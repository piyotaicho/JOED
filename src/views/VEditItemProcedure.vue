<template>
    <div class="edititem-overlay">
      <div class="edititem-overlay-content">
        <div class="content-title">
          <span>実施手術</span>
        </div>
        <!-- 選択ペイン -->
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
            <div><span>[候補術式]</span></div>
            <select
              size="8"
              :value="SelectedItem"
              @change="OnSelected"
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
        <!-- 追加術式ペイン -->
        <div class="flex-content" v-if="Description.AdditionalProcedureTitle">
          <div class="w20"></div>
          <div class="w20"><span>追加術式 : </span></div>
          <div class="w60"><span>[{{Description.AdditionalProcedureTitle}}]</span></div>
        </div>
        <!-- 追加情報ペイン -->
        <div class="flex-content" v-if="Description.Title">
          <div class="w20"></div>
          <div class="w20 selectionbox"><span>[{{Description.Title}}]</span></div>
          <div class="w50 selectionbox" v-if="Description.Multi === false">
            <select v-model="DescriptionValue[0]" @dblclick="CommitChanges()">
              <option v-for="item of Description.Options"
                :key="item"
                :value="item">
                {{spliceMarker(item)}}
              </option>
            </select>
          </div>
          <div class="w50 selectionbox" v-if="Description.Multi === true">
            <label v-for="item in Description.Options" :key="item">
              <input type="checkbox" v-model="DescriptionValue" :value="item" />
              {{spliceMarker(item)}}
            </label>
          </div>
        </div>
        <!-- コントロールペイン -->
        <div class="content-bottom">
          <div class="controls">
            <div class="w20">
              <span>入力術式 : </span>
            </div>
            <div class="w60">
              <input type="Text" :disabled="Description.Title" v-model="EditableItem" @keydown.enter="SubmitOnEnterkey"/>
            </div>
            <div class="w20"> [SEARCH] </div>
          </div>
          <div class="controls">
            <div v-if="!disableCancel"><span @click="GoBack"> [編集の取り消し] </span></div>
            <div><span @click="CommitChanges"> [編集内容の登録] </span></div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import EditItemMixins from '@/mixins/EditItemMixins'
import ProcedureTree from '@/modules/ProcedureItemList'

const ProceduresTree = new ProcedureTree()

export default {
  name: 'ViewEditItemProcedure',
  mixins: [
    EditItemMixins
  ],
  props: {
    disableCancel: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return ({
      Description: {
        AdditionalProcedureTitle: '',
        Title: '',
        Options: [],
        Multi: false,
        Value: []
      }
    })
  },
  mounted () {
    // mixin で基本的な部分は展開済み, Description/AdditionalProcedureを展開する
    if (this.ItemValue) {
      if (this.ItemValue.AdditionalProcedure) {
        const selectedItemObject = ProcedureTree.getItemByName(this.Category, this.TargetOrgan, this.SelectedItem)
        this.setDataAdditionalProcedure(selectedItemObject)
        if (this.ItemValue.AdditionalProcedure.Description) {
          Object.assign(this.Description.Value, this.ItemValue.AdditionalProcedure.Description)
        }
      } else if (this.ItemValue.Description) {
        Object.assign(this.Description.Value, this.ItemValue.Description)
      }
    }
  },
  computed: {
    Categories () {
      return ProceduresTree.Categories()
    },
    TargetOrgans () {
      return ProceduresTree.Targets(this.Category)
    },
    CandidateItems () {
      return ProceduresTree.Candidates(this.Category, this.TargetOrgan)
    },
    DescriptionValue: {
      set (newvalue) {
        if (typeof newvalue === 'string') {
          this.Description.Value.splice(0)
          if (newvalue !== undefined) {
            this.Description.Value.push(newvalue)
          }
        } else {
          this.Description.Value = newvalue
        }
      },
      get () {
        return this.Description.Value
      }
    }
  },
  methods: {
    spliceMarker (str) {
      return str[str.length - 1] !== '$' ? str : str.substr(0, str.length - 1)
    },

    OnSelected (event) {
      const newValue = event.target.value
      this.SelectedItem = newValue
      this.EditableItem = newValue

      const selectedItemObject = ProceduresTree.getItemByName(this.Category, this.TargetOrgan, newValue)

      this.setDataAdditionalProcedure(selectedItemObject)
    },

    setDataAdditionalProcedure (item) {
      const additionalProcedure = ProcedureTree.getAdditioninalProcedure(item)
      if (additionalProcedure) {
        this.Description.AdditionalProcedureTitle = additionalProcedure

        const additionalItem = ProceduresTree.getItemByName(this.Category, this.TargetOrgan, additionalProcedure)
        this.setDataDescription(additionalItem)
      } else {
        this.Description.AdditionalProcedureTitle = ''
        this.setDataDescription(item)
      }
    },

    setDataDescription (item) {
      const setDescriptionProperties = (Title, Multi, Options) => {
        this.Description.Title = Title
        this.$nextTick().then(() => {
          this.Description.Multi = Multi
          this.$nextTick().then(() => {
            if (Options.length === 0) {
              this.Description.Options.splice(0)
            } else {
              this.Description.Options = Options
            }
          })
        })
      }

      const descriptionTitle = ProcedureTree.getDescriptionTitle(item)
      this.Description.Value.splice(0)

      if (descriptionTitle) {
        setDescriptionProperties(
          descriptionTitle,
          ProcedureTree.isDescriptionMultiple(item),
          ProcedureTree.getDescriptionValue(item)
        )
      } else {
        setDescriptionProperties('', false, [])
      }
    },

    CommitChanges () {
      if (this.Category !== '' &&
        this.TrimmedEditableItem !== '' &&
        (this.Description.Title === '' || (this.Description.Title !== '' && this.Description.Value.length > 0))
      ) {
        const temporaryItem = {}
        const descriptionValue = this.Description.Value.filter(item => item[item.length - 1] !== '$')

        temporaryItem.Text = this.TrimmedEditableItem

        if (this.IsItemEdited) {
          temporaryItem.Chain = [this.Category]
          temporaryItem.UserTyped = true
        } else {
          temporaryItem.Chain = [this.Category, this.TargetOrgan]

          if (this.Description.AdditionalProcedureTitle !== '') {
            if (descriptionValue.length > 0) {
              temporaryItem.AdditionalProcedure = {
                Text: this.Description.AdditionalProcedureTitle,
                Description: descriptionValue
              }
            }
          } else {
            if (this.Description.Title !== '' && descriptionValue.length > 0) {
              temporaryItem.Description = descriptionValue
            } else {
              // 最終的なvalidation - 登録出来ないパターン
              return
            }
          }
        }
        this.$emit('data-upsert', '実施手術', this.ItemIndex, temporaryItem)
        this.GoBack()
      }
    }
  }
}
</script>
