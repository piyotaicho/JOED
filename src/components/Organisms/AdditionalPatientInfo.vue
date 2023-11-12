<script setup>
import { computed, defineProps, defineEmits } from 'vue'
// vue2.7 + compositionAPI store hack
import { useStore } from '@/store'
import InputTextField from '@/components/Molecules/InputTextField'

// vue2.7 + compositionAPI store hack
const store = useStore()

// Properties
const props = defineProps([
  'Denial', // boolean
  'JSOGId', // string
  'NCDId' // string
])

const emit = defineEmits([
  'update:Denial',
  'update:JSOGId',
  'update:NCDId'
])

// const visiblePopover = ref(true)

const AppealDenial = computed({
  get () {
    return props.Denial || false
  },
  set (newValue) {
    emit('update:Denial', newValue)
  }
})

const editJSOGId = computed(() => store.getters['system/EditJSOGId'])
const valueJSOGId = computed({
  get () {
    return props.JSOGId || ''
  },
  set (newValue) {
    emit('update:JSOGId', newValue)
  }
})

const editNCDId = computed(() => store.getters['system/EditNCDId'])
const valueNCDId = computed({
  get () {
    return props.NCDId || ''
  },
  set (newValue) {
    emit('update:NCDId', newValue)
  }
})

const informIconColor = computed(() => {
  if (props.Denial) {
    return { color: 'var(--color-danger)' }
  }
  if (props.JSOGId !== '' || props.NCDId !== '') {
    return { color: 'var(--color-warning)' }
  }
  return { color: 'var(--color-primary)' }
})
</script>

<template>
  <div>
    <el-popover placement="bottom" width="400" trigger="click">
      <!-- popover content-->
      <div class="additional-patient-info-panel">
        <div style="display: flex; flex-direction: row; height: 2.4rem;">
          <div class="label"><span>登録拒否</span></div>
          <div class="field" style="padding-top: 0.33rem;">
            <el-switch v-model="AppealDenial" inactive-text="なし" inactive-color="var(--color-primary)" active-text="あり" active-color="var(--color-danger)"/>
          </div>
        </div>
        <div>
          <InputTextField title="腫瘍登録番号" :value.sync="valueJSOGId" placeholder="腫瘍登録患者No." :disabled="!editJSOGId && props.JSOGId === ''"/>
        </div>
        <div>
          <InputTextField title="NCD症例識別コード" :value.sync="valueNCDId" placeholder="NCD症例識別コード" :disabled="!editNCDId && props.NCDId === ''"/>
        </div>
      </div>
      <!-- display button -->
      <div slot="reference" class="additonal-patient-info-button">
        <div>
          <i class="el-icon-info" :style="informIconColor"></i>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<style lang="sass">
div.additonal-patient-info-button
  display: flex
  justify-content: center
  align-content: center
  font-size: 1.3rem

div.additional-patient-info-panel
  display: flex
  flex-direction: column
  & > div
    width: 100%
  input[type="text"]
    width: 100%
  select
    width: 100%
    height: 2rem
  .label
    width: 10rem
    text-align: right
    padding-top: 0.4rem
    margin-right: 1.4rem
  .field
    width: 13.5rem
</style>
