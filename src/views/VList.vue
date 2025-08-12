<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/store'
import { Loading } from '@element-plus/icons-vue'
import DrawerButton from '@/components/Atoms/DrawerButton.vue'
import NewEntryButton from '@/components/Atoms/NewEntryButton'
import CaseDocument from '@/components/Organisms/CaseDocument'
import ListDrawer from '@/components/Organisms/ListDrawer'
import WelcomeBanner from '@/components/Organisms/WelcomeBanner'
// import InfiniteLoading from 'vue-infinite-loading' // Vue 3非対応のため削除

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

// Element Plus infinite scroll用の状態管理
const loading = ref(false)
const noMore = computed(() => store.getters.PagedUidsRange >= store.getters.NumberOfCases)

const createNewEntry = () => router.push({ name: 'edit', params: { uid: 0 } })

const openDrawer = () => { showMenuDrawer.value = true }

const closeDrawer = () => { showMenuDrawer.value = false }

// Element Plus infinite scroll のハンドラー
const loadMore = () => {
  if (loading.value || noMore.value) return

  loading.value = true
  // 少し遅延を入れてユーザー体験を改善
  setTimeout(() => {
    store.commit('IncrementDocumentListRange')
    loading.value = false
  }, 100)
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
    <div class="itemlist"
         v-infinite-scroll="loadMore"
         :infinite-scroll-disabled="loading || noMore"
         :infinite-scroll-distance="200">
      <DrawerButton class="open-drawer" tab-index="0" @click="openDrawer"/>
      <NewEntryButton class="list-new-entry" tab-index="0" @click="createNewEntry"/>

      <ListDrawer :visible="showMenuDrawer" @close="closeDrawer"/>

      <template v-for="uid in uids" :key="uid">
        <CaseDocument :uid="uid"/>
      </template>

      <!-- Element Plus Infinite Scroll用のローディング表示 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span>読み込み中...</span>
      </div>

      <!-- 全データロード完了表示（オプション） -->
      <!-- <div v-if="noMore && uids.length > 0" class="no-more-container">
        <span>すべてのデータを読み込みました</span>
      </div> -->
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

// Element Plus infinite scroll用のスタイル
.loading-container
  display: flex
  justify-content: center
  align-items: center
  padding: 20px
  gap: 8px
  color: #666

  .el-icon
    font-size: 18px

.no-more-container
  display: flex
  justify-content: center
  align-items: center
  padding: 20px
  color: #999
  font-size: 14px

div.open-drawer
  position: fixed
  top: 14px
  left: 9px

div.list-new-entry
  position: fixed
  top: 14px
  left: 880px
</style>
