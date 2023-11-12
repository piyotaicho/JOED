<script>
import SectionBlock from '@/components/Molecules/SectionBlock'

export default {
  name: 'SectionDiagnoses',
  components: { SectionBlock },
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
    EditItem (value) {
      this.$emit('edititem', value)
    },
    RemoveItem (index) {
      this.$emit('removeitem', index)
    }
  }
}
</script>

<template>
  <SectionBlock title="手術診断"
    :container.sync="items"
    @addnewitem="AddNewItem"
    @edititem="EditItem"
    @removeitem="RemoveItem">
  </SectionBlock>
</template>
