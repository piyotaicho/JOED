<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'

const props = defineProps({
  item: {
    type: [Object, String],
    required: true
  },
  value: {}
})

const emit = defineEmits(['update:value'])

const itemlabel = computed(() => (typeof this.item === 'object')
  ? props.item.Text
  : props.item
)

const itemvalue = computed(() => (typeof this.item === 'object')
  ? props.item.Value
  : props.item
)

const checkboxvalue = computed({
  get: () => props.value,
  set: (newvalue) => emit('update:value', newvalue)
})
</script>

<template>
  <LabeledCheckbox :container.sync="checkboxvalue" :value="itemvalue">{{itemlabel}}</LabeledCheckbox>
</template>
