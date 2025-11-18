<script setup>
import InputDate from '@/components/Molecules/InputDate.vue'
import InputTextField from '@/components/Molecules/InputTextField.vue'
import InputNumberField from '@/components/Molecules/InputNumberField.vue'
import InputProcedureTime from '@/components/Molecules/InputProcedureTime.vue'
import AdditionalPatientInfo from './Organisms/AdditionalPatientInfo.vue'

const DateOfProcedure = defineModel('DateOfProcedure', {
  required: true,
  default: '',
})

const PatientId = defineModel('PatientId', {
  required: true,
  default: '',
})

const Name = defineModel('Name', {
  default: '',
})

const Age = defineModel('Age')

const ProcedureTime = defineModel('ProcedureTime', {
  default: '',
})

const Denial = defineModel('Denial', {
  default: false,
})

const JSOGId = defineModel('JSOGId', {
  default: '',
})

const NCDId = defineModel('NCDId', {
  default: '',
})
</script>

<template>
  <div class="patient-info-section">
    <div class="patient-info-section-left">
      <InputDate v-model="DateOfProcedure" :required="true" />
      <div style="display: flex; flex-direction: row">
        <div style="flex-grow: 2">
          <InputTextField
            title="患者ID"
            :required="true"
            v-model="PatientId"
            placeholder="患者の認識子"
          />
        </div>
        <div style="width: 2rem; margin-left: 0.3rem;">
          <AdditionalPatientInfo
            v-model:Denial="Denial"
            v-model:JSOGId="JSOGId"
            v-model:NCDId="NCDId"
            :DateOfProcedure="DateOfProcedure"
            :PatientId="PatientId"
          />
        </div>
      </div>
      <InputTextField title="患者名" v-model="Name" />
      <InputNumberField title="年齢" v-model="Age" :min="1" :max="120" />
    </div>
    <div class="patient-info-section-right">
      <div style="position: relative; height: 2.4rem"><!-- space --></div>
      <div style="position: relative; height: 2.4rem"><!-- space --></div>
      <div style="position: relative; height: 2.4rem"><!-- space --></div>
      <InputProcedureTime v-model="ProcedureTime" />
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
