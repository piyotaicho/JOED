<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  value: {
    required: true
  },
  title: {
    default: 'スイッチ'
  },
  options: {
    type: [Array, Object]
  },
  required: {
    default: false
  }
})
const emit = defineEmits(['update:value'])

// プロパティから構成(non reactive)
const texts = toString.call(props.options) === '[object Array]'
  ? [...props.options].splice(0, 2)
  : (
      toString.call(props.options) === '[object Object]'
        ? [...Object.keys(props.options)]
        : ['FALSE', 'TRUE']
    )
const values = toString.call(props.options) === '[object Object]'
  ? [...Object.keys(props.options).splice(0, 2).map(key => props.options[key])]
  : [false, true]

// 算出プロパティ
const selectedValue = computed({
  get: () => props.value,
  set: (newvalue) => emit('update:value', newvalue)
})
</script>

<template>
  <div>
    <div class="label"><span>{{title}}</span></div>
    <div class="field">
      <el-switch
        v-model="selectedValue"
        :inactive-text="texts[0]"
        :inactive-value="values[0]"
        inactive-color="var(--color-primary)"
        :active-text="texts[1]"
        :active-value="values[1]"
        active-color="var(--color-primary)"
        v-bind="$attrs"
      />
    </div>
</div>
</template>
