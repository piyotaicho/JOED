<template>
  <div class="section">
    <span class="section-title">手術診断 ： </span>
    <draggable handle=".handle" v-model="ItemContainer">
      <div class="list-item"
        v-for="(item, index) in ItemContainer"
        :key="index">
        <ItemOfSection :item="item" @click="RemoveItem(index)" />
      </div>
    </draggable>
    <span class="new-entry-button" @click="AddNewItem()"></span>
  </div>
</template>

<script>
import EditSectionMixins from '@/mixins/EditSectionMixins'

export default {
  name: 'EditSectionDiagnoses',
  mixins: [EditSectionMixins]
}
</script>
