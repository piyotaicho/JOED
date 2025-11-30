<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from '@/store'

const store = useStore()
const props = defineProps({
  selectionAll: {
    type: Boolean,
    default: true
  },
  optionalValues: {
    type: Array,
    default: () => []
  }
})

const value = defineModel()

const selections = ref([])

onMounted(async () => {
  await store.dispatch('GetYears')
    .then(CountByYear => {
      const years = Object.keys(CountByYear).sort().reverse()
      for (const year of years) {
        selections.value.push(
          {
            year,
            count: CountByYear[year]
          }
        )
      }
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
