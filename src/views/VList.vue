<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from '@/store'
import { Loading } from '@element-plus/icons-vue'
import DrawerButton from '@/components/Atoms/DrawerButton.vue'
import NewEntryButton from '@/components/Atoms/NewEntryButton.vue'
import CaseDocument from '@/components/Organisms/CaseDocument.vue'
import ListDrawer from '@/components/Organisms/ListDrawer.vue'
import WelcomeBanner from '@/components/Organisms/WelcomeBanner.vue'
import { confirm } from '@/modules/Popups'

const store = useStore()
const route = useRoute()
const router = useRouter()

onMounted(() => {
  // vue routerのscrollを代替 - #doc-id なエレメントが中心になるようにスクロールとfocusする
  if (route.hash) {
    const element = document.getElementById(route.hash.slice(1))
    if (element.id.match(/^doc-\d+$/)) {
      element.scrollIntoView({ block: 'center' })
      element.focus()

    }
  }
})

const showStartupDialog = computed(() => store.getters['system/ShowStartupDialog'])
const showDrawer = ref(false)

// Element Plus infinite scroll用の状態管理
const fetching = ref(false)
const noMore = computed(() => store.getters.PagedUidsRange >= store.getters.NumberOfCases)

// リスト項目一覧
const uids = computed(() => store.getters.PagedUids)
// 選択モード
const multiSelectMode = ref(false)
const selectedUids = ref([])

// ハンドラー
// ドロワーの開閉
const openDrawer = () => { showDrawer.value = true }
const closeDrawer = () => { showDrawer.value = false }

// 新規症例の作成
const createNewEntry = () => router.push({ name: 'edit', params: { uid: 0 } })

// リスト項目へのフォーカス移動
const moveFocus = (offset) => {
  const currentid = document.activeElement.id
  if (!showDrawer.value && !showStartupDialog.value && currentid !== '') {
    const moveto = uids.value[
      uids.value.indexOf(Number(currentid.substring(3))) + offset
    ]
    if (moveto) {
      document.getElementById('doc' + moveto).focus()
      // フォーカス移動時はmultiSelectModeは変化させない
    }
  }
}

// uidsのリスト内容が変更されたらselectedUidsをクリア
watch(uids, () => {
  selectedUids.value.splice(0)
  multiSelectMode.value = false
})

// 症例削除のディスパッチ
const dispatchRemove = async () => {
  if (selectedUids.value.length === 0) return
  if (selectedUids.value.length === 1) {
    // 単一選択の場合は確認ダイアログを表示
    await confirm('症例を削除します. よろしいですか？', '確認').then((result) => {
      if (result) {
        store.dispatch('RemoveDocument', { DocumentId: selectedUids.value[0] })
        selectedUids.value.splice(0)
        multiSelectMode.value = false
      }
    })
    return
  }
  await confirm(`選択されている${selectedUids.value.length}件の症例を削除します. よろしいですか？`, '確認').then((result) => {
    if (result) {
      selectedUids.value.forEach((uid) => {
        store.dispatch('RemoveDocument', { DocumentId: uid })
      })
      selectedUids.value.splice(0)
      multiSelectMode.value = false
    }
  })
}

// SingleSelectのハンドラー
const onSingleSelect = (uid) => {
  // 単一選択時は常に複数選択を解除し、指定されたuidのみを選択
  selectedUids.value.splice(0)
  selectedUids.value.push(uid)
  multiSelectMode.value = false
}

// MultiSelectのハンドラー
const onMultiSelect = ({ uid, selected }) => {
  if (selected) {
    if (!selectedUids.value.includes(uid)) {
      selectedUids.value.push(uid)
    }
  } else {
    const index = selectedUids.value.indexOf(uid)
    if (index !== -1) {
      selectedUids.value.splice(index, 1)
    }
  }
  // CTRL+クリックでの操作では常にmultiSelectModeをtrueにする
  multiSelectMode.value = true
}

// ESCキーでの選択解除
const handleEscapeKey = () => {
  const currentid = document.activeElement.id
  if (!showDrawer.value && !showStartupDialog.value && currentid !== '' && currentid.startsWith('doc')) {
    const uid = Number(currentid.substring(3))
    // 現在フォーカスのあるCaseDocumentがあれば[uid]、なければ[]
    selectedUids.value.splice(0)
    selectedUids.value.push(uid)
  } else {
    // フォーカスがない場合は空にする
    selectedUids.value.splice(0)
  }
  multiSelectMode.value = false
}

// SPACEキーでの選択切り替え
const handleSpaceKey = () => {
  const currentid = document.activeElement.id
  if (!showDrawer.value && !showStartupDialog.value && currentid !== '' && currentid.startsWith('doc')) {
    const uid = Number(currentid.substring(3))

    if (multiSelectMode.value) {
      // multiSelectModeの場合は既存の選択に追加/削除
      if (selectedUids.value.includes(uid)) {
        // 既に選択されている場合は選択解除
        const index = selectedUids.value.indexOf(uid)
        selectedUids.value.splice(index, 1)

        // 結果が空になった場合は[uid]でmultiSelectMode = false
        if (selectedUids.value.length === 0) {
          selectedUids.value.push(uid)
          multiSelectMode.value = false
        }
      } else {
        // 選択されていない場合は追加
        selectedUids.value.push(uid)
      }
    } else {
      // multiSelectModeでない場合は単一選択を解除してmultiSelectModeに移行
      selectedUids.value.splice(0)
      selectedUids.value.push(uid)
      multiSelectMode.value = true
    }
  }
}

// Element Plus infinite scroll のハンドラー
const loadMore = () => {
  if (fetching.value || noMore.value) return

  fetching.value = true
  // 少し遅延を入れてユーザー体験を改善
  setTimeout(() => {
    store.commit('IncrementDocumentListRange')
    fetching.value = false
  }, 100)
}
</script>

<template>
  <div
    @keydown.up.prevent="moveFocus(-1)"
    @keydown.k="moveFocus(-1)"
    @keydown.down.prevent="moveFocus(+1)"
    @keydown.j="moveFocus(+1)"
    @keydown.space.prevent="handleSpaceKey"
    @keydown.escape="handleEscapeKey"
  >
    <div class="itemlist"
         v-infinite-scroll="loadMore"
         :infinite-scroll-disabled="fetching || noMore"
         :infinite-scroll-distance="200">
      <DrawerButton class="open-drawer" tab-index="0" @click="openDrawer"/>
      <NewEntryButton class="list-new-entry" tab-index="0" @click="createNewEntry"/>

      <ListDrawer :visible="showDrawer" @close="closeDrawer"/>

      <template v-for="uid in uids" :key="uid">
        <CaseDocument :uid="uid" :selected="selectedUids.includes(uid) && multiSelectMode" @select="onSingleSelect" @multiselect="onMultiSelect" @remove="dispatchRemove"/>
      </template>

      <div v-if="fetching" class="fetching-container">
        <el-icon>
          <Loading />
        </el-icon>
        <span>読み込み中...</span>
      </div>
    </div>

    <WelcomeBanner v-if="showStartupDialog"/>
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
.fetching-container
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
