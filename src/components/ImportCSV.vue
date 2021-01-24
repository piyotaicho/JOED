<template>
  <div>
    <div>
      Excelなどから出力したCSVファイルから症例データの雛型として読み込むことが出来ます.<br/>
      全ての項目を入力することは出来ませんが, CSVファイルのフィールドを指定の項目に割り当てて読み込みます.<br/>
      手術実施日と患者IDは重複入力確認のため必須入力です.<br/>
      完全な入力は原理的に不可能ですので,全ての入力に編集と確認の操作が必要になります.<br/>
    </div>
    <div>
      <div>
        <LabeledCheckbox v-model="CSVhasTitle" :value="true">CSVファイルの先頭行はフィールド名</LabeledCheckbox>
      </div>
      <QueryBuilder
      :records="recordTitle"
      :functions="functions"
      :CSV="previewCSV"
      :CSVhasTitleRow="CSVhasTitle"
      />
    </div>
    <div>
      <LabeledCheckbox v-model="ReplaceStrings" :value="false">診断名称・手術名称に対して基本的な置換操作を行う</LabeledCheckbox>
      <el-tooltip placement="top-start">
        <template #content><div>チョコレート嚢胞→子宮内膜症性嚢胞, 子宮外妊娠→異所性妊娠 など<br/>2019年以前の登録で利用されていた内容のうち表記変更のあったものを一律に置換します.</div></template>
        <i class="el-icon-question" style="padding-top: 0.36rem; margin-left: 0.6rem;"/>
      </el-tooltip>
      <br/>
      <el-button type="primary" :disabled="disabled" @click="ProcessStream">上記ルールに則ってデータを変換</el-button>
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
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'
import QueryBuilder from '@/components/Molecules/QueryBuilder'
import StepIndicator from '@/components/Molecules/StepIndicator'
import Reports from '@/components/Atoms/Reports'
import { parseCSV } from '@/modules/CSV'
import { CreateDocument } from '@/modules/ImportCSV.js'
import { DateFormatPattern } from '@/modules/CaseValidater'
import * as Popups from '@/modules/Popups'

export default {
  name: 'ImportCSV',
  components: { LabeledCheckbox, QueryBuilder, StepIndicator, Reports },
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
      LogMessages: [],
      CSVhasTitle: true,
      ReplaceStrings: false,
      Query: {},
      records: []
    })
  },
  watch: {
    stream () {
      this.ResetState()
    }
  },
  computed: {
    recordTitle () {
      return [
        '手術日 (必須)', 'ID (必須)',
        '患者名', '年齢', '腫瘍登録番号', 'NCD症例識別コード',
        '手術時間',
        '合併症の有無',
        '手術診断1', '手術診断1カテゴリ', '手術診断1良性/悪性',
        '手術診断2', '手術診断2カテゴリ', '手術診断2良性/悪性',
        '手術診断3', '手術診断3カテゴリ', '手術診断3良性/悪性',

        '実施手術1', '実施手術1カテゴリ', '実施手術1良性/悪性',
        '実施手術2', '実施手術2カテゴリ', '実施手術2良性/悪性',
        '実施手術3', '実施手術3カテゴリ', '実施手術3良性/悪性'
      ]
    },
    functions () {
      return {
        '自動生成 - ID': { compute: 'ID', title: '自動生成' },
        '定数 - 日付(ユーザ入力)': { constants: '$', title: 'yyyy-mm-dd の形式で日付文字列を入力して下さい.', rule: DateFormatPattern },
        '定数 - 文字列(ユーザ入力)': { constants: '$', title: '任意の文字列を入力可能です.' },
        '定数 - 数値(ユーザ入力)': { constants: '$', title: '任意の数値を入力可能です.', rule: '^[1-9][0-9]*$' }, // HARDCODED
        '定数 - あり': { constants: false, title: 'あり' },
        '定数 - なし': { constants: false, title: 'なし' },
        '定数 - 腹腔鏡': { constants: '腹腔鏡' },
        '定数 - ロボット': { constants: 'ロボット' },
        '定数 - 腹腔鏡悪性': { constants: '腹腔鏡悪性' },
        '定数 - ロボット悪性': { constants: 'ロボット悪性' },
        '定数 - 子宮鏡': { constants: '子宮鏡' },
        '定数 - 卵管鏡': { constants: '卵管鏡' },
        '定数 - 良性': { constants: '良性' },
        '定数 - 悪性': { constants: '悪性' }
      }
    },
    previewCSV () {
      return this.records.length > 0 ? this.records[0] : []
    }
  },
  methods: {
    ResetState () {
      this.Processing = -1
      this.LogMessages.splice(0)
      this.records.splice(0)
      this.records.splice(0, 0, parseCSV(this.stream))
    },
    CreateQuery (queryobj) {
      this.$set(this, 'Query', queryobj)
    },
    async ProcessStream () {
      this.LogMessages.splice(0)
      const ImportedDocuments = []
      try {
        this.ProcessStep = 0
        // mergeファイル(quoted, titled CSV)の読み込み
        // 不正なCSVファイル(フィールド数が違うなど)では例外を発生する.
        const records = parseCSV(this.stream)
        // 読み込むデータの有無を確認
        if (records.length === 0) {
          throw new Error('ファイルに有効なレコードが含まれていません.')
        } else {
          this.LogMessages.push(`ファイル中に${records.length}件のレコードが含まれています.`)
        }

        this.ProcessStep++
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

        this.ProcessStep++
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

        this.ProcessStep++
        // 作成したドキュメントを親に送る
        this.$emit('done', ImportedDocuments)
      } catch (error) {
        Popups.alert(error.message)
      }
    }
  }
}
</script>
