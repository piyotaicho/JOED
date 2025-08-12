<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/store'
import DrawerButton from '@/components/Atoms/DrawerButton.vue'
import NewEntryButton from '@/components/Atoms/NewEntryButton'
import CaseDocument from '@/components/Organisms/CaseDocument'
import ListDrawer from '@/components/Organisms/ListDrawer'
import WelcomeBanner from '@/components/Organisms/WelcomeBanner'
import InfiniteLoading from 'vue-infinite-loading'

const store = useStore()
const route = useRoute()
const router = useRouter()

onMounted(() => {
  // vue routerのscrollを代替 - #doc-id なエレメントが中心になるようにスクロールとfocusする
  if (route.hash) {
    const element = document.getElementById(route.hash.slice(1))
    if (element) {
      element.scrollIntoView({ block: 'center' })
      element.focus()
    }
  }
})

const showMenuDrawer = ref(false)

const uids = computed(() => store.getters.PagedUids)

const isShowStartupDialog = computed(() => store.getters['system/ShowStartupDialog'])

const displayIdentifier = computed(() => store.getters.DisplayIdentifier)

const createNewEntry = () => router.push({ name: 'edit', params: { uid: 0 } })

const openDrawer = () => { showMenuDrawer.value = true }

const closeDrawer = () => { showMenuDrawer.value = false }

const handleInfinite = (state) => {
  store.commit('IncrementDocumentListRange')
  if (store.getters.PagedUidsRange >= store.getters.NumberOfCases) {
    state.complete()
  } else {
    state.loaded()
  }
}

const moveFocus = (offset) => {
  const currentid = document.activeElement.id
  if (!showMenuDrawer.value && isShowStartupDialog.value && currentid !== '') {
    const moveto = uids[
      uids.value.indexOf(Number(currentid.substring(3))) + offset
    ]
    if (moveto) {
      document.getElementById('doc' + moveto).focus()
    }
  }
}
</script>

<template>
  <div
    @keydown.up.prevent="moveFocus(-1)"
    @keydown.k="moveFocus(-1)"
    @keydown.down.prevent="moveFocus(+1)"
    @keydown.j="moveFocus(+1)"
  >
    <div class="itemlist">
      <DrawerButton class="open-drawer" tab-index="0" @click="openDrawer"/>
      <NewEntryButton class="list-new-entry" tab-index="0" @click="createNewEntry"/>

      <ListDrawer :visible="showMenuDrawer" @close="closeDrawer"/>

      <template v-for="uid in uids" :key="uid">
        <CaseDocument :uid="uid"/>
      </template>
      <InfiniteLoading @infinite="handleInfinite" :identifier="displayIdentifier" ref="infiniteloading">
        <template v-slot:no-more><span></span></template>
        <template v-slot:no-results><span></span></template>
      </InfiniteLoading>
    </div>

    <WelcomeBanner v-if="isShowStartupDialog"/>
    <router-view></router-view>
  </div>
</template>

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
