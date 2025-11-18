<script setup>
import { computed, useTemplateRef } from 'vue'
import { useStore } from '@/store'
import { InfoFilled } from '@element-plus/icons-vue'
import InputTextField from '@/components/Molecules/InputTextField.vue'

const store = useStore()

const props = defineProps({
  DateOfProcedure: {
    type: String
  },
  PatientId: {
    type: String
  }
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

const switchField = useTemplateRef('switchField')

// 編集フラグ
const editJSOGId = computed(() => store.getters['system/EditJSOGId'])
const editNCDId = computed(() => store.getters['system/EditNCDId'])

const hashString = computed(() => {
  if (Denial.value && props.DateOfProcedure !== '' && props.PatientId !== '') {
    return store.getters['system/generateHash'](
      JSON.stringify({
        DateOfProcedure: props.DateOfProcedure,
        PatientId: props.PatientId
      }),
      props.DateOfProcedure.substring(0, 4) <= '2021'
    )
  } else {
    return '手術日と患者IDの入力が必須です'
  }
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
  const inputElement = switchField.value.getElementsByTagName('input')[0]
  inputElement.focus()
}
</script>

<template>
  <div>
    <el-popover placement="bottom" width="400" trigger="click" @after-enter="focusInput">
      <!-- display button -->
      <template #reference>
        <div class="additonal-patient-info-button">
          <template v-if="tooltip === ''">
            <el-icon :style="{borderRadius: '50%', ...iconColor}" tabindex="0"><InfoFilled /></el-icon>
          </template>
          <template v-else>
            <el-tooltip class="item" effect="dark" placement="right" :content="tooltip">
              <el-icon :style="{borderRadius: '50%', ...iconColor} " tabindex="0"><InfoFilled /></el-icon>
            </el-tooltip>
          </template>
        </div>
      </template>
      <!-- popover content-->
      <div class="additional-patient-info-panel">
          <div style="display: flex; flex-direction: row; height: 2.4rem;">
            <div class="label"><span>登録拒否</span></div>
            <div class="field" ref="switchField">
              <el-switch
                v-model="Denial"
                :active-text="'あり'"
                :active-value="true"
                :inactive-text="'なし'"
                :inactive-value="false"
                style="--el-switch-on-color: var(--color-danger); --el-switch-off-color: var(--color-primary);" />
            </div>
          </div>

        <template v-if="Denial">
          <InputTextField title="レコード識別子" :modelValue="hashString" readonly/>
        </template>
        <template v-if="editJSOGId || JSOGId !== ''">
          <InputTextField title="腫瘍登録番号" v-model="JSOGId" placeholder="腫瘍登録患者No."/>
        </template>
        <template v-if="editNCDId || NCDId !== ''">
          <InputTextField title="NCD症例識別コード" v-model="NCDId" placeholder="NCD症例識別コード"/>
        </template>
      </div>
    </el-popover>
  </div>
</template>

<style lang="sass">
div.additonal-patient-info-button
  display: block
  justify-content: center
  align-content: center
  font-size: 1.2rem
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
