<template>
  <div class="editview">
    <div class="edit-top">
      <div class="edit-top-left">
        <div>
          <div><span class="required">手術日</span></div>
          <div>
            <input type="date"
              v-model="CaseData.DateOfProcedure"
              placeholder="手術日"
              v-bind:class="(!CaseData.DateOfProcedure)?'vacant':''"/>
          </div>
        </div>
        <div>
          <div><span class="required">患者ID</span></div>
          <div>
            <input type="Text"
              v-model="CaseData.InstitutionalPatientId"
              inputmode="tel"
              placeholder="施設での患者ID"
              v-bind:class="(!CaseData.InstitutionalPatientId)?'vacant':''"/>
          </div>
        </div>
        <div>
          <div><span class="required">患者名</span></div>
          <div>
            <input type="Text"
              v-model="CaseData.Name"
              inputmode="kana-name"
              placeholder="患者名"
              v-bind:class="(!CaseData.Name)?'vacant':''"/>
          </div>
        </div>
        <div>
          <div><span class="required">手術時間</span></div>
          <div>
            <select v-model="CaseData.ProcedureTime"
              v-bind:class="(!CaseData.ProcedureTime)?'vacant':''">
              <option value="" disabled style="'display:none;">手術所要時間</option>
              <option v-for="(item,key,index) in ProcedureTimeSelections"
                v-bind:key="index"
                v-bind:value="item">
                {{item}}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div class="edit-top-right">
        <div>
          <div><span>腫瘍登録番号</span></div>
          <div><input type="Text" v-model="CaseData.JSOGId" inputmode="verbatim" placeholder="日産婦腫瘍登録番号" /></div>
        </div>
        <div>
          <div><span>NCD症例識別コード</span></div>
          <div><input type="Text" v-model="CaseData.NCDId" inputmode="verbatim" placeholder="ロボット支援下手術症例コード" /></div>
        </div>
        <div>
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
              v-bind:class="(!CaseData.Age)?'vacant':''"/>
            </div>
        </div>
      </div>
    </div>
    <div class="edit-bottom">
      <div class="section">
        <span class="section-title">手術診断 :</span>
        <draggable tag="ul" handle=".handle" v-model="CaseData.Diagnoses">
          <li v-for="(item, index) in CaseData.Diagnoses" v-bind:key="index">
            <span class="handle">[ = ] </span>
            <span> {{ItemValue(item)}} </span>
             <span class="edit-button" v-on:click="OpenEditView('手術診断', index, item)"> [EDIT] </span>
          </li>
        </draggable>
        <span class="new-entry-button" v-on:click="OpenEditView('手術診断')"></span>
      </div>
      <div class="section">
        <span class="section-title">実施手術 :</span>
        <draggable tag="ul" handle=".handle" v-model="CaseData.Procedures">
          <li v-for="(item, index) in CaseData.Procedures" v-bind:key="index">
            <span class="handle">[ = ] </span>
            <span> {{ItemValue(item)}} </span>
            <span class="edit-button" v-on:click="OpenEditView('実施手術', index, item)"> [EDIT] </span>
          </li>
        </draggable>
        <span class="new-entry-button" v-on:click="OpenEditView('実施手術')"></span>
      </div>
      <div class="section">
        <span class="section-title">合併症 :</span>
        <span><label><input type="checkbox" v-model="IsNoAEs">合併症なし</label></span>
        <draggable tag="ul" handle=".handle" v-model="CaseData.AEs">
          <li v-for="(item, index) in CaseData.AEs" v-bind:key="index">
            <span class="handle"> [ = ] </span>
            <span> {{item.Category}} </span>
            <span>Grade : {{item.Grade}} </span>
            <span class="edit-button" v-on:click="OpenEditView('AE', index, item)"> [EDIT] </span>
          </li>
        </draggable>
        <span class="new-entry-button" v-on:click="OpenEditView('AE')"></span>
      </div>
    </div>
    <!-- コントロールボタン群 -->
    <div class="edit-controls">
      <span v-on:click="GoBack()"> [編集内容を破棄] </span>
      <span v-on:click="CommitItem()"> [編集内容を保存] <span v-if="Validate">★</span></span>
      <span v-if="IsEditingExistingItem" v-on:click="RemoveItem"> [このエントリを削除] </span>
      <span v-on:click="CommitItemAndRenew()"> [保存して新規エントリを作成] </span>
    </div>
    <!--モーダルダイアログとしてルーティングを使用する-->
    <div>
      <router-view v-on:data-upsert="EditListItem"></router-view>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import SelectionTree from '@/views/ItemHandler'

export default {
  name: 'ViewEditItem',
  components: {
    draggable
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
      var Item = this.$store.getters.GetItemObject(this.uid)
      for (var key in this.CaseData) {
        if (Item[key] !== undefined) {
          if (
            toString.call(Item[key]) === '[object Object]' ||
            toString.call(Item[key]) === '[object Array]'
          ) {
            Object.assign(this.CaseData[key], Item[key])
          } else {
            this.CaseData[key] = Item[key]
          }
        }
      }
    }
  },
  computed: {
    ProcedureTimeSelections () {
      return [ // 今だけハードコード！最終的にはjsへ
        '～  30分まで',
        '30分以上 － 60分まで',
        '60分以上 － 90分まで',
        '90分以上 － 120分まで',
        '120分以上 － 150分まで',
        '150分以上 － 180分まで',
        '180分以上 － 210分まで',
        '210分以上 － 240分まで',
        '240分以上 － 270分まで',
        '270分以上 － 300分まで',
        '300分以上 － 330分まで',
        '330分以上 － 360分まで',
        '360分以上 － 420分まで',
        '420分以上 － 480分まで',
        '480分以上'
      ]
    },
    Validate () {
      var InputCheck = !!this.CaseData.Name.trim() &&
        this.CaseData.Age > 0 &&
        !!this.CaseData.InstitutionalPatientId.trim() &&
        !!this.CaseData.DateOfProcedure &&
        !!this.CaseData.ProcedureTime &&
        this.CaseData.Diagnoses.length > 0 &&
        this.CaseData.Procedures.length > 0
      var AEAdequacy = (!this.CaseData.PresentAE && !this.CaseData.AEs.length > 0) ||
        (this.CaseData.PresentAE && this.CaseData.AEs.length > 0)
      return InputCheck && AEAdequacy
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
    ItemValue (item) {
      /* var GetTextInHash = (h = {}) => {
      // ハッシュを辿って Text のkeyをもつ最初の値を返す
        if (h.Text) {
          return h.Text
        } else {
          for (var i in h) {
            return GetTextInHash(h[i])
          }
          return ''
        }
      } */
      return SelectionTree.getPropertyValue(item)
    },
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
        this.$store.dispatch('RemoveItemFromDatastore', { SqeuentialId: this.uid })
        return true
      }
      return false
    },
    DoCommitItem () {
      if (this.Validate) {
        var payload = {}
        Object.assign(payload, this.CaseData)
        // SqeuentialIdの設定、0は新規レコード
        payload.SqeuentialId = this.uid

        // テキストフィールドの整形
        payload.Name = payload.Name.trim()

        payload.InstitutionalPatientId = payload.InstitutionalPatientId
          .trim()
          .replace(/[ーｰ～]/g, '-')
          .replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
          .replace(/[^\d\w-&]/g, '')

        if (payload.JSOGId.trim() === '') {
          delete payload.JSOGId
        } else {
          payload.JSOGId = payload.JSOGId.trim()
            .replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
        }

        if (payload.NCDId.trim() === '') {
          delete payload.NCDId
        } else {
          payload.NCDId = payload.NCDId.trim()
            .replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
        }

        // AEsが空白の際は削除
        if (payload.AEs.length === 0) {
          delete payload.AEs
        }

        // 区分コードの抽出
        payload.TypeOfProcedure = Object.keys(payload.Procedures[0])[0]

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
  margin: auto auto
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
  div.edit-bottom
    div.section
      position: relative
      background: white
      width: 800px
      min-height: 48px
      margin-top: 21px
      border: 1px solid black
      span.new-entry-button
        position: absolute
        right: 4px
        bottom: 4px
        width: 40px
        height: 40px
        background: url('../assets/icon-add.png')
      li
        position: relative
        background: #eeeeee
        line-height: 1.5
        padding: 0.5em
        margin-right: 48px
        margin-bottom: 2px
        list-style: none
        span.handle
          margin-left: 12px
          margin-right: 18px
        span.edit-button
          position: absolute
          right: 20px
          margin-top: auto
          margin-bottom: auto
      span.section-title
        margin: 4px
        font-size: 120%
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
