<template>
  <div class="caseitem" @dblclick="MoveToEditView()">
    <AtomCaseCategoryIdentifier :category="CaseCategory"></AtomCaseCategoryIdentifier>
    <div class="caseitem-description">
      <div class="caseitem-row">
        <span class="w20"> {{CaseDate}} </span>
        <span class="w20"> {{CasePersonalInformation.Id}} </span>
        <span class="w40"> {{CasePersonalInformation.Name}} </span>
        <span class="w20"> ( {{CasePersonalInformation.Age}}歳 ) </span>
      </div>
      <div class="caseitem-row">
        <span class="w40"> {{CaseDiagnosis}} </span>
        <span class="w40"> {{CaseProcedure}} </span>
        <span class="w20" :class="CaseNotification?'caution-badge':''"> {{CaseNotification}} </span>
      </div>
    </div>
    <div class="caseitem-controller">
      <span @click="MoveToEditView()"> [EDIT] </span>
      <span> [REMOVE] </span>
    </div>
  </div>
</template>

<script>
import AtomCaseCategoryIdentifier from '@/components/Atoms/AtomCaseCategoryIdentifier'
import SelectionTree from '@/assets/ItemHandler'

export default {
  name: 'Caseitem',
  props: {
    uid: {
      type: [Number, String],
      required: true
    }
  },
  data () {
    return {}
  },
  computed: {
    $ItemDocument () {
      return this.$store.getters.GetItemObject(this.uid)
    },
    CaseCategory () {
      return this.$ItemDocument.TypeOfProcedure
    },
    CaseDate () {
      return this.$ItemDocument.DateOfProcedure
    },
    CasePersonalInformation () {
      return {
        Id: this.$ItemDocument.InstitutionalPatientId,
        Name: this.$ItemDocument.Name,
        Age: this.$ItemDocument.Age
      }
    },
    CaseDiagnosis () {
      return SelectionTree.getItemValue(this.$ItemDocument.Diagnoses[0])
    },
    CaseProcedure () {
      return SelectionTree.getItemValue(this.$ItemDocument.Procedures[0])
    },
    CaseNotification () {
      return this.$ItemDocument.PresentAE ? '合併症あり' : ''
    }
  },
  methods: {
    MoveToEditView () {
      this.$router.push({ name: 'edit', params: { uid: this.uid } })
    }
  },
  components: {
    AtomCaseCategoryIdentifier
  }
}
</script>
