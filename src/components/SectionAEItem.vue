<template>
  <el-tooltip placement="top-start" :open-delay="700">
    <template v-slot:content>
      <DescriptionOfAE :item="props.item"/>
    </template>

    <div class="section-item" tabindex="0" @keydown.delete="removeItem">
      <span class="w20">{{ item.Category }}</span>
      <span class="w30">
        {{ label }}
      </span>
      <span class="w20">( Grade : {{item.Grade}} )</span>
      <el-icon class="edit-button" @click="editItem" v-if="props.editable"><Edit /></el-icon>
      <el-icon class="remove-button" @click="removeItem"><Delete /></el-icon>
    </div>
  </el-tooltip>
</template>

<script setup>
import { computed } from 'vue'
import DescriptionOfAE from '@/components/Molecules/DescriptionOfAE'
import { Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  item: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['edit', 'remove'])

const item = computed(() => JSON.parse(props.item))

const label = computed(() => {
  if (item.value.Category === '出血') {
    if (item.value.BloodCount === '不明') {
      return '出血量不明'
    } else {
      return item.value.BloodCount + 'ml'
    }
  } else {
    const labelSource = []
    let labelString = ''
    if (item.value.Title) {
      labelSource.push(...item.value.Title)
    } else if (item.value.Cause) {
      labelSource.push(...item.value.Cause)
    } else {
      return ' '
    }

    labelString = labelSource.join(', ')
    while (labelString.length > 40) {
      if (labelSource.length > 2) {
        labelSource.splice(-2, 1)
        labelString = labelSource.slice(0, -1).join(', ') + ', ..., ' + labelSource.slice(-1)
      } else {
        labelString = labelSource[0]
        break
      }
    }
    return ' … ' + labelString
  }
})

const editItem = () => emit('edit')

const removeItem = () => emit('remove')
</script>
