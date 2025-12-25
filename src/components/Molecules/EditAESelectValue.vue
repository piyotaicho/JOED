<script setup>
import { computed } from 'vue'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox.vue'

const props = defineProps({
  item: {
    type: [Object, String],
    required: true
  }
})
const modelValue = defineModel()

const itemlabel = computed(() => (typeof props.item === 'object')
  ? (props.item?.Text || '')
  : props.item
)

const itemvalue = computed(() => (typeof props.item === 'object')
  ? (props.item?.Value || '')
  : props.item
)

const checkboxvalue = computed({
  get: () => modelValue.value,
  set: (newvalue) => { modelValue.value = newvalue }
})
</script>

<template>
  <LabeledCheckbox v-model="checkboxvalue" :value="itemvalue">{{itemlabel}}</LabeledCheckbox>
</template>
