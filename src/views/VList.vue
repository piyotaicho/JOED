<script setup>
import { onMounted, nextTick, ref, computed, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
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

// リスト項目一覧
const uids = computed(() => store.getters.PagedUids)

// スクロールコンテナへの参照
const scrollContainer = ref(null)

// 表示状態フラグ
const showStartupDialog = computed(() => store.getters['system/ShowStartupDialog'])
const drawerOpened = ref(false)

// Element Plus infinite scroll用の状態管理
const fetching = ref(false)
const noMore = computed(() => store.getters.PagedUidsRange >= store.getters.NumberOfCases)

// 選択モード
const multiSelectMode = ref(false)
const selectedUids = ref([])

// uidsのリスト内容が変更されたら選択をクリアし、スクロールバーチェック
watch(uids, () => {
  selectedUids.value.splice(0)
  multiSelectMode.value = false
  // データ追加・フィルタリング後、DOMレンダリング完了後にスクロールバーチェック
  setTimeout(() => ensureScrollbar(), 100)
})

// noMoreの変化も監視（全データロード完了時）
watch(noMore, (isNoMore) => {
  if (isNoMore) {
    // 全データロード完了時、スクロールバーが出ない場合はそのまま終了
    // これにより、データ量が少ない場合の無限ループを防ぐ
    fetching.value = false
  }
})

// スクロールバーが表示されるまで自動ロード
const ensureScrollbar = () => {
  if (!scrollContainer.value || fetching.value || noMore.value) return

  const { scrollHeight, clientHeight } = scrollContainer.value
  // スクロールバーが表示されていない（コンテンツが足りない）場合は追加ロード
  // ただし、全データを表示してもスクロールバーが出ない場合はnoMore.valueがtrueになるので停止する
  if (scrollHeight <= clientHeight && !noMore.value) {
    fetching.value = true
    setTimeout(() => {
      store.commit('IncrementDocumentListRange')
      fetching.value = false
      // ロード後、次のDOMレンダリング後に再度チェック
      nextTick(() => ensureScrollbar())
    }, 100)
  }
}

onMounted(async () => {
  // 初期ロード：スクロールバーが表示されるまでデータをロード
  ensureScrollbar()
  await nextTick()

  // vue routerのscrollを代替 - #doc-id なエレメントが中心になるようにスクロールとfocusする
  if (route.hash) {
    const docId = route.hash.slice(1)

    let element = document.getElementById(docId)
    while (element === null && !noMore.value) {
      loadMore(false)
      await nextTick()
      element = document.getElementById(docId)
    }

    if (element !== null && element.id.match(/^doc\d+$/)) {
      element.scrollIntoView({ block: 'center' })
      element.focus()
    }
  }
})

// ハンドラー
// ドロワーの開閉
const openDrawer = () => { drawerOpened.value = true }
const closeDrawer = () => { drawerOpened.value = false }

// 新規症例の作成
const createNewEntry = () => {
  // ドロワーがあいているときはイベントの処理をしない
  if (drawerOpened.value) return
  router.push({ name: 'edit', params: { uid: 0 } })
}

// リスト項目へのフォーカス移動
const moveFocus = (offset) => {
  const currentid = document.activeElement.id
  if (!drawerOpened.value && !showStartupDialog.value && currentid !== '') {
    const moveto = uids.value[
      uids.value.indexOf(Number(currentid.substring(3))) + offset
    ]
    if (moveto) {
      document.getElementById('doc' + moveto).focus()
      // フォーカス移動時はmultiSelectModeは変化させない
    }
  }
}

// 症例削除
const remove = async () => {
  // ドロワーがあいているときは処理しない
  if (drawerOpened.value) return

  // 選択無しも処理しない
  if (selectedUids.value.length === 0) return

  // 単一選択の削除
  if (selectedUids.value.length === 1) {
    // 一時的にmultiselectModeを設定して症例にチェックをつける
    multiSelectMode.value = true

    // 症例の内容を取得
    const caseDocument = store.getters.CaseDocument(selectedUids.value[0])
    const DateOfProcedure = caseDocument?.DateOfProcedure || ''
    const patientId = caseDocument?.PatientId || ''

    // 単一選択の場合は確認ダイアログを表示
    await confirm(`手術実施日:${DateOfProcedure} 患者ID:${patientId} \nの症例を削除します. よろしいですか？`, '確認').then((result) => {
      if (result) {
        store.dispatch('RemoveDocument', { DocumentId: selectedUids.value[0] })
        selectedUids.value.splice(0)
        multiSelectMode.value = false
      }
    })

    // multiSelectModeを解除
    multiSelectMode.value = false
    return
  }

  // 複数選択の削除
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
  if (!drawerOpened.value && !showStartupDialog.value && currentid !== '' && currentid.startsWith('doc')) {
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
  if (!drawerOpened.value && !showStartupDialog.value && currentid !== '' && currentid.startsWith('doc')) {
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

// exportへ遷移する時に複数選択内容を保存 (CSVエクスポート用)
onBeforeRouteLeave((to) => {
  if (to.name === 'export' && multiSelectMode.value && selectedUids.value.length > 0) {
    console.log('Setting selected UIDs for export:', selectedUids.value )
    store.commit('SetSelectedUidsForExport', selectedUids.value.slice())
  } else {
    store.commit('SetSelectedUidsForExport', [])
  }
})

// ネイティブスクロールイベントでの無限スクロール実装
const handleScroll = (event) => {
  if (fetching.value || noMore.value) return

  const { scrollTop, scrollHeight, clientHeight } = event.target
  // スクロール位置が下から200px以内に来たらloadMore
  if (scrollHeight - scrollTop - clientHeight < 200) {
    loadMore()
  }
}

// ドキュメントのロードを指示
const loadMore = (wait = true) => {
  if (fetching.value || noMore.value) return

  fetching.value = true
  if (wait) {
    setTimeout(() => {
      store.commit('IncrementDocumentListRange')
      fetching.value = false
    }, 100)
  } else {
    store.commit('IncrementDocumentListRange')
    fetching.value = false
  }
}

defineExpose({
  openDrawer,
  remove
})
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
         ref="scrollContainer"
         @scroll="handleScroll">
      <DrawerButton class="open-drawer" tab-index="0" @click="openDrawer"/>
      <NewEntryButton class="list-new-entry" tab-index="0" @click="createNewEntry"/>

      <ListDrawer :visible="drawerOpened" @close="closeDrawer"/>

      <template v-for="uid in uids" :key="uid">
        <CaseDocument :uid="uid" :selected="selectedUids.includes(uid) && multiSelectMode" @select="onSingleSelect" @multiselect="onMultiSelect" @remove="remove"/>
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
