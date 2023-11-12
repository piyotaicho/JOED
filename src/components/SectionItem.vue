<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import CaseDocumentHandler from '@/modules/DbItemHandler'

const props = defineProps({
  item: {
    type: Object,
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

const title = computed(() => CaseDocumentHandler.ItemValue(props.item))
const description = computed(() => {
  if (props.item?.Description) {
    return (Array.isArray(props.item.Description) && props.item.Description.length > 1)
      ? props.item.Description.map(item => item.replace(/[[\]]/g, '')).join(', ')
      : props.item.Description[0].replace(/[[\]]/g, '')
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
    <slot :item="props.item">
      <span>{{title}}</span>
      <span v-if="description !== ''">
        ( {{description}} )
      </span>
    </slot>
    <i class="edit-button el-icon-edit" @click="editItem" v-if="props.editable"/>
    <i class="remove-button el-icon-delete" @click="removeItem"/>
  </div>
</template>
