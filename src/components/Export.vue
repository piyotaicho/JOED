<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { reactive, ref, watch, computed, nextTick } from 'vue'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import InputSwitchField from '@/components/Molecules/InputSwitchField.vue'
import SelectYear from '@/components/Molecules/SelectYear.vue'
import TheWrapper from '@/components/Atoms/TheWrapper.vue'
import ViewerOverlay from '@/components/Molecules/ViewerOverlay.vue'
import CaseDocumentHandler from '@/modules/DbItemHandler'
import * as Popups from '@/modules/Popups'
import HHX from 'xxhashjs'
import { generateCSVFromObjects } from '@/modules/CSV.js'
import { ValidateCase, InstituteIDFormat } from '@/modules/CaseValidater'
import Encoding from 'encoding-japanese'
import { InvalidIDs } from '@/modules/Masters/InstituteList'

const store = useStore()
const router = useRouter()

const setting = reactive({
  year: '',
  backup: false,
  validate: true,
  csv: false,
})

const outputText = ref('')

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
      outputText.value = ''
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
    outputText.value = ''
  },
  { immediate: true }
)

const exportType = computed({
  get: () => {
    if (setting.csv) {
      return 'CSV'
    }
    if (setting.backup) {
      return 'dump'
    }
    return 'registration'
  },
  set: async (newvalue) => {
    if (
      (newvalue === 'dump' || newvalue === 'CSV') &&
      await Popups.confirm('不用意に患者情報を含むフィールドを出力するのは,個人情報保護の観点からお薦め出来ません.\nそれでも出力しますか?')
    ) {
      if (newvalue === 'CSV') {
        setting.csv = true
        setting.backup = false
        setting.validate = false
      } else {
        setting.csv = false
        setting.backup = true
      }
    } else {
      setting.csv = false
      setting.backup = false
      setting.validate = true
    }
  }
})

const csvOptionalExportTargets = computed(() => {
  const listSelection = store.getters['GetSelectedUidsForExport'] || []
  const viewCaseCount = store.getters['NumberOfCases'] || 0

  if (setting.csv) {
    return listSelection.length > 0 ?
      [
        { value: 'VIEW', text: `表示中の全項目 (${viewCaseCount}件)` },
        { value: 'SELECTED', text: `選択中の項目 (${listSelection.length}件)` }
      ] :
      [
        { value: 'VIEW', text: `表示中の全項目 (${viewCaseCount}件)` }
      ]
  }
  return []
})

const readyToExport = computed(() => outputText.value.length > 4)

// エクスポート処理
const Process = async () => {
  if (setting.year === '') {
    await Popups.error('年次が選択されていません.', 'エクスポートエラー')
    return
  }

  if (status.processing) return

  status.processing = true
  status.processStep = 0
  status.progressCheckConsistency = 0
  status.progressCreateData = 0
  status.showPreview = false
  outputText.value = ''

  try {
    await CheckSystemConfiguration()
    status.processStep++

    await CheckImportedRecords()
    status.processStep++

    const documentIds = await CheckConsistency()
    status.processStep++

    const { exportItems, countOfDenial } = await CreateExportData(documentIds)
    status.processStep++

    outputText.value = await FinaliseExportData(exportItems, countOfDenial)
    status.processStep++
  } catch (error) {
    await nextTick()
    const errorMessage = error.message.trim()
    if (errorMessage) {
      await Popups.error(errorMessage, 'エクスポートエラー')
    }
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
    if (!setting.csv) {
      // JSONデータを設定
      temporaryElementA.href = URL.createObjectURL(new Blob([outputText.value]), { type: 'application/json' })
      temporaryElementA.download = 'joed-export-data.json'
    } else {
      // SHIFT-JISのCSVデータを設定
      temporaryElementA.href = URL.createObjectURL(new Blob([new Uint8Array(Encoding.convert(outputText.value, { to: 'SJIS', type: 'array' }))]), { type: 'text/csv;charset=shift_jis;' })
      temporaryElementA.download = 'joed-export-data.csv'
    }
    temporaryElementA.style.display = 'none'
    document.body.appendChild(temporaryElementA)
    temporaryElementA.click()
    document.body.removeChild(temporaryElementA)
  }
}

// Step 1 - 施設名とIDが設定されているかを確認
//
const CheckSystemConfiguration = async () => {
  // CSV, バックアップデータでエラーチェックなしの場合 このチェックはスキップ
  if ((setting.backup || setting.csv) && !setting.validate) {
    return
  }

  // 施設コードは必須
  try {
    if (!store.getters['system/InstitutionID']) {
      throw new Error('施設情報が未設定です.')
    }

    // 施設コードのフォーマットチェック
    if (store.getters['system/InstitutionID'].match(InstituteIDFormat) === null) {
      throw new Error('不正な施設コードが設定されています.')
    }

    // 無効な施設コードのチェック
    if (InvalidIDs().includes(store.getters['system/InstitutionID'])) {
      throw new Error('利用できない施設コードが設定されています.')
    }
  } catch (error) {
    if (await Popups.confirmYesNo(`${error.message}\n設定画面へ移動しますか?`, '施設情報設定エラー')) {
      router.push({ name: 'settings' })
    }
    throw new Error()
  }
}

// Step 2 - インポートデータがすべて確認されているかを確認
//
// インポートデータ( Imported )で特になんの問題も無くインポートできたもの以外には Notification がある
const CheckImportedRecords = async () => {
  // バックアップデータ, CSVでエラーチェックなしでは チェックをスキップする
  if ((setting.backup || setting.csv) && !setting.validate) {
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
    throw new Error('登録内容の確認が必要な症例が ' + count + ' 症例あります.\n確認を御願いします.')
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
  const queryParamaters = {
    Query: {
      DocumentId: { $gt: 0 }
    },
    Projection: { DocumentId: 1, PatientId: 1, DateOfProcedure: 1, _id: 0 }
  }
  if (setting.year !== 'ALL') {
    if (setting.year === 'VIEW') {
      const listSelection = store.getters['GetSelectedUidsForExport'] || []
      if (listSelection.length > 0) {
        queryParamaters.Query.DocumentId = { $in: listSelection }
      }
    } else if (setting.year === 'SELECTED') {
      const listSelection = store.getters['GetSelectedUidsForExport'] || []
      if (listSelection.length > 0) {
        queryParamaters.Query.DocumentId = { $in: listSelection }
      } else {
        throw new Error('選択中の症例がありません.')
      }
    } else {
      queryParamaters.Query.DateOfProcedure = { $regex: new RegExp('^' + setting.year + '-') }
    }
  }
  const queriedDocuments = await store.dispatch('dbFind', queryParamaters) || []

  if (queriedDocuments.length === 0) {
    throw new Error('エクスポートの対象がありません.')
  } else {
    const dupcheck = queriedDocuments
      .map(item => item.DateOfProcedure + ' ~ ' + item.PatientId)
      .filter((item, index, self) => self.indexOf(item) !== index)

    if (dupcheck.length > 0) {
      throw new Error('同一の日付に同一IDの登録があります.重複登録の可能性があります.\n' + dupcheck.join(',\n'))
    }
  }

  const documentIds = queriedDocuments.map(item => item.DocumentId)

  // バックアップデータ, CSVでエラーチェックなしでは これ以上のチェックをスキップする
  if ((setting.backup || setting.csv) && !setting.validate) {
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

    if (setting.backup || setting.csv) {
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

// Step 5 - データファイルデータの作成～ヘッダの付与とテキスト化
//
const FinaliseExportData = async (exportItem, countOfDenial) => {
  // バックアップ、CSVデータではヘッダは不要
  if (!(setting.backup || setting.csv)) {
    const length = exportItem.length

    if (length > 0) {
      const TimeStamp = Date.now()
      const Encoder = new TextEncoder()

      const outputText = JSON.stringify(exportItem, ' ', 2)
      // ヘッダが保持するドキュメント部分のハッシュ値
      const hash = HHX.h64(
        Encoder.encode(outputText).buffer,
        TimeStamp.toString()).toString(16)
      exportItem.unshift({
        InstitutionName: store.getters['system/InstitutionName'],
        InstitutionID: store.getters['system/InstitutionID'],
        TimeStamp,
        Year: setting.year || 'ALL',
        NumberOfCases: exportItem.length,
        NumberOfDenial: countOfDenial,
        Version: store.getters['system/ApplicationVersion'],
        Platform: store.getters['system/Platform'],
        hash
      })
    }
  }

  // CSV以外はJSONテキストに変換して返す
  if (!setting.csv) {
    return JSON.stringify(exportItem, ' ', 2)
  }

  // CSVデータに変換する項目を指定
  const csvHeader = [
    { header: '患者ID', key: 'PatientId' },
    { header: '患者名', key: 'Name' },
    { header: '年齢', key: 'Age' },
    { header: '手術日', key: 'DateOfProcedure' },
    { header: '区分', key: 'TypeOfProcedure' },
    { header: '主たる診断', key: 'Diagnosis' },
    { header: '主たる実施手術', key: 'Procedure' },
    { header: '合併症の有無', key: 'PresentAE' },
    { header: 'メモ', key: 'Note' }
  ]

  // CSV用出力に抽出と成形
  const csvObjects = exportItem.map(item => {
    return {
      PatientId: item.PatientId,
      Name: item?.Name,
      Age: item?.Age,
      DateOfProcedure: item.DateOfProcedure,
      TypeOfProcedure: item?.TypeOfProcedure,
      Diagnosis: item.Diagnoses?.[0]?.Text,
      Procedure: item.Procedures?.[0]?.Text,
      PresentAE: item.PresentAE ? 'あり' : 'なし',
      Note: item.Note || ''
    }
  })

  // CSVデータに変換して返す
  return generateCSVFromObjects(csvObjects, csvHeader)
}
</script>

<template>
  <div class="utility">
    <div class="utility-switches">
      <div>
        <div class="label w30">出力の形式</div>
        <div class="field w70">
          <select v-model="exportType">
            <option value="registration">学会提出データ</option>
            <option value="dump">バックアップデータ</option>
            <option value="CSV">CSVデータ</option>
          </select>
        </div>
      </div>

      <div>
        <div class="label w30">出力する年次</div>
        <SelectYear
          class="field w70"
          v-model="setting.year"
          :selection-all="exportType === 'dump' || exportType === 'CSV'"
          :optional-values="csvOptionalExportTargets"
        />
      </div>

      <InputSwitchField
        v-model="setting.validate"
        :disabled="exportType === 'registration'"
        title="データのエラーチェック"
        :options="[{ text: '行う', value: true }, { text: '行わない', value: false }]"
        :class-override="['label w30', 'field w70']"
      />

      <div>
        <div class="label w30"></div>
        <div class="field w70">
          <el-button
            type="primary"
            @click="Process()"
            :disabled="!setting.year || status.processing"
            >出力データの作成</el-button>
        </div>
      </div>
    </div>

    <el-collapse-transition>
      <div class="progress-views" v-show="status.processStep !== undefined">
        <el-steps
          :active="status.processStep"
          process-status="wait"
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
      <ViewerOverlay @click="status.showPreview = false">{{ outputText }}</ViewerOverlay>
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
