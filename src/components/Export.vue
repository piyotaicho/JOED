<template>
  <div class="utility">
    <div class="utility-switches">
      <InputSwitchField
        v-model="exportAsBackup"
        title="出力する様式"
        :options="{学会提出データ: false, バックアップデータ: true}"/>

      <div>
        <div class="label">出力する年次</div>
        <SelectYear class="field" v-model="exportYear" :accept-all="exportAsBackup"/>
      </div>

      <InputSwitchField
        v-model="validateOnBackup"
        :disabled="!exportAllFields"
        title="データのエラーチェック"
        :options="{行う: true, 行わない: false}"/>

      <div>
        <el-button type="primary" @click="Process()" :disabled="(!exportYear) || processing">出力データの作成</el-button>
      </div>
    </div>

    <el-collapse-transition>
      <div class="progress-views" v-show="processStep !== undefined">
        <el-steps :active="processStep" process-status="warning" finish-status="success" direction="vertical" space="42px">
          <el-step title="システム設定の確認"/>
          <el-step title="読み込み症例の確認を検証"/>
          <el-step title="登録内容の妥当性の検証">
            <template #description>
              <el-progress :v-show="progressCheckConsistency > 0" :percentage="progressCheckConsistency"/>
            </template>
          </el-step>
          <el-step title="提出用データとして整形">
            <template #description>
              <el-progress :v-show="progressCreateData > 0" :percentage="progressCreateData"/>
            </template>
          </el-step>
          <el-step title="チェックサムの計算とヘッダの付与"/>
        </el-steps>
      </div>
    </el-collapse-transition>

    <el-collapse-transition>
      <div v-show="readyToExport">
        <el-dropdown split-button type="primary" @click="Download()">
          出力先を指定してファイルの出力
          <template v-slot:dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click.native="showPreview = true">出力先結果の確認</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-collapse-transition>

    <TheWrapper prevent-close v-if="processing"/>
    <TheWrapper v-if="showPreview" alpha="60" @click="showPreview = false">
      <div>
        <div id="preview">
          画面のクリックで戻ります.
          <hr/>
          <pre>{{exportText}}</pre>
        </div>
      </div>
    </TheWrapper>
  </div>
</template>

<script>
import InputSwitchField from '@/components/Molecules/InputSwitchField'
import SelectYear from '@/components/Molecules/SelectYear'
import TheWrapper from '@/components/Atoms/TheWrapper'
import CaseDocumentHandler from '@/modules/DbItemHandler'
import * as Popups from '@/modules/Popups'
import HHX from 'xxhashjs'
import { ValidateCase } from '@/modules/CaseValidater'

export default {
  name: 'ExportData',
  components: {
    SelectYear, InputSwitchField, TheWrapper
  },
  data () {
    return ({
      exportYear: '',
      exportAllFields: false,
      validateOnBackup: true,

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
      if (this.exportYear === 'ALL') {
        this.exportYear = ''
      }
      this.ResetState()
    },
    exportRaw () {
      this.ResetState()
    },
    RawValidation () {
      this.ResetState()
    },
    addHeader () {
      if (this.addHeader === true) {
        this.RawValidation = true
      }
      this.ResetState()
    }
  },
  computed: {
    exportAsBackup: {
      get () {
        return this.exportAllFields
      },
      async set (newvalue) {
        if (newvalue && await Popups.confirm('不用意に全てのフィールドのデータを出力するのは,個人情報保護の観点からお薦め出来ません.\nそれでも出力しますか?', this)) {
          this.exportAllFields = true
          this.RawValidation = false
        } else {
          this.exportAllFields = false
        }
        if (newvalue === false) {
          this.exportAllFields = false
        }
      }
    },
    baseQuery () {
      const query = {
        DocumentId: { $gt: 0 }
      }
      if (this.exportYear !== '') {
        if (this.exportYear !== 'ALL') {
          query.DateOfProcedure = { $regex: new RegExp('^' + this.exportYear + '-') }
        }
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
      this.$nextTick(() => {})
    },

    async Process () {
      if (this.processing) return

      this.processing = true
      this.processStep = 0
      this.progressCheckConsistency = 0
      this.progressCreateData = 0
      this.exportText = ''
      this.showPreview = false

      try {
        await this.CheckSystemConfiguration()
        this.processStep++

        await this.CheckImportedRecords()
        this.processStep++

        const documentIds = await this.CheckConsistency()
        this.processStep++

        const exportitems = await this.CreateExportData(documentIds)
        this.processStep++

        this.exportText = await this.CreateHeader(exportitems)
        this.processStep++
      } catch (error) {
        await this.$nextTick()
        Popups.error(error.message, this)
      } finally {
        await this.$nextTick()
        this.processing = false
      }
    },

    async Download () {
      if (!this.exportAllFields ||
        (
          await Popups.confirmYesNo('保存されるデータにはID番号・氏名・年齢などの個人情報が含まれている可能性があります.\n処理を続行しますか?', this) &&
          await Popups.confirm('出力されたファイルの取り扱いは厳重行ってください.')
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
    async CheckSystemConfiguration () {
      // バックアップデータでエラーチェックなしでは チェックをスキップする
      if (this.exportAllFields && !this.validateOnBackup) {
        return
      }

      // 施設番号は必須
      if (!this.$store.getters['system/InstitutionID']) {
        throw new Error('施設情報が未設定です.')
      }

      // 2022年収集からは腫瘍登録番号に関する情報は収集しないので腫瘍登録施設番号の確認は行わない
      // const countJSOGId = await this.$store.dispatch('dbCount', {
      //   Query:
      //     {
      //       JSOGId: { $exists: true },
      //       ...this.baseQuery
      //     }
      // })
      // if (countJSOGId > 0 && !this.$store.getters['system/JSOGInstitutionID']) {
      //   throw new Error('日本産科婦人科学会腫瘍登録施設番号が未設定です.')
      // }
    },

    // Step 2 - インポートデータがすべて確認されているかを確認
    //
    // インポートデータ( Imported )で特になんの問題も無くインポートできたもの以外には Notification がある
    async CheckImportedRecords () {
      // バックアップデータでエラーチェックなしでは チェックをスキップする
      if (this.exportAllFields && !this.validateOnBackup) {
        return
      }

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

      // 対象の有無と重複のチェック
      const querydocuments = (
        await this.$store.dispatch('dbFind',
          {
            Query: this.baseQuery,
            Projection: { DocumentId: 1, PatientId: 1, DateOfProcedure: 1, _id: 0 }
          }) ||
        []
      )
      if (querydocuments.length === 0) {
        throw new Error('エクスポートの対象がありません.')
      } else {
        const dupcheck = querydocuments
          .map(item => item.DateOfProcedure + ' ~ ' + item.PatientId)
          .filter((item, index, self) => self.indexOf(item) !== index)

        if (dupcheck.length > 0) {
          throw new Error('同一日付に同一IDの登録があります.重複登録の可能性があります.\n' + dupcheck.join(',\n'))
        }
      }

      const documentIds = querydocuments.map(item => item.DocumentId)

      // バックアップデータでエラーチェックなしでは これ以上のチェックをスキップする
      if (this.exportAllFields && !this.validateOnBackup) {
        return documentIds
      }

      // 各登録の妥当性検証
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
          console.error(error.message)
          this.$store.dispatch('dbUpdate',
            {
              Query: { DocumentId: documentIds[index] },
              Update: { $set: { Notification: error.message } }
            })
          this.$store.commit('RemoveDatastore', {
            DocumentId: documentIds[index]
          })
          errorCount++
        }
      }
      this.progressCheckConsistency = 100

      if (errorCount > 0) {
        throw new Error(
          'データ検証で' + errorCount + '件のエラーが確認されました.\n' +
          '確認と修正を御願いします.'
        )
      }

      return documentIds
    },

    // Step 4 - データの整形
    //
    async CreateExportData (documentIds) {
      this.progressCreateData = 0
      const ExportItems = []
      const exportJSOGId = this.$store.getters['system/ExportJSOGId']
      const exportNCDId = this.$store.getters['system/ExportNCDId']

      for (const index in documentIds) {
        this.progressCreateData = parseInt(index * 100.0 / documentIds.length)
        const exportdocument = await this.$store.dispatch('dbFindOne',
          {
            Query: { DocumentId: documentIds[index] },
            Projection: { _id: 0, DocumentId: 0 }
          }
        )

        if (this.exportAllFields) {
          // 生データの出力
          ExportItems.push(exportdocument)
        } else {
          // 提出用データを出力

          // 2021より実装変更:
          // ユニークキー(PatientId, DateOfProcedure)からレコードのハッシュを作成する.
          // 2022より64bitのシードを与えるように変更
          const hashString = HHX.h64(
            JSON.stringify(
              {
                PatientId: exportdocument.PatientId,
                DateOfProcedure: exportdocument.DateOfProcedure
              }
            ),
            this.exportYear >= '2022'
              ? this.$store.getters['system/SALT'].toString()
              : this.$store.getters['system/SALT']
          ).toString(36)

          ExportItems.push(
            {
              ...CaseDocumentHandler.ExportCase(
                exportdocument,
                {
                  omitNCDId: !exportNCDId,
                  anonymizeJSOGId: !exportJSOGId
                }
              ),
              hash: hashString
            }
          )
        }
      }
      this.progressCreateData = 100
      return ExportItems
    },

    // Step 5 - データヘッダの作成
    //
    async CreateHeader (exportItem) {
      if (!this.exportAllFields) {
        const length = exportItem.length

        if (length > 0) {
          const TimeStamp = Date.now()

          const exportText = JSON.stringify(exportItem, ' ', 2)
          // ヘッダが保持するドキュメント部分のハッシュ値
          const hash = HHX.h64(exportText, TimeStamp.toString()).toString(16)

          exportItem.unshift({
            InstitutionName: this.$store.getters['system/InstitutionName'],
            InstitutionID: this.$store.getters['system/InstitutionID'],
            // 2022年からは腫瘍関係の情報収集は排除.
            // JSOGoncologyboardID: this.$store.getters['system/JSOGInstitutionID'],
            TimeStamp,
            Year: this.exportYear || 'ALL',
            NumberOfCases: exportItem.length,
            Version: this.$store.getters['system/ApplicationVersion'],
            Plathome: this.$store.getters['system/Plathome'],
            hash
          })
        }
      }
      return JSON.stringify(exportItem, ' ', 2)
    }
  }
}
</script>

<style lang="sass">
div#preview
  position: relative
  height: 80%
  overflow-y: none
  margin: 1rem 4rem
  padding: 1rem
  border: 2px solid var(--color-text-primary)
  border-radius: 0.5rem
  background: var(--background-color-list)
</style>
