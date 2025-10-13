<script setup>
const props = defineProps({
  title: {
    default: 'スイッチ'
  },
  options: {
    type: [Array, Object]
  },
  required: {
    default: false
  }
})

const value = defineModel({
  type: [String, Number, Boolean],
  required: true,
  default: false
})

// DOMの初期化パラメータはプロパティから構成される(注意！non reactiveに限定)
let texts = ['FALSE', 'TRUE']
let values = [false, true]
let colors = ['var(--color-primary)', 'var(--color-primary)']

// DOMの初期化パラメータの設定
if (toString.call(props.options) === '[object Object]') {
  // objectでは {テキスト1: 値1, テキスト2: 値2} または
  // {テキスト1: {value: 値1, color: 色1}, テキスト2: {value: 値2, color: 色2}} の形で指定
  const keys = Object.keys(props.options)
  for (let index = 0; index < 2; index++) {
    texts[index] = keys[index]
    if (toString.call(props.options[keys[index]] !== '[object Object]')) {
      values[index] = props.options[keys[index]]
    } else {
      values[index] = props.options[keys[index]]?.value
      if (props.options[keys[index]]?.color) {
        colors[index] = props.options[keys[index]]?.color
      }
    }
  }
} else {
  // arrayでは テキスト1, テキスト2, 値1, 値2, 色1, 色2 の順に指定
  if (props.options.length === 6) {
    colors = [...props.options].splice(4, 2)
  }
  if (props.options.length === 4) {
    values = [...props.options].splice(2, 2)
  }
  if (props.options.length === 2) {
    texts = [...props.options].splice(0, 2)
  }
}

const switchColorStyle = `--el-switch-on-color: ${colors[1]}; --el-switch-off-color: ${colors[0]};`
</script>

<template>
  <div>
    <div class="label"><span>{{title}}</span></div>
    <div class="field" style="padding-top: 0;">
      <el-switch
        v-model="value"
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
