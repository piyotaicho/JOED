<template>
  <div id="app">
    <router-view :key="$route.name + ($route.params.uid || '')"></router-view>
  </div>
</template>

<script>
export default {
  created () {
    this.$store.commit('onCreated')
  }
}
</script>

<style lang="sass">
@import 'cross-plathome-yu-gothic.css'
@import 'app-global.sass'
</style>
