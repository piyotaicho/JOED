<template>
  <div class="editview">
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
        @removeitem="RemoveListItem('手術診断', $event)"
        @addnewitem="OpenEditView('手術診断')" />

      <EditSectionProcedures
        :container.sync="CaseData.Procedures"
        @removeitem="RemoveListItem('実施手術', $event)"
        @addnewitem="OpenEditView('実施手術')" />

      <EditSectionAEs
        :container.sync="CaseData.AEs"
        :optionValue.sync="IsNoAEs"
        @removeitem="RemoveListItem('AE', $event)"
        @addnewitem="OpenEditView('AE')"/>
    </div>

    <!-- コントロールボタン群 -->
    <div class="edit-controls">
      <span @click="GoBack()"> [編集内容を破棄] </span>
      <span @click="CommitItem()"> [編集内容を保存] <span v-if="Validate">★</span></span>
      <span v-if="IsEditingExistingItem" @click="RemoveItem"> [このエントリを削除] </span>
      <span @click="CommitItemAndRenew()"> [保存して新規エントリを作成] </span>
    </div>

    <!--モーダルダイアログとしてルーティングを使用する-->
    <div>
      <router-view @data-upsert="EditListItem"></router-view>
    </div>
  </div>
</template>

<script>
// import draggable from 'vuedraggable'
import SelectionTree from '@/assets/ItemHandler'
import EditSectionDiagnoses from '@/components/EditSectionDiagnoses'
import EditSectionProcedures from '@/components/EditSectionProcedures'
import EditSectionAEs from '@/components/EditSectionAEs'
import InputProcedureTime from '@/components/InputProcedureTime'
import InputDateOfProcedure from '@/components/InputDateOfProcedure'
import InputTextField from '@/components/InputTextField'
import { ZenToHan } from '@/assets/ZenHanChars'

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
      Navigation: {
        View: {
          手術診断: 'diagnosis',
          実施手術: 'procedure',
          AE: 'AE'
        },
        Target: {
          手術診断: 'Diagnoses',
          実施手術: 'Procedures',
          AE: 'AEs'
        }
      }
    })
  },
  created () {
    if (this.uid > 0) {
      // 既存データの編集なのでデータベースからフィールドをコピーする
      const item = this.$store.getters.GetItemObject(this.uid)
      for (var key in this.CaseData) {
        if (item[key] !== undefined) {
          if (
            toString.call(item[key]) === '[object Object]' ||
            toString.call(item[key]) === '[object Array]'
          ) {
            Object.assign(this.CaseData[key], item[key])
          } else {
            this.CaseData[key] = item[key]
          }
        }
      }
    }
  },
  computed: {
    Validate () {
      const BasicInformations = this.CaseData.Age > 0 &&
        !!this.CaseData.InstitutionalPatientId.trim() &&
        !!this.CaseData.DateOfProcedure &&
        !!this.CaseData.ProcedureTime &&
        this.CaseData.Diagnoses.length > 0 &&
        this.CaseData.Procedures.length > 0
      const AEAdequacy = (!this.CaseData.PresentAE && !this.CaseData.AEs.length > 0) ||
        (this.CaseData.PresentAE && this.CaseData.AEs.length > 0)
      return BasicInformations && AEAdequacy
    },
    IsNoAEs: {
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
    IsObjectEmpty (value) {
      return ((typeof (value) === 'string' && value === '') ||
              (typeof (value) === 'object' && Object.keys(value).length === 0))
    },
    EditListItem (target, index, value) {
      if (this.Navigation.Target[target]) {
        this.ManipulateList(
          this.CaseData[this.Navigation.Target[target]],
          index, value
        )
        if (target === 'AE') {
          this.CaseData.PresentAE = (this.CaseData.AEs.length > 0)
        }
      }
    },
    RemoveListItem (target, index) {
      this.EditListItem(target, index, '')
    },
    OpenEditView (target, index = -1, value = {}) {
      if (this.Navigation.View[target]) {
        this.$router.push({
          name: this.Navigation.View[target],
          params: {
            ItemIndex: index,
            ItemValue: value
          }
        })
      }
    },
    ManipulateList (ListObject, index, value) {
      if (Array.isArray(ListObject)) {
        if (index >= 0) {
          if (ListObject[index] !== undefined) {
            // 空データが与えられた場合は当該インデックスを削除
            if (this.IsObjectEmpty(value)) {
              ListObject.splice(index, 1)
            } else {
              // 実データが与えられた場合は当該インデックスの内容を置換する
              ListObject[index] = value
            }
          }
        } else {
          // インデックスがundefinedもしくは-1の場合は新規項目としてリストに追加する
          if (!this.IsObjectEmpty(value)) {
            ListObject.push(value)
          }
        }
      }
    },
    GoBack () {
      this.$router.push({ name: 'list' })
    },
    RemoveItem () {
      this.DoRemoveItem() &&
      this.GoBack()
    },
    CommitItem () {
      this.DoCommitItem() &&
      this.GoBack()
    },
    CommitItemAndRenew () {
      // this.DoCommitItem()
      this.$router.go({ name: 'edit', params: { uid: 0 } })
    },
    DoRemoveItem () {
      if (this.uid > 0) {
        this.$store.dispatch('RemoveItemFromDatastore', { SequentialId: this.uid })
        return true
      }
      return false
    },
    DoCommitItem () {
      if (this.Validate) {
        var payload = {}
        Object.assign(payload, this.CaseData)
        // SequentialIdの設定、0は新規レコード
        payload.SequentialId = Number(this.uid)

        // テキストフィールドの整形
        payload.Name = payload.Name.trim()

        payload.InstitutionalPatientId = ZenToHan(payload.InstitutionalPatientId.trim()).replace(/[^\d\w-&]/g, '')

        if (payload.JSOGId.trim() === '') {
          delete payload.JSOGId
        } else {
          payload.JSOGId = ZenToHan(payload.JSOGId.trim())
        }

        if (payload.NCDId.trim() === '') {
          delete payload.NCDId
        } else {
          payload.NCDId = ZenToHan(payload.NCDId.trim())
        }

        // AEsが空白の際は削除
        if (payload.AEs.length === 0) {
          delete payload.AEs
        }

        // 区分コードの抽出
        payload.TypeOfProcedure = SelectionTree.getItemChain(payload.Procedures[0])[0]

        this.$store.dispatch('UpsertItemInDatastore', payload)

        return true
      }
      return false
    }
    // end of methods
  }
}
</script>

<style lang="sass">
div.editview
  position: relative
  width: 800px
  top: 50%
  background-color: ivory
  Text-align: left
  margin-left: 48px
  padding: 14px 20px
  border: black 1px solid
  border-radius: 5px
  div.edit-top
    display: flex
    justify-content: space-around
    /* 左側のペイン */
    div.edit-top-left
      width: 320px
      div
        display: flex
        height: 2.4em
        div
          display: block
        div:nth-child(1)
          width: 100px
          text-align: right
          line-height: 100%
        div:nth-child(2)
          vertical-align: middle
          width: 220px
          padding-left: 20px
          line-height: 100%
    /* 右側のペイン */
    div.edit-top-right
      width: 400px
      div
        display: flex
        height: 2.4em
        div
          display: block
        div:nth-child(1)
          width: 180px
          text-align: right
        div:nth-child(2)
          width: 220px
          padding-left: 20px
    input
      width: 200px
      height: 1.5em
    input.half
      width: 100px
    select
      width: 200px
      font-size: 100%
      height: 2em
      padding: 0
      margin-top: auto
      margin-bottom: auto

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
