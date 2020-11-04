<template>
  <div
    @keydown.up.prevent="MoveFocus(-1)"
    @keydown.75.ctrl="MoveFocus(-1)"
    @keydown.down.prevent="MoveFocus(+1)"
    @keydown.74.ctrl="MoveFocus(+1)"
  >
    <WelcomeBanner v-if="ShowStartupDialog"/>

    <DrawerButton div-class="open-drawer" tab-index="0" @click="OpenDrawer"/>
    <NewEntryButton div-class="list-new-entry" tab-index="0" @click="CreateNewEntry()"/>

    <Drawer :showDrawer="showMenuDrawer" @close="CloseDrawer"/>

    <div class="itemlist">
      <CaseDocument v-for="uid in Uids" :key="uid" :uid="uid"/>
      <InfiniteLoading @infinite="HandleInfinite" :identifier="DisplayIdentifier" ref="infiniteloading">
        <span slot="no-more"></span>
        <span slot="no-results"></span>
      </InfiniteLoading>
    </div>

    <router-view></router-view>
  </div>
</template>

<script>
import DrawerButton from '@/components/Atoms/DrawerButton.vue'
import NewEntryButton from '@/components/Atoms/NewEntryButton'
import CaseDocument from '@/components/CaseDocument'
import Drawer from '@/components/Drawer'
import WelcomeBanner from '@/components/Molecules/WelcomeBanner'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: 'VList',
  components: {
    DrawerButton, NewEntryButton, CaseDocument, Drawer, WelcomeBanner, InfiniteLoading
  },
  mounted () {
    // scrollを代替 - #id なエレメントが中心になるようにスクロールする
    if (this.$route.hash && document.querySelector(this.$route.hash)) {
      document.querySelector(this.$route.hash).scrollIntoView({ block: 'center' })
    }
  },
  data () {
    return ({
      showMenuDrawer: false
    })
  },
  computed: {
    Uids () {
      return this.$store.getters.PagedUids
    },
    ShowStartupDialog () {
      return this.$store.getters['system/ShowStartupDialog']
    },
    DisplayIdentifier () {
      return this.$store.getters.DisplayIdentifier
    }
  },
  methods: {
    CreateNewEntry () {
      this.$router.push({ name: 'edit', params: { uid: 0 } })
    },
    OpenDrawer () {
      this.showMenuDrawer = true
    },
    CloseDrawer () {
      this.showMenuDrawer = false
    },
    HandleInfinite (state) {
      this.$store.commit('IncrementDocumentListRange')
      if (this.$store.getters.PagedUidsRange >= this.$store.getters.NumberOfCases) {
        state.complete()
      } else {
        state.loaded()
      }
    },
    MoveFocus (diff) {
      const currentid = document.activeElement.id
      if (!this.showMenuDrawer && !this.ShowStartupDialog && currentid !== '') {
        const moveto = this.Uids[
          this.Uids.indexOf(Number(currentid.substr(3))) + diff
        ]
        if (moveto) {
          document.getElementById('doc' + moveto).focus()
        }
      }
    }
  }
}
</script>

<style lang="sass">
div.itemlist
  position: absolute
  left: 0
  top: 0
  width: 100%
  height: 100%
  background-color: ivory
  overflow: auto
  &::after
    display: block
    height: 60px
    width: 1px
    content: ''

div.open-drawer
  z-index: 10
  position: fixed
  top: 14px
  left: 9px

div.list-new-entry
  z-index: 10
  position: fixed
  top: 14px
  left: 880px
</style>
