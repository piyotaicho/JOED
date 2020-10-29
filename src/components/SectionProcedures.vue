<template>
  <div>
    <div class="section">
      <span class="section-title">実施手術 ： </span>
      <draggable handle=".handle" v-model="ItemContainer">
        <div class="section-item-list"
          v-for="(item, index) in ItemContainer"
          :key="index">
          <SectionItem :item="item" @remove="RemoveItem(index)" @edit="EditItem(index, item)"/>
          <SectionItem :item="item.AdditionalProcedure" @click="RemoveItem(index)" v-if="item.AdditionalProcedure"/>
        </div>
      </draggable>
      <NewEntryButton @click="AddNewItem()" tabindex="0" />
    </div>
  </div>
</template>

<script>
import EditSectionMixins from '@/mixins/EditSectionMixins'

export default {
  name: 'SectionProcedures',
  mixins: [EditSectionMixins]
}
</script>
