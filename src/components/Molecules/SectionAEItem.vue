<template>
  <el-tooltip placement="top-start" :show-after="500" :hide-after="0">
    <template v-slot:content>
      <DescriptionOfAE :item="props.item"/>
    </template>

    <div class="section-item" tabindex="0" @keydown.delete="removeItem">
      <span class="w20">{{ item.Category }}</span>
      <span class="w50 AE-detail-label">
        {{ label }}
      </span>
      <span class="w20">( Grade : {{item.Grade}} )</span>
      <el-icon class="edit-button" @click="editItem"><Edit /></el-icon>
      <el-icon class="remove-button" @click="removeItem"><Delete /></el-icon>
    </div>
  </el-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DescriptionOfAE from '@/components/Molecules/DescriptionOfAE.vue'
import { Edit, Delete } from '@element-plus/icons-vue'

type AEItem = {
  Category?: string
  Grade?: string | number
  BloodCount?: string | number
  Title?: string[]
  Cause?: string[]
}

const props = defineProps({
  item: {
    type: String,
    required: true
  }
})
const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'remove'): void
}>()

const item = computed<AEItem>(() => {
  try {
    return JSON.parse(props.item) as AEItem
  } catch {
    return {}
  }
})

const label = computed(() => {
  if (item.value.Category === '出血') {
    if (item.value.BloodCount === '不明') {
      return '(血量不明)'
    } else {
      return ' ' + item.value.BloodCount + 'ml'
    }
  } else {
    const labelSource: string[] = []
    if (item.value.Title) {
      labelSource.push(...item.value.Title)
    } else if (item.value.Cause) {
      labelSource.push(...item.value.Cause)
    } else {
      return ' '
    }

    return labelSource.join(', ')
  }
})

const editItem = () => emit('edit')

const removeItem = () => emit('remove')
</script>

<style lang="sass">
SPAN.AE-detail-label
  display: inline-block
  white-space: nowrap
  overflow-x: hidden
  text-overflow: ellipsis
</style>
