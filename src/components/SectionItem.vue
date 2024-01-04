<script setup>
import { computed } from 'vue'
import CaseDocumentHandler from '@/modules/DbItemHandler'

const props = defineProps({
  item: {
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

const item = computed(() => JSON.parse(props.item || '""'))
const title = computed(() => CaseDocumentHandler.ItemValue(item.value))
const description = computed(() => {
  if (item.value?.Description) {
    return (Array.isArray(item.value.Description) && item.value.Description.length > 1)
      ? item.value.Description.map(item => item.replace(/[[\]]/g, '')).join(', ')
      : item.value.Description[0].replace(/[[\]]/g, '')
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
    <i class="handle el-icon-d-caret" v-if="props.draggable"/>
    <slot :item="item">
      <span>{{title}}</span>
      <span v-if="description !== ''">
        ( {{description}} )
      </span>
    </slot>
    <i class="edit-button el-icon-edit" @click="editItem" v-if="props.editable"/>
    <i class="remove-button el-icon-delete" @click="removeItem"/>
  </div>
</template>
