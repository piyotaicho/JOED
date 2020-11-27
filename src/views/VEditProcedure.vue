<template>
  <TheWrapper alpha="10">
    <EditSection @commit="CommitChanges" @discard="GoBack">
      <ThreePaneSelections
        Pane3Title="候補術式"
        :Pane1.sync="Category" :Pane1Items="Categories"
        @pane1change="CategoryIsChanged()"
        :Pane2.sync="TargetOrgan" :Pane2Items="TargetOrgans"
        @pane2change="SetCandidateItemsBySelection()"
        :Pane3.sync="SelectedItem" :Pane3Items="CandidateItems"
        @pane3change="OnCandidateSelected()"
        @pane3dblclick="CommitChanges()"
        :disabled="disabled"
      />

      <!-- 追加情報セクション -->
      <DescriptionSection
        v-model="Description"
        v-if="Description.Title"
      />

      <!-- 追加術式セクション -->
      <template v-if="AdditionalProcedure.Title">
        <div class="flex-content">
          <div class="w30"></div>
          <div class="w30">
            <div class="subtitle">
              <span>付随する実施手術</span>
            </div>
          </div>
          <div class="w30">
            <span>{{AdditionalProcedure.Title}}</span>
          </div>
          <div class="w10"></div>
        </div>
        <DescriptionSection
          v-model="AdditionalProcedure.Description"
        />
      </template>

      <FreewordSection
        v-model="EditableItem"
        :disabled="!UserEditingAllowed"
        @click-search="SetCandidateItemsByFreeword"/>

      <div class="content-bottom">
        <div class="controls">
          <el-button type="primary" @click="GoBack" :disabled="disabled || disableCancel">取り消し</el-button>
          <el-button type="primary" @click="CommitChanges" :disabled="disabled">登録</el-button>
        </div>
      </div>
    </EditSection>
  </TheWrapper>
</template>

<script>
import EditItemMixins from '@/mixins/EditItemMixins'
import ProcedureMaster from '@/modules/Masters/ProcedureItemList'
import { getMatchesInProcedures } from '@/modules/CloseMatches'
import * as Popups from '@/modules/Popups'

import TheWrapper from '@/components/Atoms/TheWrapper'
import EditSection from '@/components/Molecules/EditSection'
import ThreePaneSelections from '@/components/Molecules/3PaneSelections'
import DescriptionSection from '@/components/Molecules/DescriptionSection'
import FreewordSection from '@/components/Molecules/FreewordSection'

const ProceduresTree = new ProcedureMaster()

export default {
  name: 'ViewEditItemProcedure',
  mixins: [
    EditItemMixins
  ],
  components: {
    TheWrapper,
    EditSection,
    ThreePaneSelections,
    DescriptionSection,
    FreewordSection
  },
  props: {
    disableCancel: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return ({
      CandidateItems: [],
      Description: {
        Title: '',
        Options: [],
        Multi: false,
        Value: []
      },
      AdditionalProcedure: {
        Title: '',
        Description: {
          Title: '',
          Options: [],
          Multi: false,
          Value: []
        }
      }
    })
  },
  created () {
    if (this.ItemValue && this.ItemValue.UserTyped === true) {
      this.Category = this.ItemValue.Chain[0]
      this.TargetOrgan = this.ItemValue.Chain[1] ? this.ItemValue.Chain[1] : ''
      this.EditableItem = this.ItemValue.Text
      this.$nextTick()
    }
  },
  computed: {
    Categories () {
      return ProceduresTree.Categories()
    },
    TargetOrgans () {
      return ProceduresTree.Targets(this.Category)
    }
  },
  methods: {
    SetCandidateItemsBySelection () {
      this.CandidateItems = ProceduresTree.Candidates(this.Category, this.TargetOrgan, this.year)
      this.SelectedItem = ''
      this.$set(this.Description, 'Title', '')
      this.$set(this.AdditionalProcedure, 'Title', '')
    },
    SetCandidateItemsByFreeword () {
      if (this.EditableItem && this.UserEditingAllowed) {
        const flatten = ProceduresTree.getItemsInCategory(this.Category, this.year)
        const arr = getMatchesInProcedures(this.EditableItem, flatten)

        this.CandidateItems.splice(0, this.CandidateItems.length, ...arr)

        this.SelectedItem = ''
        this.$set(this.Description, 'Title', '')
        this.$set(this.AdditionalProcedure, 'Title', '')
      }
    },

    OnCandidateSelected () {
      const newValue = this.SelectedItem
      if (newValue) {
        this.EditableItem = newValue

        if (!this.TargetOrgan) {
          const searchByName = ProceduresTree.findItemByName(newValue, this.year)
          this.TargetOrgan = searchByName.Chain[1]
        }

        const selectedItem = ProceduresTree.getItemByName(this.Category, this.TargetOrgan, newValue, this.year)
        this.setDescriptionSection(selectedItem)
        this.setAdditionalProcedureSection(selectedItem)
        this.$nextTick()
      }
    },

    setAdditionalProcedureSection (item) {
      const additionalProcedure = ProcedureMaster.getAdditioninalProcedure(item)
      if (additionalProcedure) {
        this.$set(this.AdditionalProcedure, 'Title', additionalProcedure)

        const additionalItem = ProceduresTree.getItemByName(this.Category, this.TargetOrgan, additionalProcedure, this.year)
        // this.setDescriptionSection(additionalItem)
        this.$set(this.AdditionalProcedure.Description, 'Title', ProcedureMaster.getDescriptionTitle(additionalItem))
        this.$set(this.AdditionalProcedure.Description, 'Multi', ProcedureMaster.isDescriptionMultiple(additionalItem))
        const options = ProcedureMaster.getDescriptionValue(additionalItem)
        if (options && options.length > 0) {
          this.AdditionalProcedure.Description.Options.splice(0, this.AdditionalProcedure.Description.Options.length, ...options)
        } else {
          this.AdditionalProcedure.Description.Options.splice(0)
        }
      } else {
        this.$set(this.AdditionalProcedure, 'Title', '')
      }
    },

    setDescriptionSection (item) {
      this.Description.Value.splice(0)

      const title = ProcedureMaster.getDescriptionTitle(item)
      if (title) {
        this.$set(this.Description, 'Title', title)
        this.$set(this.Description, 'Multi', ProcedureMaster.isDescriptionMultiple(item))

        const options = ProcedureMaster.getDescriptionValue(item)
        if (options && options.length > 0) {
          this.Description.Options.splice(0, this.Description.Options.length, ...options)
        } else {
          this.Description.Options.splice(0)
        }
      } else {
        this.$set(this.Description, 'Title', '')
      }
    },

    async CommitChanges () {
      if (
        this.Category !== '' &&
        this.TrimmedEditableItem !== '' &&
        (
          this.Description.Title === '' ||
          (this.Description.Title !== '' && this.Description.Value.length > 0)
        )
      ) {
        const temporaryItem = {}

        temporaryItem.Text = this.TrimmedEditableItem

        if (this.IsItemEdited) {
          this.SetCandidateItemsByFreeword()
          if (this.CandidateItems.length !== 0 && await Popups.confirm('候補術式名があります,選択を優先してください.') === false) return
          if (this.CandidateItems.indexOf(this.TrimmedEditableItem) !== -1) {
            Popups.information('自由入力の内容が候補術式名にあります,選択してください.')
            return
          }
          if (await Popups.confirm('直接入力した術式の登録は可能な限り控えてください.') === false) return

          // ユーザ手入力の場合は選択が掛かっていないので最低限の情報のみかつフラグを必ず立てる
          temporaryItem.Chain = [this.Category]
          temporaryItem.UserTyped = true
        } else {
          if (!this.SelectedItem) {
            return
          }
          if (!this.TargetOrgan) {
            Popups.alert('候補の選択のみが可能です.')
            return
          }
          // 選択されたものには適切な付随情報を収納
          temporaryItem.Chain = [this.Category, this.TargetOrgan]

          const dittos = ProcedureMaster.getDittos(ProceduresTree.getItemByName(...temporaryItem.Chain, temporaryItem.Text, this.year))
          if (dittos) {
            temporaryItem.Ditto = [...dittos]
          }

          if (this.Description.Title !== '') {
            const description = this.Description.Value.filter(item => item[item.length - 1] !== '$')
            if (description.length === 0) {
              return
            } else {
              temporaryItem.Description = description
            }
          }

          if (this.AdditionalProcedure.Title !== '') {
            const description = this.AdditionalProcedure.Description.Value
            if (description.length === 0) {
              return
            } else {
              const filtered = description.filter(item => item[item.length - 1] !== '$')
              if (filtered.length > 0) {
                temporaryItem.AdditionalProcedure = {
                  Text: this.AdditionalProcedure.Title,
                  Description: description
                }
              }
            }
          }
        }
        this.$emit('data-upsert', 'Procedures', this.ItemIndex, temporaryItem)
        this.GoBack()
      }
    }
  }
}
</script>
