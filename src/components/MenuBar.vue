<template>
  <div class="menubar">
    <div>
      <div><router-link :to="{name: 'sort'}">SORT</router-link></div>
      <div><router-link :to="{name: 'filter'}">FILTER</router-link></div>
      <div>SEARCH</div>
      <div><router-link to="/utilities">キテレツ病院</router-link></div>
    </div>
  </div>
</template>

<script>
// import MenuItem from '@/components/MenuItem'

export default {
  name: 'MenuBar' /* ,
  components: {
    MenuItem
  } */
}
</script>

<style lang="sass">
div.menubar
  position: fixed
  z-index: 80
  left: 0
  top: 0
  right: 0
  height: 32px
  background-color: #dbdbdb
  padding-top: 3px
  div
    width: 940px
    display: flex
    justify-content: space-around
    border: 1px #dbdbdb solid

.expanded
  background-color: yellow
</style>
