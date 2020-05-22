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
              @change="SelectedItem = ''">
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
              <input type="Text" v-model.lazy="EditableItem" @keydown.enter="SubmitOnEnterkey"/>
            </div>
            <div class="w20"> [SEARCH] </div>
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

const DiagnosesTree = new DiagnosisTree()

export default {
  mixins: [
    EditItemMixins
  ],
  computed: {
    Categories () {
      return DiagnosesTree.Categories()
    },
    TargetOrgans () {
      return DiagnosesTree.Targets(this.Category)
    },
    CandidateItems () {
      return DiagnosesTree.Candidates(this.Category, this.TargetOrgan)
    }
  },
  methods: {
    CommitChanges () {
      this.$emit('data-upsert', 'Diagnoses', this.ItemIndex,
        this.IsItemEdited
          ? { Text: this.TrimmedEditableItem, UserTyped: true }
          : { Text: this.TrimmedEditableItem, Chain: [this.Category, this.TargetOrgan] })
      this.GoBack()
    }
  }
}
</script>
