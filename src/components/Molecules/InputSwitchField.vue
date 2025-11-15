<script setup>
import { onMounted, nextTick } from 'vue'

const props = defineProps({
  title: {
    default: 'スイッチ'
  },
  options: {
    type: [Array]
  },
  required: {
    default: false
  }
})

const modelValue = defineModel({
  type: [String, Number, Boolean],
  required: true,
  default: false
})

// DOMの初期化パラメータはプロパティから構成 - non reactiveであることに注意
let texts = ['FALSE', 'TRUE']
let values = [false, true]
let colors = ['var(--color-primary)', 'var(--color-primary)']

// DOMの初期化パラメータの設定
// options: [ inactive, active ]
//  inactive/active: String, Number, Boolean, Object
//  Objectの場合は {value: 値, text: 表示, color: 色} の形で指定
if (props.options !== undefined && props.options !== null) {
  if (props.options.length < 2) {
    throw new Error('InputSwitchField: optionsプロパティは最低2要素必要です')
  }

  const parseOption = (option) => {
    if (Object.prototype.toString.call(option) === '[object Object]') {
      return {
        ...option?.value !== undefined ? {value: option.value} : {},
        ...option?.text !== undefined ? {text: option.text} :
          option?.value !== undefined
            ? {text: typeof option.value === 'boolean' ? (option.value ? 'TRUE' : 'FALSE') : String(option.value)}
            : {},
        ...option?.color !== undefined ? {color: option.color} : {}
      }
    } else {
      return {
        text: typeof option === 'boolean' ? (option ? 'TRUE' : 'FALSE') : String(option),
        value: option
      }
    }
  }

  const inactiveOption = parseOption(props.options[0])
  const activeOption = parseOption(props.options[1])

  texts = [inactiveOption?.text || texts[0], activeOption?.text || texts[1]]
  values = [inactiveOption?.value || values[0], activeOption?.value || values[1]]
  colors = [inactiveOption?.color || colors[0], activeOption?.color || colors[1]]
}

const switchColorStyle = `--el-switch-on-color: ${colors[1]}; --el-switch-off-color: ${colors[0]};`

onMounted(() => nextTick())
</script>

<template>
  <div>
    <div class="label"><span>{{title}}</span></div>
    <div class="field" style="padding-top: 0;">
      <el-switch
        v-model="modelValue"
        :inactive-text="texts[0]"
        :inactive-value="values[0]"
        :active-text="texts[1]"
        :active-value="values[1]"
        :style="switchColorStyle"
        v-bind="$attrs"
      />
    </div>
</div>
</template>
