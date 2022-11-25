<template>
  <div
    @keydown.up.prevent="MoveFocus(-1)"
    @keydown.k="MoveFocus(-1)"
    @keydown.down.prevent="MoveFocus(+1)"
    @keydown.j="MoveFocus(+1)"
  >
    <div class="itemlist">
      <DrawerButton class="open-drawer" tab-index="0" @click="OpenDrawer"/>
      <NewEntryButton class="list-new-entry" tab-index="0" @click="CreateNewEntry()"/>

      <ListDrawer :visible="showMenuDrawer" @close="CloseDrawer"/>

      <CaseDocument v-for="uid in Uids" :key="uid" :uid="uid"/>
      <InfiniteLoading @infinite="HandleInfinite" :identifier="DisplayIdentifier" ref="infiniteloading">
        <template v-slot:no-more><span></span></template>
        <template v-slot:no-results><span></span></template>
      </InfiniteLoading>
    </div>

    <WelcomeBanner v-if="ShowStartupDialog"/>
    <router-view></router-view>
  </div>
</template>

<script>
import DrawerButton from '@/components/Atoms/DrawerButton.vue'
import NewEntryButton from '@/components/Atoms/NewEntryButton'
import CaseDocument from '@/components/Organisms/CaseDocument'
import ListDrawer from '@/components/Organisms/ListDrawer'
import WelcomeBanner from '@/components/Organisms/WelcomeBanner'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: 'VList',
  components: {
    DrawerButton, NewEntryButton, CaseDocument, ListDrawer, WelcomeBanner, InfiniteLoading
  },
  mounted () {
    // vue routerのscrollを代替 - #doc-id なエレメントが中心になるようにスクロールとfocusする
    if (this.$route.hash) {
      const element = document.getElementById(this.$route.hash.substr(1))
      if (element) {
        element.scrollIntoView({ block: 'center' })
        element.focus()
      }
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
  position: fixed
  top: 14px
  left: 9px

div.list-new-entry
  position: fixed
  top: 14px
  left: 880px
</style>
