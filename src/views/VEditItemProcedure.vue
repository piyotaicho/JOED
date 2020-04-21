<template>
    <div class="edititem-overlay">
      <div class="edititem-overlay-content">
        <div class="content-title">
          <span>実施手術</span>
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
            <div><span>[候補術式]</span></div>
            <select v-model="SelectedItem"
              size="8"
              v-on:change="OnSelected()"
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
        <div class="flex-content" v-if="AdditionalProcedure.Title">
          <div class="w20"></div>
          <div class="w20 selectionbox"><span>[{{AdditionalProcedure.Title}}]</span></div>
          <div class="w50 selectionbox">
            <select v-model="AdditionalProcedure.value" size="1" v-on:dblclick="CommitChanges()">
              <option v-for="(item,key,index) in AdditionalProcedure.Options"
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
              <span>入力術式 : </span>
            </div>
            <div class="w60">
              <input type="Text" disabled v-model.lazy="EditableItem" v-on:keydown.enter="SubmitOnEnterkey"/>
            </div>
            <div class="w20"> [SEARCH] </div>
          </div>
          <div class="controls">
            <div><span v-on:click="GoBack"> [編集の取り消し] </span></div>
            <div><span v-on:click="CommitChanges"> [編集内容の登録] </span></div>
            <div>
              <span v-if="ItemIndex >= 0"
                v-on:click="EraseItem"
                style="color: red">
                [このエントリを削除]
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import EditItemMixins from '@/mixins/EditItemMixins'
import ProcedureTree from '@/views/ProcedureItemList'

const ItemTree = new ProcedureTree()

export default {
  mixins: [
    EditItemMixins
  ],
  data () {
    return ({
      AdditionalProcedure: {
        Title: '',
        Options: [],
        value: ''
      }
    })
  },
  mounted () {
    // mixin で基本的な部分は展開済み, AdditionalProcedureを展開する
    if (this.ItemValue) {
      this.SetAdditionalProcedure()
      const AdditionalProcedure = ProcedureTree.getPropertyValue(this.ItemValue, 'AdditionalProcedure')
      if (AdditionalProcedure) {
        this.AdditionalProcedure.Title = Object.keys(AdditionalProcedure)[0]
        this.AdditionalProcedure.value = AdditionalProcedure[this.AdditionalProcedure.Title]
      }
    }
  },
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
    OnSelected () {
      this.EditableItem = this.SelectedItem
      this.ItemEdited = false
      this.SetAdditionalProcedure()
    },
    SetAdditionalProcedure () {
      const queryItemIndex = (aim) => this.GetCandidateItems.findIndex(item => item === aim)

      this.AdditionalProcedure.Title = ''
      this.AdditionalProcedure.Options.length = 0
      this.AdditionalProcedure.value = ''

      if (this.Category !== '' && this.TargetOrgan !== '' && this.SelectedItem !== '') {
        let item = ItemTree[this.Category][this.TargetOrgan][queryItemIndex(this.SelectedItem)]
        if (typeof item === 'object') {
          item = item[this.SelectedItem].AdditionalProcedure
          if (typeof item === 'object') {
            this.AdditionalProcedure.Title = Object.keys(item)[0]
            this.AdditionalProcedure.Options = item[this.AdditionalProcedure.Title]
          } else {
            this.AdditionalProcedure.Title = item
            this.AdditionalProcedure.Options = ['なし', 'あり']
          }
        }
      }
    },
    CommitChanges () {
      if (this.Category !== '' &&
        this.TrimmedEditableItem !== '' &&
        (this.AdditionalProcedure.Title === '' || (this.AdditionalProcedure.Title !== '' && this.AdditionalProcedure.value !== ''))
      ) {
        const temporaryItem = {}
        if (this.ItemEdited) {
          temporaryItem[this.Category] = {
            Text: this.TrimmedEditableItem,
            UserTyped: true
          }
        } else {
          temporaryItem[this.Category] = {
            [this.TargetOrgan]: { Text: this.TrimmedEditableItem }
          }
          if (this.AdditionalProcedure.Title !== '') {
            temporaryItem[this.Category][this.TargetOrgan].AdditionalProcedure = {
              [this.AdditionalProcedure.Title]: this.AdditionalProcedure.value
            }
          }
        }
        this.EmitItem(temporaryItem)
        this.GoBack()
      }
    },
    EmitItem (value) {
      this.$emit('data-upsert',
        '実施手術', this.ItemIndex, value
      )
    }
  }
}
</script>
