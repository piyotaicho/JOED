<template>
    <div class="closebutton" @keypress.enter="Close" @click="Close" :tabindex="this.tabindex">&#xe6db;</div>
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
    Close () {
      this.$emit('close')
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
  font-family: 'element-icons'
  font-size: 1.2rem
  &:hover
    font-weight: bold
</style>
