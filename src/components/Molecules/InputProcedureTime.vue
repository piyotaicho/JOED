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
 * キーボードイベントを処理して入力文字列を作成する
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
    typedString.value = (typedString.value + char).slice(-5)
  }

  // 適当に計算した分の値から値の候補を設定
  const index = typedString.value.indexOf(':')
  if (index !== -1) {
    selectionCandidate.value = encodeProcedureTime(
      Number(typedString.value.substring(0, index)) * 60 +
      Number(typedString.value.substring(index + 1))
    )
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
 * 手動入力値関連を削除
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
          @keyup.esc="clearTypedValue()"
          @keyup.backspace="typeInChar('DEL')"
          @keypress.48.prevent="typeInChar('0')" @keypress.96.prevent="typeInChar('0')"
          @keypress.49.prevent="typeInChar('1')" @keypress.97.prevent="typeInChar('1')"
          @keypress.50.prevent="typeInChar('2')" @keypress.98.prevent="typeInChar('2')"
          @keypress.51.prevent="typeInChar('3')" @keypress.99.prevent="typeInChar('3')"
          @keypress.52.prevent="typeInChar('4')" @keypress.100.prevent="typeInChar('4')"
          @keypress.53.prevent="typeInChar('5')" @keypress.101.prevent="typeInChar('5')"
          @keypress.54.prevent="typeInChar('6')" @keypress.102.prevent="typeInChar('6')"
          @keypress.55.prevent="typeInChar('7')" @keypress.103.prevent="typeInChar('7')"
          @keypress.56.prevent="typeInChar('8')" @keypress.104.prevent="typeInChar('8')"
          @keypress.57.prevent="typeInChar('9')" @keypress.105.prevent="typeInChar('9')"
          @keypress.:.prevent="typeInChar(':')"
          v-popover:popover
        >
          <option value="" disabled style="display:none;">手術所要時間</option>
          <option v-for="item in procedureTimeSelections"
            :key="item"
            :value="item">
            {{item}}
          </option>
        </select>
      </el-tooltip>
    </div>
  </div>
</template>
