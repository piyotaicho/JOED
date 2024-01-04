<script setup>
import { computed, ref } from 'vue'
import { ProcedureTimeSelections, encodeProcedureTime } from '@/modules/ProcedureTimes'

const props = defineProps(['value'])
const emit = defineEmits(['update:value'])

const procedureTimeSelections = ProcedureTimeSelections()

// reactiveプロパティ
const typedString = ref('')

// 算出プロパティ
const procedureTime = computed({
  get: () => props.value,
  set: (newvalue) => emit('update:value', newvalue)
})

const typeInChar = (char) => {
  if (char === 'DEL') {
    typedString.value = typedString.value.slice(0, -1)
  } else {
    typedString.value = (typedString.value + char).slice(-5)
  }

  const index = typedString.value.indexOf(':')
  if (index !== -1) {
    procedureTime.value = encodeProcedureTime(
      Number(typedString.value.substring(0, index)) * 60 +
      Number(typedString.value.substring(index + 1))
    )
  } else {
    procedureTime.value = encodeProcedureTime(typedString.value)
  }
}

const clearTypedValue = () => {
  typedString.value = ''
}
</script>

<template>
  <div style="display: flex; flex-direction: row; height: 2.4rem;">
    <div class="label"><span class="required">手術時間</span></div>
    <div class="field">
      <select v-model="procedureTime"
        :class="[!procedureTime ? 'vacant' : '']"
        v-bind="$attrs"
        @blur="clearTypedValue()"
        @keypress.esc="clearTypedValue()"
        @keypress.delete="typeInChar('DEL')"
        @keypress.48.prevent="typeInChar('0')" @keypress.96.prevent="typeInChar('0')"
        @keypress.49.prevent="typeInChar('1')" @keypress.97.prevent="typeInChar('1')"
        @keypress.50.prevent="typeInChar('2')" @keypress.98.prevent="typeInChar('2')"
        @keypress.51.prevent="typeInChar('3')" @keypress.99.prevent="typeInChar('3')"
        @keypress.52.prevent="typeInChar('4')" @keypress.100.prevent="typeInChar('4')"
        @keypress.53.prevent="typeInChar('5')" @keypress.101.prevent="typeInChar('5')"
        @keypress.54.prevent="typeInChar('6')" @keypress.102.prevent="typeInChar('6')"
        @keypress.55.prevent="typeInChar('7')" @keypress.103.prevent="typeInChar('7')"
        @keypress.56.prevent="typeInChar('8')" @keypress.104.prevent="typeInChar('8')"
        @keypress.57.prevent="typeInChar('9')" @keypress.105.prevent="typeInChar('9')"
        @keypress.58.prevent="typeInChar(':')"
      >
        <option value="" disabled style="display:none;">手術所要時間</option>
        <option v-for="item in procedureTimeSelections"
          :key="item"
          :value="item">
          {{item}}
        </option>
      </select>
    </div>
  </div>
</template>
