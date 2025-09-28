<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
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
    console.log(`Getter ${dateOfProcedure.value}`)
    if (!dateOfProcedure.value) return null
    // ISO日付型文字列 (yyyy-MM-dd) を Date 型に変換
    // const [yyyy, mm, dd] = dateOfProcedure.value.split('-')
    // if (!yyyy || !mm || !dd) return null
    // return new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    return dateOfProcedure.value
  },
  set: (value) => {
    console.log(`Got ${value} type ${typeof value}`)
    if (value instanceof Date && !isNaN(value)) {
      // yyyy-MM-dd 形式でISO文字列に変換
      const yyyy = value.getFullYear()
      const mm = String(value.getMonth() + 1).padStart(2, '0')
      const dd = String(value.getDate()).padStart(2, '0')
      dateOfProcedure.value = `${yyyy}-${dd}-${mm}`
    } else {
      if (typeof value === 'string') {
        // 空文字列は許容
        dateOfProcedure.value = value
      } else {
        dateOfProcedure.value = ''
      }
    }
  },
})

const datepickerValueManualChange = (value) => {
  console.log(`Manual change ${value}`)
  if (typeof value === 'string') {
    dateOfProcedure.value = value
  }
}

watch(dateOfProcedure, () => {
  if (props.required && inputelement !== undefined) {
    if (dateOfProcedure.value === '') {
      inputelement.classList.add('vacant')
    } else {
      inputelement.classList.remove('vacant')
    }
  }
})
</script>

<template>
  <div style="display: flex; flex-direction: row; height: 2.4rem">
    <div class="label"><span>手術日</span></div>
    <div class="field">
      <VueDatePicker
        ref="datepicker"
        v-model="datepickerValue"
        text-input
        model-type="yyyy-MM-dd"
        :enable-time-picker="false"
        format="yyyy-MM-dd"
        :format-locale="ja"
        week-start="0"
        auto-apply
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
        <template #dp-input="{ value, onBlur, onEnter }">
          <input
            type="text"
            :value="value"
            placeholder="クリックでカレンダー"
            :class="[!value && props.required ? 'vacant' : '']"
            :onBlur="datepickerValueManualChange(value)"
            @onEnter="datepickerValueManualChange(value)"
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
