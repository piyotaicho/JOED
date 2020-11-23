<template>
  <Section title="手術診断"
    :container.sync="items"
    @addnewitem="AddNewItem"
    @edititem="EditItem"
    @removeitem="RemoveItem">
  </Section>
</template>

<script>
import Section from '@/components/Molecules/Section'

export default {
  name: 'SectionDiagnoses',
  components: { Section },
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
