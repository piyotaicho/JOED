<template>
  <div>
    <div class="app-dialog w800p">
      <div class="edit-top">
        <div class="edit-top-left">
          <InputDateOfProcedure v-model="CaseData.DateOfProcedure" :required="true"/>
          <InputTextField title="患者ID" :required="true" v-model="CaseData.PatientId" placeholder="施設の患者ID"/>
          <InputTextField title="患者名" v-model="CaseData.Name"/>
          <InputNumberField title="年齢" v-model="CaseData.Age" :min="1" :max="120"/>
        </div>
        <div class="edit-top-right">
          <InputTextField title="腫瘍登録番号" v-model="CaseData.JSOGId" placeholder="腫瘍登録患者No." :disabled="skipJSOGId"/>
          <InputTextField title="NCD症例識別コード" v-model="CaseData.NCDId" placeholder="NCD症例識別コード" :disabled="skipNCDId"/>
          <div> <!-- spacer -->
          </div>
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
        :container.sync="CaseData.AEs"
        :optionValue.sync="isNoAEs"
        @addnewitem="EditSection('AE')"
        @removeitem="RemoveListItem('AEs', $event)"
      />

      <!-- Controles -->
      <el-button icon="el-icon-caret-left" size="medium" circle id="MovePrev"
        v-if="isEditingExistingItem"
        :disabled="!prevUid"
        @click.exact="CancelEditing(-1)"
        @click.ctrl.shift="CommitCaseAndGo('prev')" />
      <el-button icon="el-icon-caret-right" size="medium" circle id="MoveNext"
        v-if="isEditingExistingItem"
        :disabled="!nextUid"
        @click.exact="CancelEditing(+1)"
        @click.ctrl.shift="CommitCaseAndGo('next')" />

      <div class="edit-controls">
        <div class="edit-controls-left">
          <el-button type="warning" icon="el-icon-warning" @click="ShowNotification"
            v-if="CaseData.Notification">
            入力内容の確認が必要です.
          </el-button>
        </div>
        <div class="edit-controls-right">
          <div>
            <el-button type="primary" icon="el-icon-arrow-left" @click="CancelEditing()">戻る</el-button>
          </div>
          <div>
            <el-dropdown split-button type="primary" @click="CommitCaseAndGo()" @command="CommitCaseAndGo">
              編集内容を保存<i class="el-icon-loading" v-if="processing"/>

              <el-dropdown-menu slot="dropdown">
                <template v-if="isEditingExistingItem">
                  <el-dropdown-item command="next" :disabled="!nextUid">保存して次へ</el-dropdown-item>
                  <el-dropdown-item command="prev" :disabled="!prevUid">保存して前へ</el-dropdown-item>
                </template>
                <el-dropdown-item command="new">保存して新規作成</el-dropdown-item>
              </el-dropdown-menu>

            </el-dropdown>
          </div>
          <div v-if="isEditingExistingItem">
            <el-button type="danger" icon="el-icon-delete" @click="RemoveCase()">削除</el-button>
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
import Popups from 'depmodules/Popups'
import { ValidateCase } from '@/modules/CaseValidater'

export default {
  name: 'ViewEditCase',
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
        UniqueID: undefined,
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
      Preserve: ''
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
          for (var key in this.CaseData) {
            if (casedocument !== undefined && casedocument[key] !== undefined) {
              switch (toString.call(casedocument[key])) {
                case '[object Object]':
                  this.CaseData[key] = Object.assign(this.CaseData[key], casedocument[key])
                  break
                case '[object Array]':
                  casedocument[key].forEach(item => this.CaseData[key].push(item))
                  break
                default:
                  this.CaseData[key] = casedocument[key]
              }
            }
          }
          this.Preserve = JSON.stringify(this.CaseData)

          this.processing = false
          this.prevUid = this.$store.getters.NextUids(this.uid).Prev
          this.nextUid = this.$store.getters.NextUids(this.uid).Next
        })
    } else {
      this.processing = false
      this.Preserve = JSON.stringify(this.CaseData)
    }
  },
  computed: {
    isNoAEs: {
      get () {
        return !this.CaseData.PresentAE
      },
      set (newvalue) {
        this.CaseData.PresentAE = !newvalue
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
    BackToList (uid = Number(this.uid)) {
      if (uid === 0) {
        this.$router.push({ name: 'list' })
      } else {
        this.$router.push({ name: 'list', hash: ('#case-' + uid) })
      }
    },
    GoAnotherEdit (uid) {
      if (uid > 0) {
        this.$router.push({ name: 'edit', params: { uid: uid } })
      }
      if (uid === 0) {
        this.$router.push({ name: 'edit', params: { uid: (this.uid === '0') ? '00' : '0' } })
      }
    },

    EditSection (target, params = {}) {
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
      Popups.information(this.CaseData.Notification)
    },

    EditListItem (target, index, value) {
      this.UpdateList(this.CaseData[target], index, value)
      if (target === 'AEs') {
        this.CaseData.PresentAE = (this.CaseData.AEs.length > 0)
      }
    },
    RemoveListItem (target, index) {
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

    RemoveCase () {
      if (this.uid > 0 && Popups.confirm('この症例を削除します.よろしいですか?')) {
        this.$store.dispatch('RemoveDocument', { DocumentId: this.uid })
          .then(_ => this.BackToList(0))
      }
    },

    CommitCaseAndGo (to = '') {
      if (this.processing) {
        return
      }
      // HACK:
      // 新規(uid = '0')→新規(uid = '0')ではApp.vueで定義したRouterKeyが重複するための quick hack.
      // uid = '00' も uid > 0 がfalseで新規扱いになるのでそれを利用する.
      this.StoreCase()
        .then(() => {
          switch (to) {
            case 'new':
              this.GoAnotherEdit(0)
              break
            case 'prev':
              if (this.prevUid !== 0) this.GoAnotherEdit(this.prevUid)
              break
            case 'next':
              if (this.nextUid !== 0) this.GoAnotherEdit(this.nextUid)
              break
            default:
              this.BackToList()
          }
        })
        .catch(e => Popups.alert(e.message))
    },
    CancelEditing (offset = 0) {
      if (this.Preserve === JSON.stringify(this.CaseData) || Popups.confirm('編集中の項目がありますがよろしいですか?')) {
        if (offset === 0) {
          this.BackToList(this.uid)
        } else {
          if (offset < 0 && this.prevUid !== 0) {
            this.$router.push({ name: 'edit', params: { uid: this.prevUid } })
          }
          if (offset > 0 && this.nextUid !== 0) {
            this.$router.push({ name: 'edit', params: { uid: this.nextUid } })
          }
        }
      }
    },

    async StoreCase () {
      this.processing = true

      // データベース登録に用いるドキュメントを生成
      const newDocument = {}
      Object.assign(newDocument, this.CaseData)

      // 連番 (新規ドキュメントのuidは0もしくは00があるのでNumberで処理する)
      newDocument.DocumentId = Number(this.uid)

      // 警告の削除
      delete newDocument.Notification

      // テキストフィールドの整形(trimと半角英数に置換)
      newDocument.Name = newDocument.Name.trim()
      newDocument.PatientId = ZenToHan(newDocument.PatientId.trim()).replace(/[^\d\w-&]/g, '')

      if (newDocument.JSOGId.trim() === '') {
        delete newDocument.JSOGId
      } else {
        newDocument.JSOGId = ZenToHan(newDocument.JSOGId.trim())
      }
      if (newDocument.NCDId.trim() === '') {
        delete newDocument.NCDId
      } else {
        newDocument.NCDId = ZenToHan(newDocument.NCDId.trim())
      }

      // AEsが空白の際は削除
      if (newDocument.AEs.length === 0) {
        delete newDocument.AEs
      }

      // 区分コードの抽出
      newDocument.TypeOfProcedure = newDocument.Procedures[0] && newDocument.Procedures[0].Chain[0]

      try {
        await ValidateCase(newDocument)
        await this.$store.dispatch('UpsertDocument', newDocument)
      } finally {
        this.processing = false
      }
    }
  }
}
</script>

<style lang="sass">
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

div.vdp-datepicker__calendar
  width: 300px !important
  z-index: 900
/* セクション系ペイン */
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
