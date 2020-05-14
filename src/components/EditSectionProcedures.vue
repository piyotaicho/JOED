<template>
  <div>
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
  </div>
</template>

<script>
import EditSectionMixins from '@/mixins/EditSectionMixins'

export default {
  name: 'EditSectionProcedures',
  mixins: [EditSectionMixins],
  computed: {
    isDup () {
      // Ditto/AdditionalProcedureを含む重複確認
      const procedures = []
      for (const item of this.container) {
        procedures.push(item.Text)

        if (item.AdditionalProcedure) {
          procedures.push(item.AdditionalProcedure.Text)
        }
        if (item.Ditto) {
          procedures.push(item.Ditto)
        }
      }

      return procedures
        .flat()
        .filter((item, index, self) => self.indexOf(item) !== self.lastIndexOf(item))
        .length > 0
    }
  },
  methods: {
    Validate () {
      this.$emit('validate', this.container.length > 0 && this.isDup === false)
    }
  }
}
</script>
