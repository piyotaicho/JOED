<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'

const props = defineProps({
  Container: {
    type: Object,
    // {
    //   Title: string,
    //   SelectionMode: 'one'|'any'|anyornone' = 'one',
    //   Options: string[],
    //   Value: string[]
    // }
    required: true
  }
})

const emit = defineEmits(['update:Container'])

const selectionItems = computed(() => props.Container?.Options || [])

const isMultipleSelection = computed(() =>
  this.Container?.SelectionMode === 'any' ||
  this.Container?.SelectionMode === 'anyornone'
)

const selectedArrayValue = computed({
  get: () => props.Container?.Value ? this.Container.Value : [],
  set: (value) => emitValue(value)
})

const selectedSingleValue = computed({
  get: () => {
    if (!props.Container?.Value || props.Container.Value.length === 0) {
      return undefined
    } else {
      if (props.Container.Value.length > 1) {
        emitValue(props.Container.Value[0])
      }
      return props.Container.Value[0]
    }
  },
  set: (value) => emitValue(value)
})

const escapedItemCaption = (str) => str.replace(/\[.+\]/g, '').replace(/\$$/, '')

const emitValue = (value) => {
  const newvalue = []
  if (value === undefined || typeof value === 'string') {
    // SELECTから
    if (value && props.Container.Options.indexOf(value) !== -1) {
      newvalue.push(value)
    }
  }
  if (Array.isArray(value)) {
    // CHECKBOXから
    // Optionsからvalueに該当するものをピックアップ > Optionsの順番を維持して保持
    const filtedvalue = props.Container.Options.filter(
      (option) => value.indexOf(option) !== -1
    )
    if (filtedvalue.length > 0 || newvalue.SelectionMode === 'anyornone') {
      newvalue.push(...filtedvalue)
    }
  }

  const newContainer = Object.assign(props.Container, { Value: newvalue })
  emit('update:Container', newContainer)
}
</script>

<template>
  <div class="flex-content">
    <div class="w30"></div>
    <div class="w20 selectionbox">
      <div>
        <span>{{ props.Container.Title }}</span>
      </div>
    </div>
    <div class="w40 selectionbox">
      <template v-if="isMultipleSelection">
        <template v-for="item of selectionItems">
          <div :key="item">
            <LabeledCheckbox :container.sync="selectedArrayValue" :value="item" :key="item">
              {{ escapedItemCaption(item) }}
            </LabeledCheckbox>
          </div>
        </template>
      </template>
      <template v-else>
        <select v-model="selectedSingleValue">
          <option v-for="item of selectionItems" :key="item" :value="item">
            {{ escapedItemCaption(item) }}
          </option>
        </select>
      </template>
    </div>
    <div class="w10"></div>
  </div>
</template>
