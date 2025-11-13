<script setup>
import { onMounted, ref, computed } from 'vue'
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
const datepicker = ref()
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
</script>

<template>
  <div style="display: flex; flex-direction: row; height: 2.4rem">
    <div class="label"><span>手術日</span></div>
    <div class="field">
      <VueDatePicker
        ref="datepicker"
        v-model="datepickerValue"
        model-type="yyyy-MM-dd"
        :formats="{ format: 'yyyy-MM-dd', preview: 'yyyy-MM-dd' }"
        :locale="ja"
        :time-config="{ enableTimePicker: false }"
        week-start="0"
        :auto-apply="true"
        :input-attrs="{ clearable: false }"
        :text-input="{
          enterSubmit: true,
          tabSubmit: true,
          openMenu: 'toggle',
          escClose: true,
        }"
        :action-row="{
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
        <template #dp-input="{ value, onInput, onBlur, onFocus, onKeypress, handlePaste }">
          <input
            type="text"
            :value="value"
            placeholder="クリックでカレンダー"
            :class="[!value && props.required ? 'vacant' : '']"
            @input="onInput"
            @blue="onBlur"
            @focus="onFocus"
            @keypress="onKeypress"
            @keydown="onKeypress($event)"
            @paste="handlePaste"
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
