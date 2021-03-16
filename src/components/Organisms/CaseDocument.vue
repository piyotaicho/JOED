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

<script>
import CategoryIdentifier from '@/components/Atoms/CaseCategoryIdentifier'
import * as Popups from '@/modules/Popups'
import CaseDocumentHandler from '@/modules/DbItemHandler'

export default {
  name: 'CaseDocument',
  props: {
    uid: {
      required: true
    }
  },
  data () {
    return {
      Loading: true
    }
  },
  mounted () {
    if (this.uid > 0) {
      this.$store
        .dispatch('FetchDocument', { DocumentId: this.uid })
        .then(_ => {
          this.Loading = false
          this.$nextTick()
        })
        .catch(e => e)
    }
  },
  computed: {
    ItemDocument () {
      return this.Loading ? {} : this.$store.getters.CaseDocument(this.uid)
    },
    Category () {
      return this.Loading ? '' : this.ItemDocument.TypeOfProcedure
    },
    DateOfProcedure () {
      return this.Loading ? '' : this.ItemDocument.DateOfProcedure
    },
    PersonalInformation () {
      return this.Loading
        ? {
            Id: '',
            Name: 'データを取得中',
            Age: ''
          }
        : {
            Id: this.ItemDocument.PatientId,
            Name: this.ItemDocument.Name ? this.ItemDocument.Name : '',
            Age: this.ItemDocument.Age ? '( ' + Number(this.ItemDocument.Age) + '歳 )' : ''
          }
    },
    Diagnosis () {
      return this.Loading ? '' : CaseDocumentHandler.ItemValue(this.ItemDocument.Diagnoses[0])
    },
    Procedure () {
      return this.Loading ? '' : CaseDocumentHandler.ItemValue(this.ItemDocument.Procedures[0])
    },
    PresentAE () {
      return !this.Loading && this.ItemDocument.PresentAE
    },
    Notification () {
      return !this.Loading && this.ItemDocument.Notification
    }
  },
  methods: {
    MoveToEditView () {
      if (!this.Loading) {
        this.$router.push({ name: 'edit', params: { uid: this.uid } })
      }
    },
    RemoveDocumentKeypress (event) {
      if (!event.repeat) {
        if (this.$store.getters['system/Platform'] === 'darwin'
          ? (event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) // macOS - command
          : (event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) // Windows - Ctrl
        ) {
          this.RemoveDocument()
        }
      }
    },
    async RemoveDocument () {
      if (await Popups.confirm('この症例を削除します.よろしいですか?')) {
        this.Loading = true
        this.$store.dispatch('RemoveDocument', { DocumentId: this.uid })
      }
    }
  },
  components: {
    CategoryIdentifier
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
