<script setup>
import { onMounted, useTemplateRef, computed } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { ja } from 'date-fns/locale'

const props = defineProps({
  required: {
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  tabindex: {
    type: [Number, String],
  },
})
const dateOfProcedure = defineModel()

// Set tabindex
const datepicker = useTemplateRef('datepicker')
let inputelement
onMounted(() => {
  try {
    inputelement = datepicker.value.getElementsByTagName('input')[0]
  } catch {
    inputelement = undefined
  }
  if (props.tabindex !== undefined && inputelement !== undefined) {
    inputelement.tabIndex = props.tabindex
  }
})

const datepickerValue = computed({
  get: () => {
    if (!dateOfProcedure.value) return null
    return dateOfProcedure.value
  },
  set: (value) => {
    if (typeof value === 'string') {
      // 空文字列は許容
      dateOfProcedure.value = value
    } else {
      // nullは空文字列に変換
      dateOfProcedure.value = ''
    }
  },
})

// yyyy-MM-dd形式にフォーマット
const formatDisplayValue = (value) => {
  if (!value) return ''

  // 既にyyyy-MM-dd形式ならそのまま返す
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  // MM/dd/yyyy形式の文字列を変換
  if (typeof value === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
    const parts = value.split('/')
    const month = parts[0].padStart(2, '0')
    const day = parts[1].padStart(2, '0')
    const year = parts[2]
    return `${year}-${month}-${day}`
  }

  // Dateオブジェクトの場合はフォーマット
  if (value instanceof Date) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return value
}
</script>

<template>
  <div style="display: flex; flex-direction: row; height: 2.4rem">
    <div class="label"><span>手術日</span></div>
    <div class="field">
      <VueDatePicker
        ref="datepicker"
        v-model="datepickerValue"
        model-type="yyyy-MM-dd"
        :locale="ja"
        :time-config="{ enableTimePicker: false }"
        week-start="0"
        :auto-apply="true"
        :text-input="{
          enterSubmit: true,
          tabSubmit: true,
          openMenu: 'toggle',
          escClose: true,
          format: 'yyyy-MM-dd'
        }"
        :input-attrs="{
          clearable: false
        }"
        :action-row="{
          showSelect: true,
          showCancel: true,
          selectBtnLabel: '選択',
          cancelBtnLabel: '閉じる'
        }"
      >
        <template #calendar-header="{ index, day }">
          <div
            :style="
              index === 0
                ? 'font-weight: normal; font-size: 0.8rem; color: red;'
                : 'font-weight: normal; font-size: 0.8rem;'
            "
          >
            {{ day }}
          </div>
        </template>
        <template #dp-input="{ value, onInput, onBlur, onFocus, onKeypress, onEnter, onTab, onPaste }">
          <input
            type="text"
            :value="formatDisplayValue(value)"
            placeholder="クリックでカレンダー"
            :class="[!value && props.required ? 'vacant' : '']"
            @input="(e) => onInput(e)"
            @blur="onBlur"
            @focus="onFocus"
            @keypress="onKeypress"
            @keydown.enter="onEnter"
            @keydown.tab="onTab"
            @paste="(e) => onPaste(e)"
          />
        </template>
      </VueDatePicker>
    </div>
  </div>
</template>

<style lang="sass">
div.vdp-datepicker__calendar
  // 日曜日
  span.day-header:first-child
    color: red
  // 土曜日
  span.day-header:nth-child(7)
    color: blue
</style>
