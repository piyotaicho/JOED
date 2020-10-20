<template>
  <label :disabled="disabled" ref="labelContent">
    <template v-if="value !== undefined">
      <input type="checkbox" v-model="CheckboxValue" :disabled="disabled" :value="value">
    </template>
    <template v-else>
      <input type="checkbox" v-model="CheckboxValue" :disabled="disabled" :value="LabelValue()">
    </template>
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
  mounted () {
    this.$nextTick(_ => this.$refs.labelContent)
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
  },
  methods: {
    LabelValue () {
      return this.$refs.labelContent && this.$refs.labelContent.textContent.trim()
    }
  }
}
</script>
