<script setup>
import { computed } from 'vue'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox.vue'

const props = defineProps({
  item: {
    type: String,
    required: true
  }
})
const modelValue = defineModel()

const parsedItem = computed(() => {
  try {
    return JSON.parse(props.item)
  } catch {
    return ''
  }
})

const itemlabel = computed(() => (typeof parsedItem.value === 'object')
  ? parsedItem.value.Text
  : parsedItem.value
)

const itemvalue = computed(() => (typeof parsedItem.value === 'object')
  ? parsedItem.value.Value
  : parsedItem.value
)

const checkboxvalue = computed({
  get: () => modelValue.value,
  set: (newvalue) => { modelValue.value = newvalue }
})
</script>

<template>
  <LabeledCheckbox v-model="checkboxvalue" :value="itemvalue">{{itemlabel}}</LabeledCheckbox>
</template>
