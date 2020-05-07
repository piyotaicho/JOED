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
        <span class="right-aligned"><router-link to="/utilities">キテレツ病院</router-link></span>
      </div>
    </div>
    <div class="itemlist">
      <Caseitem v-for="uid in Uids" :key="uid" :uid="uid" />
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
/* ========================================
    症例一覧画面  VListOfCaseitems
   ======================================== */
// トップステータスバー
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

// リストコンテナ
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
