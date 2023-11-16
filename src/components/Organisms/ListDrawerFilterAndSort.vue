<script setup>
import { defineEmits, onMounted, ref, computed, nextTick } from 'vue'
import { useStore } from '@/store'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'
import { CategoriesOfProcedure } from '@/modules/CaseValidater'
import * as Popups from '@/modules/Popups'

const store = useStore()

const emit = defineEmits(['changed'])

const data = ref({
  // カテゴリ: CaterogyTranslation から作成される
  Categories: {},
  // 年次: created()で非同期にロードされる
  Years: {},
  Conditions: {
    合併症あり: { Field: 'PresentAE', Value: true },
    読み込み症例: { Field: 'Imported', Value: true },
    情報あり: { Field: 'Notification', Value: { $exists: true } },
    登録拒否: { Field: 'Denial', value: true }
  },
  Sort: {
    Item: 'DocumentId',
    Order: -1
  }
})

const FilterItems = ref([])

// 選択肢項目オブジェクトの初期化
function initData () {
  // カテゴリをインポート
  CategoriesOfProcedure.forEach(categorylabel => {
    data.value.Categories[categorylabel] = { Field: 'TypeOfProcedure', Value: categorylabel }
  })
}
initData()
onMounted(async () => await ImportSettings())

const isFilterItemsEmpty = computed({
  get: () => FilterItems.value.length === 0,
  set: (newvalue) => {
    // newvalue: boolean
    if (newvalue) {
      FilterItems.value.splice(0)
    }
  }
})

const ImportSettings = async () => {
  // 年次データを更新
  await store.dispatch('GetYears')
    .then((CountByYear) => {
      Object.keys(CountByYear).forEach(year => {
        data.value.Years[year + '年'] = { Field: 'DateOfProcedure', Value: year }
      })
    })

  // 現在の表示設定をインポート
  const view = store.getters.ViewSettings

  if (view) {
    if (view.Sort && Object.entries(view.Sort).length > 0) {
      [data.value.Sort.Item, data.value.Sort.Order] = Object.entries(view.Sort)[0]
    }

    FilterItems.value.splice(0)
    if (view.Filters) {
      const newFilters = view.Filters.map(filter => {
        switch (filter.Field) {
          case 'TypeOfProcedure':
            return filter.Value
          case 'DateOfProcedure':
            return filter.Value + '年'
          default:
            for (const condition in data.value.Conditions) {
              if (data.value.Conditions[condition].Field === filter.Field) {
                return condition
              }
            }
            return undefined
        }
      }).filter(item => item)
      FilterItems.value.push(...newFilters)
    }
  }
}

const Apply = async () => {
  const FilterObjects = FilterItems.value
    .map(filter => data.value.Categories[filter] || data.value.Years[filter] || data.value.Conditions[filter])
    .filter(filter => filter)

  store.commit('SetFilters', FilterObjects)
  store.commit('SetSort', { [data.value.Sort.Item]: data.value.Sort.Order })
  await DisableSearch()
  emit('changed')
}

const Store = async () => {
  try {
    await store.dispatch('system/SaveCurrentView')
    await Popups.information('現在の表示設定を規定として保存しました.\n環境設定から初期設定にリセットできます.')
    await nextTick()
  } catch {}
}

const Revert = async () => {
  store.commit('SetFilters', {})
  store.commit('SetSort', {})
  await DisableSearch()
  emit('changed')
  ImportSettings()
  nextTick()
}

const DisableSearch = async () => {
  if (store.getters.SearchActivated) {
    if (await Popups.confirmYesNo('検索が実行されています.\n検索を解除しますか?')) {
      store.commit('SetSearch', {
        Filter: {}
      })
    }
  }
}
</script>

<template>
  <div class="menu-item">
    <div class="subtitle">表示の順番</div>
    <div class="menu-item-content">
      <div>
        <select v-model="data.Sort.Item">
          <option value="DocumentId">登録順</option>
          <option value="DateOfProcedure">手術日</option>
          <option value="ProcedureTime">手術時間</option>
          <option value="TypeOfProcedure">カテゴリ</option>
          <option value="Age">年齢</option>
          <option value="PatientId">施設の患者ID</option>
        </select>
      </div>

      <div>
        <el-switch
          v-model="data.Sort.Order"
          active-text="昇順"
          :active-value="1"
          active-color="var(--color-primary)"
          inactive-text="降順"
          :inactive-value="-1"
          inactive-color="var(--color-primary)" />
      </div>
    </div>

    <div class="subtitle">表示する内容</div>
    <div class="menu-item-content" id="display-item-selection">
      <div><LabeledCheckbox :container.sync="isFilterItemsEmpty">全て表示する</LabeledCheckbox></div>

      <div>
        <div>カテゴリ</div>
        <div>
          <template v-for="(value, category) in data.Categories">
            <LabeledCheckbox :container.sync="FilterItems" :value="category" :key="category"></LabeledCheckbox>
          </template>
        </div>
      </div>

      <div>
        <div>年次</div>
        <div>
          <template v-for="(value, year) in data.Years">
            <LabeledCheckbox :container.sync="FilterItems" :value="year" :key="year"></LabeledCheckbox>
          </template>
        </div>
      </div>

      <div>
        <div>情報</div>
        <div>
          <template v-for="(value, condition) in data.Conditions">
            <LabeledCheckbox :container.sync="FilterItems" :value="condition" :key="condition" ></LabeledCheckbox>
          </template>
        </div>
      </div>

    </div>
    <div class="menu-item-bottom">
      <el-dropdown split-button type="primary" @click="Apply()">
        設定
        <template v-slot:dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click.native="Store()">現在の表示設定を規定として保存</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-button type="success" style="margin-left: 0.715rem;" @click="Revert()">規定の設定に戻す</el-button>
    </div>
  </div>
</template>
