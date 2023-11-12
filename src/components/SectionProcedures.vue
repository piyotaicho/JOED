<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import SectionBlock from '@/components/Molecules/SectionBlock'
import SectionItem from '@/components/SectionItem'
import { confirmYesNo } from '@/modules/Popups'

const props = defineProps({
  container: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:container', 'addnewitem', 'edititem', 'removeitem'])

const items = computed({
  get: () => props.container,
  set: (value) => emit('update:container', value)
})

function addNewItem () {
  emit('addnewitem')
}

function editItem (index, item) {
  emit('edititem', {
    ItemIndex: index,
    ItemValue: item
  })
}

function removeItem (index) {
  emit('removeitem', index)
}

async function removeAdditionalItemEntry (index) {
  if (await confirmYesNo('付随する手術も併せて削除されます.')) {
    this.RemoveItem(index)
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
