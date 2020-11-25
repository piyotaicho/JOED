<template>
  <label class="LabeledCheckbox"
    :disabled="disabled"
    :tabindex="tabindex"
    @keydown.enter.exact="Click"
    @keydown.space.exact.prevent="Click">
    <input type="checkbox" class="LabeledCheckbox"
      ref="input"
      v-model="CheckboxValue"
      :disabled="disabled"
      :value="value">
    <span>
      <slot>{{typeof(value)==='boolean'?'':value}}</slot>
    </span>
  </label>
</template>

<script>
export default {
  Name: 'LabeledCheckbox',
  model: {
    prop: 'container',
    event: 'change'
  },
  props: {
    container: {},
    value: {
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    tabindex: {
      type: [Number, String],
      default: 0
    }
  },
  computed: {
    CheckboxValue: {
      get () {
        return this.container
      },
      set (value) {
        this.$emit('change', value)
      }
    }
  },
  methods: {
    Click (event) {
      this.$refs.input.click()
    }
  }
}
</script>

<style lang="sass">
label.LabeledCheckbox
  padding: 0.1rem 0.7rem 0rem 0rem
  margin: 0 0 0 0.3rem
  white-space: nowrap

input.LabeledCheckbox[type="checkbox"]
  display: none
  outline: none
  & + span
    padding-left: 1.9rem
    position: relative
  & + span::before
    position: absolute
    display: block
    border: 1px solid var(--border-color-base)
    border-radius: 0.15rem
    content: ''
    top: 50%
    left: 0.4rem
    height: 0.8rem
    width: 0.8rem
    transform: translateY(-0.55rem)
  &:checked + span::before
    border-color: var(--color-primary)
    background: var(--color-primary)
  &:checked + span::after
    position: absolute
    display: block
    border-bottom: 2px solid var(--background-color-dialog)
    border-left: 2px solid var(--background-color-dialog)
    content: ''
    top: 50%
    left: 0.7rem
    height: 0.25rem
    width: 0.48rem
    transform: rotate(-50deg) translate(0.2rem, -0.4rem)
</style>
