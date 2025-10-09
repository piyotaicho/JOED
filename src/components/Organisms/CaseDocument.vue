<script setup>
import { Loading, Edit } from '@element-plus/icons-vue'
import { onMounted, ref, computed } from 'vue'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import CategoryIdentifier from '@/components/Atoms/CaseCategoryIdentifier.vue'
import * as Popups from '@/modules/Popups'
import CaseDocumentHandler from '@/modules/DbItemHandler'

const store = useStore()
const router = useRouter()

const props = defineProps({
  uid: {
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select', 'multiselect'])

// 情報取得中フラグ
const fetching = ref(true)

// ドキュメントuidを数値化(propsは文字列として受け取るため)
const uid = computed(() => Number(props.uid))

onMounted(() => {
  if (uid.value > 0) {
    store
      .dispatch('FetchDocument', { DocumentId: uid.value })
      .then(() => {
        fetching.value = false
      })
      .catch((e) => e)
  }
})

const currentDocument = computed(() => (fetching.value ? {} : store.getters.CaseDocument(uid.value)))

// ドキュメントの各種フィールド
const Category = computed(() => (fetching.value ? '' : currentDocument.value?.TypeOfProcedure || ''))
const Id = computed(() => (fetching.value ? '' : currentDocument.value.PatientId || ''))
const Name = computed(() => (fetching.value ? 'データを取得中' : currentDocument.value?.Name || ''))
const DateOfProcedure = computed(() => (fetching.value ? '' : currentDocument.value?.DateOfProcedure))
const Age = computed(() =>
  fetching.value ? '' : (currentDocument.value?.Age ? '( ' + currentDocument.value.Age + '歳 )' : '')
)
const Denial = computed(() => (fetching.value ? undefined : currentDocument.value?.Denial))

const Diagnosis = computed(() =>
  fetching.value ? '' : CaseDocumentHandler.ItemValue(currentDocument.value?.Diagnoses[0]),
)
const Procedure = computed(() =>
  fetching.value ? '' : CaseDocumentHandler.ItemValue(currentDocument.value?.Procedures[0]),
)
const PresentAE = computed(() => !fetching.value && (currentDocument.value?.PresentAE === true))

const Notification = computed(() => (fetching.value ? '' : currentDocument.value?.Notification || ''))

const MoveToEditView = () => {
  if (!fetching.value) {
    router.push({ name: 'edit', params: { uid: uid.value } })
  }
}

const RemoveDocumentKeypress = (event) => {
  if (!event.repeat) {
    if (
      store.getters['system/Platform'] === 'darwin'
        ? event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey // macOS - command
        : event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey // Windows - Ctrl
    ) {
      RemoveDocument()
    }
  }
}

const RemoveDocument = async () => {
  if (await Popups.confirm('この症例を削除します.よろしいですか?')) {
    fetching.value = true
    store.dispatch('RemoveDocument', { DocumentId: uid.value })
  }
}

const Select = (event) => {
  if (event.ctrlKey) {
    // Ctrlキー押下時はMultiSelect
    MultiSelect()
  } else {
    // それ以外はSingleSelect
    SingleSelect()
  }
}
const SingleSelect = () => {
  // 単一選択では常に選択状態を更新
  emit('select', uid.value)
}

const MultiSelect = () => {
  if (!props.selected) {
    emit('multiselect', { uid: uid.value, selected: true })
  } else {
    emit('multiselect', { uid: uid.value, selected: false })
  }
}
</script>

<template>
  <div
    class="caseitem"
    :id="'doc' + uid.toString(10)"
    tabindex="0"
    @keypress.enter="MoveToEditView()"
    @keydown.o="MoveToEditView()"
    @dblclick="MoveToEditView()"
    @click="Select($event)"
    @keydown.x="RemoveDocumentKeypress($event)"
  >
    <div class="caseitem-icon">
      <CategoryIdentifier :category="Category" :notification="Notification" :checked="selected" />
    </div>
    <div class="caseitem-description">
      <div class="caseitem-row">
        <span class="w20"> {{ DateOfProcedure }} </span>
        <template v-if="Denial === true">
          <el-tooltip
            placement="top-start"
            :open-delay="700"
            content="この症例には登録拒否が設定されています"
          >
            <span class="w20 caution-font"> {{ Id }} </span>
          </el-tooltip>
        </template>
        <template v-else>
          <span class="w20"> {{ Id }} </span>
        </template>
        <span class="w30 truncatable"> {{ Name }} </span>
        <span class="w10"> {{ Age }} </span>
        <span class="w20"></span>
      </div>
      <div class="caseitem-row">
        <span class="w40 truncatable"> {{ Diagnosis }} </span>
        <span class="w40 truncatable"> {{ Procedure }} </span>
        <span class="w20 caution-badge" v-show="PresentAE"> 合併症あり </span>
      </div>
    </div>
    <div class="caseitem-controller">
      <template v-if="fetching">
        <div><el-icon class="button-font">
          <Loading />
        </el-icon></div>
      </template>
      <template v-else>
        <div><el-icon class="button-font" v-if="!Loading" @click="MoveToEditView()">
          <Edit />
        </el-icon></div>
      </template>
    </div>
  </div>
</template>

<style lang="sass">
div.caseitem
  position: relative
  width: 800px
  height: 3.6rem
  border: black 1px solid
  border-radius: 2px
  background-color: white
  margin-left: 59px
  margin-top: 0.6rem
  padding: 0.12rem 0
  display: flex
  flex-direction: row
  &:focus
    background: var(--color-text-placeholder)
  +.selected
    background: var(--color-text-placeholder)
div.caseitem-icon
  width: 60px
  display: flex
  flex-direction: row
div.caseitem-description
  width: 680px
  display: flex
  flex-direction: column
  justify-content: space-around
  div.caseitem-row
    display: flex
    flex-direction: row
div.caseitem-controller
  width: 60px
  display: flex
  flex-direction: column
  justify-content: space-around
  div
    display: inline-flex
    flex-direction: row
    justify-content: center
.caution-badge
  border-radius: 1rem
  margin: 0.07rem
  background-color: var(--color-danger)
  text-align: center
  font-size: 0.86rem
  color: white
.button-font
  font-size: 1.4rem
.caution-font
  color: var(--color-danger)
  font-weight: 600
</style>
