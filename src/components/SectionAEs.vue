<script setup>
import SectionBlock from '@/components/Molecules/SectionBlock.vue'
import SectionAEItem from '@/components/Molecules/SectionAEItem.vue'

const emit = defineEmits(['additem', 'edititem', 'removeitem'])
const items = defineModel({
  type: Array,
  required: true
})

const addItem = () => emit('additem')
const editItem = (index, value) => emit('edititem', {index, value})
const removeItem = (index) => emit('removeitem', index)
</script>

<template>
  <SectionBlock title="合併症"
    v-model="items"
    :draggable="false"
    @add='addItem()'>
    <template #beforeitemlist>
      <slot></slot>
    </template>
    <template #default="itemprops">
      <SectionAEItem :item="itemprops.item" @edit="editItem(itemprops.index, itemprops.item)" @remove="removeItem(itemprops.index)" />
    </template>
  </SectionBlock>
</template>
