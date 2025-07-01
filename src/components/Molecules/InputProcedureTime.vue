<script setup>
import { computed, ref } from 'vue'
import { ProcedureTimeSelections, encodeProcedureTime } from '@/modules/ProcedureTimes'

const props = defineProps(['value'])
const emit = defineEmits(['update:value'])

const procedureTimeSelections = ProcedureTimeSelections()

// reactiveプロパティ
// キー入力文字列
const typedString = ref('')
// キー入力からの候補選択
const selectionCandidate = ref('')

// 算出プロパティ

// 選択値候補があればプロパティよりもそちらを優先
const procedureTime = computed({
  get: () => selectionCandidate.value !== '' ? selectionCandidate.value : props.value,
  set: (newvalue) => {
    emit('update:value', newvalue)
    clearTypedValue()
  }
})

// ツールチップの文字列
const popoverContent = computed(() => typedString.value === '' ? '' : `直接入力中: ${typedString.value}`)

/**
 * キーボードイベントを処理して入力文字列処理へ渡す
 */
const handleKeydown = (event) => {
  const keyMap = {
    0: '0',
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    Delete: 'DEL',
    ':': ':',
    ';': ':' // USキーボードの場合
  }
  if (keyMap[event.key] !== undefined) {
    typeInChar(keyMap[event.key])
  }
}

/**
 * 入力を受け取って文字列を生成する
 * @param char 入力文字
 */
const typeInChar = (char) => {
  // キー入力文字列を生成
  if (char === 'DEL') {
    typedString.value = typedString.value.slice(0, -1)
    if (typedString.value === '') {
      selectionCandidate.value = ''
      return
    }
  } else {
    if (typedString.value === '') {
      selectionCandidate.value = ''
    }
    typedString.value = typedString.value + char
  }

  // 入力文字列から候補選択
  const hourSepIndex = typedString.value.indexOf(':')
  if (hourSepIndex !== -1) {
    const hour = Number(typedString.value.substring(0, hourSepIndex))
    const minuteSepIndex = typedString.value.indexOf(':', hourSepIndex + 1)
    const minute = minuteSepIndex === -1
      ? Number(typedString.value.substring(hourSepIndex + 1)) % 60
      : Number(typedString.value.substring(hourSepIndex + 1, minuteSepIndex)) % 60

    selectionCandidate.value = encodeProcedureTime((hour * 60) + minute)
  } else {
    selectionCandidate.value = encodeProcedureTime(typedString.value)
  }
}

/**
 * 手動入力値をそのまま採用する
 */
const acceptValue = () => {
  if (selectionCandidate.value !== '') {
    procedureTime.value = selectionCandidate.value
  }
  clearTypedValue()
}

/**
 * 手動入力値を削除
 */
const clearTypedValue = () => {
  typedString.value = ''
  selectionCandidate.value = ''
}
</script>

<template>
  <div style="display: flex; flex-direction: row; height: 2.4rem;">
    <div class="label"><span class="required">手術時間</span></div>
    <div class="field">
      <el-tooltip ref="popover" placement="top" offset="2" :manual="true" transition="none" :value="typedString !== ''" :content="popoverContent">
        <select v-model="procedureTime"
          :class="[!procedureTime ? 'vacant' : '']"
          v-bind="$attrs"
          @blur="acceptValue()"
          @keyup.enter="acceptValue()"
          @keyup.esc="clearTypedValue()"
          @keyup.exact.backspace="typeInChar('DEL')"
          @keydown.exact.prevent="handleKeydown($event)"
          v-popover:popover
        >
          <option value="" disabled style="display:none;">手術所要時間</option>
          <template v-for="item in procedureTimeSelections" :key="item">
            <option :value="item">{{ item }}</option>
          </template>
        </select>
      </el-tooltip>
    </div>
  </div>
</template>
