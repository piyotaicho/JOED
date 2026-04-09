<script setup lang="ts">
import EditAESelectValue from './EditAESelectValue.vue'
import type { PropType } from 'vue'

type CheckValue = boolean | string | number
type AESelectionItem = string | { Label?: string; Text?: string; Value?: CheckValue }
type AESelectionLine = AESelectionItem[]

const props = defineProps({
  items: {
    type: Array as PropType<AESelectionItem[][]>,
    required: true
  }
})

const modelValue = defineModel<CheckValue | CheckValue[] | undefined>()

const firstLabel = (linearray: AESelectionLine): string => {
  if (linearray.length !== 1) {
    return ''
  }
  const firstItem = linearray[0]
  if (typeof firstItem === 'object' && firstItem) {
    return firstItem.Label || ''
  }
  return ''
}
</script>

<template>
  <div>
    <template v-for="(linearray, lineindex) in props.items" :key="lineindex">
      <template v-if="firstLabel(linearray)">
        <div style="margin: 0.3rem 0;">
          <span>{{ firstLabel(linearray) }}</span>
        </div>
      </template>
      <template v-else>
        <div>
          <template v-for="(item, itemindex) in linearray" :key="itemindex">
            <EditAESelectValue
              :item="item"
              v-model="modelValue"
            />
          </template>
        </div>
      </template>
    </template>
  </div>
</template>
