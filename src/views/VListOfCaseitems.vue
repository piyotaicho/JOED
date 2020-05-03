<template>
  <div>
    <router-link to="/edit/0/">
      <div class="new-item-button"></div>
    </router-link>
    <div class="header">
      <div>
        <span class="left-aligned">SORT</span>
        <span class="left-aligned">FITER</span>
        <span class="left-aligned">SEARCH</span>
        <span class="right-aligned">キテレツ病院</span>
      </div>
    </div>
    <div class="itemlist">
      <caseitem v-for="uid in Uids" :key="uid" :uid="uid"></caseitem>
    </div>
  </div>
</template>

<script>
import Caseitem from '@/components/Caseitem'

export default {
  name: 'ViewListOfCaseitems',
  components: {
    Caseitem
  },
  mounted () {
    this.$store.dispatch('ReloadDatastore')
  },
  data () {
    return ({
    })
  },
  computed: {
    Uids () {
      return this.$store.getters.GetUids
    }
  }
}
</script>

<style lang="sass">
div.header
  position: fixed
  display: flex
  justify-content: center
  left: 0
  top: 0
  width: 100%
  height: 32px
  background-color: #dbdbdb
  padding-top: 3px
  justify-content: space-between
  div
    position: relative
    width: 900px
    display: flex
    justify-content: space-around

span.left-aligned
  margin-left: 4em

span.right-aligned
  margin-right: 4em
  margin-left: 16em

div.itemlist
  position: absolute
  left: 0
  top: 32px
  width: 100%
  height: 100%
  margin-bottom: 80px
  background-color: ivory
  overflow: auto

div.new-item-button
  z-index: 2
  position: fixed
  left: 953px
  top: 48px
  width: 40px
  height: 40px
  background: url('../assets/icon-add.png')
</style>
