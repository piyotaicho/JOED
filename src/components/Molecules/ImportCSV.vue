<script setup>
import { defineProps, defineEmits, reactive, computed, watch, nextTick } from 'vue'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'
import QueryBuilder from '@/components/Organisms/QueryBuilder'
import ReportViewer from '@/components/Atoms/Reports'
import { parseCSV } from '@/modules/CSV'
import { CreateDocument, Migrate } from '@/modules/ImportCSV.js'
import { DateFormatPattern } from '@/modules/CaseValidater'
import * as Popups from '@/modules/Popups'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  stream: {
    type: String,
    required: true
  },
  preservedRule: {
    type: String,
    default: '{}'
  }
})

const emit = defineEmits([])

const data = reactive({
  Processing: -1,
  LogMessages: [],
  CSVhasTitle: true,
  ReplaceStrings: false,
  RuleSet: {},
  records: []
})

watch(props.stream, async () => await resetState())

const recordTitle = [
  '手術日 (必須)', 'ID (必須)',
  '患者名', '年齢', '腫瘍登録番号', 'NCD症例識別コード',
  '手術時間',
  '合併症の有無',

  '手術診断1', '手術診断1カテゴリ', '手術診断1良性/悪性',
  '実施手術1', '実施手術1カテゴリ', '実施手術1良性/悪性',

  '手術診断2', '手術診断2カテゴリ', '手術診断2良性/悪性',
  '実施手術2', '実施手術2カテゴリ', '実施手術2良性/悪性',

  '手術診断3', '手術診断3カテゴリ', '手術診断3良性/悪性',
  '実施手術3', '実施手術3カテゴリ', '実施手術3良性/悪性',

  '手術診断4', '手術診断4カテゴリ', '手術診断4良性/悪性',
  '実施手術4', '実施手術4カテゴリ', '実施手術4良性/悪性'
]

const functions = {
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

const CSV = computed(() => props.records.length > 0 ? data.records : [[]])

const disableProcess = computed(() => {
  if (
    !props.disabled &&
    data.records.length > 0
  ) {
    return false
  } else {
    return true
  }
})

const resetState = async () => {
  data.Processing = -1
  data.LogMessages.splice(0)
  data.records.splice(0)

  try {
    data.records.splice(0, 0, ...parseCSV(props.stream))
  } catch (error) {
    Popups.alert(error.message)
  }

  if (data.preservedRule !== '{}' && await Popups.confirmYesNo('保存されたルールを利用しますか?')) {
    updateRuleset(JSON.parse(props.preservedRule))
  } else {
    if (Object.keys(data.RuleSet).length > 0 && await Popups.confirmYesNo('現在のルールを利用しますか?') === false) {
      updateRuleset({})
    }
  }
}

const convertStream = async () => {
  data.LogMessages.splice(0)
  const ImportedDocuments = []
  try {
    data.ProcessStep = 0
    data.LogMessages.push('ファイルにはタイトル行を含めて' + data.records.length + '行の情報があります.')

    data.ProcessStep++
    await nextTick()

    // ルールセットの確認
    if (data.RuleSet['手術日 (必須)'] && data.RuleSet['ID (必須)']) {
      for (const title of ['手術診断', '実施手術']) {
        for (const index of ['1', '2', '3', '4']) {
          if (data.RuleSet[title + index]) {
            if (!data.RuleSet[title + index + 'カテゴリ']) {
              throw new Error(title + index + 'に対応するカテゴリの割り当てがありません.')
            }
          }
        }
      }
    } else {
      throw new Error('手術日とIDへの割り当ては必須です.')
    }

    // レコード毎にドキュメントを作成
    for (
      let index = data.CSVhasTitle ? 1 : 0;
      index < data.records.length;
      index++
    ) {
      const record = data.records[index]
      try {
        const newdocument = CreateDocument(record, data.RuleSet)
        if (data.ReplaceStrings) {
          // 2019以前の登録で使用されていたルールのうち単純置換のものを置換する
          // ただしDateOfProcedure > 2019に限る
          Migrate(newdocument)
        }
        ImportedDocuments.push(newdocument)
      } catch (error) {
        console.warn(`On line ${index + 1} - ${error.message}.`)

        if (!(await Popups.confirmYesNo(error.message + '\n残りの処理を続行しますか?'))) {
          throw new Error(`${index + 1}行目の不適切なフィールドにより変換を中止しました.`)
        }
      }
    }
    data.LogMessages.push(`${ImportedDocuments.length}件のレコードが変換されました.`)

    data.ProcessStep++
    // 作成したドキュメントを親に送る
    emit('done', ImportedDocuments)
  } catch (error) {
    Popups.alert(error.message)
  }
}

const updateRuleset = async (rule) => {
  for (const key of Object.keys(data.RuleSet)) {
    deleteRuleSetProperty(key)
  }
  for (const key of Object.keys(rule)) {
    setRuleSetPropertyValue(key, rule[key])
  }
  await nextTick()
}

const setRuleSetPropertyValue = async (key, value) => {
  data.RuleSet[key] = value
  await nextTick()
}

const deleteRuleSetProperty = async (key) => {
  delete data.RuleSet[key]
  await nextTick()
}

const storeRuleset = () => emit('store', JSON.stringify(data.RuleSet))
</script>

<template>
  <div>
    <div style="padding-bottom: 1rem;">
      Excelなどから出力したCSVファイルからデータの雛型を読み込むことが出来ます.<br/>
      全ての項目を完全に入力することは出来ませんが, CSVファイルのフィールドや定数を指定の項目に割り当てて読み込みます.<br/>
      手術実施日と患者IDは重複入力確認のため必須入力です.<br/>
      完全な入力は原理的に不可能ですので,全ての入力に編集と確認の操作が必要になります.<br/>
    </div>
    <div style="padding-bottom: 1rem;" v-show="data.records.length > 0">
      <div>
        <LabeledCheckbox :container.sync="data.CSVhasTitle" :value="true">CSVファイルの先頭行はフィールド名</LabeledCheckbox>
      </div>
      <QueryBuilder
      :records="recordTitle"
      :functions="functions"
      :CSV="CSV"
      :CSVhasTitleRow="data.CSVhasTitle"
      :ruleset="data.RuleSet"
      @change="updateRuleset"
      @set="setRuleSetPropertyValue"
      @delete="deleteRuleSetProperty"
      />
      <LabeledCheckbox :container.sync="data.ReplaceStrings" :value="false">診断名称・実施手術の入力に対して基本的な置換操作を行う</LabeledCheckbox>
      <el-tooltip placement="top-start" :tabindex="-1">
        <template #content><div>チョコレート嚢胞→子宮内膜症性嚢胞, 子宮外妊娠→異所性妊娠 など<br/>2019年以前の登録で利用されていた内容のうち表記変更のあったものを一律に置換します.</div></template>
        <i class="el-icon-question" style="padding-top: 0.36rem; margin-left: 0.6rem;"/>
      </el-tooltip>
    </div>
    <div style="padding-bottom: 1rem;">
      <br/>
      <el-button type="primary" :disabled="disableProcess" @click="convertStream">上記ルールに則ってデータを変換</el-button>
      <el-button type="primary" :disabled="props.disabled" @click="storeRuleset">ルールを保存</el-button>
    </div>
    <div class="progress-views">
      <ReportViewer :report="LogMessages.join('\n')" v-show="data.LogMessages.length > 0"/>
    </div>
  </div>
</template>
