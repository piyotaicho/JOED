<template>
  <TheWrapper alpha="10">
    <EditSection @commit="CommitChanges" @discard="GoBack">
      <ThreePaneSelections
        Pane3Title="手術診断の候補"
        :Pane1.sync="category" :Pane1Items="Categories"
        @pane1change="CategoryIsChanged()"
        :Pane2.sync="target" :Pane2Items="TargetOrgans"
        @pane2change="SetCandidateItemsBySelection()"
        :Pane3.sync="selectedItem" :Pane3Items="candidates"
        @pane3change="OnCandidateSelected()"
        @pane3dblclick="CommitChanges()"
      />

      <FreewordSection
        v-model="freewordText"
        :disabled="!UserEditingAllowed"
        @click-search="SetCandidateItemsByFreeword"/>
    </EditSection>
  </TheWrapper>
</template>

<script>
import EditItemMixins from '@/mixins/EditItemMixins'
import Master from '@/modules/Masters/DiagnosisItemList'
// import { getMatchesInDiagnoses } from '@/modules/CloseMatches'
import * as Popups from '@/modules/Popups'

import TheWrapper from '@/components/Atoms/TheWrapper'
import EditSection from '@/components/Molecules/EditSection'
import ThreePaneSelections from '@/components/Molecules/3PaneSelections'
import FreewordSection from '@/components/Molecules/EditSectionFreeword'

const DiagnosesTree = new Master()

export default {
  data () {
    return {
      category: '',
      target: '',
      candidates: [],
      selectedItem: '',
      freewordText: ''
    }
  },
  mixins: [
    EditItemMixins
  ],
  components: {
    TheWrapper,
    EditSection,
    ThreePaneSelections,
    FreewordSection
  },
  created () {
    if (this.ItemIndex > -1) {
      // ItemIndex != -1 の場合は再編集
      // Chainの解釈
      if (this.ItemValue.Chain) {
        if (this.ItemValue.Chain[0]) {
          this.category = this.ItemValue.Chain[0]
          if (this.ItemValue.Chain[1]) {
            this.target = this.ItemValue.Chain[1]
          }
        }
      }
      // Textはmountedで解釈する
    }
  },
  mounted () {
    if (this.catgegory !== '' && this.target !== '') {
      // カテゴリと対象が選択されているので選択リストの展開
      this.SetCandidateItemsBySelection()

      const text = this.ItemValue.Text
      if (text !== '') {
        if (this.candidates.includes(text)) {
          // 選択肢に該当項目がある場合選択する
          this.selectedItem = text
        } else {
          // 選択肢に入力されている項目がなければ自由入力に展開する
          this.freewordText = text
        }
      }
      this.$nextTick()
    }
  },
  computed: {
    Categories () {
      return DiagnosesTree.Categories()
    },
    TargetOrgans () {
      return DiagnosesTree.Targets(this.category)
    }
  },
  methods: {
    OnCandidateSelected () {
      // this.freewordText = ''
    },

    SetCandidateItemsBySelection () {
      this.candidates = DiagnosesTree.ItemTexts(this.category, this.target, this.year)
      this.selectedItem = ''
      this.$nextTick()
    },
    SetCandidateItemsByFreeword () {
      if (this.freewordText && this.UserEditingAllowed) {
        const arr = DiagnosesTree.Matches(this.freewordText, this.category, this.target || '', this.year) // getMatchesInDiagnoses(this.freewordText, flatten)
        this.candidates.splice(0, this.candidates.length, ...arr)
        this.$nextTick()
      }
    },
    async CommitChanges () {
      const temporaryItem = {}
      if (this.selectedItem !== '') {
        // 選択された内容が最優先
        // 選択されたものには適切な付随情報を収納
        temporaryItem.Text = this.selectedItem
        temporaryItem.Chain = [this.category, ...(this.target !== '' ? [this.target] : [])]
      } else {
        if (this.freewordText.trim() !== '') {
          // 自由入力は兎にも角にも候補入力を優先させる.
          this.SetCandidateItemsByFreeword()
          if (
            this.candidates.length !== 0 &&
            await Popups.confirm('手術診断の候補があります,選択を優先してください.') === false
          ) {
            return
          }
          // 候補に入力と同じものがある場合は何が何でも選択させる.
          if (this.candidates.indexOf(this.freewordText.trim()) !== -1) {
            await Popups.information('自由入力の内容が候補にありますのでそれを選択してください.')
            return
          }
          // 最終確認
          if (await Popups.confirm('直接入力した手術診断の登録は可能な限り控えてください.') === false) {
            return
          }

          // ユーザ手入力の場合は選択が掛かっていないので最低限の情報のみかつフラグを必ず立てる
          temporaryItem.Text = this.freewordText.trim()
          temporaryItem.Chain = [this.category]
          temporaryItem.UserTyped = true
        }
      }
      // 新しいレコードが作成されていたら登録, そうでなければなにもしない.
      if (temporaryItem.Text) {
        this.$emit('data-upsert', 'Diagnoses', this.ItemIndex, temporaryItem)
        this.GoBack()
      }
    }
  }
}
</script>
