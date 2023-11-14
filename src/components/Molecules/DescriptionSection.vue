<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'

const props = defineProps({
  container: {
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

const emit = defineEmits(['update:container'])

const selectionItems = computed(() => props.container?.Options || [])

const isMultipleSelection = computed(() =>
  props.container?.SelectionMode === 'any' ||
  props.container?.SelectionMode === 'anyornone'
)

const selectedArrayValue = computed({
  get: () => props.container?.Value ? props.container.Value : [],
  set: (value) => emitValue(value)
})

const selectedSingleValue = computed({
  get: () => {
    if (!props.container?.Value || props.container.Value.length === 0) {
      return undefined
    } else {
      if (props.container.Value.length > 1) {
        emitValue(props.container.Value[0])
      }
      return props.container.Value[0]
    }
  },
  set: (value) => emitValue(value)
})

const escapedItemCaption = (str) => str.replace(/\[.+\]/g, '').replace(/\$$/, '')

const emitValue = (value) => {
  const newvalue = []
  if (value === undefined || typeof value === 'string') {
    // SELECTから
    if (value && props.container.Options.indexOf(value) !== -1) {
      newvalue.push(value)
    }
  }
  if (Array.isArray(value)) {
    // CHECKBOXから
    // Optionsからvalueに該当するものをピックアップ > Optionsの順番を維持して保持
    const filtedvalue = props.container.Options.filter(
      (option) => value.indexOf(option) !== -1
    )
    if (filtedvalue.length > 0 || newvalue.SelectionMode === 'anyornone') {
      newvalue.push(...filtedvalue)
    }
  }

  const newcontainer = Object.assign(props.container, { Value: newvalue })
  emit('update:container', newcontainer)
}
</script>

<template>
  <div class="flex-content">
    <div class="w30"></div>
    <div class="w20 selectionbox">
      <div>
        <span>{{ props.container.Title }}</span>
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
