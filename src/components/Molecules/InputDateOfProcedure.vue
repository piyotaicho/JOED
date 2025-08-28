<script setup>
import { onMounted, ref, computed } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker';

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
onMounted(() => {
  if (props.tabindex !== undefined) {
    let inputelement
    try {
      inputelement = datepicker.value.getElementsByTagName('input')[0]
      inputelement.tabIndex = props.tabindex
    } catch {}
  }
})

const dateOfProcedure = computed({
  get: () => props.value,
  set (newvalue) {
    if (newvalue) {
      // Datepickerから渡されるnewvalueはISO datestrなので整形が必要
      const dateobj = new Date(newvalue)
      const datestr = dateobj.getFullYear() + '-' +
        ('0' + (dateobj.getMonth() + 1)).slice(-2) + '-' +
        ('0' + dateobj.getDate()).slice(-2)
      emit('update:value', datestr)
    }
  }
})

const requiredClass = computed(() => (props.required === true && props.value === '') ? 'vacant' : '')
</script>

<template>
  <div ref="datepicker" style="display: flex; flex-direction: row; height: 2.4rem;">
    <div class="label"><span>手術日</span></div>
    <template>
      <Datepicker
        v-model="dateOfProcedure"
        text-input
        :enable-time-picker="false"
        format="yyyy-MM-dd"
        :format-locale="ja"
        auto-apply
        placeholder="クリックでカレンダー"
        />
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
