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
let texts = ['FALSE', 'TRUE']
let values = [false, true]
let colors = ['var(--color-primary)', 'var(--color-primary)']

const created = () => {
  if (toString.call(props.options) === '[object Object]') {
    const keys = Object.keys(props.options)
    for (let index = 0; index < 2; index++) {
      texts[index] = keys[index]
      if (toString.call(props.options[keys[index]] !== '[object Object]')) {
        values[index] = props.options[keys[index]]
      } else {
        values[index] = props.options[keys[index]]?.value
        if (props.options[keys[index]]?.color) {
          colors[index] = props.options[keys[index]]?.color
        }
      }
    }
  } else {
    switch (true) {
      case props.options.length === 6:
        colors = [...props.options].splice(4, 2)
      // eslint-disable-next-line no-fallthrough
      case props.options.length === 4:
        values = [...props.options].splice(2, 2)
      // eslint-disable-next-line no-fallthrough
      case props.options.length === 2:
        texts = [...props.options].splice(0, 2)
    }
  }
}
created()

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
        :inactive-color="colors[0]"
        :active-text="texts[1]"
        :active-value="values[1]"
        :active-color="colors[1]"
        v-bind="$attrs"
      />
    </div>
</div>
</template>
