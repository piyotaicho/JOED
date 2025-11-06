<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import * as Popups from '@/modules/Popups'
import InputFile from '@/components/Molecules/InputFile.vue'
import ImportJSON from '@/components/Molecules/ImportJSON.vue'
import ImportCSV from '@/components/Molecules/ImportCSV.vue'
import ImportMergeV4 from '@/components/Molecules/ImportMergeV4.vue'
import ViewerOverlay from '@/components/Molecules/ViewerOverlay.vue'
import TheWrapper from '@/components/Atoms/TheWrapper.vue'
import { nextTick, ref, reactive, watch } from 'vue'
import { useStore } from '@/store'

const store = useStore()

const importMode = ref('json')
const data = reactive({
  Processing: false,
  Committing: 0,
  FileExtentions: {
    json: '.json',
    csv: '.csv,.mer',
    merge: '.mer'
  },
  FileStream: '',
  DocumentupdateCreatedDocument: false,
  CreatedDocument: [],
  count: 0,
  errors: [],
  errorText: ''
})

watch(importMode, () => resetState())

const resetState = () => {
  data.Processing = false
  data.Committing = 0

  data.DocumentupdateCreatedDocument = false

  data.FileStream = ''
  data.CreatedDocument.splice(0)

  data.count = 0
  data.errors.splice(0)
  data.errorText = ''
}

const clickViewer = () => {
  data.errorText = ''
}

const saveErrorText = () => {
  if (data.errorText !== '') {
    const temporaryElementA = document.createElement('A')
    temporaryElementA.href = URL.createObjectURL(new Blob([data.errorText]), { type: 'text/plain' })
    temporaryElementA.download = 'import-error-report.txt'
    temporaryElementA.style.display = 'none'
    document.body.appendChild(temporaryElementA)
    temporaryElementA.click()
    document.body.removeChild(temporaryElementA)
  }
}

const updateStreamData = (content) => {
  resetState()
  data.FileStream = content
}

const updateCreatedDocument = (newdocuments) => data.CreatedDocument.splice(0, data.CreatedDocument.length, ...newdocuments)

const commit = async () => {
  if (data.CreatedDocument.length === 0) {
    return
  }

  data.Committing = 1
  data.ProgressBar = 0
  data.Processing = true

  data.count = 0
  data.errors.splice(0)

  for (const record of data.CreatedDocument) {
    await store.dispatch('UpsertDocument', record)
      .then(() => data.count++)
      .catch(error => data.errors.push(error.message || error))
  }

  data.ImportProgress = 100
  data.Committing = 2
  data.Processing = false
  await nextTick(() => {})

  const message = data.count + ' 例を登録しました.'
  if (data.errors.length === 0) {
    Popups.information(message)
  } else {
    let exportText = message + '\n' + data.errors.length + ' 件の登録に失敗しました.'
    if (await Popups.confirmAnyOk(exportText, 'エラー内容を表示') === false) {
      // errorsを保存
      const countChars = data.errors.length.toString().length
      const spaces = ((n) => {
        let s = ''
        for (let i = 0; i < n; i++) {
          s += ' '
        }
        return s
      })(countChars)

      exportText += '\n---\n' + data.errors.map((str, index) =>
        (spaces + (index + 1).toString()).slice(-countChars) + ': ' + str
      ).join('\n')
      data.errorText = exportText
    }
  }

  data.CreatedDocument.splice(0)
  nextTick(() => {})
}
</script>

<template>
  <div class="utility">
    <div>
      <div class="title">データ読み込み</div>
      <div class="subtitle">ファイル種別の指定</div>
      <div>
        <select v-model="importMode">
          <option value="json">JOED5のバックアップ形式に準拠した jsonファイル</option>
          <option value="csv">ExcelやFilemaker等から出力した CSVファイル</option>
          <option value="merge">症例登録システム version4 で入力・出力した mergeファイル</option>
        </select>
      </div>
      <input-file @load="updateStreamData" ButtonText="ファイルの指定" :AcceptFileTypes="data.FileExtentions[importMode]" />
    </div>

    <!-- Importerセクション -->
    <import-CSV v-if="importMode === 'csv'"
      :stream="data.FileStream" :disabled="!data.FileStream" @done="updateCreatedDocument" />
    <import-merge-v4 v-if="importMode === 'merge'"
      :stream="data.FileStream" :disabled="!data.FileStream" @done="updateCreatedDocument" />
    <import-JSON v-if="importMode === 'json'"
      :stream="data.FileStream" :disabled="!data.FileStream" @done="updateCreatedDocument" />

    <div>
      <el-button type="primary" :disabled="data.CreatedDocument.length === 0 || data.Committing > 0"
        @click="commit">変換したデータの登録</el-button>
    </div>

    <template v-if="data.errorText !== ''">
      <ViewerOverlay buttonLabel="ファイルに保存" @click="clickViewer()" @buttonClick="saveErrorText()">{{data.errorText}}</ViewerOverlay>
    </template>
    <TheWrapper prevent-close v-if="data.Processing" />
  </div>
</template>
