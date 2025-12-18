<template>
  <template v-if="title !== ''">
    <div style="display: inline-block;" v-show="requirment !== 'none'">
      <template v-if="noitems">
        <el-button :type="requirment === 'optional' ? 'warning' : 'danger'" size="small" round @click="edit">{{ title }}</el-button>
      </template>
      <template v-else>
        <template v-for="category in dataCategories" :key="category">
          <el-button-group style="margin-right: 0.8rem;">
            <template v-for="item in props.value[category]" :key="item">
              <el-button :color="getColorCode(category)" size="small" round @click="edit">{{ valueToLabel(item, category) }}</el-button>
            </template>
          </el-button-group>
        </template>
      </template>
    </div>
  </template>
</template>

<script setup>
import { computed, watch } from 'vue'
import ApproachMaster from '@/modules/Masters/ApproachMaster'

const props = defineProps({
  value: {
    type: Object,
    default: () => ({})
  },
  year: {
    type: String,
    default: ''
  },
  procedureCategories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['click'])

const master = computed(() => {
  return new ApproachMaster(props.year)
})

const requirment = computed(() => {
  return master.value.getRequirement(props.procedureCategories || [])
})

const noitems = computed(() => {
  const items = Object.keys(props.value || {}).map(category => (props.value[category] || [])).flat().filter(item => item)
  return items.length === 0
})

const title = computed(() => {
  return master.value.getTitle()
})

const dataCategories = computed(() => {
  return master.value.getCategories(Object.keys(props.value || {}))
})

const getColorCode = computed(() => category => master.value.getColorCode(category))

const valueToLabel = computed(() => (value, category) => {
  return master.value.valueToLabel(value, category)
})

const edit = () => {
  emit('click')
}
</script>
