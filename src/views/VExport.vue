<template>
  <div class="utility">
    <!-- <div class="title">データの出力</div> -->
    <div class="utility-switches">
      <div>
        <div class="label">出力する年次</div>
        <SelectYear div-class="field" v-model="exportYear" :accept-all="false" />
      </div>

      <InputSwitchField
        v-model="allFields"
        title="出力するデータ"
        :options="{学会提出データ: false, 全フィールドのデータ: true}" />

      <InputSwitchField
        v-model="exportDateOfProcedure"
        :disabled="exportAllFields"
        title="手術実施日の出力"
        :options="{しない: false, する: true}" />

      <InputSwitchField
        v-model="exportAge"
        :disabled="exportAllFields"
        title="患者の年齢の出力"
        :options="{しない: false, する: true}" />

      <div>
        <el-button type="primary" @click="Process()" :disabled="exportYear=='' || processing">出力データの作成</el-button>
      </div>
    </div>

    <el-collapse-transition>
      <div class="progress-views" v-show="processStep !== undefined">
        <el-steps :active="processStep" process-status="warning" finish-status="success" direction="vertical" space="42px">
          <el-step title="システム設定の確認" />
          <el-step title="読み込み症例の確認を検証" />
          <el-step title="登録内容の妥当性の検証">
            <template #description>
              <el-progress :percentage="progressCheckConsistency" />
            </template>
          </el-step>
          <el-step title="提出用データとして整形">
            <template #description>
              <el-progress :percentage="progressCreateData" />
            </template>
          </el-step>
          <el-step title="チェックサムの計算とヘッダの付与" />
        </el-steps>
      </div>
    </el-collapse-transition>

    <el-collapse-transition>
      <div v-show="readyToExport">
        <el-dropdown split-button type="primary" @click="Download()">
          出力先を指定してファイルの出力
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="showPreview = true">出力先結果の確認</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-collapse-transition>

    <TheWrapper v-if="processing"/>
    <TheWrapper v-if="showPreview" alpha="60" @click="showPreview = false">
      <div id="preview">
        画面のクリックで戻ります.
        <hr/>
        <pre>{{exportText}}</pre>
      </div>
    </TheWrapper>
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
      exportYear: '',
      exportAllFields: false,
      exportDateOfProcedure: true,
      exportAge: true,
      forceRenumber: false,

      exportText: '',

      processing: false,
      processStep: undefined,
      progressCheckConsistency: 0,
      progressCreateData: 0,

      showPreview: false
    })
  },
  watch: {
    exportYear () {
      this.ResetState()
    },
    exportAllFields () {
      this.ResetState()
    },
    exportDateOfProcedure () {
      this.ResetState()
    }
  },
  computed: {
    allFields: {
      get () {
        return this.exportAllFields
      },
      set (newvalue) {
        if (newvalue && Popups.confirm('不用意に全てのフィールドのデータを出力するのは,個人情報保護の観点からお薦め出来ません.\nそれでも出力しますか?')) {
          this.exportAllFields = true
        } else {
          this.exportAllFields = false
        }
      }
    },
    baseQuery () {
      const query = {
        DocumentId: { $gt: 0 }
      }
      if (this.exportYear !== '') {
        const reg = new RegExp('^' + this.exportYear + '-')
        query.DateOfProcedure = { $regex: reg }
      }
      return query
    },
    readyToExport () {
      return this.exportText.length > 4
    }
  },
  methods: {
    ResetState () {
      this.processStep = undefined
      this.exportText = ''
    },

    async Process () {
      if (this.processing) return

      this.processStep = 0
      this.progressCheckConsistency = 0
      this.progressCreateData = 0
      this.exportText = ''
      this.showPreview = false

      try {
        await this.CheckSystem()
        this.processStep++

        await this.CheckImported()
        this.processStep++

        const documentIds = await this.CheckConsistency()
        this.processStep++

        const exportitems = await this.CreateExportData(documentIds)
        this.processStep++

        this.exportText = await this.CreateHeader(exportitems)
        this.processStep++
      } catch (error) {
        await this.$nextTick()
        Popups.alert(error.message)
      } finally {
        await this.$nextTick()
        this.processing = false
      }
    },

    Download () {
      if (!this.exportAllFields ||
        (
          Popups.confirm('ファイルへの保存が指示されました, 作成されたデータにはID番号・氏名・年齢などの個人情報が含まれている可能性があります.\n処理を続行しますか?') &&
          Popups.confirm('出力されたファイルの取り扱いは厳重行ってください.')
        )
      ) {
        // ブラウザの機能でダウンロードさせる.
        const temporaryElementA = document.createElement('A')
        temporaryElementA.href = URL.createObjectURL(new Blob([this.exportText]), { type: 'application/json' })
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
        Query:
          {
            JSOGId: { $exists: true },
            ...this.baseQuery
          }
      })
      if (countJSOGId > 0 && !this.$store.getters['system/JSOGInstitutionID']) {
        throw new Error('日本産科婦人科学会腫瘍登録施設番号が未設定です.')
      }
    },

    // Step 2 - インポートデータがすべて確認されているかを確認
    //
    // インポートデータ( Imported )で特になんの問題も無くインポートできたもの以外には Notification がある
    async CheckImported () {
      const count = await this.$store.dispatch('dbCount', {
        Query:
          {
            Imported: { $exists: true },
            ...this.baseQuery
          }
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
      this.progressCheckConsistency = 0

      const documentIds = (
        await this.$store.dispatch('dbFind',
          {
            Query: this.baseQuery,
            Projection: { DocumentId: 1, _id: 0 }
          }) ||
        []
      ).map(item => item.DocumentId)
      if (documentIds.length === 0) throw new Error('エクスポートの対象症例がありません.')

      let errorCount = 0

      for (const index in documentIds) {
        this.progressCheckConsistency = parseInt(index * 100.0 / documentIds.length)
        try {
          await ValidateCase(
            await this.$store.dispatch('dbFindOne',
              {
                Query: { DocumentId: documentIds[index] }
              })
          )
        } catch (error) {
          this.$store.dispatch('dbUpdate',
            {
              Query: { DocumentId: documentIds[index] },
              Update: { $set: { Notification: error } }
            })
          errorCount++
        }
      }
      this.progressCheckConsistency = 100

      if (errorCount > 0) {
        throw new Error(
          'データ検証で' + errorCount + '件のエラーが確認されました.\n' +
          '該当するデータの修正を御願いします.'
        )
      }

      return documentIds
    },

    // Step 4 - データの整形
    //
    async CreateExportData (documentIds) {
      this.progressCreateData = 0

      const ExportItems = []

      let serial = this.forceRenumber ? 0
        : Number(
          (
            await this.$store.dispatch('dbFindOne',
              {
                Query:
                  {
                    UniqueID: { $exists: true },
                    ...this.baseQuery
                  },
                Sort: { UniqueID: -1 }
              }) ||
              {
                // UniqueIDが無い場合のダミー つまるところ 0.
                UniqueID: '2222-99001-0'
              }
          ).UniqueID.substr(11)
        )

      for (const index in documentIds) {
        this.progressCreateData = parseInt(index * 100.0 / documentIds.length)
        const exportdocument = await this.$store.dispatch('dbFindOne',
          { Query: { DocumentId: documentIds[index] } }
        )

        if (this.forceRenumber || !exportdocument.UniqueID) {
          ++serial
          exportdocument.UniqueID = [
            this.$store.getters['system/InstitutionID'],
            this.exportYear,
            serial
          ].join('-')

          await this.$store.dispatch('dbUpdate',
            {
              Query: { DocumentId: documentIds[index] },
              Update: { $set: { UniqueID: exportdocument.UniqueID } }
            })
        }

        ExportItems.push(
          CaseDocumentHandler.ExportCase(
            exportdocument,
            {
              exportAllFields: this.exportAllFields,
              omitAge: !this.exportAge,
              omitDateOfProcedure: !this.exportDateOfProcedure
            }
          )
        )
      }
      this.progressCreateData = 100
      return ExportItems
    },

    // Step 5 - データヘッダの作成
    //
    async CreateHeader (exportItem) {
      const length = exportItem.length

      if (length > 0) {
        const HHX = require('xxhashjs')
        const TimeStamp = Date.now()

        const exportText = JSON.stringify(exportItem, ' ', 2)
        const Checksum = HHX.h64(exportText, TimeStamp).toString(16)

        exportItem.splice(0, 0, {
          InstitutionName: this.$store.getters['system/InstitutionName'],
          InstitutionID: this.$store.getters['system/InstitutionID'],
          JSOGoncologyboardID: this.$store.getters['system/JSOGInstitutionID'],
          TimeStamp: TimeStamp,
          Year: this.exportYear || 'ALL',
          NumberOfCases: exportItem.length,
          MD5: Checksum
        })
      }
      return JSON.stringify(exportItem, ' ', 2)
    }
  }
}
</script>

<style lang="sass">
div#preview
  position: relative
  height: 80vh
  overflow-y: scroll
  margin: 4rem
  padding: 1rem
  border: 2px solid var(--color-text-primary)
  border-radius: 0.5rem
  background: var(--background-color-list)
</style>
