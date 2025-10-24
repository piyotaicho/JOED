<template>
  <label class="LabeledRadio"
    :disabled="props.disabled"
    :tabindex="props.tabindex"
    @keydown.enter.exact="changeState"
    @keydown.space.exact.prevent="changeState">
    <input type="radio" class="LabeledRadio"
      ref="inputElement"
      v-model="radioValue"
      :disabled="props.disabled"
      :value="props.value"
      :required="props.required">
    <span>
      <slot>{{typeof(value)==='boolean'?'':value}}</slot>
    </span>
  </label>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  // チェックボックスで設定される値
  value: {
    type: [Boolean, String, Number],
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  tabindex: {
    type: [Number, String],
    default: 0
  },
  required: {
    type: Boolean,
    default: false
  }
})

// 設定値を双方向バインドするためのコンテナ
const radioValue = defineModel()

const inputElement = ref()

// const radioValue = computed({
//   get: () => container.value || null,
//   set: (newValue) => { container.value = newValue }
// })

const changeState = () => {
  if (radioValue.value === props.value) {
    // すでに選択されている場合は選択解除
    radioValue.value = null
  } else {
    radioValue.value = props.value
  }
}
</script>

<style lang="sass">
label.LabeledRadio
  padding: 0.1rem 0.7rem 0.1rem 0rem
  margin: 0 0 0 0.3rem
  white-space: nowrap

input.LabeledRadio[type="radio"]
  display: none
  outline: none
  & + span
    padding-left: 1.9rem
    position: relative
  & + span::before
    position: absolute
    display: block
    border: 1px solid var(--border-color-base)
    border-radius: 0.15rem
    content: ''
    top: 50%
    left: 0.4rem
    height: 0.8rem
    width: 0.8rem
    transform: translateY(-0.45rem)
  &:required + span::before
    border-color: var(--color-danger)
  &:checked + span::before
    border-color: var(--color-primary)
    background: var(--color-primary)
  &:checked + span::after
    position: absolute
    display: block
    border-bottom: 2px solid var(--background-color-dialog)
    border-left: 2px solid var(--background-color-dialog)
    content: ''
    top: 50%
    left: 0.7rem
    height: 0.25rem
    width: 0.48rem
    transform: translate(-0.14rem, -0.25rem) rotate(-50deg)
</style>
