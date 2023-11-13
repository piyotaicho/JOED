<script setup>
import { defineProps, defineEmits, defineExpose, ref, computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    default: null
  },
  title: {
    type: String,
    default: '項目'
  },
  items: {
    type: Array,
    default: () => [],
    required: true
  },
  lines: {
    type: [String, Number],
    default: 8
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['change-selection', 'change', 'dblclick', 'keypress-enter'])

const selectElement = ref()

const paneValue = computed({
  get: () => props.value,
  set: (value) => emit('change-selection', value)
})

const change = (value) => emit('change', value)

const dblClick = (value) => emit('dblclick', value)

const enter = (value) => emit('keypress-enter', value)

const clearSelection = () => { selectElement.value.selectedIndex = -1 }

defineExpose({
  clearSelection
})
</script>

<template>
  <div>
    <div class="subtitle">{{props.title}}</div>
    <select tabindex="0"
      ref="selectElement" :size="props.lines"
      v-model="paneValue"
      @change="change"
      @keypress.enter="enter"
      @dblclick="dblClick"
      :disabled="disabled">
      <option v-if="props.items.length===0" disabled :value="null"></option>
      <option v-for="(item,key,index) in props.items"
        :key="index"
        :value="item">
        {{item}}
      </option>
    </select>
  </div>
</template>
