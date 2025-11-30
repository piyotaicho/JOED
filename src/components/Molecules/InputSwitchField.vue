<script setup>
import { reactive, computed } from 'vue'

const props = defineProps({
  title: {
    default: 'スイッチ'
  },
  options: {
    type: [Array]
  },
  required: {
    default: false
  },
  classOverride: {
    type: Array,
    default: () => ['label', 'field']
  }
})

const modelValue = defineModel({
  type: [String, Number, Boolean],
  required: true,
  default: false
})

const switchParams = reactive({
  inactive: {
    text: 'FALSE',
    value: false,
    color: 'var(--color-primary)'
  },
  active: {
    text: 'TRUE',
    value: true,
    color: 'var(--color-primary)'
  }
})

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

  switchParams.inactive = {
    ...switchParams.inactive,
    ...inactiveOption
  }
  switchParams.active = {
    ...switchParams.active,
    ...activeOption
  }
}

const isChecked = computed(() => {
  return modelValue.value === switchParams.active.value
})
</script>

<template>
  <div>
    <div :class="classOverride[0]"><span>{{title}}</span></div>
    <div :class="classOverride[1]">
      <div style="display: flex; flex-direction: row;">
        <div style="padding: 0.35rem 0.8rem; font-size: 14px;" v-if="switchParams.inactive.text !== ''">
          <span :style="{fontWeight: isChecked ? 'normal' : 'bold'}">{{switchParams.inactive.text}}</span>
        </div>
        <el-switch
          v-model="modelValue"
          :inactive-value="switchParams.inactive.value"
          :active-value="switchParams.active.value"
          :style="`--el-switch-on-color: ${switchParams.active.color}; --el-switch-off-color: ${switchParams.inactive.color};`"
          v-bind="$attrs"
        />
        <div style="padding: 0.35rem 0.8rem; font-size: 14px;" v-if="switchParams.active.text !== ''">
          <span :style="{fontWeight: isChecked ? 'bold' : 'normal'}">{{switchParams.active.text}}</span>
        </div>
      </div>
    </div>
</div>
</template>
