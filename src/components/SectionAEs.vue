<script setup>
import { computed } from 'vue'
import SectionBlock from '@/components/Molecules/SectionBlock.vue'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox.vue'
import SectionAEItem from '@/components/SectionAEItem.vue'

const props = defineProps({
  modelValue: {
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

const items = computed(() => props.modelValue)

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
    v-model="items"
    :draggable="false"
    @addnewitem='addNewItem()'>
    <template #beforeitemlist>
      <LabeledCheckbox v-model="option" id="noAEcheckbox">合併症なし</LabeledCheckbox>
      <div class="section-item-list" style="display: none;"><div class="item-description"></div></div>
    </template>
    <template #default="itemprops">
      <SectionAEItem :item="itemprops.item" @edit="editItem(itemprops.index, itemprops.item)" @remove="removeItem(itemprops.index)" />
    </template>
  </SectionBlock>
</template>
