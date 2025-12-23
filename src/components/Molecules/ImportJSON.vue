<script setup>
import { watch, ref, toRef } from 'vue'
import ReportViewer from '@/components/Atoms/Reports.vue'
import { ValidateRecords, CreateDocument } from '@/modules/ImportJSON'
import * as Popups from '@/modules/Popups'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  stream: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['done'])

const stream = toRef(props, 'stream')
watch(stream, async () => ResetState())

// 一時ドキュメントはnon reactive
const records = []

const Processing = ref(false)
const LogMessages = ref([])

const ResetState = () => {
  Processing.value = false
  LogMessages.value.splice(0)

  records.splice(0)

  try {
    const parseResult = JSON.parse(props.stream)
    if (
      Array.isArray(parseResult) &&
      parseResult.length > 0 &&
      toString.call(parseResult[0]) === '[object Object]'
    ) {
      records.splice(0, 0, ...parseResult)
    } else {
      throw new Error()
    }
  } catch (e) {
    if (e.name === 'SyntaxError') {
      Popups.alert('指定されたファイルは正しいJSON形式ではありません.')
    } else {
      Popups.alert('指定されたファイルの構造が違います.')
    }
  }
}

const ProcessStream = async () => {
  LogMessages.value.splice(0)
  Processing.value = true

  const ImportedDocuments = []
  try {
    const validationResult = ValidateRecords(records)

    if (validationResult.hasHeader) {
      LogMessages.value.push('ファイルは学会提出用データです.必要に応じてフィールド内容が自動生成されます.')
    }
    if (validationResult.anonymised && !validationResult.hasHeader) {
      LogMessages.value.push('ファイルにはIDなどが含まれていません.必要に応じてフィールド内容が自動生成されます.')
    }
    LogMessages.value.push('ファイルには' + validationResult.length + '件の症例レコードがあります.')

    // レコード毎にドキュメントの検証
    for (const record of records) {
      try {
        const newdocument = CreateDocument(record)
        ImportedDocuments.push(newdocument)
      } catch (error) {
        if (!(await Popups.confirmYesNo('指定されたファイル中に不適切なレコードが認められました.\n残りの処理を続行しますか?'))) {
          throw new Error('不適切なレコードにより変換を中止しました.')
        }
      }
    }
    LogMessages.value.push(`${ImportedDocuments.length}件のレコードが変換されました.`)

    // 作成したドキュメントを親に送る
    emit('done', ImportedDocuments)
  } catch (error) {
    Popups.alert(error.message)
  }
}
</script>

<template>
  <div>
    <div style="padding-bottom: 1rem;">
      JOED5の症例レコードフォーマットに一致したJSONファイルを読み込むことが出来ます.<br/>
      規定のフォーマットにある程度一致していれば要確認のフラグはつきません.<br/>
      提出用データのインポートの際には,手術日・患者IDは自動生成されますがあまりお薦めできません.<br/>
      データフォーマットについては, 設定のライセンス表記中に記載されたJOEDの開発リポジトリのドキュメントをご覧下さい.<br/>
    </div>
    <div>
      <el-button type="primary" :disabled="props.disabled || Processing " @click="ProcessStream">ファイルの読み込みと変換</el-button>
    </div>
    <div class="progress-views">
      <ReportViewer :report="LogMessages.join('\n')" v-show="LogMessages.length > 0"/>
    </div>
  </div>
</template>
