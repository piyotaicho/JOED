<template>
  <div>
    <div class="edit-dialog" ref="edit">
      <div class="edit-top">
        <div class="edit-top-left">
          <InputDateOfProcedure v-model="CaseData.DateOfProcedure" :required="true"/>
          <InputTextField title="患者ID" :required="true" v-model="CaseData.PatientId" placeholder="施設の患者ID"/>
          <InputTextField title="患者名" v-model="CaseData.Name"/>
          <InputNumberField title="年齢" v-model="CaseData.Age" :min="1" :max="120"/>
        </div>
        <div class="edit-top-right">
          <InputTextField title="腫瘍登録番号" v-model="CaseData.JSOGId" placeholder="腫瘍登録患者No." :disabled="skipJSOGId && CaseData.JSOGId === ''"/>
          <InputTextField title="NCD症例識別コード" v-model="CaseData.NCDId" placeholder="NCD症例識別コード" :disabled="skipNCDId && CaseData.NCDId === ''"/>
          <div><!-- spacer --></div>
          <InputProcedureTime v-model="CaseData.ProcedureTime"/>
        </div>
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
        :container.sync="CaseData.AEs"
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

<script>
import SectionDiagnoses from '@/components/SectionDiagnoses'
import SectionProcedures from '@/components/SectionProcedures'
import SectionAEs from '@/components/SectionAEs'
import InputTextField from '@/components/Molecules/InputTextField'
import InputNumberField from '@/components/Molecules/InputNumberField'
import InputProcedureTime from '@/components/Molecules/InputProcedureTime'
import InputDateOfProcedure from '@/components/Molecules/InputDateOfProcedure'
import TheWrapper from '@/components/Atoms/TheWrapper'

import { ZenToHan } from '@/modules/ZenHanChars'
import * as Popups from '@/modules/Popups'
import { ValidateCase } from '@/modules/CaseValidater'

export default {
  name: 'VEdit',
  components: {
    InputTextField,
    InputNumberField,
    InputProcedureTime,
    InputDateOfProcedure,
    SectionDiagnoses,
    SectionProcedures,
    SectionAEs,
    TheWrapper
  },
  props: {
    uid: {
      type: [Number, String],
      required: true,
      default: 0
    }
  },
  data () {
    return ({
      CaseData: {
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
        Notification: ''
      },
      prevUid: 0,
      nextUid: 0,
      processing: true,
      editingSection: false,
      preserve: '',
      preservedElement: null
    })
  },
  // 既存データの読み込みをする.
  //
  // @prop {uid} DocumentId
  created () {
    if (Number(this.uid) > 0) {
      this.$store.dispatch('FetchDocument', { DocumentId: this.uid })
        .then(_ => {
          const casedocument = this.$store.getters.CaseDocument(this.uid)
          for (const key in this.CaseData) {
            if (casedocument !== undefined && casedocument[key] !== undefined) {
              if (toString.call(casedocument[key]) === '[object Object]') {
                this.$set(this.CaseData, key, { ...casedocument[key] })
              } else if (Array.isArray(casedocument[key])) {
                this.$set(this.CaseData, key, [...casedocument[key]])
              } else {
                this.$set(this.CaseData, key, casedocument[key])
              }
            }
          }
          this.preserve = JSON.stringify(this.CaseData)

          this.processing = false
          this.prevUid = this.$store.getters.NextUids(this.uid).Prev
          this.nextUid = this.$store.getters.NextUids(this.uid).Next
        })
    } else {
      this.processing = false
      this.preserve = JSON.stringify(this.CaseData)
    }
  },
  mounted () {
    document.addEventListener('keydown', this.EventListner, true)
    window.addEventListener('beforeunload', this.BeforeUnloadLister)
  },
  beforeDestroy () {
    window.removeEventListener('beforeunload', this.BeforeUnloadLister)
    document.removeEventListener('keydown', this.EventListner, true)
  },
  beforeRouteUpdate (to, from, next) {
    const goSection = to.name !== 'edit'
    this.editingSection = goSection
    if (goSection) {
      this.preservedElement = document.activeElement
    } else {
      try {
        this.preservedElement.focus()
      } catch {}
    }
    next()
  },
  computed: {
    isNoAEs: {
      get () {
        return !this.CaseData.PresentAE
      },
      set (newvalue) {
        this.$set(this.CaseData, 'PresentAE', !newvalue)
      }
    },
    isEditingExistingItem () {
      return (this.uid > 0)
    },
    skipJSOGId () {
      return !this.$store.getters['system/EditJSOGId']
    },
    skipNCDId () {
      return !this.$store.getters['system/EditNCDId']
    }
  },
  methods: {
    BackToList (uid) {
      if (Number(uid) === 0) {
        this.$router.push({ name: 'list' })
      } else {
        this.$router.push({ name: 'list', hash: ('#doc' + uid) })
      }
    },
    AnotherEdit (uid) {
      if (uid > 0) {
        this.$router.push({ name: 'edit', params: { uid } })
      }
      // HACK:
      // 新規(uid = '0')→新規(uid = '0')ではApp.vueで定義したRouterKeyが重複するための quick hack.
      // uid = '00' も uid > 0 がjavascriptの型変換ではfalseで新規扱いになるのでそれを利用する.
      if (uid === 0) {
        this.$router.push({ name: 'edit', params: { uid: (this.uid === '00') ? '0' : '00' } })
      }
    },

    EditSection (target, params = {}) {
      if (this.editingSection) return

      const index = params.ItemIndex !== undefined ? params.ItemIndex : -1
      const value = params.ItemValue || {}
      const editingYear = this.CaseData.DateOfProcedure.substr(0, 4)
      this.$router.push({
        name: target,
        params: {
          ItemIndex: index,
          ItemValue: value,
          year: editingYear
        }
      })
    },

    ShowNotification () {
      Popups.information(
        this.$createElement('div', null,
          this.CaseData.Notification
            .split('\n')
            .map(line => this.$createElement('p', null, line))
        )
      )
    },

    EditListItem (target, index, value) {
      this.UpdateList(this.CaseData[target], index, value)
      if (target === 'AEs') {
        this.$set(this.CaseData, 'PresentAE', this.CaseData.AEs.length > 0)
      }
    },

    RemoveListItem (target, index) {
      if (this.editingSection) return

      this.EditListItem(target, index, '')
    },

    UpdateList (list, index, value) {
      const IsObjectEmpty = value =>
        (
          (typeof (value) === 'string' && value === '') ||
          (typeof (value) === 'object' && Object.keys(value).length === 0)
        )

      if (index >= 0) {
        if (list[index] !== undefined) {
          // 空データが与えられた場合は当該インデックスを削除
          if (IsObjectEmpty(value)) {
            list.splice(index, 1)
          } else {
            // 実データが与えられた場合は当該インデックスの内容を置換する
            list.splice(index, 1, value)
          }
        }
      } else {
        // インデックスがundefinedもしくは-1の場合は新規項目としてリストに追加する
        if (!IsObjectEmpty(value)) {
          list.push(value)
        }
      }
    },

    async RemoveCase () {
      if (this.uid > 0 && await Popups.confirm('この症例を削除します.よろしいですか?')) {
        this.$store.dispatch('RemoveDocument', { DocumentId: this.uid })
          .then(_ => this.BackToList(0))
      }
    },

    async CommitCase (to = '') {
      if (this.processing || this.editingSection) {
        return
      }

      await this.StoreCase(to.includes('temporary'))
        .then(() => {
          switch (to) {
            case 'new':
            case 'temporarynew':
              this.AnotherEdit(0)
              break
            case 'prev':
              if (this.prevUid !== 0) this.AnotherEdit(this.prevUid)
              break
            case 'next':
              if (this.nextUid !== 0) this.AnotherEdit(this.nextUid)
              break
            default:
              this.BackToList(Number(this.uid))
          }
        })
        .catch(e => {
          Popups.alert(e.message, this)
        })
    },

    async CancelEditing (to = '') {
      if (this.processing || this.editingSection) {
        return
      }

      if (this.preserve === JSON.stringify(this.CaseData) || await Popups.confirm('項目が編集中です.移動しますか?')) {
        switch (to) {
          case 'prev':
            if (this.prevUid !== 0) this.AnotherEdit(this.prevUid)
            break
          case 'next':
            if (this.nextUid !== 0) this.AnotherEdit(this.nextUid)
            break
          default:
            this.BackToList(Number(this.uid))
        }
      }
    },

    async StoreCase (temporary = false) {
      try {
        this.processing = true

        // データベース登録に用いるレコードドキュメントを生成
        const newDocument = {}
        Object.assign(newDocument, this.CaseData)

        // 連番 (新規ドキュメントのuidは0もしくは00があるのでNumberで処理する)
        newDocument.DocumentId = Number(this.uid)

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

        await this.$store.dispatch('UpsertDocument', newDocument)
      } finally {
        this.processing = false
      }
    },

    async EventListner (event) {
      if (this.editingSection || event.repeat) {
        return
      }

      if (this.$store.getters['system/Platform'] === 'darwin'
        ? (event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) // macOS - command
        : (event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) // Windows - Ctrl
      ) {
        switch (event.code) {
          case 'Digit0':
            this.$refs.edit.getElementsByTagName('input')[0].focus()
            break
          case 'Digit1':
            this.EditSection('diagnosis')
            break
          case 'Digit2':
            this.EditSection('procedure')
            break
          case 'Digit3':
            this.EditSection('AE')
            break
          case 'KeyJ':
            await this.CancelEditing('next')
            break
          case 'KeyK':
            await this.CancelEditing('prev')
            break
          case 'KeyU':
            await this.CancelEditing()
            break
          case 'KeyN':
            await this.CommitCase('new')
            break
          case 'KeyS':
          case 'Enter':
            event.preventDefault()
            await this.CommitCase()
            break
          case 'KeyX':
            await this.RemoveCase()
            break
        }
      } else if (this.$store.getters['system/Platform'] === 'darwin'
        ? (event.metaKey && event.shiftKey && !event.ctrlKey && !event.altKey) // macOS - command + shift
        : (event.ctrlKey && event.shiftKey && !event.metaKey && !event.altKey) // Windows - Ctrl + Shift
      ) {
        switch (event.code) {
          case 'Digit3':
            this.$refs.sectionAEs.$el.getElementsByTagName('label')[0].focus()
            break
          case 'KeyJ':
            await this.CommitCase('next')
            break
          case 'KeyK':
            await this.CommitCase('prev')
            break
          case 'KeyS':
            await this.CommitCase('temporary')
            break
        }
      }
    },
    BeforeUnloadLister (event) {
      if (this.processing) {
        event.preventDefault()
        event.returnValue = ''
        return false
      }
      if (this.preserve !== JSON.stringify(this.CaseData)) {
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
  display: flex
  flex-direction: row
  input[type="text"]
    width: 100%
  select
    width: 100%
    height: 2rem
  & > div
    display: flex
    flex-direction: column
    & > div
      display: flex
      flex-direction: row
      height: 2.4rem
    .label
      width: 40%
      text-align: right
      padding-top: 0.2rem
    .field
      margin-left: 2rem
      width: 60%
      .number
        width: 3rem

div.edit-top-left
  width: 40%
div.edit-top-right
  width: 60%

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
