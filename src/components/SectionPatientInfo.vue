<script setup>
import { computed } from 'vue'
import InputDateOfProcedure from '@/components/Molecules/InputDateOfProcedure'
import InputTextField from '@/components/Molecules/InputTextField'
import InputNumberField from '@/components/Molecules/InputNumberField'
import InputProcedureTime from '@/components/Molecules/InputProcedureTime'
import AdditionalPatientInfo from './Organisms/AdditionalPatientInfo'

// プロパティ
const props = defineProps({
  DateOfProcedure: {
    type: String,
    default: ''
  },
  PatientId: {
    type: String,
    default: ''
  },
  Name: {
    type: String,
    default: ''
  },
  Age: {
    type: [Number, String]
  },
  ProcedureTime: {
    type: String,
    default: ''
  },
  Denial: {
    type: Boolean,
    default: false
  },
  JSOGId: {
    type: String,
    default: ''
  },
  NCDId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'update:DateOfProcedure',
  'update:PatientId',
  'update:name',
  'update:age',
  'update:ProcedureTime',
  'update:denial',
  'update:JSOGId',
  'update:NCDId'
])

// computed as v handler
const valueDateOfProcedure = computed({
  get () {
    return props.DateOfProcedure || ''
  },
  set (newValue) {
    emit('update:DateOfProcedure', newValue)
  }
})

const valuePatientId = computed({
  get () {
    return props.PatientId || ''
  },
  set (newValue) {
    emit('update:PatientId', newValue)
  }
})

const valueName = computed({
  get () {
    return props.Name || ''
  },
  set (newValue) {
    emit('update:name', newValue)
  }
})

const valueAge = computed({
  get () {
    return props.Age || undefined
  },
  set (newValue) {
    emit('update:age', newValue)
  }
})

const valueProcedureTime = computed({
  get () {
    return props.ProcedureTime || ''
  },
  set (newValue) {
    emit('update:ProcedureTime', newValue)
  }
})

const valueDenial = computed({
  get () {
    return props.Denial || false
  },
  set (newValue) {
    emit('update:denial', newValue)
  }
})

const valueJSOGId = computed({
  get () {
    return props.JSOGId
  },
  set (newValue) {
    emit('update:JSOGId', newValue)
  }
})

const valueNCDId = computed({
  get () {
    return props.NCDId
  },
  set (newValue) {
    emit('update:NCDId', newValue)
  }
})
</script>

<template>
  <div class="patient-info-section">
    <div class="patient-info-section-left">
      <InputDateOfProcedure :value.sync="valueDateOfProcedure" :required="true"/>
      <div style="display: flex; flex-direction: row;">
        <div style="flex-grow: 2;">
          <InputTextField title="患者ID" :required="true" :value.sync="valuePatientId" placeholder="患者の認識子"/>
        </div>
        <div style="width: 2rem;">
          <AdditionalPatientInfo :Denial.sync="valueDenial" :JSOGId.sync="valueJSOGId" :NCDId.sync="valueNCDId" :DateOfProcedure="valueDateOfProcedure" :PatientId="valuePatientId"/>
        </div>
      </div>
      <InputTextField title="患者名" :value.sync="valueName"/>
      <InputNumberField title="年齢" :value.sync="valueAge" :min="1" :max="120"/>
    </div>
    <div class="patient-info-section-right">
      <div style="position: relative; height: 2.4rem;"><!-- space --></div>
      <div style="position: relative; height: 2.4rem;"><!-- space --></div>
      <div style="position: relative; height: 2.4rem;"><!-- space --></div>
      <InputProcedureTime :value.sync="valueProcedureTime"/>
    </div>
  </div>
</template>

<style lang="sass">
div.patient-info-section
  display: flex
  flex-direction: row
  input[type="text"]
    width: 100%
  select
    width: 100%
    height: 2rem
  .label
    width: 8rem
    text-align: right
    padding-top: 0.2rem
    margin-right: 1.4rem
  .field
    width: 15.5rem
  .number
    width: 3rem

div.patient-info-section-left
  width: 50%
  display: flex
  flex-direction: column

div.patient-info-section-right
  width: 50%
  display: flex
  flex-direction: column

</style>
