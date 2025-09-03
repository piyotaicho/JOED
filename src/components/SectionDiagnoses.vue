<script setup>
import { computed } from 'vue'
import SectionBlock from '@/components/Molecules/SectionBlock'

const props = defineProps({
  container: {
    type: Array,
    required: true
  }
})
const emit = defineEmits(['addnewitem', 'edititem', 'removeitem', 'update:container'])

const items = computed({
  get: () => props.container,
  set: (value) => emit('update:container', value)
})

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
