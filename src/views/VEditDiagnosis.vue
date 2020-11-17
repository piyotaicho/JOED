<template>
  <TheWrapper alpha="10">
    <div class="edititem" @keydown.ctrl.enter.prevent.capture="CommitChanges()" @keydown.ctrl.w.capture="GoBack()">
      <ThreePaneSelections
        Pane3Title="候補病名"
        :Pane1.sync="Category" :Pane1Items="Categories"
        @pane1change="CategoryIsChanged()"
        :Pane2.sync="TargetOrgan" :Pane2Items="TargetOrgans"
        @pane2change="SetCandidateItemsBySelection()"
        :Pane3.sync="SelectedItem" :Pane3Items="CandidateItems"
        @pane3change="OnCandidateSelected()"
        @pane3dblclick="CommitChanges()"
      >
      </ThreePaneSelections>

      <FreewordSection
        v-model="EditableItem"
        :disabled="!UserEditingAllowed"
        @click-search="SetCandidateItemsByFreeword"/>

      <div class="content-bottom">
        <div class="controls">
          <el-button type="primary" @click="GoBack">取り消し</el-button>
          <el-button type="primary" @click="CommitChanges">登録</el-button>
        </div>
      </div>
    </div>
  </TheWrapper>
</template>

<script>
import EditItemMixins from '@/mixins/EditItemMixins'
import DiagnosisMaster from '@/modules/Masters/DiagnosisItemList'
import { getMatchesInDiagnoses } from '@/modules/CloseMatches'
import * as Popups from '@/modules/Popups'

import TheWrapper from '@/components/Atoms/TheWrapper'
import ThreePaneSelections from '@/components/Molecules/3PaneSelections'
import FreewordSection from '@/components/Molecules/FreewordSection'

const DiagnosesTree = new DiagnosisMaster()

export default {
  data () {
    return {
      CandidateItems: []
    }
  },
  mixins: [
    EditItemMixins
  ],
  components: {
    TheWrapper,
    ThreePaneSelections,
    FreewordSection
  },
  created () {
    if (this.ItemValue.UserTyped && this.ItemValue.UserTyped === true) {
      this.Category = this.ItemValue.Chain[0]
      this.TargetOrgan = this.ItemValue.Chain[1] ? this.ItemValue.Chain[1] : ''
      this.EditableItem = this.ItemValue.Text
      this.$nextTick()
    }
  },
  computed: {
    Categories () {
      return DiagnosesTree.Categories()
    },
    TargetOrgans () {
      return DiagnosesTree.Targets(this.Category)
    }
  },
  methods: {
    OnCandidateSelected () {
      const newValue = this.SelectedItem
      if (newValue) {
        this.EditableItem = newValue

        if (!this.TargetOrgan) {
          const searchByName = DiagnosesTree.findItemByName(newValue, this.year)
          this.TargetOrgan = searchByName.Chain[1]
        }
      }
    },

    SetCandidateItemsBySelection () {
      this.CandidateItems = DiagnosesTree.Candidates(this.Category, this.TargetOrgan, this.year)
      this.SelectedItem = ''
      this.$nextTick()
    },
    SetCandidateItemsByFreeword () {
      if (this.EditableItem && this.UserEditingAllowed) {
        const flatten = DiagnosesTree.getItemsInCategory(this.Category, this.year)
        const arr = getMatchesInDiagnoses(this.EditableItem, flatten)
        this.CandidateItems.splice(0, this.CandidateItems.length, ...arr)
        this.$nextTick()
      }
    },
    async CommitChanges () {
      const temporaryItem = {}
      if (this.IsItemEdited) {
        this.SetCandidateItemsByFreeword()
        if (this.CandidateItems.length !== 0 && await Popups.confirm('候補診断名があります,選択を優先してください.') === false) return
        if (await Popups.confirm('直接入力した診断名の登録は可能な限り控えてください.') === false) return
        Object.assign(temporaryItem,
          {
            Text: this.TrimmedEditableItem,
            Chain: [this.Category],
            UserTyped: true
          }
        )
      } else {
        if (!this.SelectedItem) {
          return
        }
        Object.assign(temporaryItem,
          {
            Text: this.SelectedItem,
            Chain: [this.Category, this.TargetOrgan]
          }
        )
      }
      this.$emit('data-upsert', 'Diagnoses', this.ItemIndex, temporaryItem)
      this.GoBack()
    }
  }
}
</script>
