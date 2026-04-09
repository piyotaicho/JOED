<template>
  <template v-if="title !== ''">
    <div style="display: inline-block;" v-show="requirment !== 'none'">
      <template v-if="noitems">
        <el-button :type="requirment === 'optional' ? 'warning' : 'danger'" size="small" round @click="edit">{{ title }}</el-button>
      </template>
      <template v-else>
        <template v-for="category in dataCategories" :key="category">
          <el-button-group style="margin-right: 0.8rem;">
            <template v-for="item in itemsByCategory(category)" :key="item">
              <el-button :color="getColorCode(category)" size="small" round @click="edit">{{ valueToLabel(item, category) }}</el-button>
            </template>
          </el-button-group>
        </template>
      </template>
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import ApproachMaster from '@/modules/Masters/ApproachMaster'
import type { PropType } from 'vue'

const props = defineProps({
  value: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({})
  },
  year: {
    type: String,
    default: ''
  },
  procedureCategories: {
    type: Array as () => string[],
    default: () => []
  }
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const master = computed(() => {
  return new ApproachMaster(props.year)
})

const requirment = computed(() => {
  return (master.value as any).getRequirement(props.procedureCategories || [])
})

const noitems = computed(() => {
  const items = Object.keys(props.value || {}).map((category) => (props.value[category] || [])).flat().filter((item) => item)
  return items.length === 0
})

const title = computed(() => {
  return (master.value as any).getTitle()
})

const dataCategories = computed(() => {
  return (master.value as any).getCategories(Object.keys(props.value || {})) as string[]
})

const getColorCode = computed(() => (category: string) => (master.value as any).getColorCode(category))

const valueToLabel = computed(() => (value: string, category: string) => {
  return (master.value as any).valueToLabel(value, category)
})

const itemsByCategory = (category: string): string[] => {
  const items = props.value?.[category]
  return Array.isArray(items) ? items.map((item) => String(item)) : []
}

const edit = (): void => {
  emit('click')
}
</script>
