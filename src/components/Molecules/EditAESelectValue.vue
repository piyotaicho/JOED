<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox.vue'

type CheckValue = boolean | string | number
type SelectItem = string | { Text?: string; Value?: CheckValue }

const props = defineProps({
  item: {
    type: [Object, String] as PropType<SelectItem>,
    required: true
  }
})
const modelValue = defineModel<CheckValue | CheckValue[] | undefined>()

const itemlabel = computed<string>(() => (typeof props.item === 'object' && props.item)
  ? (props.item.Text || '')
  : String(props.item)
)

const itemvalue = computed<CheckValue>(() => (typeof props.item === 'object' && props.item)
  ? (props.item.Value ?? '')
  : props.item
)

const checkboxvalue = computed({
  get: () => modelValue.value,
  set: (newvalue: CheckValue | CheckValue[] | undefined) => { modelValue.value = newvalue }
})
</script>

<template>
  <LabeledCheckbox v-model="checkboxvalue" :value="itemvalue">{{itemlabel}}</LabeledCheckbox>
</template>
