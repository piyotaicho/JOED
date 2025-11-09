<script setup>
import { reactive, ref, computed } from 'vue'
import { useStore } from '@/store'
import InputSwitchField from '@/components/Molecules/InputSwitchField.vue'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox.vue'
import LabeledRadio from '@/components/Atoms/LabeledRadio.vue'
import ApproachMaster from '@/modules/Masters/ApproachMaster'
import * as Popups from '@/modules/Popups'

const store = useStore()

// マスターデータ取得(non-reactive)
const master = new ApproachMaster()
// マスターツリー取得(non-reactive) デフォルト設定用
const masterTree = master.getTree(undefined, true)

const data = reactive({
  showStartupDialog: false,
  editJSOGId: false,
  editNCDId: false,
  showNote: true,
  revertView: false
})
const preserve = ref('')

const categorySelections = ref({})
const categorySelectionOfOneOf = ref({})

const changed = computed(() => preserve.value !== (
  JSON.stringify(data) +
  JSON.stringify(categorySelectionOfOneOf.value) +
  JSON.stringify(categorySelections.value)
))

// 初期値をstoreから取得
data.showStartupDialog = store.getters['system/ShowStartupDialog']
data.editJSOGId = store.getters['system/EditJSOGId']
data.editNCDId = store.getters['system/EditNCDId']
data.showNote = store.getters['system/ShowNote']

const initValues = () => {
  for (const category of master.getCategories()) {
    categorySelections.value[category] = []
    categorySelectionOfOneOf.value[category] = ''
  }

  try {
    // 規定のapproachを展開
    const defaultApproach = JSON.parse(store.getters['system/Approach'])
    for (const category in defaultApproach) {
      for (const item of defaultApproach[category]) {
        const oneOfItems = (masterTree[category]
          ?.filter(directive => Object.keys(directive)[0] === 'oneOf')[0]
          ?.oneOf) || []
        const otherItems = (masterTree[category]
          ?.filter(directive => Object.keys(directive)[0] !== 'oneOf')
          ?.map(directive => directive[Object.keys(directive)[0]])
          .flat(2)) || []

        if (oneOfItems.includes(item)) {
          categorySelectionOfOneOf.value[category] = item
          continue
        }
        if (otherItems.includes(item)) {
          categorySelections.value[category].push(item)
          continue
        }
      }
    }
  } catch {
    // 不正なJSONの場合は初期化する内容は無い
  }

  preserve.value = JSON.stringify(data) +
    JSON.stringify(categorySelectionOfOneOf.value) +
    JSON.stringify(categorySelections.value)
}
initValues()

const commitSettings = async () => {
  // リスト表示内容の規定値をアプリケーションの初期設定に戻す
  if (data.revertView) {
    store.commit('system/SetView', {})
  }

  // アプローチのオブジェクトを構築
  const approach = {}
  for (const category of master.getCategories()) {
    if (categorySelectionOfOneOf.value[category]) {
      approach[category] = [categorySelectionOfOneOf.value[category]]
    } else {
      approach[category] = []
    }
    if (categorySelections.value[category]?.length > 0) {
      approach[category].push(...categorySelections.value[category])
    }
  }

  // 各種設定の保存
  store.commit('system/SetPreferences', {
    ShowStartupDialog: data.showStartupDialog,
    EditJSOGId: data.editJSOGId,
    EditNCDId: data.editNCDId,
    ShowNote: data.showNote,
    Approach: JSON.stringify(approach)
  })

  await store.dispatch('system/SavePreferences')
  preserve.value = JSON.stringify(data) +
    JSON.stringify(categorySelectionOfOneOf.value) +
    JSON.stringify(categorySelections.value)

  Popups.information('設定が変更されました.')
}
</script>

<template>
  <div class="utility">
    <div class="utility-switches">
      <div>
        <div class="label">
          <i class="el-icon-arrow-down" style="padding-top: 0.36rem; margin-right: 0.6rem;"/>
          症例表示画面の設定
        </div>
      </div>
      <InputSwitchField
        v-model="data.showStartupDialog"
        title="リスト表示の起動時メッセージの表示"
        :options="{'しない': false, 'する': true}" />
      <InputSwitchField
        v-model="data.revertView"
        title="リスト表示内容の規定値をアプリケーションの初期設定に戻す"
        :options="{'しない': false, 'する': true}" />

      <div>
        <div class="label">
          <i class="el-icon-arrow-down" style="padding-top: 0.36rem; margin-right: 0.6rem;"/>
          症例編集画面の設定
        </div>
      </div>
      <InputSwitchField
        v-model="data.editJSOGId"
        title="日産婦腫瘍登録 症例番号の入力"
        :options="{'しない': false, 'する': true}" />
      <InputSwitchField
        v-model="data.editNCDId"
        title="ロボット支援下手術 NCD症例識別コードの入力"
        :options="{'しない': false, 'する': true}" />
      <InputSwitchField
        v-model="data.showNote"
        title="メモが入力されていた場合編集を開く"
        :options="{'しない': false, 'する': true}" />

      <div>
        <div class="label">
          <i class="el-icon-arrow-down" style="padding-top: 0.36rem; margin-right: 0.6rem;"/>
          アプローチ入力の規定値
        </div>
      </div>
      <template v-for="category of master.getCategories()" :key="category">
        <div class="flex-content" aria-category="{{ category }}" style="margin-bottom: 1.2rem;">
          <div class="w20">{{ category }}</div>
          <div class="w80" style="display: flex; flex-direction: column; word-break: break-all;">
            <template v-for="directive of masterTree[category]" :key="directive">
              <template v-if="Object.keys(directive)[0] === 'oneOf'">
                  <div style="display: inline;">
                    <template v-for="item in directive.oneOf" :key="item">
                      <LabeledRadio v-model="categorySelectionOfOneOf[category]" :value="item"/>
                    </template>
                  </div>
                  <br/>
              </template>
              <template v-if="Object.keys(directive)[0] === 'anyOf' || Object.keys(directive)[0] === 'check'">
                <div style="display: inline;">
                  <template v-for="item in (directive.anyOf || directive.check)" :key="item">
                    <LabeledCheckbox v-model="categorySelections[category]" :value="item" />
                  </template>
                </div>
              </template>
            </template>
          </div>
        </div>
      </template>
    </div>

    <div>
      <el-button type="primary" :disabled="!changed" @click="commitSettings">上記設定を保存</el-button>
    </div>
  </div>
</template>
