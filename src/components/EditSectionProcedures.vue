<template>
  <div class="section">
    <span class="section-title">実施手術 ： </span>
    <draggable handle=".handle" v-model="ItemContainer">
      <div class="list-item"
        v-for="(item, index) in ItemContainer"
        :key="index">
        <ItemOfSection :item="item" @click="RemoveItem(index)" />
        <ItemOfSection v-if="item.AdditionalProcedure" :item="item.AdditionalProcedure" @click="RemoveItem(index)" />
      </div>
    </draggable>
    <span class="new-entry-button" @click="AddNewItem()"></span>
  </div>
</template>

<script>
import EditSectionMixins from '@/mixins/EditSectionMixins'

export default {
  name: 'EditSectionProcedures',
  mixins: [EditSectionMixins],
  methods: {
    Validate () {
      this.$emit('validate', this.container.length > 0)
    }
  }
}
</script>
