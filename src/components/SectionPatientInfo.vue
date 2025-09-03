<script setup>
import { computed } from 'vue'
import InputDateOfProcedure from '@/components/Molecules/InputDateOfProcedure'
import InputTextField from '@/components/Molecules/InputTextField'
import InputNumberField from '@/components/Molecules/InputNumberField'
import InputProcedureTime from '@/components/Molecules/InputProcedureTime'
import AdditionalPatientInfo from './Organisms/AdditionalPatientInfo'

// プロパティ
// const props = defineProps({
//   DateOfProcedure: {
//     type: String,
//     default: ''
//   },
//   PatientId: {
//     type: String,
//     default: ''
//   },
//   Name: {
//     type: String,
//     default: ''
//   },
//   Age: {
//     type: [Number, String]
//   },
//   ProcedureTime: {
//     type: String,
//     default: ''
//   },
//   Denial: {
//     type: Boolean,
//     default: false
//   },
//   JSOGId: {
//     type: String,
//     default: ''
//   },
//   NCDId: {
//     type: String,
//     default: ''
//   }
// })

const DateOfProcedure = defineModel('DateOfProcedure', {
  required: true,
  default: ''
})

const PatientId = defineModel('PatientId', {
  required: true,
  default: ''
})

const Name = defineModel('Name', {
  default: ''
})

const Age = defineModel('Age')

const ProcedureTime = defineModel('ProcedureTime', {
  default: ''
})

const Denial = defineModel('Denial', {
  default: false
})

const JSOGId = defineModel('JSOGId', {
  default: ''
})

const NCDId = defineModel('NCDId', {
  default: ''
})

// computed as v handler
const valueDateOfProcedure = computed({
  get: () => DateOfProcedure || '',
  set: (newValue) => {
    DateOfProcedure.value = newValue
  }
})

const valuePatientId = computed({
  get: () => PatientId.value || '',
  set: (newValue) => {
    PatientId.value = newValue
  }
})

const valueName = computed({
  get: () => Name.value || '',
  set: (newValue) => {
    Name.value = newValue
  }
})

const valueAge = computed({
  get: () => Age.value.toString() || undefined,
  set: (newValue) => {
    Age.value = newValue
  }
})

const valueProcedureTime = computed({
  get: () => ProcedureTime.value || '',
  set: (newValue) => {
    ProcedureTime.value = newValue
  }
})

const valueDenial = computed({
  get: () => Denial.value || false,
  set: (newValue) => {
    Denial.value = newValue
  }
})

const valueJSOGId = computed({
  get: () => JSOGId.value || '',
  set: (newValue) => {
    JSOGId.value = newValue
  }
})

const valueNCDId = computed({
  get: () => NCDId.value || '',
  set: (newValue) => {
    NCDId.value = newValue
  }
})
</script>

<template>
  <div class="patient-info-section">
    <div class="patient-info-section-left">
      <InputDateOfProcedure v-model="valueDateOfProcedure" :required="true"/>
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
