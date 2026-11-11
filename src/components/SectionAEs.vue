<script setup lang="ts">
import SectionBlock from '@/components/Molecules/SectionBlock.vue'
import SectionAEItem from '@/components/Molecules/SectionAEItem.vue'

const emit = defineEmits<{
  (e: 'additem'): void
  (e: 'edititem', payload: { index: number; value: string }): void
  (e: 'removeitem', index: number): void
}>()
const items = defineModel<string[]>({
  required: true,
  default: () => [],
})

const addItem = (): void => emit('additem')
const editItem = (index: number, value: string): void => emit('edititem', { index, value })
const removeItem = (index: number): void => emit('removeitem', index)
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
      <SectionAEItem :item="String(itemprops.item ?? '')" @edit="editItem(itemprops.index, String(itemprops.item ?? ''))" @remove="removeItem(itemprops.index)" />
    </template>
  </SectionBlock>
</template>
