<template>
  <div>
    <div class="edit-dialog" ref="editDialog">
      <div class="edit-top">
        <SectionPatientInfo
          :DateOfProcedure.sync="CaseData.DateOfProcedure"
          :PatientId.sync="CaseData.PatientId"
          :Name.sync="CaseData.Name"
          :Age.sync="CaseData.Age"
          :Denial.sync="CaseData.Denial"
          :ProcedureTime.sync="CaseData.ProcedureTime"
          :JSOGId.sync="CaseData.JSOGId"
          :NCDId.sync="CaseData.NCDId"
        />
      </div>

      <SectionDiagnoses
        :container.sync="CaseData.Diagnoses"
        @addnewitem="EditSection('diagnosis')"
        @edititem="EditSection('diagnosis', $event)"
        @removeitem="RemoveListItem('Diagnoses', $event)"
      />

      <SectionProcedures
        :container.sync="CaseData.Procedures"
        @addnewitem="EditSection('procedure')"
        @edititem="EditSection('procedure', $event)"
        @removeitem="RemoveListItem('Procedures', $event)"
      />

      <SectionAEs
        ref="sectionAEs"
        :container="CaseData.AEs"
        :optionValue.sync="isNoAEs"
        @addnewitem="EditSection('AE')"
        @removeitem="RemoveListItem('AEs', $event)"
      />

      <!-- Navigations -->
      <el-button icon="el-icon-caret-left" size="medium" circle id="MovePrev"
        tabindex="-1"
        v-if="isEditingExistingItem"
        :disabled="!prevUid"
        @click.exact="CancelEditing('prev')"
        @click.shift="CommitCase('prev')" />
      <el-button icon="el-icon-caret-right" size="medium" circle id="MoveNext"
        tabindex="-1"
        v-if="isEditingExistingItem"
        :disabled="!nextUid"
        @click.exact="CancelEditing('next')"
        @click.shift="CommitCase('next')" />

      <!--Controls -->
      <div class="edit-controls">
        <div class="edit-controls-left">
          <el-button type="warning" icon="el-icon-warning"

            @click="ShowNotification"
            v-if="CaseData.Notification">
            入力内容の確認が必要です.
          </el-button>
        </div>
        <div class="edit-controls-right">
          <div>
            <el-button type="primary" icon="el-icon-arrow-left"

              @click="CancelEditing()">
              戻る
            </el-button>
          </div>
          <div>
            <el-dropdown split-button type="primary"
              @click.exact="CommitCase()" @click.shift="CommitCase('temporary')"
              @command="CommitCase">
              編集内容を保存 <i class="el-icon-loading" v-show="processing"/>

              <template v-slot:dropdown>
                <el-dropdown-menu>
                  <template v-if="isEditingExistingItem">
                    <el-dropdown-item command="next" :disabled="!nextUid">保存して次へ</el-dropdown-item>
                    <el-dropdown-item command="prev" :disabled="!prevUid">保存して前へ</el-dropdown-item>
                  </template>
                  <el-dropdown-item command="new">保存して新規作成</el-dropdown-item>
                  <el-dropdown-item command="temporarynew">一時保存して新規作成</el-dropdown-item>
                </el-dropdown-menu>
              </template>

            </el-dropdown>
          </div>
          <div v-if="isEditingExistingItem">
            <el-button type="danger" icon="el-icon-delete" ref="RemoveButton"
              @click="RemoveCase()">
              削除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- ダイアログとしてルーティングを使用 -->
    <div>
      <router-view @data-upsert="EditListItem"></router-view>
    </div>

    <TheWrapper v-if="processing"/>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from '@/store'
import { onBeforeRouteUpdate, useRouter } from 'vue-router/composables'
import SectionPatientInfo from '../components/SectionPatientInfo.vue'
import SectionDiagnoses from '@/components/SectionDiagnoses'
import SectionProcedures from '@/components/SectionProcedures'
import SectionAEs from '@/components/SectionAEs'
import TheWrapper from '@/components/Atoms/TheWrapper'

import { ZenToHan } from '@/modules/ZenHanChars'
import * as Popups from '@/modules/Popups'
import { ValidateCase } from '@/modules/CaseValidater'

const store = useStore()
const router = useRouter()

const props = defineProps({
  uid: {
    type: [Number, String],
    required: true,
    default: 0
  }
})

const CaseData = reactive({
  Name: '',
  Age: undefined,
  PatientId: '',
  JSOGId: '',
  NCDId: '',
  DateOfProcedure: '',
  ProcedureTime: '',
  TypeOfProcedure: '',
  PresentAE: true,
  Diagnoses: [],
  Procedures: [],
  AEs: [],
  Notification: '',
  Denial: false
})

const prevUid = ref(0)
const nextUid = ref(0)
const processing = ref(true)
const editingSection = ref(false)

const editDialog = ref()
const sectionAEs = ref()

let preserve = ''
let preservedElement

// Reactiveでない状態(created)で既存データの読み込みをする.
//
// @prop {uid} DocumentId
function created () {
  const uid = Number(props.uid)
  if (uid > 0) {
    store.dispatch('FetchDocument', { DocumentId: uid })
      .then(_ => {
        const storedDocument = store.getters.CaseDocument(uid)
        if (storedDocument !== undefined) {
          for (const key in CaseData) {
            if (storedDocument[key] !== undefined) {
              if (Array.isArray(storedDocument[key])) {
                CaseData[key] = storedDocument[key].map(item => JSON.stringify(item))
              } else {
                CaseData[key] = storedDocument[key]
              }
            }
          }
        }
        preserve = JSON.stringify(CaseData)

        processing.value = false
        prevUid.value = store.getters.NextUids(uid).Prev
        nextUid.value = store.getters.NextUids(uid).Next
      })
  } else {
    processing.value = false
    preserve = JSON.stringify(CaseData)
  }
}
created()

onMounted(() => {
  document.addEventListener('keydown', keyboardEventListener, true)
  window.addEventListener('beforeunload', BeforeUnloadLister)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', BeforeUnloadLister)
  document.removeEventListener('keydown', keyboardEventListener, true)
})

onBeforeRouteUpdate((to, _from, next) => {
  const goSection = to.name !== 'edit'
  editingSection.value = goSection
  if (goSection) {
    preservedElement = document.activeElement
  } else {
    try {
      preservedElement.focus()
    } catch {}
  }
  next()
})

const uid = computed(() => Number(props.uid))

const isNoAEs = computed({
  get: () => !CaseData.PresentAE,
  set: (newvalue) => {
    CaseData.PresentAE = !newvalue
  }
})

const isEditingExistingItem = computed(() => uid.value > 0)

const BackToList = (currentUid) => {
  if (currentUid === 0) {
    router.push({ name: 'list' })
  } else {
    router.push({ name: 'list', hash: (`#doc${currentUid}`) })
  }
}

const editAnother = (targetUid) => {
  if (targetUid > 0) {
    router.push({ name: 'edit', params: { uid: targetUid } })
  }
  // HACK:
  // 新規(uid = '0')→新規(uid = '0')ではApp.vueで定義したRouterKeyが重複するための quick hack.
  // uid = '00' も uid > 0 がjavascriptの型変換ではfalseで新規扱いになるのでそれを利用する.
  if (targetUid === 0) {
    router.push({ name: 'edit', params: { uid: (props.uid.toString() === '00') ? '0' : '00' } })
  }
}

const EditSection = (target, params = {}) => {
  if (editingSection.value) return

  const index = params.ItemIndex !== undefined ? params.ItemIndex : -1
  const jsonValue = params.ItemValue || '{}'
  const editingYear = CaseData.DateOfProcedure.substring(0, 4)

  router.push({
    name: target,
    params: {
      ItemIndex: index,
      ItemValue: jsonValue,
      year: editingYear
    }
  })
}

const ShowNotification = () => {
  Popups.information(CaseData.Notification)
}

const EditListItem = (target, index, value) => {
  UpdateList(target, index, value)
  if (target === 'AEs') {
    CaseData.PresentAE = CaseData.AEs.length > 0
  }
}

const RemoveListItem = (target, index) => {
  if (editingSection.value) return

  UpdateList(target, index, undefined)
}

const UpdateList = (target, index, value) => {
  if (['Diagnoses', 'Procedures', 'AEs'].indexOf(target) >= 0) {
    const isEmptyValue = typeof value === 'undefined' || (typeof value === 'string' && value === '')
    if (index >= 0) {
      if (CaseData[target][index] !== undefined) {
        // 空データが与えられた場合は当該インデックスを削除
        if (isEmptyValue) {
          CaseData[target].splice(index, 1)
        } else {
          // 実データが与えられた場合は当該インデックスの内容を置換する
          CaseData[target].splice(index, 1, value)
        }
      }
    } else {
      // インデックスがundefinedもしくは-1の場合は新規項目としてリストに追加する
      if (!isEmptyValue) {
        CaseData[target].push(value)
      }
    }
  }
}

const RemoveCase = async () => {
  if (uid.value > 0 && await Popups.confirm('この症例を削除します.よろしいですか?')) {
    store.dispatch('RemoveDocument', { DocumentId: uid.value })
      .then(_ => this.BackToList(0))
  }
}

const CommitCase = async (to = '') => {
  if (processing.value || editingSection.value) {
    return
  }

  await StoreCase(to.includes('temporary'))
    .then(() => {
      switch (to) {
        case 'new':
        case 'temporarynew':
          editAnother(0)
          break
        case 'prev':
          if (prevUid.value !== 0) editAnother(prevUid.value)
          break
        case 'next':
          if (nextUid.value !== 0) editAnother(nextUid.value)
          break
        default:
          BackToList(uid.value)
      }
    })
    .catch(e => {
      Popups.alert(e.message)
    })
}

const CancelEditing = async (to = '') => {
  if (processing.value || editingSection.value) {
    return
  }

  if (preserve === JSON.stringify(CaseData) || await Popups.confirm('項目が編集中です.移動しますか?')) {
    switch (to) {
      case 'prev':
        if (prevUid.value !== 0) editAnother(prevUid.value)
        break
      case 'next':
        if (nextUid.value !== 0) editAnother(nextUid.value)
        break
      default:
        BackToList(uid.value)
    }
  }
}

const StoreCase = async (temporary = false) => {
  try {
    processing.value = true

    // データベース登録に用いるレコードドキュメントを生成
    const newDocument = {}
    for (const key in CaseData) {
      // ArrayはObject[]なのでJSON文字列化する
      if (Array.isArray(CaseData[key])) {
        newDocument[key] = CaseData[key].map(item => JSON.parse(item))
      } else {
        newDocument[key] = CaseData[key]
      }
    }

    // 連番 (新規ドキュメントのuidは0もしくは00があるのでNumberで処理する)
    newDocument.DocumentId = uid.value

    if (temporary) {
      // 一次保存の場合メッセージを設定
      newDocument.Notification = '一時保存したデータです.\n編集終了後に確定保存して下さい.'
    } else {
      // 一時保存でなければメッセージを削除
      delete newDocument.Notification
    }

    // テキストフィールドの整形(trimと半角英数に置換)
    // 患者名 : 前後トリムのみ
    newDocument.Name = newDocument.Name.trim()
    // 患者ID : 半角文字に置換・空白文字を除去
    newDocument.PatientId = ZenToHan(newDocument.PatientId.trim())
      .replace(/\s/g, '')

    // 腫瘍登録番号 : 半角文字に置換・大文字変換・空白文字の除去
    if (newDocument.JSOGId.trim() === '') {
      delete newDocument.JSOGId
    } else {
      newDocument.JSOGId = ZenToHan(newDocument.JSOGId)
        .toUpperCase()
        .replace(/\s/g, '')
    }

    // NCD登録番号 : 半角文字に置換・数値とハイフン以外を除去
    if (newDocument.NCDId.trim() === '') {
      delete newDocument.NCDId
    } else {
      newDocument.NCDId = ZenToHan(newDocument.NCDId.trim()).replace(/[^\d-]/g, '')
    }

    // AEsが空白の際は削除
    if (newDocument.AEs.length === 0) {
      delete newDocument.AEs
      // AEsが空白なのに PresentAEがtrue=無編集 の場合はPresentAEも削除
      if (newDocument.PresentAE) {
        delete newDocument.PresentAE
      }
    }

    // データの検証と区分の取得
    const typeofprocedure = await ValidateCase(newDocument, temporary)

    // 区分コードの設定
    if (typeofprocedure) {
      newDocument.TypeOfProcedure = typeofprocedure
    }

    await store.dispatch('UpsertDocument', newDocument)
  } finally {
    processing.value = false
  }
}

const keyboardEventListener = async (event) => {
  if (editingSection.value || event.repeat) {
    return
  }

  if (store.getters['system/Platform'] === 'darwin'
    ? (event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) // macOS - command
    : (event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) // Windows - Ctrl
  ) {
    switch (event.code) {
      case 'Digit0':
        editDialog.value.getElementsByTagName('input')[0].focus()
        break
      case 'Digit1':
        EditSection('diagnosis')
        break
      case 'Digit2':
        EditSection('procedure')
        break
      case 'Digit3':
        EditSection('AE')
        break
      case 'KeyJ':
        await CancelEditing('next')
        break
      case 'KeyK':
        await CancelEditing('prev')
        break
      case 'KeyU':
        await CancelEditing()
        break
      case 'KeyN':
        await CommitCase('new')
        break
      case 'KeyS':
      case 'Enter':
        event.preventDefault()
        await CommitCase()
        break
      case 'KeyX':
        await RemoveCase()
        break
    }
  } else if (store.getters['system/Platform'] === 'darwin'
    ? (event.metaKey && event.shiftKey && !event.ctrlKey && !event.altKey) // macOS - command + shift
    : (event.ctrlKey && event.shiftKey && !event.metaKey && !event.altKey) // Windows - Ctrl + Shift
  ) {
    switch (event.code) {
      case 'Digit3':
        sectionAEs.value.getElementsByTagName('label')[0].focus()
        break
      case 'KeyJ':
        await CommitCase('next')
        break
      case 'KeyK':
        await CommitCase('prev')
        break
      case 'KeyS':
        await CommitCase('temporary')
        break
    }
  }
}

const BeforeUnloadLister = (event) => {
  if (processing.value) {
    event.preventDefault()
    event.returnValue = ''
    return false
  }
  if (preserve !== JSON.stringify(this.CaseData)) {
    event.preventDefault()
    event.returnValue = ''
    Popups.confirmYesNo('項目が編集中ですが閉じますか?')
      .then(result => {
        if (result) {
          window.removeEventListener('beforeunload', this.BeforeUnloadLister)
          window.close()
        }
      })
    return false
  }
}
</script>

<style lang="sass">
div.edit-dialog
  position: relative
  border: 1px black solid
  border-radius: 0.5rem
  background-color: ivory
  margin-left: 48px
  margin-top: 1rem
  padding: 1rem 1.5rem 0.4rem
  width: 800px
  display: flex
  flex-direction: column

div.edit-top
  padding-right: 3rem
  padding-left: 1rem

div.edititem
  position: relative
  display: block
  background: white
  width: 800px
  border: 4px solid gray
  border-radius: 10px
  margin-top: 120px
  margin-left: 50px
  margin-bottom: 1rem
  padding: 0.6rem 1rem 0.8rem
div.content-title
  padding: 0 0.55rem
  font-size: 1.1rem
  font-weight: bold
  letter-spacing: 0.12rem
div.flex-content
  display: flex
  flex-direction: row
  margin-bottom: 0.3rem
div.selectionbox
  margin: 0.3rem 0.5rem
  min-height: 2rem
  line-height: 2rem
  select
    width: 100%
div.inputbox
  margin: 0.14rem 1.15rem
  height: 2.85rem
  flex-direction: row
  & > div
    margin: auto 0
  input
    width: 95%
div.content-bottom
  div.controls
    padding: 0 0.55rem
    text-align: right
    margin: 0.14rem 0
    height: 2.5rem
div.vdp-datepicker__calendar
  width: 20rem !important
  z-index: +1

/* コントロール */
#MovePrev
  position: absolute
  top: 70px
  left: 10px
#MoveNext
  position: absolute
  top: 70px
  right: 10px
div.edit-controls
  position: relative
  text-align: right
  padding-top: 16px
  padding-bottom: 8px
  display: flex
  flex-direction: row
  justify-content: space-between
div.edit-controls-left
  display: flex
  flex-direction: row
  justify-content: flex-start
div.edit-controls-right
  display: flex
  flex-direction: row
  justify-content: flex-end
  & > div
    margin-left: 0.2rem
</style>
