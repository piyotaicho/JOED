<template>
  <div>
    <div style="padding-bottom: 1rem;">
      JOED5の症例レコードフォーマットに一致したJSONファイルを読み込むことが出来ます.<br/>
      規定のフォーマットにある程度一致していれば要確認のフラグはつきません.<br/>
      提出用データのインポートの際には,手術日・患者IDは自動生成されますがあまりお薦めできません.<br/>
      データフォーマットについては, 設定のライセンス表記中に記載されたJOEDの開発リポジトリのドキュメントをご覧下さい.<br/>
    </div>
    <div>
      <el-button type="primary" :disabled="disabled || Processing " @click="ProcessStream">ファイルの読み込みと変換</el-button>
    </div>
    <div class="progress-views">
      <Reports :report="LogMessages.join('\n')" v-show="LogMessages.length > 0"/>
    </div>
  </div>
</template>

<script>
import Reports from '@/components/Atoms/Reports'
import { ValidateRecords, CreateDocument } from '@/modules/ImportJSON'
import * as Popups from '@/modules/Popups'

export default {
  name: 'ImportJSON',
  components: { Reports },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    stream: {
      type: String,
      required: true
    }
  },
  data () {
    return ({
      Processing: false,
      LogMessages: [],
      CSVhasTitle: true,
      ReplaceStrings: false,
      RuleSet: {},
      records: []
    })
  },
  watch: {
    stream () {
      this.ResetState()
    }
  },
  methods: {
    ResetState () {
      this.Processing = false
      this.LogMessages.splice(0)
      this.records.splice(0)
      try {
        const parsedstream = JSON.parse(this.stream)
        if (
          Array.isArray(parsedstream) &&
          parsedstream.length > 0 &&
          toString.call(parsedstream[0]) === '[object Object]'
        ) {
          this.records.splice(0, 0, ...parsedstream)
        } else {
          throw new Error()
        }
      } catch (e) {
        if (e.name === 'SyntaxError') {
          Popups.alert('指定されたファイルはJSON形式ではありません.')
        } else {
          Popups.alert('指定されたファイルの構造が違います.')
        }
      }
    },
    async ProcessStream () {
      this.LogMessages.splice(0)
      this.Processing = true

      const ImportedDocuments = []
      try {
        const validation = ValidateRecords(this.records)

        if (validation.hasHeader) {
          this.LogMessages.push('ファイルは学会提出用データです.必要に応じてフィールド内容が自動生成されます.')
        }
        if (validation.anonymised && !validation.hasHeader) {
          this.LogMessages.push('ファイルにはIDなどが含まれていません.必要に応じてフィールド内容が自動生成されます.')
        }
        this.LogMessages.push('ファイルには' + validation.length + '件の症例レコードがあります.')

        // レコード毎にドキュメントの検証
        for (const record of this.records) {
          try {
            const newdocument = CreateDocument(record)
            ImportedDocuments.push(newdocument)
          } catch (error) {
            console.warn(`importing JSON - ${error.message}.`)

            if (!(await Popups.confirmYesNo('指定されたファイル中に不適切なレコードが認められました.\n残りの処理を続行しますか?'))) {
              throw new Error('不適切なレコードにより変換を中止しました.')
            }
          }
        }
        this.LogMessages.push(`${ImportedDocuments.length}件のレコードが変換されました.`)

        // 作成したドキュメントを親に送る
        this.$emit('done', ImportedDocuments)
      } catch (error) {
        Popups.alert(error.message)
      }
    }
  }
}
</script>
