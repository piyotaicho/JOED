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
  name: 'ViewList',
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
</style>
