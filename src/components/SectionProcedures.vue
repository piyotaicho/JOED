<script setup lang="ts">
import SectionBlock from '@/components/Molecules/SectionBlock.vue'
import SectionItem from '@/components/Molecules/SectionItem.vue'
import { confirmYesNo } from '@/modules/Popups'

const items = defineModel<string[]>({
  required: true,
  default: () => [],
})

const emit = defineEmits<{
  (e: 'additem'): void
  (e: 'edititem', payload: { index: number; value: string }): void
  (e: 'removeitem', index: number): void
}>()

const addItem = (): void => emit('additem')

const editItem = (index: number, value: string): void => emit('edititem', { index, value })

const removeItem = (index: number): void => emit('removeitem', index)

const removeAdditionalItemEntry = async (index: number): Promise<void> => {
  if (await confirmYesNo('付随する手術も併せて削除されます.')) {
    removeItem(index)
  }
}

const hasAdditionalProcedure = (item: unknown): boolean => String(item ?? '').includes(',"AdditionalProcedure":{')
const additionalProcedure = (item: unknown): string => {
  try {
    return JSON.stringify((JSON.parse(String(item || ''))?.AdditionalProcedure) || '')
  } catch {
    return ''
  }
}
</script>

<template>
  <SectionBlock title="実施手術"
    v-model="items"
    @add="addItem">
    <template #beforeitemlist>
      <slot></slot>
    </template>
    <template #default="slotprops">
      <template v-if="!hasAdditionalProcedure(slotprops.item)">
        <SectionItem :value="String(slotprops.item ?? '')" @remove="removeItem(slotprops.index)" @edit="editItem(slotprops.index, String(slotprops.item ?? ''))" editable/>
      </template>
      <template v-else>
        <SectionItem :value="String(slotprops.item ?? '')" @remove="removeAdditionalItemEntry(slotprops.index)" @edit="editItem(slotprops.index, String(slotprops.item ?? ''))" editable/>
        <SectionItem :value="additionalProcedure(slotprops.item)" @remove="removeAdditionalItemEntry(slotprops.index)"/>
      </template>
    </template>
  </SectionBlock>
</template>
