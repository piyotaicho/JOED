<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from '@/store'

const store = useStore()
const props = defineProps({
  selectionAll: {
    type: Boolean,
    default: true
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
      <option value="ALL" v-if="props.selectionAll">すべて</option>
      <template v-for="item in selections" :key="item.year">
        <option :value="item.year">
          {{item.year}}年 ({{item.count}}件)
        </option>
      </template>
    </select>
  </div>
</template>
