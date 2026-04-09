<script setup lang="ts">
import SectionBlock from '@/components/Molecules/SectionBlock.vue'

const items = defineModel<string[]>({
  required: true,
  default: () => [],
})
const emit = defineEmits<{
  (e: 'additem'): void
  (e: 'edititem', payload: { index: number; value: string }): void
  (e: 'removeitem', index: number): void
}>()

const AddNewItem = (): void => emit('additem')

const EditItem = ({ index, value }: { index: number; value: string }): void => emit('edititem', { index, value })

const RemoveItem = (index: number): void => emit('removeitem', index)
</script>

<template>
  <SectionBlock title="手術診断"
    v-model="items"
    @add="AddNewItem"
    @edit="({ index, value }) => EditItem({ index, value: String(value ?? '') })"
    @remove="RemoveItem">
  </SectionBlock>
</template>
