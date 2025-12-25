<script setup>
import SectionBlock from '@/components/Molecules/SectionBlock.vue'

const items = defineModel({ type: Array, required: true })
const emit = defineEmits(['additem', 'edititem', 'removeitem'])

const AddNewItem = () => emit('additem')

const EditItem = ({index, value}) => emit('edititem', { index, value })

const RemoveItem = (index) => emit('removeitem', index)
</script>

<template>
  <SectionBlock title="手術診断"
    v-model="items"
    @add="AddNewItem"
    @edit="EditItem"
    @remove="RemoveItem">
  </SectionBlock>
</template>
