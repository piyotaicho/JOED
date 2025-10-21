<script setup>
import SectionBlock from '@/components/Molecules/SectionBlock.vue'
import SectionItem from '@/components/Molecules/SectionItem.vue'
import ApproachItems from './Molecules/ApproachItems.vue'
import { confirmYesNo } from '@/modules/Popups'

const props = defineProps({
  approach: {
    type: Object,
    default: () => ({})
  },
  year: {
    type: String,
    default: ''
  }
})

const items = defineModel({ type: Array, required: true })

const emit = defineEmits(['additem', 'edititem', 'removeitem', 'editapproach'])

const addItem = () => emit('additem')

const editItem = (index, value) => emit('edititem', { index, value })

const removeItem = (index) => emit('removeitem', index)

const editApproach = () => emit('editapproach')

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
    @add="addItem">
    <template #beforeitemlist>
      <ApproachItems :value="props.approach" :year="props.year" @click="editApproach()"/>
    </template>
    <template #default="slotprops">
      <template v-if="!hasAdditionalProcedure(slotprops.item)">
        <SectionItem :value="slotprops.item" @remove="removeItem(slotprops.index)" @edit="editItem(slotprops.index, slotprops.item)" editable/>
      </template>
      <template v-else>
        <SectionItem :value="slotprops.item" @remove="removeAdditionalItemEntry(slotprops.index)" @edit="editItem(slotprops.index, slotprops.item)" editable/>
        <SectionItem :value="additionalProcedure(slotprops.item)" @remove="removeAdditionalItemEntry(slotprops.index)"/>
      </template>
    </template>
  </SectionBlock>
</template>
