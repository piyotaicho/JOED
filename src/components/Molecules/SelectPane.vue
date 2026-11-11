<script setup lang="ts">
import { ref } from 'vue'
import type { PropType } from 'vue'

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
    type: Array as PropType<Array<string | number>>,
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

const modelValue = defineModel<string | null>({
  type: String,
  default: null
})
const emit = defineEmits<{
  (e: 'dblclick', value: string | null): void
  (e: 'keypress-enter', value: string | null): void
}>()

const selectElement = ref<HTMLSelectElement | null>(null)

const dblClick = (): void => emit('dblclick', modelValue.value)

const enter = (): void => emit('keypress-enter', modelValue.value)

const clearSelection = (): void => {
  if (selectElement.value) {
    selectElement.value.selectedIndex = -1
  }
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
      <template v-for="(item, index) in props.items" :key="index">
        <option :value="item">{{ item }}</option>
      </template>
    </select>
  </div>
</template>
