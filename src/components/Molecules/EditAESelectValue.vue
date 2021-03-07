<template>
  <labeled-checkbox v-model="checkboxvalue" :value="itemvalue">{{itemlabel}}</labeled-checkbox>
</template>

<script>
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'

export default {
  components: { LabeledCheckbox },
  props: {
    item: {
      type: [Object, String],
      required: true
    },
    value: {}
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  computed: {
    itemlabel () {
      if (typeof this.item === 'object') {
        return this.item.Text
      } else {
        return this.item
      }
    },
    itemvalue () {
      if (typeof this.item === 'object') {
        return this.item.Value
      } else {
        return this.item
      }
    },
    checkboxvalue: {
      get () {
        return this.value
      },
      set (newvalue) {
        this.$emit('change', newvalue)
      }
    }
  }
}
</script>
