<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { PropType } from 'vue'
import { useStore } from '@/store'
import * as Popups from '@/modules/Popups'

type OptionalValue = {
  value: string
  text?: string
}

type YearSelection = {
  year: string
  count: number
}

const store = useStore()
const props = defineProps({
  selectionAll: {
    type: Boolean,
    default: true
  },
  optionalValues: {
    type: Array as PropType<OptionalValue[]>,
    default: () => []
  }
})

const value = defineModel<string | undefined>()

const selections = ref<YearSelection[]>([])

onMounted(async () => {
  await store.dispatch('GetYears')
    .then((CountByYear: Record<string, number>) => {
      const years = Object.keys(CountByYear).sort().reverse()
      for (const year of years) {
        selections.value.push(
          {
            year,
            count: CountByYear[year] ?? 0
          }
        )
      }
    })
    .catch(async () => {
      await Popups.alert('データベースエラーにより年次ごとのデータ取得に失敗しました.')
      selections.value.splice(0)
    })
})
</script>

<template>
  <div>
    <select v-model="value">
      <option value="ALL" v-if="props.selectionAll">すべて ({{store.getters['TotalNumberOfCases'] || 0}}件)</option>
      <template v-for="item in props.optionalValues" :key="item.value">
        <option :value="item.value">{{item.text || item.value}}</option>
      </template>
      <template v-for="item in selections" :key="item.year">
        <option :value="item.year">
          {{item.year}}年 ({{item.count}}件)
        </option>
      </template>
    </select>
  </div>
</template>
