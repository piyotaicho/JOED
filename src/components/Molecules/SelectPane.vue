<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  // value: {
  //   type: String,
  //   default: null,
  // },
  title: {
    type: String,
    default: '項目',
  },
  items: {
    type: Array,
    default: () => [],
    required: true,
  },
  lines: {
    type: [String, Number],
    default: 8,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const modelValue = defineModel({
  type: String,
  default: null
})
const emit = defineEmits(['dblclick', 'keypress-enter'])

const selectElement = ref()

const dblClick = (value) => emit('dblclick', value)

const enter = (value) => emit('keypress-enter', value)

const clearSelection = () => {
  selectElement.value.selectedIndex = -1
}

defineExpose({
  clearSelection,
})
</script>

<template>
  <div>
    <div class="subtitle">{{ props.title }}</div>
    <select
      tabindex="0"
      ref="selectElement"
      :size="props.lines"
      v-model="modelValue"
      @keypress.enter="enter"
      @dblclick="dblClick"
      :disabled="disabled"
    >
      <option v-if="props.items.length === 0" disabled :value="null"></option>
      <template v-for="(item, key, index) in props.items" :key="index">
        <option :value="item">{{ item }}</option>
      </template>
    </select>
  </div>
</template>
