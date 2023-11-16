<script setup>
import { defineProps, defineEmits, ref, computed, onMounted } from 'vue'
// vue2.7 + compositionAPI store hack
import { useStore } from '@/store'
import InputSwitchField from '../Molecules/InputSwitchField.vue'
import InputTextField from '@/components/Molecules/InputTextField'

// vue2.7 + compositionAPI store hack
const store = useStore()

// Properties
const props = defineProps({
  Denial: {
    type: Boolean
  },
  JSOGId: {
    type: String
  },
  NCDId: {
    type: String
  }
})

const emit = defineEmits(['update:denial', 'update:JSOGId', 'update:NCDId'])

const switchField = ref()
onMounted(() => {
  // コンポーネント内へスタイルシートを適応仕切れないので適宜対応
  const el = switchField.value.$el.getElementsByClassName('field')[0]
  el.style.paddingTop = '0.33rem'
})

const Denial = computed({
  get: () => props?.Denial || false,
  set: (newValue) => emit('update:denial', newValue)
})

const editJSOGId = computed(() => store.getters['system/EditJSOGId'])
const JSOGId = computed({
  get: () => props?.JSOGId || '',
  set: (newValue) => emit('update:JSOGId', newValue)
})

const editNCDId = computed(() => store.getters['system/EditNCDId'])
const NCDId = computed({
  get: () => props?.NCDId || '',
  set: (newValue) => emit('update:NCDId', newValue)
})

const tooltip = computed(() => {
  let message = ''
  if (Denial.value) {
    message += '登録拒否症例です.'
  }
  if (JSOGId.value !== '' || NCDId.value !== '') {
    message +=
      [
        ...JSOGId.value !== '' ? ['腫瘍登録番号'] : [],
        ...NCDId.value !== '' ? ['NCD症例識別コード'] : []
      ].join(',') + 'が入力されています.'
  }
  return message
})

const iconColor = computed(() => {
  if (Denial.value) {
    return { color: 'var(--color-danger)' }
  }
  if (JSOGId.value !== '' || NCDId.value !== '') {
    return { color: 'var(--color-warning)' }
  }
  return { color: 'var(--color-primary)' }
})

const focusInput = () => {
  // スイッチへフォーカスする
  const inputElement = switchField.value.$el.getElementsByTagName('input')[0]
  console.dir(inputElement)
  inputElement.focus()
}
</script>

<template>
  <div>
    <el-popover placement="bottom" width="400" trigger="click" @after-enter="focusInput" :tabindex="-1">
      <!-- popover content-->
      <div class="additional-patient-info-panel">
          <InputSwitchField
            :value.sync="Denial"
            title="登録拒否"
            :options="['なし', 'あり', false, true, 'var(--color-primary)', 'var(--color-danger)']"
            style="display: flex; flex-direction: row; height: 2.4rem; div.field { border: 1px solid red; };"
            ref="switchField"
          />
        <div>
          <InputTextField title="腫瘍登録番号" :value.sync="JSOGId" placeholder="腫瘍登録患者No." :disabled="!editJSOGId && JSOGId === ''"/>
        </div>
        <div>
          <InputTextField title="NCD症例識別コード" :value.sync="NCDId" placeholder="NCD症例識別コード" :disabled="!editNCDId && NCDId === ''"/>
        </div>
      </div>
      <!-- display button -->
      <div slot="reference" class="additonal-patient-info-button">
        <div v-if="tooltip === ''">
          <i class="el-icon-info" :style="iconColor"></i>
        </div>
        <div v-else>
          <el-tooltip class="item" effect="dark" placement="right" :content="tooltip">
            <i class="el-icon-info" :style="iconColor"></i>
          </el-tooltip>
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
