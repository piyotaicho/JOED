<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { reactive, ref, watch, computed, nextTick } from 'vue'
import { useStore } from '@/store'
import InputSwitchField from '@/components/Molecules/InputSwitchField'
import SelectYear from '@/components/Molecules/SelectYear'
import TheWrapper from '@/components/Atoms/TheWrapper'
import ViewerOverlay from '@/components/Molecules/ViewerOverlay.vue'
import CaseDocumentHandler from '@/modules/DbItemHandler'
import * as Popups from '@/modules/Popups'
import HHX from 'xxhashjs'
import { ValidateCase } from '@/modules/CaseValidater'

const store = useStore()

const setting = reactive({
  year: '',
  backup: false,
  validate: true
})

const jsonText = ref('')

const status = reactive({
  processing: false,
  processStep: undefined,
  progressCheckConsistency: 0,
  progressCreateData: 0,

  showPreview: false
})

watch(
  () => setting.backup,
  (newValue, oldValue) => {
    if (oldValue !== newValue) {
      status.processStep = undefined
      jsonText.value = ''
      if (setting.year === 'ALL') {
        setting.year = ''
      }
    }
  },
  { immediate: true }
)

watch(
  () => setting.year,
  () => {
    status.processStep = undefined
    jsonText.value = ''
  },
  { immediate: true }
)

const exportAsBackup = computed({
  get: () => setting.backup,
  set: async (newvalue) => {
    if (newvalue && await Popups.confirm('不用意に全てのフィールドのデータを出力するのは,個人情報保護の観点からお薦め出来ません.\nそれでも出力しますか?')) {
      setting.backup = true
    } else {
      setting.backup = false
    }
  }
})

const readyToExport = computed(() => jsonText.value.length > 4)

const Process = async () => {
  if (setting.year === '') {
    await Popups.error('年次が選択されていません.')
    return
  }

  if (status.processing) return

  status.processing = true
  status.processStep = 0
  status.progressCheckConsistency = 0
  status.progressCreateData = 0
  status.showPreview = false
  jsonText.value = ''

  try {
    await CheckSystemConfiguration()
    status.processStep++

    await CheckImportedRecords()
    status.processStep++

    const documentIds = await CheckConsistency()
    status.processStep++

    const { exportItems, countOfDenial } = await CreateExportData(documentIds)
    status.processStep++

    jsonText.value = await CreateHeader(exportItems, countOfDenial)
    status.processStep++
  } catch (error) {
    await nextTick()
    Popups.error(error.message)
  } finally {
    status.processing = false
  }
}

/**
 * ダウンロード処理
 */
const Download = async () => {
  // バックアップでは取扱の警告を表示
  if (!setting.backup ||
    (
      await Popups.confirmYesNo('保存されるデータにはID番号・氏名・年齢などの個人情報が含まれている可能性があります.\n処理を続行しますか?') &&
      await Popups.confirm('出力されたファイルの取り扱いは厳重行ってください.')
    )
  ) {
    // ブラウザの機能でダウンロードさせる.
    const temporaryElementA = document.createElement('A')
    temporaryElementA.href = URL.createObjectURL(new Blob([jsonText.value]), { type: 'application/json' })
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
  if (setting.backup && !setting.validate) {
    return
  }

  // 施設コードは必須
  if (!store.getters['system/InstitutionID']) {
    throw new Error('施設情報が未設定です.')
  }
}

// Step 2 - インポートデータがすべて確認されているかを確認
//
// インポートデータ( Imported )で特になんの問題も無くインポートできたもの以外には Notification がある
const CheckImportedRecords = async () => {
  // バックアップデータでエラーチェックなしでは チェックをスキップする
  if (setting.backup && !setting.validate) {
    return
  }

  const count = await store.dispatch('dbCount', {
    Query:
      setting.year === 'ALL'
        ? {
            DocumentId: { $gt: 0 },
            Imported: { $exists: true }
          }
        : {
            DocumentId: { $gt: 0 },
            Imported: { $exists: true },
            DateOfProcedure: { $regex: new RegExp('^' + setting.year + '-') }
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
        Query: setting.year === 'ALL'
          ? {
              DocumentId: { $gt: 0 }
            }
          : {
              DocumentId: { $gt: 0 },
              DateOfProcedure: { $regex: new RegExp('^' + setting.year + '-') }
            },
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
      throw new Error('同一の日付に同一IDの登録があります.重複登録の可能性があります.\n' + dupcheck.join(',\n'))
    }
  }

  const documentIds = querydocuments.map(item => item.DocumentId)

  // バックアップデータでエラーチェックなしでは これ以上のチェックをスキップする
  if (setting.backup && !setting.validate) {
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
  let countOfDenial = 0

  for (const index in documentIds) {
    status.progressCreateData = parseInt(index * 100.0 / documentIds.length)
    const exportdocument = await store.dispatch('dbFindOne',
      {
        Query: { DocumentId: documentIds[index] },
        Projection: { _id: 0, DocumentId: 0 }
      }
    )

    if (setting.backup) {
      // 生データの出力
      exportItems.push(exportdocument)
    } else {
      // 提出用データを出力

      // 登録拒否症例は出力データに含めない
      if (exportdocument?.Denial === true) {
        countOfDenial++
        continue
      }

      // hash生成
      // 2021より実装変更:
      // ユニークキー(PatientId, DateOfProcedure)からレコードのハッシュを作成する.
      // 2022より明確に64bitのシードを与えるように変更:
      // 今後のライブラリ変更に備えてdataを入力前にUint8Arrayに変更
      const hashString = store.getters['system/generateHash'](
        JSON.stringify({
          PatientId: exportdocument.PatientId,
          DateOfProcedure: exportdocument.DateOfProcedure
        }),
        setting.year <= '2021'
      )

      exportItems.push(
        {
          ...CaseDocumentHandler.ExportCase(exportdocument),
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
  if (!setting.backup) {
    const length = exportItem.length

    if (length > 0) {
      const TimeStamp = Date.now()
      const Encoder = new TextEncoder()

      const jsonText = JSON.stringify(exportItem, ' ', 2)
      // ヘッダが保持するドキュメント部分のハッシュ値
      const hash = HHX.h64(
        Encoder.encode(jsonText).buffer,
        TimeStamp.toString()).toString(16)

      exportItem.unshift({
        InstitutionName: store.getters['system/InstitutionName'],
        InstitutionID: store.getters['system/InstitutionID'],
        TimeStamp,
        Year: setting.year || 'ALL',
        NumberOfCases: exportItem.length,
        NumberOfDenial: countOfDenial,
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
  <div class="utility">
    <div class="utility-switches">
      <InputSwitchField
        v-model="exportAsBackup"
        title="出力する様式"
        :options="{ 学会提出データ: false, バックアップデータ: true }"
      />

      <div>
        <div class="label">出力する年次</div>
        <SelectYear
          class="field"
          v-model="setting.year"
          :selection-all="exportAsBackup"
        />
      </div>

      <InputSwitchField
        v-model="setting.validate"
        :disabled="!exportAsBackup"
        title="データのエラーチェック"
        :options="{ 行う: true, 行わない: false }"
      />

      <div>
        <el-button
          type="primary"
          @click="Process()"
          :disabled="!setting.year || status.processing"
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
        <el-button-group>
          <el-button type="primary" @click="Download()">出力先を指定してファイルの出力</el-button>
          <el-button type="primary" @click="status.showPreview = true">出力結果の表示</el-button>
        </el-button-group>
      </div>
    </el-collapse-transition>

    <TheWrapper prevent-close v-if="status.processing" />
    <template v-if="status.showPreview">
      <ViewerOverlay @click="status.showPreview = false">{{ jsonText }}</ViewerOverlay>
    </template>
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
