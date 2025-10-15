<script setup>
import SectionBlock from '@/components/Molecules/SectionBlock.vue'
import SectionItem from '@/components/SectionItem.vue'
import { confirmYesNo } from '@/modules/Popups'

const items = defineModel({ type: Array, required: true })
const emit = defineEmits(['additem', 'edititem', 'removeitem'])

const addItem = () => emit('additem')

const editItem = (index, value) => emit('edititem', { index, value })

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
    @add="addItem">
    <template #beforeitemlist>
      <!-- カテゴリkeyごとにgroup化する ボタンイベントは全て編集 -->
      <el-button-group style="margin-right: 0.8rem;">
        <el-button type="primary" size="small" round>通常ポート配置</el-button>
      </el-button-group>
      <el-button-group style="margin-right: 0.8rem;">
        <el-button type="primary" size="small" round>通常ポート配置</el-button>
      </el-button-group>
      <el-button-group style="margin-right: 0.8rem;">
        <el-button type="primary" size="small" round>細径子宮鏡</el-button>
        <el-button type="primary" size="small" round>非電解質溶液使用</el-button>
      </el-button-group>
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
