<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from '@/store'

const store = useStore()
const props = defineProps({
  value: {
    required: true
  },
  selectionAll: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:value'])

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

const SelectedValue = computed({
  get () { return props.value },
  set (newvalue) { emit('update:value', newvalue) }
})
</script>

<template>
  <div>
    <select v-model="SelectedValue">
      <option value="ALL" v-if="props.selectionAll">すべて</option>
      <option v-for="item in selections"
        :key="item.year" :value="item.year">
        {{item.year}}年 ({{item.count}}件)
      </option>
    </select>
  </div>
</template>
