<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { reactive, ref, watch, computed, nextTick } from 'vue'
import { useStore } from '@/store'
import InputSwitchField from '@/components/Molecules/InputSwitchField'
import SelectYear from '@/components/Molecules/SelectYear'
import TheWrapper from '@/components/Atoms/TheWrapper'
import CaseDocumentHandler from '@/modules/DbItemHandler'
import * as Popups from '@/modules/Popups'
import HHX from 'xxhashjs'
import { ValidateCase } from '@/modules/CaseValidater'

const store = useStore()

const baseElement = ref()
const setting = reactive({
  exportYear: '',
  exportAllFields: false,
  validateOnBackup: true
})

const exportText = ref('')

const status = reactive({
  processing: false,
  processStep: undefined,
  progressCheckConsistency: 0,
  progressCreateData: 0,

  showPreview: false
})

watch(
  () => setting?.exportAllFields,
  (newValue, oldValue) => {
    if (oldValue !== newValue) {
      if (setting.exportYear === 'ALL') {
        setting.exportYear = ''
      }
    }
  },
  { immediate: true }
)

watch(
  () => setting?.exportYear,
  () => {
    status.processStep = undefined
    exportText.value = ''
  },
  { immediate: true }
)

const exportAsBackup = computed({
  get: () => setting.exportAllFields,
  set: async (newvalue) => {
    if (newvalue && await Popups.confirm('不用意に全てのフィールドのデータを出力するのは,個人情報保護の観点からお薦め出来ません.\nそれでも出力しますか?')) {
      setting.exportAllFields = true
    } else {
      setting.exportAllFields = false
    }
  }
})

const baseQuery = computed(() => {
  const query = {
    DocumentId: { $gt: 0 }
  }
  if (setting.exportYear !== '') {
    if (setting.exportYear !== 'ALL') {
      query.DateOfProcedure = { $regex: new RegExp('^' + setting.exportYear + '-') }
    }
  }
  return query
})

const readyToExport = computed(() => exportText.value.length > 4)

const Process = async () => {
  if (status.processing) return

  status.processing = true
  status.processStep = 0
  status.progressCheckConsistency = 0
  status.progressCreateData = 0
  status.showPreview = false
  exportText.value = ''

  try {
    await CheckSystemConfiguration()
    status.processStep++

    await CheckImportedRecords()
    status.processStep++

    const documentIds = await CheckConsistency()
    status.processStep++

    const { exportItems, countOfDenial } = await CreateExportData(documentIds)
    status.processStep++

    exportText.value = await CreateHeader(exportItems, countOfDenial)
    status.processStep++
  } catch (error) {
    await nextTick()
    Popups.error(error.message)
  } finally {
    status.processing = false
  }
}

const Download = async () => {
  if (!setting.exportAllFields ||
    (
      await Popups.confirmYesNo('保存されるデータにはID番号・氏名・年齢などの個人情報が含まれている可能性があります.\n処理を続行しますか?') &&
      await Popups.confirm('出力されたファイルの取り扱いは厳重行ってください.')
    )
  ) {
    // ブラウザの機能でダウンロードさせる.
    const temporaryElementA = document.createElement('A')
    temporaryElementA.href = URL.createObjectURL(new Blob([setting.exportText]), { type: 'application/json' })
    temporaryElementA.download = 'joed-export-data.json'
    temporaryElementA.style.display = 'none'
    document.body.appendChild(temporaryElementA)
    temporaryElementA.click()
    document.body.removeChild(temporaryElementA)
  }
}

// Step 1 - 施設名とIDが設定されているかを確認
//
const CheckSystemConfiguration = async () => {
  // バックアップデータでエラーチェックなしの場合 このチェックはスキップ
  if (setting.exportAllFields && !setting.validateOnBackup) {
    return
  }

  // 施設番号は必須
  if (!store.getters['system/InstitutionID']) {
    throw new Error('施設情報が未設定です.')
  }
}

// Step 2 - インポートデータがすべて確認されているかを確認
//
// インポートデータ( Imported )で特になんの問題も無くインポートできたもの以外には Notification がある
const CheckImportedRecords = async () => {
  // バックアップデータでエラーチェックなしでは チェックをスキップする
  if (setting.exportAllFields && !setting.validateOnBackup) {
    return
  }

  const count = await store.dispatch('dbCount', {
    Query:
      {
        Imported: { $exists: true },
        ...baseQuery.value
      }
  })
  if (count > 0) {
    throw new Error('要確認の症例が ' + count + ' 症例あります.\n確認を御願いします.')
  }
}

// Step 3 - データの妥当性検証
//
// 基本的に入力時に検証されているので大丈夫だと思うが：
//  必須項目の有無
//  項目の重複(ditto含む)
const CheckConsistency = async () => {
  status.progressCheckConsistency = 0

  // 対象の有無と重複のチェック
  const querydocuments = (
    await store.dispatch('dbFind',
      {
        Query: baseQuery.value,
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
  if (setting.exportAllFields && !setting.validateOnBackup) {
    return documentIds
  }

  // 各登録の妥当性検証
  let errorCount = 0

  for (const index in documentIds) {
    status.progressCheckConsistency = parseInt(index * 100.0 / documentIds.length)
    try {
      await ValidateCase(
        await store.dispatch('dbFindOne',
          {
            Query: { DocumentId: documentIds[index] }
          })
      )
    } catch (error) {
      console.error(error.message)
      store.dispatch('dbUpdate',
        {
          Query: { DocumentId: documentIds[index] },
          Update: { $set: { Notification: error.message } }
        })
      store.commit('RemoveDatastore', {
        DocumentId: documentIds[index]
      })
      errorCount++
    }
  }
  status.progressCheckConsistency = 100

  if (errorCount > 0) {
    throw new Error(
      'データ検証で' + errorCount + '件のエラーが確認されました.\n' +
      '確認と修正を御願いします.'
    )
  }

  return documentIds
}

// Step 4 - データの整形
//
const CreateExportData = async (documentIds) => {
  status.progressCreateData = 0
  const exportItems = []
  const exportJSOGId = store.getters['system/ExportJSOGId']
  const exportNCDId = store.getters['system/ExportNCDId']
  const Encoder = new TextEncoder()
  let countOfDenial = 0

  for (const index in documentIds) {
    status.progressCreateData = parseInt(index * 100.0 / documentIds.length)
    const exportdocument = await store.dispatch('dbFindOne',
      {
        Query: { DocumentId: documentIds[index] },
        Projection: { _id: 0, DocumentId: 0 }
      }
    )

    if (setting.exportAllFields) {
      // 生データの出力
      exportItems.push(exportdocument)
    } else {
      // 提出用データを出力

      // 登録拒否症例は出力データに含めない
      if (exportdocument?.Denial === true) {
        countOfDenial++
        continue
      }

      // 2021より実装変更:
      // ユニークキー(PatientId, DateOfProcedure)からレコードのハッシュを作成する.
      // 2022より64bitのシードを与えるように変更
      // 今後のライブラリ変更に備えてdataを入力前にUint8Arrayに変更
      let hashString = ''
      if (setting.exportYear >= '2022') {
        hashString = HHX.h64(
          Encoder.encode(
            JSON.stringify(
              {
                PatientId: exportdocument.PatientId,
                DateOfProcedure: exportdocument.DateOfProcedure
              })
          ).buffer,
          store.getters['system/SALT'].toString()
        ).toString(36)
      } else {
        hashString = HHX.h64(
          JSON.stringify(
            {
              PatientId: exportdocument.PatientId,
              DateOfProcedure: exportdocument.DateOfProcedure
            }
          ),
          store.getters['system/SALT']
        ).toString(36)
      }

      exportItems.push(
        {
          ...CaseDocumentHandler.ExportCase(
            exportdocument,
            setting.exportYear >= '2022'
              ? {}
              : {
                  omitNCDId: !exportNCDId,
                  omitJSOGId: !exportJSOGId,
                  anonymizeJSOGId: !exportJSOGId
                }
          ),
          hash: hashString
        }
      )
    }
  }
  status.progressCreateData = 100
  return { exportItems, countOfDenial }
}

// Step 5 - データヘッダの作成
//
const CreateHeader = async (exportItem, countOfDenial) => {
  if (!setting.exportAllFields) {
    const length = exportItem.length

    if (length > 0) {
      const TimeStamp = Date.now()
      const Encoder = new TextEncoder()

      const exportText = JSON.stringify(exportItem, ' ', 2)
      // ヘッダが保持するドキュメント部分のハッシュ値
      const hash = HHX.h64(
        Encoder.encode(exportText).buffer,
        TimeStamp.toString()).toString(16)

      exportItem.unshift({
        InstitutionName: store.getters['system/InstitutionName'],
        InstitutionID: store.getters['system/InstitutionID'],
        TimeStamp,
        Year: setting.exportYear || 'ALL',
        NumberOfCases: exportItem.length,
        CountOfDenial: countOfDenial,
        Version: store.getters['system/ApplicationVersion'],
        Plathome: store.getters['system/Plathome'],
        hash
      })
    }
  }
  return JSON.stringify(exportItem, ' ', 2)
}
</script>

<template>
  <div ref="baseElement" class="utility">
    <div class="utility-switches">
      <InputSwitchField
        :value.sync="exportAsBackup"
        title="出力する様式"
        :options="{ 学会提出データ: false, バックアップデータ: true }"
      />

      <div>
        <div class="label">出力する年次</div>
        <SelectYear
          class="field"
          :value.sync="setting.exportYear"
          :accept-all="exportAsBackup"
        />
      </div>

      <InputSwitchField
        :value.sync="setting.validateOnBackup"
        :disabled="!setting.exportAllFields"
        title="データのエラーチェック"
        :options="{ 行う: true, 行わない: false }"
      />

      <div>
        <el-button
          type="primary"
          @click="Process()"
          :disabled="!setting.exportYear || status.processing"
          >出力データの作成</el-button
        >
      </div>
    </div>

    <el-collapse-transition>
      <div class="progress-views" v-show="status.processStep !== undefined">
        <el-steps
          :active="status.processStep"
          process-status="warning"
          finish-status="success"
          direction="vertical"
          space="42px"
        >
          <el-step title="システム設定の確認" />
          <el-step title="読み込み症例の確認を検証" />
          <el-step title="登録内容の妥当性の検証">
            <template #description>
              <el-progress
                :v-show="status.progressCheckConsistency > 0"
                :percentage="status.progressCheckConsistency"
              />
            </template>
          </el-step>
          <el-step title="提出用データとして整形">
            <template #description>
              <el-progress
                :v-show="status.progressCreateData > 0"
                :percentage="status.progressCreateData"
              />
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
          <template v-slot:dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click.native="status.showPreview = true"
                >出力先結果の確認</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-collapse-transition>

    <TheWrapper prevent-close v-if="status.processing" />
    <TheWrapper v-if="status.showPreview" alpha="60" @click="status.showPreview = false">
      <div>
        <div id="preview">
          画面のクリックで戻ります.
          <hr />
          <pre>{{ exportText }}</pre>
        </div>
      </div>
    </TheWrapper>
  </div>
</template>

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
