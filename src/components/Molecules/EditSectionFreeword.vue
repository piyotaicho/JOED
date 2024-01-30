<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'

const props = defineProps({
  value: {
    type: String
  },
  disabled: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits(['update:value', 'click-search'])

const expandInput = ref(false)
const inputElement = ref()

onMounted(() => {
  if (props.value !== '') {
    expandInput.value = true
  }
})

const typedValue = computed({
  get: () => props.value,
  set: (value) => emit('update:value', value)
})

const toggle = () => {
  expandInput.value = !expandInput.value
  if (expandInput.value) {
    nextTick(() => inputElement.value.focus())
  }
}

const open = async () => {
  expandInput.value = true
  await nextTick()
  inputElement.value.focus()
}
const search = () => emit('click-search')

defineExpose({ open })
</script>

<template>
  <div class="flex-content inputbox">
    <div class="w20"></div>
    <div class="w20 subtitle">
      <div class="invisible-button" @click="toggle">
        <span>自由入力</span>
        <span style="padding-left: 1rem;">
          <i :class="[expandInput ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right']"/>
        </span>
      </div>
    </div>
    <div class="w40" v-show="expandInput">
        <input type="text"
          v-model="typedValue"
          :disabled="props.disabled"
          placeholder="カテゴリ選択後に入力・検索可能になります"
          ref="inputElement"
        />
    </div>
    <div class="w20" v-show="expandInput">
      <el-button type="primary" @click="search" icon="el-icon-search" :disabled="props.disabled">候補を検索</el-button>
    </div>
  </div>
</template>

<style lang="sass">
div.invisible-button
  padding: 0 1rem 0 2rem
  border: 1px solid transparent
  border-radius: 0.2rem
  &:hover
    border: 1px dashed var(--border-color-base)
    border-radius: 0.2rem
div.inputbox
  input[type="text"][disabled]
    cursor: not-allowed
</style>
