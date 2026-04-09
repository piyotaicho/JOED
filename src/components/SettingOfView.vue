<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useStore } from '@/store'
import { ArrowDown } from '@element-plus/icons-vue'
import InputSwitchField from '@/components/Molecules/InputSwitchField.vue'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox.vue'
import LabeledRadio from '@/components/Atoms/LabeledRadio.vue'
import ApproachMaster from '@/modules/Masters/ApproachMaster'
import * as Popups from '@/modules/Popups'

const store = useStore()

type MasterDirective = Record<string, string[]>
type MasterTree = Record<string, MasterDirective[]>

// マスターデータ取得(non-reactive)
const master = new ApproachMaster()
// マスターツリー取得(non-reactive) デフォルト設定用
const masterTree = master.getTree(undefined, true) as MasterTree

const data = reactive({
  showStartupDialog: false,
  editJSOGId: false,
  editNCDId: false,
  showNote: true,
  revertView: false
})
const categorySelections = ref<Record<string, string[]>>({})
const categorySelectionOfOneOf = ref<Record<string, string>>({})

// 初期値をstoreから取得
data.showStartupDialog = store.getters['system/ShowStartupDialog']
data.editJSOGId = store.getters['system/EditJSOGId']
data.editNCDId = store.getters['system/EditNCDId']
data.showNote = store.getters['system/ShowNote']

const initValues = () => {
  const categories = (master.getCategories() as string[])
  for (const category of categories) {
    categorySelections.value[category] = []
    categorySelectionOfOneOf.value[category] = ''
  }

  try {
    // 規定のapproachを展開
    const defaultApproach = JSON.parse(store.getters['system/Approach']) as Record<string, string[]>
    for (const category in defaultApproach) {
      const defaultItems = defaultApproach[category] || []
      const directives = masterTree[category] || []
      for (const item of defaultItems) {
        const oneOfItems = (directives
          ?.filter((directive: MasterDirective) => Object.keys(directive)[0] === 'oneOf')[0]
          ?.oneOf) || []
        const otherItems = (directives
          ?.filter((directive: MasterDirective) => Object.keys(directive)[0] !== 'oneOf')
          ?.map((directive: MasterDirective) => directive[Object.keys(directive)[0] || ''] || [])
          .flat(2)) || []

        if (oneOfItems.includes(item)) {
          categorySelectionOfOneOf.value[category] = item
          continue
        }
        if (otherItems.includes(item)) {
          ;(categorySelections.value[category] || (categorySelections.value[category] = [])).push(item)
          continue
        }
      }
    }
  } catch {
    // 不正なJSONの場合は初期化する内容は無い
  }
}
initValues()

const commitSettings = async () => {
  // リスト表示内容の規定値をアプリケーションの初期設定に戻す
  if (data.revertView) {
    store.commit('system/SetView', {})
  }

  // アプローチのオブジェクトを構築
  const approach: Record<string, string[]> = {}
  for (const category of (master.getCategories() as string[])) {
    if (categorySelectionOfOneOf.value[category]) {
      approach[category] = [categorySelectionOfOneOf.value[category]]
    } else {
      approach[category] = []
    }
    const selectedItems = categorySelections.value[category] || []
    if (selectedItems.length > 0) {
      approach[category].push(...selectedItems)
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

  Popups.information('設定が変更されました.')
}
</script>

<template>
  <div class="utility">
    <div class="utility-switches">
      <div>
        <div class="label">
          <el-icon style="padding-top: 0.36rem; margin-right: 0.6rem;"><ArrowDown /></el-icon>
          リスト表示画面の設定
        </div>
      </div>
      <InputSwitchField
        v-model="data.showStartupDialog"
        title="リスト表示の起動時メッセージの表示"
        :options="[{text: 'しない', value: false}, {text: 'する', value: true}]" />
      <InputSwitchField
        v-model="data.revertView"
        title="表示内容の規定値をアプリケーション初期設定に戻す"
        :options="[{text: 'しない', value: false}, {text: 'する', value: true}]" />
      <div>
        <div class="label">
          <el-icon style="padding-top: 0.36rem; margin-right: 0.6rem;"><ArrowDown /></el-icon>
          症例編集画面の設定
        </div>
      </div>
      <InputSwitchField
        v-model="data.editJSOGId"
        title="日産婦腫瘍登録 症例番号の入力"
        :options="[{text: 'しない', value: false}, {text: 'する', value: true}]" />
      <InputSwitchField
        v-model="data.editNCDId"
        title="ロボット支援下手術 NCD症例識別コードの入力"
        :options="[{text: 'しない', value: false}, {text: 'する', value: true}]" />
      <InputSwitchField
        v-model="data.showNote"
        title="メモが入力されていた場合編集を開く"
        :options="[{text: 'しない', value: false}, {text: 'する', value: true}]" />

      <div>
        <div class="label">
          <el-icon style="padding-top: 0.36rem; margin-right: 0.6rem;"><ArrowDown /></el-icon>
          アプローチ入力の規定値
        </div>
      </div>
      <template v-for="category of master.getCategories()" :key="category">
        <div class="flex-content" aria-category="{{ category }}" style="margin-bottom: 1.2rem;">
          <div style="width: 16%;">{{ category }}</div>
          <div style="width: 84%; display: flex; flex-direction: column; word-break: break-all;">
            <template v-for="directive of masterTree[category]" :key="directive">
              <template v-if="Object.keys(directive)[0] === 'oneOf'">
                  <div style="display: inline;">
                    <template v-for="item in directive.oneOf" :key="item">
                      <LabeledRadio v-model="categorySelectionOfOneOf[category]" :value="ApproachMaster.asValue(item)">
                        {{ ApproachMaster.asLabel(item) }}
                      </LabeledRadio>
                    </template>
                  </div>
                  <br/>
              </template>
              <template v-if="Object.keys(directive)[0] === 'anyOf' || Object.keys(directive)[0] === 'check'">
                <div style="display: inline;">
                  <template v-for="item in (directive.anyOf || directive.check)" :key="item">
                    <LabeledCheckbox v-model="categorySelections[category]" :value="ApproachMaster.asValue(item)">
                      {{ ApproachMaster.asLabel(item) }}
                    </LabeledCheckbox>
                  </template>
                </div>
              </template>
            </template>
          </div>
        </div>
      </template>

      <div>
        <div class="label"></div>
        <div class="field">
          <el-button type="primary" @click="commitSettings">上記設定を保存</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
