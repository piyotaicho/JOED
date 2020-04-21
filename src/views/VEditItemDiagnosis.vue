<template>
    <div class="edititem-overlay">
      <div class="edititem-overlay-content">
        <div class="content-title">
          <span>実施術式</span>
        </div>
        <div class="flex-content">
          <div class="w20 selectionbox">
            <div><span>[カテゴリ]</span></div>
            <select v-model="Category"
              size="8"
              v-on:change="TargetOrgan = '', SelectedItem = ''">
              <option v-for="(item,key,index) in GetCategories"
                v-bind:key="index"
                v-bind:value="item">
                {{item}}
              </option>
            </select>
          </div>
          <div class="w20 selectionbox">
            <div><span>[対象臓器]</span></div>
            <select v-model="TargetOrgan"
              size="8"
              v-on:change="SelectedItem = ''">
              <option v-if="GetTargetOrgans.length===0" value=""/>
              <option v-for="(item,key,index) in GetTargetOrgans"
                v-bind:key="index"
                v-bind:value="item">
                {{item}}
              </option>
            </select>
          </div>
          <div class="w60 selectionbox">
            <div><span>[候補病名]</span></div>
            <select v-model="SelectedItem"
              size="8"
              v-on:change="EditableItem = SelectedItem; ItemEdited = false"
              v-on:dblclick="CommitChanges()">
              <option v-if="GetCandidateItems.length===0" value=""/>
              <option v-for="(item,key,index) in GetCandidateItems"
                v-bind:key="index"
                v-bind:value="item">
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
              <input type="Text" v-model.lazy="EditableItem" v-on:keydown.enter="SubmitOnEnterkey"/>
            </div>
            <div class="w20"> [SEARCH] </div>
          </div>
          <div>
            <span v-on:click="GoBack"> [編集の取り消し] </span>
            <span v-on:click="CommitChanges"> [編集内容の登録] </span>
            <span v-if="this.ItemIndex >= 0" v-on:click="EraseItem" style="color: red"> [このエントリを削除] </span>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import EditItemMixins from '@/mixins/EditItemMixins'
import DiagnosisTree from '@/views/DiagnosisItemList'

const ItemTree = new DiagnosisTree()

export default {
  mixins: [
    EditItemMixins
  ],
  computed: {
    GetCategories () {
      return ItemTree.fetchCategories()
    },
    GetTargetOrgans () {
      return ItemTree.fetchTargets(this.Category)
    },
    GetCandidateItems () {
      return ItemTree.fetchSelections(this.Category, this.TargetOrgan)
    }
  },
  methods: {
    EmitItem (value) {
      this.$emit('data-upsert',
        '手術診断', this.ItemIndex, value
      )
    }
  }
}
</script>
