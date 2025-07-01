<script setup>
import { shallowRef, reactive, computed, watch, nextTick, triggerRef } from 'vue'
import { useStore } from '@/store'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'
import QueryBuilder from '@/components/Organisms/QueryBuilder'
import ReportViewer from '@/components/Atoms/Reports'
import { parseCSV } from '@/modules/CSV'
import { CreateDocument, Migrate } from '@/modules/ImportCSV.js'
import * as Popups from '@/modules/Popups'

const store = useStore()
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

const emit = defineEmits(['store', 'done'])

const data = reactive({
  Processing: -1,
  LogMessages: [],
  CsvHeader: true,
  PerformMigration: false,
  CsvArray: []
})

// RuleSetの更新は必ずメソッドを経由するのでshallowRefでdeep対応する
const RuleSet = shallowRef({})

const rulesetJson = computed(() => JSON.stringify(RuleSet.value))

const stream = computed(() => props.stream)
watch(stream, async () => await resetState())

const csvArray = computed(() => data.CsvArray.length > 0 ? data.CsvArray : [[]])

const disableProcess = computed(() => {
  if (
    !props.disabled &&
    data.CsvArray.length > 0
  ) {
    return false
  } else {
    return true
  }
})

const resetState = async () => {
  data.Processing = -1
  data.LogMessages.splice(0)
  data.CsvArray.splice(0)

  try {
    data.CsvArray.splice(0, 0, ...parseCSV(props.stream))
  } catch (error) {
    Popups.alert(error.message)
  }

  // ファイルを再ロード 編集中のルールを破棄するか確認
  if (
    Object.keys(RuleSet.value).length > 0 &&
    await Popups.confirmYesNo('現在のルールを利用しますか?') === false) {
    updateRuleset({})
  } else {
    return
  }

  // 保存済みルールの利用を確認
  const preservedRuleSet = store.getters['system/SavedCSVrule']
  if (
    (preservedRuleSet !== '' || preservedRuleSet !== '{}') &&
    await Popups.confirmYesNo('保存されたルールを利用しますか?')) {
    updateRuleset(JSON.parse(preservedRuleSet))
  }
}

const convertStream = async () => {
  data.LogMessages.splice(0)
  const ImportedDocuments = []
  try {
    data.ProcessStep = 0
    data.LogMessages.push('ファイルにはタイトル行を含めて' + data.CsvArray.length + '行の情報があります.')

    data.ProcessStep++
    await nextTick()

    // ルールセットの確認
    if (RuleSet.value['手術日 (必須)'] && RuleSet.value['ID (必須)']) {
      for (const title of ['手術診断', '実施手術']) {
        for (const index of ['1', '2', '3', '4']) {
          if (RuleSet.value[title + index]) {
            if (!RuleSet.value[title + index + 'カテゴリ']) {
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
      let index = data.CsvHeader ? 1 : 0;
      index < data.CsvArray.length;
      index++
    ) {
      const record = data.CsvArray[index]
      try {
        const newdocument = CreateDocument(record, RuleSet.value)
        if (data.PerformMigration) {
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
  for (const key in RuleSet.value) {
    delete RuleSet.value[key]
  }
  for (const key in rule) {
    RuleSet.value[key] = rule[key]
  }
  triggerRef(RuleSet)
}

const setRuleSetProperty = async (key, value) => {
  RuleSet.value[key] = value
  triggerRef(RuleSet)
}

const deleteRuleSetProperty = async (key) => {
  delete RuleSet.value[key]
  triggerRef(RuleSet)
}

const storeRuleset = () => {
  store.commit('system/SetPreferences', { csvRuleset: rulesetJson.value })
  store.dispatch('system/SavePreferences')
}
</script>

<template>
  <div>
    <div style="padding-bottom: 1rem;">
      Excelなどから出力したCSVファイルからデータの雛型を読み込むことが出来ます.<br/>
      全ての項目を完全に入力することは出来ませんが, CSVファイルのフィールドや定数を指定の項目に割り当てて読み込みます.<br/>
      手術実施日と患者IDは重複入力確認のため必須入力です.<br/>
      完全な入力は原理的に不可能ですので,全ての入力に編集と確認の操作が必要になります.<br/>
    </div>
    <div style="padding-bottom: 1rem;" v-show="data.CsvArray.length > 0">
      <div>
        <LabeledCheckbox v-model="data.CsvHeader" :value="true">CSVファイルの先頭行はフィールド名</LabeledCheckbox>
      </div>
      <QueryBuilder
        :csv="csvArray"
        :csvHeader="data.CsvHeader"
        :ruleset="rulesetJson"
        @change="updateRuleset"
        @set="setRuleSetProperty"
        @delete="deleteRuleSetProperty"
      />
      <LabeledCheckbox v-model="data.PerformMigration" :value="false">診断名称・実施手術の入力に対して基本的な置換操作を行う</LabeledCheckbox>
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
      <ReportViewer :report="data.LogMessages.join('\n')" v-show="data.LogMessages.length > 0"/>
    </div>
  </div>
</template>
