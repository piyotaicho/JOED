<template>
  <template v-if="title !== ''">
    <div style="display: inline-block;">
      <template v-if="noitems">
        <el-button type="warning" size="small" round @click="edit">{{ title }}</el-button>
      </template>
      <template v-else>
        <template v-for="category in categories" :key="category">
          <el-button-group style="margin-right: 0.8rem;">
            <template v-for="item in props.value[category]" :key="item">
              <el-button :color="getColorCode(category)" size="small" round @click="edit">{{ item }}</el-button>
            </template>
          </el-button-group>
        </template>
      </template>
    </div>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import ApproachMaster from '@/modules/Masters/ApproachMaster'

const props = defineProps({
  value: {
    type: Object,
    default: () => ({})
  },
  year: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const noitems = computed(() => {
  const items = Object.keys(props.value || {}).map(category => (props.value[category] || [])).flat()
  return items.length === 0
})

const title = computed(() => {
  const master = new ApproachMaster(props.year || '')
  return master.getTitle()
})

const categories = computed(() => {
  const master = new ApproachMaster(props.year || '')
  return master.getCategories(Object.keys(props.value || {}))
})

const getColorCode = (category) => {
  const master = new ApproachMaster(props.year || '')
  return master.getColorCode(category)
}

const edit = () => {
  emit('click')
}
</script>
