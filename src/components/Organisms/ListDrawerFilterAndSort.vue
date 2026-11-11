<script setup lang="ts">
import { onMounted, ref, reactive, computed, nextTick } from 'vue'
import { useStore } from '@/store'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox.vue'
import InputSwitchField from '../Molecules/InputSwitchField.vue'
import { CategoriesOfProcedure } from '@/modules/CaseValidater'
import * as Popups from '@/modules/Popups'

type FilterObject = { Field: string; Value: unknown }
type FilterOptions = Record<string, FilterObject>
type SortState = { Field: string; Order: 1 | -1 }
type ViewSettings = {
  Sort?: Record<string, number>
  Filters?: Array<{ Field: string; Value: unknown }>
}

const store = useStore()

const emit = defineEmits<{
  (e: 'changed'): void
}>()

const setting = reactive({
  // カテゴリ: CaterogyTranslation から作成される
  Categories: {} as FilterOptions,
  // 年次: created()で非同期にロードされる
  Years: {} as FilterOptions,
  Conditions: {
    合併症あり: { Field: 'PresentAE', Value: true },
    読み込み症例: { Field: 'Imported', Value: true },
    情報あり: { Field: 'Notification', Value: { $exists: true } },
    登録拒否: { Field: 'Denial', Value: true }
  } as FilterOptions,
  Sort: {
    Field: 'DocumentId',
    // ソート Ascending: 1, Descending: -1
    Order: -1 as 1 | -1
  } as SortState
})

// 選択の内容配列
const FilterItems = ref<string[]>([])

/**
 * 表示設定の選択肢設定と
 * 現在の表示設定をstoreからインポート
 */
onMounted(async () => {
  // カテゴリを設定
  CategoriesOfProcedure.forEach(categorylabel => {
    setting.Categories[categorylabel] = { Field: 'TypeOfProcedure', Value: categorylabel }
  })

  // 年次を設定
  await store.dispatch('GetYears')
    .then((CountByYear: Record<string, number>) => {
      const countByYear = CountByYear as Record<string, number>
      Object.keys(countByYear).forEach(year => {
        setting.Years[year + '年'] = { Field: 'DateOfProcedure', Value: year }
      })
    })
    .catch(async () => {
      await Popups.alert('データベースエラーにより年次リストの取得に失敗しました.')
      setting.Years = {}
    })

  await nextTick()

  // 現在の表示設定をインポート
  ReflectSettings()
  await nextTick()
})

const isFilterItemsEmpty = computed({
  get: () => FilterItems.value.length === 0,
  set: (newvalue) => {
    // newvalue: boolean
    if (newvalue) {
      FilterItems.value.splice(0)
    }
  }
})

/**
 * 現在の表示設定をstoreに保存
 */
const Apply = async () => {
  const FilterObjects = FilterItems.value
    .map(filter => setting.Categories[filter] || setting.Years[filter] || setting.Conditions[filter])
    .filter(filter => filter)

  store.commit('SetFilters', FilterObjects)
  store.commit('SetSort', { [setting.Sort.Field]: setting.Sort.Order })
  await DisableSearch()
  emit('changed')
}

/**
 * storeの表示設定を反映
 */
const ReflectSettings = () => {
  const view = store.getters.ViewSettings as ViewSettings | undefined

  if (view) {
    // ソート設定の取得
    const [field, order] = Object.entries(view.Sort || {}).flat()
    if (field !== undefined && order !== undefined ) {
      setting.Sort.Field = String(field)
      setting.Sort.Order = (Number(order) >= 0 ? 1 : -1)
    }

    // フィルタの設定値を取得して配列に反映
    FilterItems.value.splice(0)
    if (view.Filters) {
      const newFilters = view.Filters.map(filter => {
        switch (filter.Field) {
          case 'TypeOfProcedure': // カテゴリ
            return String(filter.Value)
          case 'DateOfProcedure': // 年次
            return String(filter.Value) + '年'
          default:  // その他：合併症あり・読み込み症例・情報あり・登録拒否
            for (const condition in setting.Conditions) {
              const conditionValue = setting.Conditions[condition]
              if (conditionValue && conditionValue.Field === filter.Field) {
                return condition
              }
            }
            return undefined
        }
      }).filter((item): item is string => typeof item === 'string')
      FilterItems.value.push(...newFilters)
    }
  }
}

/**
 * 現在の表示設定を規定として保存
 */
const StoreDefault = async () => {
  try {
    await store.dispatch('system/SaveCurrentView')
    await Popups.information('現在の表示設定を規定として保存しました.\n環境設定から初期設定にリセットできます.')
    await nextTick()
  } catch {}
}

/**
 * storeに保存された規定の表示設定に戻す
 */
const RevertToDefault = async () => {
  store.commit('SetFilters', {})
  store.commit('SetSort', {})
  await DisableSearch()
  emit('changed')
  ReflectSettings()
  await nextTick()
}

/**
 * 検索が実行されている場合, 検索のみを解除する(ソート・フィルタリングは継続)
 */
const DisableSearch = async () => {
  if (store.getters.SearchActivated) {
    if (await Popups.confirmYesNo('検索が実行されています.\n検索を解除して表示の設定を更新しますか?')) {
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
        <select v-model="setting.Sort.Field">
          <option value="DocumentId">登録順</option>
          <option value="DateOfProcedure">手術日</option>
          <option value="ProcedureTime">手術時間</option>
          <option value="TypeOfProcedure">カテゴリ</option>
          <option value="Age">年齢</option>
          <option value="PatientId">患者ID</option>
        </select>
      </div>

      <div>
        <InputSwitchField
          v-model="setting.Sort.Order"
          title=""
          :options="[{ text: '降順', value: -1 }, { text: '昇順', value: 1}]"
          style="padding-top: 0.13rem;"
        />
      </div>
    </div>

    <div class="subtitle">表示する内容</div>
    <div class="menu-item-content" id="display-item-selection">
      <div><LabeledCheckbox v-model="isFilterItemsEmpty">全て表示する</LabeledCheckbox></div>

      <div>
        <div>カテゴリ</div>
        <div>
          <template v-for="(value, category) in setting.Categories" :key="category">
            <LabeledCheckbox v-model="FilterItems" :value="category" />
          </template>
        </div>
      </div>

      <div>
        <div>年次</div>
        <div>
          <template v-for="(value, year) in setting.Years" :key="year">
            <LabeledCheckbox v-model="FilterItems" :value="year" />
          </template>
        </div>
      </div>

      <div>
        <div>情報</div>
        <div>
          <template v-for="(value, condition) in setting.Conditions" :key="condition">
            <LabeledCheckbox v-model="FilterItems" :value="condition" />
          </template>
        </div>
      </div>

    </div>
    <div class="menu-item-bottom">
      <el-dropdown split-button type="primary" @click="Apply()">
        設定
        <template v-slot:dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="RevertToDefault()">規定の設定に戻す</el-dropdown-item>
            <el-dropdown-item divided />
            <el-dropdown-item @click="StoreDefault()">現在の表示設定を規定として保存</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
