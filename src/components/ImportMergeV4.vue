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
      <el-button type="primary" :disabled="disabled || Processing " @click="ProcessStream">ファイルの読み込みと変換</el-button>
    </div>
    <div class="progress-views">
      <Reports :report="LogMessages.join('\n')" v-show="LogMessages.length > 0"/>
    </div>
  </div>
</template>

<script>
import Reports from '@/components/Atoms/Reports'
import { phraseTitledCSV } from '@/modules/CSV'
import { ValidateRecords, CreateDocument } from '@/modules/ImportMergeV4.js'
import * as Popups from '@/modules/Popups'

export default {
  name: 'ImportMergeV4',
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
      Processing: true,
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
      this.Processing = false
      this.LogMessages.splice(0)
    },
    async ProcessStream () {
      const ImportedDocuments = []
      try {
        this.Processing = true
        // mergeファイル(quoted, titled CSV)の読み込み
        // 不正なCSVファイル(フィールド数が違うなど)では例外を発生する.
        const records = phraseTitledCSV(this.stream)

        // CSVのフォーマット確認
        this.LogMessages.push(
          'ファイルには' + ValidateRecords(records) + '件のレコードが含まれています.'
        )
        if (!records[0].ID) {
          this.LogMessages.push('指定されたファイルは提出用データです.患者IDは自動生成されます.')
        }
        if (!records[0]['手術日']) {
          this.LogMessages.push('指定されたファイルは手術日の設定のない提出用データです.仮の手術日を手術年から自動生成します.')
        }

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

        // 作成したドキュメントを親コンポーネントに送る
        this.$emit('done', ImportedDocuments)
      } catch (error) {
        Popups.alert(error.message)
      }
    }
  }
}
</script>
