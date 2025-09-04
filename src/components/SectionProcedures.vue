<script setup>
import { computed } from 'vue'
import SectionBlock from '@/components/Molecules/SectionBlock.vue'
import SectionItem from '@/components/SectionItem.vue'
import { confirmYesNo } from '@/modules/Popups'

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

const addNewItem = () => emit('addnewitem')

const editItem = (index, item) => emit('edititem', { ItemIndex: index, ItemValue: item })

const removeItem = (index) => emit('removeitem', index)

const removeAdditionalItemEntry = async (index) => {
  if (await confirmYesNo('付随する手術も併せて削除されます.')) {
    removeItem(index)
  }
}

const hasAdditionalProcedure = (item) => item.toString().includes(',"AdditionalProcedure":{')
const additionalProcedure = (item) => JSON.stringify((JSON.parse(item || '')?.AdditionalProcedure) || '')
</script>

<template>
  <SectionBlock title="実施手術"
    v-model="items"
    @addnewitem="addNewItem">
    <template #default="slotprops">
      <template v-if="hasAdditionalProcedure(slotprops.item)">
        <SectionItem :item="slotprops.item" @remove="removeAdditionalItemEntry(slotprops.index)" @edit="editItem(slotprops.index, slotprops.item)" editable/>
        <SectionItem :item="additionalProcedure(slotprops.item)" @remove="removeAdditionalItemEntry(slotprops.index)"/>
      </template>
      <template v-else>
        <SectionItem :item="slotprops.item" @remove="removeItem(slotprops.index)" @edit="editItem(slotprops.index, slotprops.item)" editable/>
      </template>
    </template>
  </SectionBlock>
</template>
