<template>
  <div class="app-dialog w800p">
    <div class="edit-top">
      <div class="edit-top-left">
        <InputDateOfProcedure v-model="CaseData.DateOfProcedure" />
        <InputTextField title="患者ID" :required="true" v-model="CaseData.InstitutionalPatientId" placeholder="施設の患者ID"/>
        <InputTextField title="患者名" v-model="CaseData.Name" />
        <InputProcedureTime v-model="CaseData.ProcedureTime" />
      </div>
      <div class="edit-top-right">
        <InputTextField title="腫瘍登録番号" v-model="CaseData.JSOGId" placeholder="日産婦腫瘍登録番号" />
        <InputTextField title="NCD症例識別コード" v-model="CaseData.NCDId" placeholder="ロボット支援下手術症例コード" />
        <div> <!-- spacer -->
          <div></div>
          <div></div>
        </div>
        <div>
          <div><span class="required">年齢</span></div>
          <div>
            <input type="number"
              min="1"
              v-model="CaseData.Age"
              class="half"
              :class="(!CaseData.Age)?'vacant':''"/>
            </div>
        </div>
      </div>
    </div>
    <div class="edit-bottom">
      <EditSectionDiagnoses
        :container.sync="CaseData.Diagnoses"
        @addnewitem="OpenEditView('diagnosis')"
        @edititem="OpenEditView('diagnosis', $event)"
        @removeitem="RemoveListItem('Diagnoses', $event)"
        @validate="setValidationStatus(0, $event)" />

      <EditSectionProcedures
        :container.sync="CaseData.Procedures"
        @addnewitem="OpenEditView('procedure')"
        @edititem="OpenEditView('diagnosis', $event)"
        @removeitem="RemoveListItem('Procedures', $event)"
        @validate="setValidationStatus(1, $event)" />

      <EditSectionAEs
        :container.sync="CaseData.AEs"
        :optionValue.sync="isNoAEs"
        @addnewitem="OpenEditView('AE')"
        @removeitem="RemoveListItem('AEs', $event)"
        @validate="setValidationStatus(2, $event)" />
    </div>

    <!-- コントロールボタン群 -->
    <div class="edit-controls">
      <span v-if="IsEditingExistingItem" id="MovePrev" @click="CancelEditing(-1)">[←] </span>
      <span @click="CancelEditing()"> [編集内容を破棄] </span>
      <span @click="CommitItem()"> [編集内容を保存] </span>
      <span v-if="IsEditingExistingItem" @click="RemoveItem()"> [このエントリを削除] </span>
      <span @click="CommitItemAndRenew()"> [保存して新規エントリを作成] </span>
      <span v-if="IsEditingExistingItem" id="MoveNext" @click="CancelEditing(+1)">[→]</span>
    </div>

    <!--モーダルダイアログとしてルーティングを使用する-->
    <div>
      <router-view @data-upsert="EditListItem"></router-view>
    </div>
  </div>
</template>

<script>
import DbItems from '@/modules/DbItemHandler'
import EditSectionDiagnoses from '@/components/EditSectionDiagnoses'
import EditSectionProcedures from '@/components/EditSectionProcedures'
import EditSectionAEs from '@/components/EditSectionAEs'
import InputProcedureTime from '@/components/InputProcedureTime'
import InputDateOfProcedure from '@/components/InputDateOfProcedure'
import InputTextField from '@/components/InputTextField'
import { ZenToHan } from '@/modules/ZenHanChars'
import Popups from '@/modules/Popups'

export default {
  name: 'ViewEditItem',
  components: {
    InputProcedureTime,
    InputDateOfProcedure,
    InputTextField,
    EditSectionDiagnoses,
    EditSectionProcedures,
    EditSectionAEs
  },
  props: {
    uid: {
      type: [Number, String],
      required: true
    }
  },
  data () {
    return ({
      CaseData: {
        Name: '',
        Age: undefined,
        InstitutionalPatientId: '',
        JSOGId: '',
        NCDId: '',
        DateOfProcedure: '',
        ProcedureTime: '',
        TypeOfProcedure: '',
        PresentAE: true,
        Diagnoses: [],
        Procedures: [],
        AEs: []
      },
      ValidationStatus: [false, false, false],
      Nexts: [0, 0],
      Edited: false
    })
  },
  // DataStoreから既存データの読み込みをする.
  //
  // @prop {Number} SequentialId
  created () {
    if (this.uid > 0) {
      const item = this.$store.getters.GetItemObject(this.uid)
      for (var key in this.CaseData) {
        if (item[key] !== undefined) {
          if (
            toString.call(item[key]) === '[object Object]' ||
            toString.call(item[key]) === '[object Array]'
          ) {
            Object.assign(this.CaseData[key], item[key])
            this.$nextTick()
          } else {
            this.CaseData[key] = item[key]
          }
        }
      }
      this.Nexts.splice(0, 2, ...this.$store.getters.GetNextUids(this.uid))

      this.$nextTick(() => {
        this.Edited = false
      })
    }
  },
  watch: {
    CaseData: {
      handler: function () {
        this.Edited = true
      },
      deep: true
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
    IsEditingExistingItem () {
      return (this.uid > 0)
    }
  },
  methods: {
    OpenEditView (target, params = {}) {
      const index = params.ItemIndex !== undefined ? params.ItemIndex : -1
      const value = params.ItemValue || {}
      console.log('open edit:', target, index, value)
      this.$router.push({
        name: target,
        params: {
          ItemIndex: index,
          ItemValue: value
        }
      })
    },
    GoBack () {
      this.$router.push({ name: 'list' })
    },

    setValidationStatus (target, value) {
      this.ValidationStatus.splice(target, 1, value)
    },

    EditListItem (target, index, value) {
      this.ManipulateList(this.CaseData[target], index, value)
      if (target === 'AEs') {
        this.CaseData.PresentAE = (this.CaseData.AEs.length > 0)
      }
    },
    RemoveListItem (target, index) {
      this.EditListItem(target, index, '')
    },
    ManipulateList (ListObject, index, value) {
      const IsObjectEmpty = value =>
        (
          (typeof (value) === 'string' && value === '') ||
          (typeof (value) === 'object' && Object.keys(value).length === 0)
        )

      if (Array.isArray(ListObject)) {
        if (index >= 0) {
          if (ListObject[index] !== undefined) {
            // 空データが与えられた場合は当該インデックスを削除
            if (IsObjectEmpty(value)) {
              ListObject.splice(index, 1)
            } else {
              // 実データが与えられた場合は当該インデックスの内容を置換する
              ListObject.splice(index, 1, value)
            }
          }
        } else {
          // インデックスがundefinedもしくは-1の場合は新規項目としてリストに追加する
          if (!IsObjectEmpty(value)) {
            ListObject.push(value)
          }
        }
      }
    },

    CancelEditing (offset = 0) {
      const isEmpty =
        this.CaseData.DateOfProcedure === '' &&
        this.CaseData.InstitutionalPatientId.trim() === '' &&
        this.CaseData.Name.trim() === '' &&
        this.CaseData.ProcedureTime === '' &&
        this.CaseData.Age === undefined &&
        this.CaseData.Diagnoses.length === 0 &&
        this.CaseData.Procedures.length === 0 &&
        this.CaseData.AEs.length === 0 &&
        this.CaseData.PresentAE === true

      if (this.Edited === false || isEmpty || Popups.confirm('編集中の項目がありますがよろしいですか?')) {
        if (offset === 0) {
          this.GoBack()
        } else {
          if (offset < 0 && this.Nexts[0] !== 0) {
            this.$router.push({ name: 'edit', params: { uid: this.Nexts[0] } })
          }
          if (offset > 0 && this.Nexts[1] !== 0) {
            this.$router.push({ name: 'edit', params: { uid: this.Nexts[1] } })
          }
        }
      }
    },
    RemoveItem () {
      if (this.uid > 0) {
        this.$store.dispatch('RemoveItemFromDatastore', { SequentialId: this.uid })
        this.GoBack()
      }
    },
    CommitItem () {
      this.StoreItem()
        .then(() => this.GoBack())
        .catch(e => Popups.alert(e.message))
    },
    CommitItemAndRenew () {
      this.StoreItem().then(() =>
        this.$router.go({ name: 'edit', params: { uid: 0 } })
      )
    },

    async StoreItem () {
      try {
        const validateBasicInformations =
          this.CaseData.Age > 0 &&
          !!this.CaseData.InstitutionalPatientId.trim() &&
          !!this.CaseData.DateOfProcedure &&
          !!this.CaseData.ProcedureTime
        if (!validateBasicInformations) throw new Error('基本情報の入力が不足しています.')

        const Sections = ['手術診断', '実施手術', '合併症']
        for (const index in Sections) {
          if (!this.ValidationStatus[index]) throw new Error(Sections[index] + 'の入力を確認して下さい.')
        }

        const CategoryTranslator = {
          腹腔鏡: '腹腔鏡',
          ロボット: '腹腔鏡',
          腹腔鏡悪性: '腹腔鏡悪性',
          ロボット悪性: '腹腔鏡悪性',
          子宮鏡: '子宮鏡',
          卵管鏡: '卵管鏡'
        }
        const validateDiagnosisAndProcedure =
          this.CaseData.Diagnoses[0].Chain[0] === CategoryTranslator[this.CaseData.Procedures[0].Chain[0]] &&
          this.CaseData.Diagnoses[0].Chain[1] === this.CaseData.Procedures[0].Chain[1]
        if (!validateDiagnosisAndProcedure) throw new Error('主たる術後診断と主たる実施術式は同一カテゴリ・同一臓器である必要があります.')

        const newItemObject = {}
        Object.assign(newItemObject, this.CaseData)

        newItemObject.SequentialId = Number(this.uid)

        // テキストフィールドの整形
        newItemObject.Name = newItemObject.Name.trim()
        newItemObject.InstitutionalPatientId = ZenToHan(newItemObject.InstitutionalPatientId.trim()).replace(/[^\d\w-&]/g, '')

        if (newItemObject.JSOGId.trim() === '') {
          delete newItemObject.JSOGId
        } else {
          newItemObject.JSOGId = ZenToHan(newItemObject.JSOGId.trim())
        }
        if (newItemObject.NCDId.trim() === '') {
          delete newItemObject.NCDId
        } else {
          newItemObject.NCDId = ZenToHan(newItemObject.NCDId.trim())
        }

        // AEsが空白の際は削除
        if (newItemObject.AEs.length === 0) {
          delete newItemObject.AEs
        }

        // 区分コードの抽出
        newItemObject.TypeOfProcedure = DbItems.getItemChain(newItemObject.Procedures[0])[0]

        return this.$store.dispatch('UpsertItemInDatastore', newItemObject)
      } catch (error) {
        return Promise.reject(error)
      }
    }
  }
}
</script>

<style lang="sass">
div.edit-top
  display: flex
  flex-direction: row
  input
    width: 200px
    height: 1.5rem
  input.half
    width: 100px
  select
    width: 206px
    font-size: 100%
    height: 2rem
    padding: 2px
div.edit-top-left
  width: 40%
  div
    display: flex
    height: 2.4rem
    div:nth-child(1)
      width: 40%
      justify-content: flex-end
    div:nth-child(2)
      padding-left: 2rem
      width: 60%
div.edit-top-right
  width: 60%
  div
    display: flex
    height: 2.4rem
    div:nth-child(1)
      width: 40%
      justify-content: flex-end
    div:nth-child(2)
      padding-left: 2rem
      width: 60%

/* セクション系ペイン */
/* コントロール */
div.edit-controls
  position: relative
  display: flex
  justify-content: space-around
  padding-top: 16px
  padding-bottom: 8px
span.required:afrer
  content: "+"
.vacant
  border: red 1px solid
  padding: 2px
</style>
