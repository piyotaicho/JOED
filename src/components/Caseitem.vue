<template>
  <div class="caseitem">
    <AtomCaseCategoryIdentifier v-bind:category="CaseCategory"></AtomCaseCategoryIdentifier>
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
        <span class="w20" v-bind:class="CaseNotification?'caution-badge':''"> {{CaseNotification}} </span>
      </div>
    </div>
    <div class="caseitem-controller">
      <span v-on:click="MoveToEditView()"> [EDIT] </span>
      <span> [REMOVE] </span>
    </div>
  </div>
</template>

<script>
import AtomCaseCategoryIdentifier from '@/components/Atoms/AtomCaseCategoryIdentifier'

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
      return this.GetTextPropInHash(this.$ItemDocument.Diagnoses[0])
    },
    CaseProcedure () {
      return this.GetTextPropInHash(this.$ItemDocument.Procedures[0])
    },
    CaseNotification () {
      return this.$ItemDocument.PresentAE ? '合併症あり' : ''
    }
  },
  methods: {
    GetTextPropInHash (hash = {}) {
      if (hash.Text) {
        return hash.Text
      } else {
        for (var i in hash) {
          return this.GetTextPropInHash(hash[i])
        }
        return ''
      }
    },
    MoveToEditView () {
      this.$router.push({ name: 'edit', params: { uid: this.uid } })
    }
  },
  components: {
    AtomCaseCategoryIdentifier
  }
}
</script>
