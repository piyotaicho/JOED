<template>
  <div>
    <div>
      症例登録システムver.4で入力し出力したmergeファイルから症例データを読み込むことが出来ます.<br/>
      症例登録システムver.4にインポートして出力したデータは利用できません.上記ファイル種別で CSVファイル を使用してください.<br/>
      また,システムの大幅な変更に伴い以下の制限がありますがご了承ください.<br/>
      <ul>
        <li>この処理で読み込まれたデータについては, 全て編集と確認の操作が必要になります.</li>
        <li>合併症については「合併症なし」以外は自動での読み込みが出来ません. 個々に入力を御願いします.</li>
      </ul>
    </div>
    <div>
      <el-button type="primary" :disabled="disabled || Processing > 0" @click="ProcessStream">ファイルの読み込みと変換</el-button>
    </div>
    <div class="progress-views">
      <step-indicator :step="0" :stepcount="Processing" icon="el-icon-odometer" description="件数の確認"></step-indicator>
      <step-indicator :step="1" :stepcount="Processing" icon="el-icon-search" description="入力ファイル確認"></step-indicator>
      <step-indicator :step="2" :stepcount="Processing" icon="el-icon-cpu" description="フィールドの割り当てとレコードの検証"></step-indicator>

      <Reports :report="LogMessages.join('\n')" v-show="LogMessages.length > 0"/>
    </div>
  </div>
</template>

<script>
import StepIndicator from '@/components/Molecules/StepIndicator'
import Reports from '@/components/Atoms/Reports'
import { phraseTitledCSV } from '@/modules/CSV'
import { CreateDocument } from '@/modules/ImportMergeV4.js'
import * as Popups from '@/modules/Popups'

export default {
  name: 'ImportMergeV4',
  components: { StepIndicator, Reports },
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
      Processing: -1,
      LogMessages: []
    })
  },
  watch: {
    stream () {
      this.ResetState()
    }
  },
  methods: {
    ResetState () {
      this.Processing = -1
      this.LogMessages.splice(0)
    },
    async ProcessStream () {
      this.LogMessages.splice(0)
      const ImportedDocuments = []
      try {
        this.Processing = 0
        // mergeファイル(quoted, titled CSV)の読み込み
        // 不正なCSVファイル(フィールド数が違うなど)では例外を発生する.
        const records = phraseTitledCSV(this.stream)
        // 読み込むデータの有無を確認
        if (records.length === 0) {
          throw new Error('ファイルに有効なレコードが含まれていません.')
        } else {
          this.LogMessages.push(`ファイル中に${records.length}件のレコードが含まれています.`)
        }

        this.Processing++
        // 内部ID, 手術時間, 手術年 で正規入力されたものかを判別
        if (records[0]['内部ID'] && records[0]['手術時間'] && records[0]['手術年']) {
          if (!records[0].ID) {
            this.LogMessages.push('指定されたファイルは提出用データです.患者IDは自動生成されます.')
          }
          if (!records[0]['手術日']) {
            this.LogMessages.push('指定されたファイルは手術日の設定のない提出用データです.仮の手術日を手術年から自動生成します.')
          }
        } else {
          throw new Error('指定されたファイルは 症例登録システムJOE-D version 4 で適切に入力・出力されたmergeファイル(.mer)ではありません.')
        }

        this.Processing++
        // レコード毎にドキュメントを作成
        for (const record of records) {
          try {
            ImportedDocuments.push(CreateDocument(record))
          } catch (error) {
            if (!(await Popups.confirm('指定されたファイル中に不適切なレコードがあります.\n残りの処理を続行しますか?'))) {
              throw new Error('不適切なレコード\n', record.map(field => '"' + field + '"').join(','))
            }
          }
        }
        this.LogMessages.push(`${ImportedDocuments.length}件のレコードが登録用に準備でされました.`)

        this.Processing++
        // 作成したドキュメントを親に送る
        this.$emit('done', ImportedDocuments)
      } catch (error) {
        Popups.alert(error.message)
      }
    }
  }
}
</script>
