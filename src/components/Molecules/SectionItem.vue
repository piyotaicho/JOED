<script setup>
import { computed } from 'vue'
import CaseDocumentHandler from '@/modules/DbItemHandler'
import { Edit, Delete, DCaret } from '@element-plus/icons-vue'

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  draggable: {
    type: Boolean,
    default: true
  },
  editable: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['remove', 'edit'])

const value = computed(() => JSON.parse(props.value || '""'))

const title = computed(() => CaseDocumentHandler.ItemValue(value.value))
const description = computed(() => {
  if (value.value?.Description) {
    return (Array.isArray(value.value.Description) && value.value.Description.length > 1)
      ? value.value.Description.map(item => item.replace(/[[\]]/g, '')).join(', ')
      : value.value.Description[0].replace(/[[\]]/g, '')
  }
  return ''
})

function removeItem () {
  emit('remove')
}

function editItem () {
  if (props.editable || false) {
    emit('edit')
  }
}
</script>

<template>
  <div class="section-item" tabindex="0" @keydown.delete="removeItem" @keydown.enter="editItem">
    <el-icon class="handle" v-if="props.draggable"><DCaret /></el-icon>
    <slot :item="value">
      <span>{{title}}</span>
      <span v-if="description !== ''">
        ( {{description}} )
      </span>
    </slot>
    <el-icon class="edit-button" @click="editItem" v-if="props.editable"><Edit /></el-icon>
    <el-icon class="remove-button" @click="removeItem"><Delete /></el-icon>
  </div>
</template>
