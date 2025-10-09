<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { DArrowLeft, DArrowRight, Search } from '@element-plus/icons-vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: true
  }
})
const modelValue = defineModel({
  type: String
})
const emit = defineEmits(['click-search'])

// element refs
const inputElement = ref()

// reactive states
const expandInput = ref(false)

onMounted(() => {
  if (modelValue.value !== '') {
    expandInput.value = true
  }
})

const Toggle = () => {
  expandInput.value = !expandInput.value
  if (expandInput.value) {
    nextTick(() => inputElement.value.focus())
  }
}

const Open = async () => {
  expandInput.value = true
  await nextTick()
  inputElement.value.focus()
}

defineExpose({ Open })
</script>

<template>
  <div class="flex-content inputbox">
    <div class="w20"></div>
    <div class="w20 subtitle">
      <div class="invisible-button" @click="Toggle">
        <span>自由入力</span>
        <span style="padding-left: 1rem;">
          <el-icon><component :is="expandInput ? DArrowLeft : DArrowRight" /></el-icon>
        </span>
      </div>
    </div>
    <div class="w40" v-show="expandInput">
        <input type="text"
          v-model="modelValue"
          :disabled="props.disabled"
          placeholder="カテゴリ選択後に入力・検索可能になります"
          ref="inputElement"
        />
    </div>
    <div class="w20" v-show="expandInput">
      <el-button type="primary" @click="emit('click-search')" :icon="Search" :disabled="props.disabled">候補を検索</el-button>
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
