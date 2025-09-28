<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    default: null,
  },
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

const emit = defineEmits(['update:value', 'change', 'dblclick', 'keypress-enter'])

const selectElement = ref()

const paneValue = computed({
  get: () => props.value,
  set: (value) => {
    console.log(`New value ${value}`)
    emit('change', value)
    emit('update:value', value)
  },
})

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
      v-model="paneValue"
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
