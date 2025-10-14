<script setup>
import SectionBlock from '@/components/Molecules/SectionBlock.vue'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox.vue'
import SectionAEItem from '@/components/SectionAEItem.vue'

const emit = defineEmits(['additem', 'edititem', 'removeitem'])
const items = defineModel({
  type: Array,
  required: true
})
const option = defineModel('optionValue', {
  type: Boolean,
  required: false,
  default: false
})

const addItem = () => emit('additem')
const editItem = (index, value) => emit('edititem', {index, value})
const removeItem = (index) => emit('removeitem', index)
</script>

<template>
  <SectionBlock title="合併症"
    v-model="items"
    :draggable="false"
    @add='addItem()'>
    <template #beforeitemlist>
      <LabeledCheckbox v-model="option" id="noAEcheckbox">合併症なし</LabeledCheckbox>
      <div class="section-item-list" style="display: none;"><div class="item-description"></div></div>
    </template>
    <template #default="itemprops">
      <SectionAEItem :item="itemprops.item" @edit="editItem(itemprops.index, itemprops.item)" @remove="removeItem(itemprops.index)" />
    </template>
  </SectionBlock>
</template>
