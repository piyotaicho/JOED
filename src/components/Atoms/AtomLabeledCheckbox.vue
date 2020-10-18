<template>
  <label :disabled="disabled">
    <input type="checkbox" v-if="value !== undefined" v-model="CheckboxValue" :disabled="disabled" :value="value">
    <input type="checkbox" v-else v-model="CheckboxValue" :disabled="disabled">
      <slot></slot>
  </label>
</template>

<script>
export default {
  Name: 'LabeledCheckbox',
  model: {
    prop: 'container',
    event: 'changed'
  },
  props: {
    container: {},
    value: {
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    CheckboxValue: {
      get () {
        return this.container
      },
      set (value) {
        this.$emit('changed', value)
      }
    }
  }
}
</script>
