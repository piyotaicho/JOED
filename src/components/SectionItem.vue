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
    <!-- Vue 2: Element UI icons -->
    <i class="handle el-icon-d-caret" v-if="props.draggable"/>
    <slot :item="item">
      <span>{{title}}</span>
      <span v-if="description !== ''">
        ( {{description}} )
      </span>
    </slot>
    <i class="edit-button el-icon-edit" @click="editItem" v-if="props.editable"/>
    <i class="remove-button el-icon-delete" @click="removeItem"/>

    <!-- Vue 3: Element Plus icons (移行後)
    <el-icon class="handle" v-if="props.draggable"><DCaret /></el-icon>
    <slot :item="item">
      <span>{{title}}</span>
      <span v-if="description !== ''">
        ( {{description}} )
      </span>
    </slot>
    <el-icon class="edit-button" @click="editItem" v-if="props.editable"><Edit /></el-icon>
    <el-icon class="remove-button" @click="removeItem"><Delete /></el-icon>
    -->
  </div>
</template>
