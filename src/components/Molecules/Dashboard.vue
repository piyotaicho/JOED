<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">

import CloseButton from '@/components/Atoms/CloseButton.vue'
import DiagnosisMaster from '@/modules/Masters/DiagnosisMaster'
import ProcedureMaster from '@/modules/Masters/ProcedureMaster'
import AEMaster from '@/modules/Masters/AE'
import { confirmYesNo } from '@/modules/Popups'
import { computed } from 'vue'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// 一番新しいマスタの年次を取得する
const YearOfMaster = [
  String((new DiagnosisMaster()).Year()),
  String((new ProcedureMaster()).Year()),
  String((new AEMaster(undefined)).Year())
].sort()[2]

const InstituteName = computed<string>(() => {
  const name = store.getters['system/InstitutionName'] as string | undefined
  return name || '(施設名称未設定)'
})
const ViewCount = computed<number>(() => Number(store.getters.NumberOfCases || 0))
const TotalCount = computed<number>(() => Number(store.getters.TotalNumberOfCases || 0))

const close = () => emit('close')

const clickTitle = async () => {
  if (store.getters['system/InstitutionName']) {
    return
  }
  // 施設名称未設定時は確認して設定画面へ誘導する
  if ( await confirmYesNo('施設名称が設定されていません。設定画面へ移動しますか？') ) {
    router.push({ name: 'settings' })
  }
}
</script>

<template>
  <div>
    <div class="dashboard">
      <CloseButton @click="close"/>
      <div class="dashboard-title" @click="clickTitle">{{InstituteName}}</div>
      <div class="dashboard-row">
        <span>{{YearOfMaster}}年版マスタ</span>
        <span>表示 {{ViewCount}}件 / 全 {{TotalCount}}件</span>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
div.dashboard
  position: relative
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
