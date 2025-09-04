<script setup>
import { computed, nextTick } from 'vue'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox.vue'

const props = defineProps({
  title: {
    type: String
  },
  selectionMode: {
    type: String, // 'one'|'any'|anyornone' = 'one',
    default: 'one'
  },
  options: {
    type: Array
  },
  value: {
    type: Array
  }
})

const emit = defineEmits(['update:value'])

const title = computed(() => props?.title || '')

const selectionMode = computed(() => props?.selectionMode || 'one')

const options = computed(() => props?.options || [])

const value = computed({
  get: () => props.value || [],
  set: (value) => {
    const newvalueArray = []
    // 単一のvalue / selectから
    if (value === undefined || typeof value === 'string') {
      if (value && options.value.indexOf(value) !== -1) {
        newvalueArray.splice(0, 0, value)
      }
    }
    // 複数のvalues / checkboxから
    if (Array.isArray(value)) {
      // Optionsからvalueに該当するものをピックアップ > Optionsの順番を維持して保持
      const filtedValue = options.value.filter(
        (option) => value.indexOf(option) !== -1
      )
      if (filtedValue.length > 0 || selectionMode.value === 'anyornone') {
        newvalueArray.splice(0, 0, ...filtedValue)
      }
    }

    emit('update:value', newvalueArray)
  }
})

/**
 * valueの初期値設定
 */
const created = () => {
  if (value.value.length === 0) {
    const defaultValue = options.value.find(option => option.slice(-1) === '$')

    if (defaultValue) {
      nextTick(() => { value.value = [defaultValue] })
    }
  }
}
created()

/**
 * 単数選択→リスト
 * 複数選択可能→CheckBoxでレンダリング
 */
const isMultipleSelection = computed(() =>
  selectionMode.value === 'any' ||
  selectionMode.value === 'anyornone'
)

const selectionItems = computed(() => options.value)

const selectedArrayValue = computed({
  get: () => value.value,
  set: (newvalue) => { value.value = newvalue }
})

const selectedSingleValue = computed({
  get: () => {
    if (!value.value || value.value.length === 0) {
      return undefined
    } else {
      return value.value[0]
    }
  },
  set: (newvalue) => { value.value = newvalue }
})

/**
 * マスタの文字列から [] で囲まれた部分を削除、非保存値を示す ～$ を削除してラベルを作成する
 * @param {String} str
 */
const escapedItemCaption = (str) => str.replace(/\[.+\]/g, '').replace(/\$$/, '')

</script>

<template>
  <div class="flex-content">
    <div class="w30"></div>
    <div class="w20 selectionbox">
      <div>
        <span>{{ title }}</span>
      </div>
    </div>
    <div class="w40 selectionbox">
      <template v-if="isMultipleSelection">
        <template v-for="item of selectionItems" :key="item">
          <div>
            <LabeledCheckbox v-model="selectedArrayValue" :value="item">
              {{ escapedItemCaption(item) }}
            </LabeledCheckbox>
          </div>
        </template>
      </template>
      <template v-else>
        <select v-model="selectedSingleValue">
          <template v-for="item of selectionItems" :key="item" >
            <option :value="item">
              {{ escapedItemCaption(item) }}
            </option>
          </template>
        </select>
      </template>
    </div>
    <div class="w10"></div>
  </div>
</template>
