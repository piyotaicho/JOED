<template>
  <div id="filter-overlay" @click="closeMenu">
    <div id="filter-menu">
      FILTER BOX<br/>
      <router-link :to="{name: 'list'}">[back]</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ViewListFilter',
  methods: {
    closeMenu () {
      this.$router.push({ name: 'list' })
    }
  }
}
</script>

<style lang="sass">
div#filter-overlay
  z-index: 99
  position: absolute //fixed !important
  top: 32px
  left: 0
  bottom: 0
  right: 0
  opacity: 1
div#filter-menu
  z-index: 100
  position: absolute
  top: 3px
  left: 325px
  width: 300px
  height: 300px
  background: #dbdbdb
  opacity: 1
  border: 1px solid black
</style>
