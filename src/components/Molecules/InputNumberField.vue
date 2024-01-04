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

function increase () {
  const newValue = Number(ZenToHanNumbers(props.value) || 0) + 1
  inputText.value = ((props.max !== undefined && newValue >= props.max) ? props.max : newValue).toString(10)
}

function decrease () {
  if (props.value) {
    const newValue = Number(ZenToHanNumbers(props.value)) - 1
    inputText.value = ((props.min !== undefined && newValue <= props.min) ? props.min : newValue).toString(10)
  }
}
</script>

<template>
  <div style="display: flex; flex-direction: row; height: 2.4rem;">
    <div class="label"><span>{{title || '数値を入力'}}</span></div>
    <div class="field number-field">
      <div>
        <input type="text"
          v-model="inputText"
          :min="min"
          :max="max"
          :class="[(!inputText && props.required) ? 'vacant' : '']"
          v-bind="$attrs"
          />
        <span class="number-field__control number-field__decrease" @click="decrease">&#xe790;</span>
        <span class="number-field__control number-field__increase" @click="increase">&#xe78f;</span>
      </div>
    </div>
</div>
</template>

<style lang="sass">
div.number-field > div
  position: relative
  margin-right: 50%
span.number-field__control
  position: absolute
  right: 2px
  width: 28px
  border-left: solid 1px var(--border-color-base)
  text-align: center
  font-family: 'element-icons'
  line-heigt: 14px
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
