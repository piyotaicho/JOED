<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { PropType } from 'vue'

type SwitchPrimitive = string | number | boolean
type SwitchOptionObject = {
  value?: SwitchPrimitive
  text?: string
  color?: string
}
type SwitchOption = SwitchPrimitive | SwitchOptionObject
type SwitchParam = {
  text: string
  value: SwitchPrimitive
  color: string
}

const props = defineProps({
  title: {
    type: String,
    default: 'スイッチ'
  },
  options: {
    type: Array as PropType<SwitchOption[] | undefined>,
    default: undefined,
  },
  required: {
    type: Boolean,
    default: false
  },
  classOverride: {
    type: Array as PropType<string[]>,
    default: () => ['label', 'field']
  }
})

const modelValue = defineModel<SwitchPrimitive>({
  required: true,
  default: false
})

const switchParams = reactive<{ inactive: SwitchParam; active: SwitchParam }>({
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

  const parseOption = (option: SwitchOption): Partial<SwitchParam> => {
    if (typeof option === 'object' && option !== null && !Array.isArray(option)) {
      const objectOption = option as SwitchOptionObject
      return {
        ...objectOption.value !== undefined ? { value: objectOption.value } : {},
        ...objectOption.text !== undefined ? { text: objectOption.text } :
          objectOption.value !== undefined
            ? { text: typeof objectOption.value === 'boolean' ? (objectOption.value ? 'TRUE' : 'FALSE') : String(objectOption.value) }
            : {},
        ...objectOption.color !== undefined ? { color: objectOption.color } : {}
      }
    } else {
      const primitiveOption = option as SwitchPrimitive
      return {
        text: typeof primitiveOption === 'boolean' ? (primitiveOption ? 'TRUE' : 'FALSE') : String(primitiveOption),
        value: primitiveOption
      }
    }
  }

  const inactiveOption = parseOption(props.options[0] ?? false)
  const activeOption = parseOption(props.options[1] ?? true)

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
