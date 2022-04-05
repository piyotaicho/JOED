<template>
  <div class="closebutton" @keypress.enter="Click" @click="Click" :tabindex="this.tabindex"></div>
</template>

<script>
export default {
  name: 'CloseButton',
  props: {
    tabindex: {
      type: [Number, String]
    }
  },
  methods: {
    Click () {
      this.$emit('click')
    }
  }
}
</script>
<style lang="sass">
div.closebutton
  position: absolute
  right: 1rem
  top: 1rem
  width: 1rem
  height: 1rem
  &::after
    position: absolute
    margin: auto
    color: grey
    font-family: 'element-icons' !important
    font-size: 1.2rem
    content: '\e6db'
  &:hover::after
    font-weight: bold
</style>
