<template>
  <div>
    <router-link to="/edit/0/">
      <div class="new-item-button"></div>
    </router-link>

    <MenuBar />
    <div class="itemlist">
      <Caseitem v-for="uid in Uids" :key="uid" :uid="uid" />
    </div>

    <router-view></router-view>
  </div>
</template>

<script>
import MenuBar from '@/components/MenuBar'
import Caseitem from '@/components/Caseitem'

export default {
  name: 'ViewListOfCaseitems',
  components: {
    MenuBar, Caseitem
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
/* ========================================
    症例一覧画面  VListOfCaseitems
   ======================================== */
// リストコンテナ
div.itemlist
  position: absolute
  left: 0
  top: 32px
  width: 100%
  height: 100%
  background-color: ivory
  overflow: auto
  &::after
    display: block
    height: 60px
    width: 1px
    content: ''

div.new-item-button
  z-index: 2
  position: fixed
  left: 953px
  top: 48px
  width: 40px
  height: 40px
  background: url('../assets/icon-add.png')

// リスト項目  Caseitem
div.caseitem
  position: relative
  width: 900px
  height: 60px
  border: black 1px solid
  background-color: white
  margin-left: 39px
  margin-top: 9px
  display: flex
  justify-content: space-between
  div.caseitem-description
    width: 700px
    display: flex
    flex-direction: column
    justify-content: space-around
    div.caseitem-row
      display: flex
      flex-direction: row
      justify-content: space-between
  div.caseitem-controller
    width: 80px
    padding-left: 16px
    padding-right: 16px
    display: flex
    flex-direction: column
    justify-content: space-around
    text-align: center
  .caution-badge
    border-radius: 10px
    background-color: red
    color: white
    text-align: center
    font-size: 90%
</style>
