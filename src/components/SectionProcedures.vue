<script setup>
import { computed } from 'vue'
import SectionBlock from '@/components/Molecules/SectionBlock'
import SectionItem from '@/components/SectionItem'
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
</script>

<template>
  <SectionBlock title="実施手術"
    :container.sync="items"
    @addnewitem="addNewItem">
    <template #default="itemprops">
      <template v-if="!itemprops.item.AdditionalProcedure">
        <SectionItem :item="itemprops.item" @remove="removeItem(itemprops.index)" @edit="editItem(itemprops.index, itemprops.item)" editable/>
      </template>
      <template v-else>
        <SectionItem :item="itemprops.item" @remove="removeAdditionalItemEntry(itemprops.index)" @edit="editItem(itemprops.index, itemprops.item)" editable/>
        <SectionItem :item="itemprops.item.AdditionalProcedure" @remove="removeAdditionalItemEntry(itemprops.index)"/>
      </template>
    </template>
  </SectionBLock>
</template>
