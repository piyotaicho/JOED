<script setup>
import { computed } from 'vue'
import SectionBlock from '@/components/Molecules/SectionBlock'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'
import SectionAEItem from '@/components/SectionAEItem'

const props = defineProps({
  container: {
    type: Array,
    required: true
  },
  optionValue: {
    type: Boolean,
    required: false,
    default: false
  }
})

const emit = defineEmits(['update:optionValue', 'addnewitem', 'edititem', 'removeitem'])

const items = computed(() => props.container)

const option = computed({
  get: () => props.optionValue,
  set: (value) => emit('update:optionValue', value)
})

const addNewItem = () => emit('addnewitem')
const editItem = (index, item) => emit('edititem', {
  ItemIndex: index,
  ItemValue: item
})
const removeItem = (index) => emit('removeitem', index)
</script>

<template>
  <SectionBlock title="合併症"
    :draggable="false"
    :container="items"
    @addnewitem='addNewItem()'>
    <template #beforeitemlist>
      <LabeledCheckbox :container.sync="option" id="noAEcheckbox">合併症なし</LabeledCheckbox>
      <div class="section-item-list" style="display: none;"><div class="item-description"></div></div>
    </template>
    <template #default="itemprops">
      <SectionAEItem :item="itemprops.item" @edit="editItem(itemprops.index, itemprops.item)" @remove="removeItem(itemprops.index)" />
    </template>
  </SectionBlock>
</template>
