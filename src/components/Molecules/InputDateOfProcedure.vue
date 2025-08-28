<script setup>
import { onMounted, ref, computed, watchEffect } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'

const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  required: {
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  tabindex: {
    type: [Number, String]
  }
})
const emit = defineEmits(['update:value'])

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

const dateOfProcedure = computed({
  get: () => props.value,
  set: (newvalue) => emit('update:value', newvalue)
})

watchEffect(() => {
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
  <div style="display: flex; flex-direction: row; height: 2.4rem;">
    <div class="label"><span>手術日</span></div>
    <template>
      <VueDatePicker
        ref="datepicker"
        v-model="dateOfProcedure"
        text-input
        :enable-time-picker="false"
        format="yyyy-MM-dd"
        :format-locale="ja"
        week-start="0"
        auto-apply
        placeholder="クリックでカレンダー"
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
      </VueDatePicker>
    </template>
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
