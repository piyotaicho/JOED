<template>
    <div class="new-entry-button"
      :tabindex="tabindex"
      @click="Click"
      @keydown.enter="Click"
      @keydown.space="Click"
      :accesskey="accesskey">
    </div>
</template>

<script>
export default {
  name: 'NewEntryButton',
  props: {
    tabindex: {
      type: [String, Number],
      default: 0
    },
    accesskey: {
      type: String
    }
  },
  methods: {
    Click (event) {
      this.$emit('click', event)
    }
  }
}
</script>

<style lang="sass">
div.new-entry-button
  position: absolute
  right: 5px
  bottom: 5px
  width: 30px
  height: 30px
  border: 2px solid var(--color-primary)
  padding: 1px
  border-radius: 5px
  background: var(--background-color-list)
  &::after
    content: '\e6d9'
    font-family: 'element-icons'
    color: var(--color-primary)
    font-size: 25px
    padding-top: 6px
    padding-left: 3px
  &:hover
    border-color: var(--color-text-regular)
    &::after
      color: var(--color-text-regular)
  &:focus
    outline: none
    border: 3px solid var(--color-primary)
    padding: 0px
</style>
