<script setup>
import { ref, computed, onMounted } from 'vue'
// vue2.7 + compositionAPI store hack
import { useStore } from '@/store'
import { InfoFilled } from '@element-plus/icons-vue'
import InputSwitchField from '../Molecules/InputSwitchField.vue'
import InputTextField from '@/components/Molecules/InputTextField.vue'

// vue2.7 + compositionAPI store hack
const store = useStore()

// Properties
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

const switchField = ref()
onMounted(() => {
  // コンポーネント内へスタイルシートを適応仕切れないので適宜対応
  const el = switchField.value.$el.getElementsByClassName('field')[0]
  el.style.paddingTop = '0.33rem'
})

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
    return '手術日と患者IDが必要です'
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
  const inputElement = switchField.value.$el.getElementsByTagName('input')[0]
  inputElement.focus()
}
</script>

<template>
  <div>
    <el-popover placement="bottom" width="400" trigger="click" @after-enter="focusInput" :tabindex="-1">
      <!-- display button -->
      <template #reference>
        <div class="additonal-patient-info-button">
          <template v-if="tooltip === ''">
            <el-icon :style="iconColor"><InfoFilled /></el-icon>
          </template>
          <template v-else>
            <el-tooltip class="item" effect="dark" placement="right" :content="tooltip">
              <el-icon :style="iconColor"><InfoFilled /></el-icon>
            </el-tooltip>
          </template>
        </div>
      </template>
      <!-- popover content-->
      <div class="additional-patient-info-panel">
          <InputSwitchField
            v-model="Denial"
            title="登録拒否"
            :options="[{text: 'なし', value: false, color: 'var(--color-primary)'}, {text: 'あり', value: true, color: 'var(--color-danger)'}]"
            style="display: flex; flex-direction: row; height: 2.4rem; div.field { border: 1px solid red; };"
            ref="switchField"
          />
        <div v-if="Denial">
          <InputTextField title="レコード識別子" :modelValue="hashString" readonly/>
        </div>
        <div v-if="editJSOGId || JSOGId !== ''">
          <InputTextField title="腫瘍登録番号" v-model="JSOGId" placeholder="腫瘍登録患者No."/>
        </div>
        <div v-if="editNCDId || NCDId !== ''">
          <InputTextField title="NCD症例識別コード" v-model="NCDId" placeholder="NCD症例識別コード"/>
        </div>
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
