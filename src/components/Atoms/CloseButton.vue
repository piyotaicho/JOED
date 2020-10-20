<template>
    <div class="closebutton" @click="Close">&#xe6db;</div>
</template>

<script>
export default {
  name: 'CloseButton',
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
