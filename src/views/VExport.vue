<template>
  <div style="width: 900px;">
    <div class="title-section">データの出力</div>
    <div class="label"><span>出力する年次</span></div>
    <div class="field">
      <SelectYear v-model="ExportYear" :accept-all="false"></SelectYear>
    </div>

    <div class="utilitypanel">
    <InputSwitchField
      v-model="AllFields"
      title="出力するデータ"
      :options="{学会提出データ用: false, 全フィールドのデータ: true}" />

    <InputSwitchField
      v-model="ExportDateOfProcedure"
      :disabled="ExportAllFields"
      title="手術実施日の出力"
      :options="{しない: false, する: true}" />
    </div>

    <div>
      <el-button type="primary" @click="StartProcessing()" :disabled="ExportYear==''">出力データの作成</el-button>
    </div>

    <el-collapse-transition>
      <div class="progression" v-if="ProcessStep !== undefined">
        <el-steps :active="ProcessStep" process-status="warning" finish-status="success" direction="vertical" space="42px">
          <el-step title="システム設定の確認" />
          <el-step title="読み込み症例の確認を検証" />
          <el-step title="登録内容の妥当性の検証">
            <template #description>
              <el-progress :percentage="ProgressStepThree"></el-progress>
            </template>
          </el-step>
          <el-step title="提出用データとして整形">
            <template #description>
              <el-progress :percentage="ProgressStepFour"></el-progress>
            </template>
          </el-step>
          <el-step title="チェックサムの計算" />
          <el-step title="最終処理" />
        </el-steps>
      </div>
    </el-collapse-transition>

    <TheWrapper v-if="ShowPreview" alpha="60" @click="ShowPreview = false">
      <div id="preview">
        画面のクリックで戻ります.<br/>
        <pre>{{OutputString}}</pre>
      </div>
    </TheWrapper>
    <div>
      <el-button type="primary" :disabled="!ReadyForExport" @click="ShowPreview = true">出力先結果の確認</el-button>
      <el-button type="primary" :disabled="!ReadyForExport" @click="Download()" :loading="Processing">出力先を指定してファイルの出力</el-button>
    </div>

    <TheWrapper v-if="Processing"/>
  </div>
</template>

<script>
import InputSwitchField from '@/components/Molecules/InputSwitchField'
import SelectYear from '@/components/Molecules/SelectYear'
import TheWrapper from '@/components/Atoms/TheWrapper'
import CaseDocumentHandler from '@/modules/DbItemHandler'
import Popups from 'depmodules/Popups'
import { ValidateCase } from '@/modules/CaseValidater'

export default {
  name: 'ViewExport',
  components: {
    SelectYear, InputSwitchField, TheWrapper
  },
  data () {
    return ({
      ExportYear: '',
      ExportDateOfProcedure: true,
      ExportAllFields: false,
      Selector: {},

      Processing: false,
      ProcessStep: undefined,
      ProgressStepThree: 0,
      ProgressStepFour: 0,
      ReadyForExport: false,

      ShowPreview: false,
      OutputString: ''
    })
  },
  computed: {
    AllFields: {
      get () {
        return this.ExportAllFields
      },
      set (newvalue) {
        if (newvalue && Popups.confirm('不用意に全てのフィールドのデータを出力するのは,個人情報保護の観点からお薦め出来ません.\nそれでも出力しますか?')) {
          this.ExportAllFields = true
        } else {
          this.ExportAllFields = false
        }
      }
    },
    Query () {
      const query = {
        DocumentId: { $gt: 0 }
      }
      if (this.ExportYear !== '') {
        const reg = new RegExp('^' + this.ExportYear + '-')
        query.DateOfProcedure = { $regex: reg }
      }
      return query
    }
  },
  methods: {
    async StartProcessing () {
      this.Processing = true
      this.ProgressStepFour = 0
      this.ReadyForExport = false
      this.ShowPreview = false

      this.ProcessStep = 0

      try {
        await this.CheckSystem()

        this.ProcessStep++
        await this.CheckImported()

        this.ProcessStep++
        const documentids = await this.CheckConsistency()

        this.ProcessStep++
        const exportitems = await this.CreateExportData(documentids)

        this.ProcessStep++
        const ExportCounts = await this.CreateHeader(exportitems)

        this.ProcessStep = 6
        if (ExportCounts > 0) {
          this.ReadyForExport = true
        }
      } catch (error) {
        this.ReadyForExport = false
        Popups.alert(error.message)
      } finally {
        this.Processing = false
      }
    },

    Download () {
      if (!this.ExportAllFields ||
        (
          Popups.confirm('ファイルへの保存が指示されました, 作成されたデータには個人情報が含まれている可能性があります.\n処理を続行しますか?') &&
          Popups.confirm('出力されたファイルの取り扱いは厳重行ってください.')
        )
      ) {
        // ブラウザの機能でダウンロードさせる.
        const temporaryElementA = document.createElement('A')
        temporaryElementA.href = URL.createObjectURL(new Blob([this.OutputString]), { type: 'application/json' })
        temporaryElementA.download = 'joed-export-data.json'
        temporaryElementA.style.display = 'none'
        document.body.appendChild(temporaryElementA)
        temporaryElementA.click()
        document.body.removeChild(temporaryElementA)
      }
    },

    // Step 1 - 施設名とIDが設定されているかを確認
    //
    async CheckSystem () {
      if (!this.$store.getters['system/InstitutionID']) {
        throw new Error('施設情報が未設定です.')
      }

      const countJSOGId = await this.$store.dispatch('dbCount', {
        Query: Object.assign(
          {
            JSOGId: { $exists: true }
          },
          this.Query
        )
      })
      if (countJSOGId > 0) {
        if (!this.$store.getters['sysyem/JSOGInstitutionID']) {
          throw new Error('日本産科婦人科学会腫瘍登録施設番号が未設定です.')
        }
      }
    },

    // Step 2 - インポートデータがすべて確認されているかを確認
    //
    // インポートデータ( Imported )で特になんの問題も無くインポートできたもの以外には Notification がある
    async CheckImported () {
      const count = await this.$store.dispatch('dbCount', {
        Query: Object.assign(
          {
            Imported: { $exists: true }
          },
          this.Query
        )
      })
      if (count > 0) {
        throw new Error('未確認の読み込み症例が ' + count + ' 症例あります.\n確認を御願いします.')
      }
    },
    // Step 3 - データの妥当性検証
    //
    // 基本的に入力時に検証されているので大丈夫だと思うが：
    //  必須項目の有無
    //  項目の重複(ditto含む)
    async CheckConsistency () {
      this.ProgressStepThree = 0

      const documentids = (
        await this.$store.dispatch('dbFind',
          {
            Query: this.Query,
            Projection: { DocumentId: 1, _id: 0 }
          }) ||
        []
      ).map(item => item.DocumentId)
      if (documentids.length === 0) throw new Error('エクスポートの対象がありません.')

      let DocumentErrors = 0

      for (const index in documentids) {
        this.ProgressStepThree = parseInt(index * 100.0 / documentids.length)
        try {
          await ValidateCase(
            await this.$store.dispatch('dbFindOne',
              {
                Query: { DocumentId: documentids[index] }
              })
          )
        } catch (error) {
          this.$store.dispatch('dbUpdate',
            {
              Query: { DocumentId: documentids[index] },
              Update: { $set: { Notification: error } }
            })
          DocumentErrors++
        }
      }
      this.ProgressStepThree = 100

      if (DocumentErrors > 0) {
        throw new Error(
          'データ検証で' + DocumentErrors + '件のエラーが確認されました.\n' +
          '該当するデータの修正を御願いします.'
        )
      }

      return documentids
    },

    // Step 4 - データの整形
    //
    async CreateExportData (documentids) {
      this.ProgressStepFour = 0

      const ExportItems = []

      let serial = (
        await this.$store.dispatch('dbFindOne',
          {
            Query: Object.assign(
              {
                UniqueID: { $exists: true }
              },
              this.Query),
            Sort: { UniqueID: -1, _id: 0 }
          }
        ) || { UniqueID: 0 })
        .UniqueID

      for (const index in documentids) {
        this.ProgressStepFour = parseInt(index * 100.0 / documentids.length)
        const exportdocument = await this.$store.dispatch('dbFindOne',
          { Query: { DocumentId: documentids[index] } }
        )

        if (!exportdocument.UniqueID) {
          ++serial
          exportdocument.UniqueID = [
            this.$store.getters['system/InstitutionID'],
            this.Year,
            serial
          ].join('-')

          await this.$store.dispatch('dbUpdate',
            {
              Query: { DocumentId: documentids[index] },
              Update: { $set: { UniqueID: exportdocument.UniqueID } }
            })
        }

        ExportItems.push(
          CaseDocumentHandler.exportCase(
            exportdocument,
            {
              spliceDateOfProcedure: !this.ExportDateOfProcedure
            }
          )
        )
      }
      this.ProgressStepFour = 100
      return ExportItems
    },

    // Step 5 - データヘッダの作成
    //
    async CreateHeader (exportItem) {
      const length = exportItem.length

      if (length > 0) {
        const HHX = require('xxhashjs')
        const TimeStamp = Date.now()

        const OutputString = JSON.stringify(exportItem, ' ', 2)
        const Checksum = HHX.h64(OutputString, TimeStamp).toString(16)

        exportItem.splice(0, 0, {
          InstitutionName: this.$store.getters['system/InstitutionName'],
          InstitutionID: this.$store.getters['system/InstitutionID'],
          JSOGoncologyboardID: this.$store.getters['system/JSOGInstitutionID'],
          TimeStamp: TimeStamp,
          Year: this.ExportYear || 'ALL',
          NumberOfCases: exportItem.length,
          MD5: Checksum
        })
      }
      this.OutputString = JSON.stringify(exportItem, ' ', 2)

      return length
    }
  }
}
</script>

<style lang="sass">
div.utilitypanel
  display: flex
  flex-direction: column
  margin-bottom: 1rem
  div
    display: flex
    flex-direction: row
    margin: 0.4rem 0
    div.label
      margin-top: 0.7rem
      width: 20%
      font-weight: bold
    div.field

div#preview
  position: relative
  height: 80vh
  overflow-y: scroll
  margin: 4rem
  padding: 1rem
  border: 2px solid var(--color-text-primary)
  background: var(--background-color-list)
</style>
