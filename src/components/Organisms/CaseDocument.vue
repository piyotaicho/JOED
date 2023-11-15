<template>
  <div class="caseitem" :id="'doc' + uid.toString(10)" tabindex="0"
  @keypress.enter="MoveToEditView()"
  @keydown.o="MoveToEditView()"
  @dblclick="MoveToEditView()"
  @keydown.x="RemoveDocumentKeypress($event)">
    <div class="caseitem-icon">
      <CategoryIdentifier :category="Category" :notification="Notification"/>
    </div>
    <div class="caseitem-description">
      <div class="caseitem-row">
        <span class="w20"> {{DateOfProcedure}} </span>
        <span class="w20"> {{PersonalInformation.Id}} </span>
        <span class="w30 truncatable"> {{PersonalInformation.Name}} </span>
        <span class="w10"> {{PersonalInformation.Age}} </span>
        <span class="w20"></span>
      </div>
      <div class="caseitem-row">
        <span class="w40 truncatable"> {{Diagnosis}} </span>
        <span class="w40 truncatable"> {{Procedure}} </span>
        <span class="w20 caution-badge" v-show="PresentAE"> 合併症あり </span>
      </div>
    </div>
    <div class="caseitem-controller">
        <i class="el-icon-loading button-font" v-if="Loading"/>
        <i class="el-icon-edit button-font"
         v-if="!Loading"
        @click="MoveToEditView()"/>
    </div>
  </div>
</template>

<script setup>
import { defineProps, onMounted, ref, computed } from 'vue'
import { useStore } from '@/store'
import { useRouter } from 'vue-router/composables'
import CategoryIdentifier from '@/components/Atoms/CaseCategoryIdentifier'
import * as Popups from '@/modules/Popups'
import CaseDocumentHandler from '@/modules/DbItemHandler'

const store = useStore()
const router = useRouter()

const props = defineProps({
  uid: {
    required: true
  }
})

const Loading = ref(true)

const uid = computed(() => Number(props.uid))

onMounted(() => {
  if (uid.value > 0) {
    store
      .dispatch('FetchDocument', { DocumentId: Number(uid.value) })
      .then(_ => {
        Loading.value = false
      })
      .catch(e => e)
  }
})

const ItemDocument = computed(() => Loading.value ? {} : store.getters.CaseDocument(uid.value))

const Category = computed(() => Loading.value ? '' : ItemDocument.value.TypeOfProcedure)

const DateOfProcedure = computed(() => Loading.value ? '' : ItemDocument.value.DateOfProcedure)

const PersonalInformation = computed(() => {
  return Loading.value
    ? {
        Id: '',
        Name: 'データを取得中',
        Age: ''
      }
    : {
        Id: ItemDocument.value.PatientId,
        Name: ItemDocument.value.Name || '',
        Age: ItemDocument.value.Age ? '( ' + Number(ItemDocument.value.Age) + '歳 )' : ''
      }
})

const Diagnosis = computed(() => Loading.value ? '' : CaseDocumentHandler.ItemValue(ItemDocument.value.Diagnoses[0]))

const Procedure = computed(() => Loading.value ? '' : CaseDocumentHandler.ItemValue(ItemDocument.value.Procedures[0]))

const PresentAE = computed(() => !Loading.value && ItemDocument.value.PresentAE)

const Notification = computed(() => !Loading.value && ItemDocument.value.Notification)

const MoveToEditView = () => {
  if (!Loading.value) {
    router.push({ name: 'edit', params: { uid: uid.value } })
  }
}

const RemoveDocumentKeypress = (event) => {
  if (!event.repeat) {
    if (store.getters['system/Platform'] === 'darwin'
      ? (event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) // macOS - command
      : (event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) // Windows - Ctrl
    ) {
      RemoveDocument()
    }
  }
}

const RemoveDocument = async () => {
  if (await Popups.confirm('この症例を削除します.よろしいですか?')) {
    Loading.value = true
    store.dispatch('RemoveDocument', { DocumentId: uid.value })
  }
}
</script>

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
  text-align: center
.caution-badge
  border-radius: 1rem
  margin: 0.07rem
  background-color: var(--color-danger)
  text-align: center
  font-size: 0.86rem
  color: white
.button-font
  font-size: 1.4rem
</style>
