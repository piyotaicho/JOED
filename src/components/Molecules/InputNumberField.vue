<script setup>
import { computed } from 'vue'
import { ZenToHanNumbers } from '@/modules/ZenHanChars'

const props = defineProps({
  value: {
    type: [Number, String]
  },
  title: {
    default: 'NUMBER FIELD'
  },
  min: {
    type: Number
  },
  max: {
    type: Number
  },
  required: {
    default: false
  }
})

const emit = defineEmits(['update:value'])

const inputText = computed({
  get () { return props.value },
  set (newvalue) {
    emit('update:value', ZenToHanNumbers(newvalue))
  }
})

</script>

<template>
  <div style="display: flex; flex-direction: row; height: 2.4rem;">
    <div class="label"><span>{{title || '数値を入力'}}</span></div>
    <div class="field number-field">
      <input type="number"
        v-model="inputText"
        :min="min"
        :max="max"
        :class="[(!inputText && props.required) ? 'vacant' : '']"
        v-bind="$attrs"
        />
    </div>
</div>
</template>

<style lang="sass">
div.number-field > div
  position: relative
  margin-right: 50%

div.number-field input[type="number"]::-webkit-inner-spin-button, div.number-field input[type="number"]::-webkit-outer-spin-button
  opacity: 1

span.number-field__control
  position: absolute
  right: 2px
  width: 28px
  border-left: solid 1px var(--border-color-base)
  text-align: center
  color: var(--color-primary)
span.number-field__increase
  top: 2px
  border-bottom: solid 1px var(--border-color-base)
  height: 12px
span.number-field__decrease
  bottom: 2px
  line-height: 12px
span.number-field__disabled
  color: var(--border-color-base)
</style>
