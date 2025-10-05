<!-- eslint-disable vue/multi-word-component-names -->
<script setup>

import CloseButton from '@/components/Atoms/CloseButton.vue'
import DiagnosisMaster from '@/modules/Masters/DiagnosisMaster'
import ProcedureMaster from '@/modules/Masters/ProcedureMaster'
import AEMaster from '@/modules/Masters/AE'
import { computed } from 'vue'
import { useStore } from '@/store'

const emit = defineEmits(['close'])

// 一番新しいマスタの年次を取得する
const YearOfMaster = [(new DiagnosisMaster()).Year(), (new ProcedureMaster()).Year(), (new AEMaster()).Year()].sort()[2]

const store = useStore()
const InstituteName = computed(() => store.getters['system/InstitutionName'] || '(施設名称未設定)')
const ViewCount = computed(() => store.getters.NumberOfCases)
const TotalCount = computed(() => store.getters.TotalNumberOfCases)

const close = () => emit('close')
</script>

<template>
  <div>
    <div class="dashboard">
      <CloseButton @click="close"/>
      <div class="dashboard-title" ref="title">{{InstituteName}}</div>
      <div class="dashboard-row">
        <span>{{YearOfMaster}}年版マスタ</span>
        <span>表示 {{ViewCount}}件 / 全 {{TotalCount}}件</span>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
div.dashboard
  margin: 0.6rem 0.5rem 0.7rem 0.7rem
  padding: 0.3rem
  border: 0.18rem solid var(--border-color-base)
  border-radius: 0.3rem

div.dashboard-title
  margin: 0.3rem 0
  font-size: 1.3rem
  line-height: 1.8rem
  font-weight: bold
  letter-spacing: 0.08rem
  overflow-wrap: break-word
  word-break: break-word

div.dashboard-row
  display: flex
  flex-direction: row
  justify-content: space-around
  font-size: 0.95rem
</style>
