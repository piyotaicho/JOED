<template>
  <Section title="実施手術"
    :container.sync="items"
    @addnewitem="AddNewItem">
    <template #default="itemprops">
      <SectionItem :item="itemprops.item" @remove="RemoveItem(itemprops.index)" @edit="EditItem(itemprops.index, itemprops.item)" editable/>
      <SectionItem :item="itemprops.item.AdditionalProcedure" @click="RemoveItem(itemprops.index)" v-if="itemprops.item.AdditionalProcedure"/>
    </template>
  </Section>
</template>

<script>
import Section from '@/components/Molecules/Section'
import SectionItem from '@/components/SectionItem'

export default {
  name: 'SectionProcedures',
  components: { Section, SectionItem },
  props: {
    container: {
      type: Array,
      required: true
    }
  },
  computed: {
    items: {
      get () {
        return this.container
      },
      set (value) {
        this.$emit('update:container', value)
      }
    }
  },
  methods: {
    AddNewItem () {
      this.$emit('addnewitem')
    },
    EditItem (index, item) {
      this.$emit('edititem', {
        ItemIndex: index,
        ItemValue: item
      })
    },
    RemoveItem (index) {
      this.$emit('removeitem', index)
    }
  }
}
</script>
