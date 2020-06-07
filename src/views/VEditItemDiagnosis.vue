<template>
    <div class="edititem-overlay">
      <div class="edititem-overlay-content">
        <div class="content-title">
          <span>手術診断</span>
        </div>
        <div class="flex-content">
          <div class="w20 selectionbox">
            <div><span>[カテゴリ]</span></div>
            <select v-model="Category"
              size="8"
              @change="TargetOrgan = '', SelectedItem = ''">
              <option v-for="(item,key,index) in Categories"
                :key="index"
                :value="item">
                {{item}}
              </option>
            </select>
          </div>
          <div class="w20 selectionbox">
            <div><span>[対象臓器]</span></div>
            <select v-model="TargetOrgan"
              size="8"
              @change="SetCandidateItemsBySelection()">
              <option v-if="TargetOrgans.length===0" value=""/>
              <option v-for="(item,key,index) in TargetOrgans"
                :key="index"
                :value="item">
                {{item}}
              </option>
            </select>
          </div>
          <div class="w60 selectionbox">
            <div><span>[候補病名]</span></div>
            <select v-model="SelectedItem"
              size="8"
              @change="EditableItem = SelectedItem; ItemEdited = false"
              @dblclick="CommitChanges()">
              <option v-if="CandidateItems.length===0" value=""/>
              <option v-for="(item,key,index) in CandidateItems"
                :key="index"
                :value="item">
                {{item}}
              </option>
            </select>
          </div>
        </div>
        <div class="content-bottom">
          <div class="controls">
            <div class="w20">
              <span>入力病名 : </span>
            </div>
            <div class="w60">
              <input type="Text"
                v-model.lazy="EditableItem"
                :disabled="!UserEditingAllowed"
                @keydown.enter="SubmitOnEnterkey" />
            </div>
            <div class="w20" @click="SetCandidateItemsByFreeword()"> [SEARCH] </div>
          </div>
          <div>
            <span @click="GoBack"> [編集の取り消し] </span>
            <span @click="CommitChanges"> [編集内容の登録] </span>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import EditItemMixins from '@/mixins/EditItemMixins'
import DiagnosisTree from '@/modules/DiagnosisItemList'
import { getMatchesInDiagnoses } from '@/modules/CloseMatches'
// import Popups from '@/modules/Popups.js'

const DiagnosesTree = new DiagnosisTree()

export default {
  data () {
    return {
      CandidateItems: []
    }
  },
  mixins: [
    EditItemMixins
  ],
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
    },
    UserEditingAllowed () {
      return !!this.Category && !this.SelectedItem
    }
  },
  methods: {
    SetCandidateItemsBySelection () {
      this.CandidateItems = DiagnosesTree.Candidates(this.Category, this.TargetOrgan)
      this.SelectedItem = ''
      this.$nextTick()
    },
    SetCandidateItemsByFreeword () {
      if (this.EditableItem && this.UserEditingAllowed) {
        const flatten = DiagnosesTree.flatten(this.Category)
        const arr = getMatchesInDiagnoses(this.EditableItem, flatten)
        this.CandidateItems.splice(0, this.CandidateItems.length, ...arr)
        this.$nextTick()
      }
    },
    CommitChanges () {
      this.$emit('data-upsert', 'Diagnoses', this.ItemIndex,
        this.IsItemEdited
          ? {
            Text: this.TrimmedEditableItem,
            Chain: [this.Category], //, (this.TargetOrgan || '')],
            UserTyped: true
          }
          : {
            Text: this.EditableItem,
            Chain: [this.Category, this.TargetOrgan]
          })
      this.GoBack()
    }
  }
}
</script>
