<template>
  <label class="LabeledCheckbox"
    :disabled="disabled"
    :tabindex="tabindex"
    @keydown.enter="Click"
    @keydown.space.prevent="Click">
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
  padding: 0.08rem
  padding-right: 0.7rem
  margin-left: 0.3rem
  white-space: nowrap

input.LabeledCheckbox[type="checkbox"]
  display: none
  & + span
    padding-left: 1.9rem
    position: relative
  & + span::before
    position: absolute
    display: block
    border: 1px solid var(--border-color-base)
    border-radius: 0.15rem
    content: ''
    top: 0.13rem
    left: 0.4rem
    height: 0.8rem
    width: 0.8rem
  &:focus + span
    outline: none
  &:focus + span::before
    outline: 1px dashed var(--border-color-base)
  &:checked + span::before
    border-color: var(--border-color-base)
    background: var(--border-color-base)
  &:checked + span::after
    position: absolute
    display: block
    border-bottom: 2px solid var(--background-color-dialog)
    border-left: 2px solid var(--background-color-dialog)
    content: ''
    top: 0.42rem
    left: 0.69rem
    height: 0.3rem
    width: 0.5rem
    -webkit-transform: rotate(-45deg)
    transform: rotate(-45deg) translateY(-50%)
</style>
