<script setup>
import SectionBlock from '@/components/Molecules/SectionBlock.vue'

const items = defineModel({ type: Array, required: true })
const emit = defineEmits(['addnewitem', 'edititem', 'removeitem'])

const AddNewItem = () => emit('addnewitem')

const EditItem = (value) => emit('edititem', value)

const RemoveItem = (index) => emit('removeitem', index)
</script>

<template>
  <SectionBlock title="手術診断"
    v-model="items"
    @addnewitem="AddNewItem"
    @edititem="EditItem"
    @removeitem="RemoveItem">
  </SectionBlock>
</template>
