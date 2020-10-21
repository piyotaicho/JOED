<template>
  <label :disabled="disabled" ref="labelContent">
    <template v-if="value !== undefined">
      <input type="checkbox" v-model="CheckboxValue" :disabled="disabled" :value="value">
    </template>
      <slot>{{typeof(value)==='boolean'?'':value}}</slot>
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
      default: true
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
