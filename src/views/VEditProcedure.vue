<template>
  <TheWrapper alpha="10">
    <EditSection @commit="CommitChanges" @discard="GoBack">
      <ThreePaneSelections
        Pane3Title="実施手術の候補"
        :Pane1.sync="category" :Pane1Items="Categories"
        @pane1change="CategoryIsChanged()"
        :Pane2.sync="target" :Pane2Items="TargetOrgans"
        @pane2change="SetCandidateItemsBySelection()"
        :Pane3.sync="selectedItem" :Pane3Items="candidates"
        @pane3change="OnCandidateSelected()"
        @pane3dblclick="CommitChanges()"
      />

      <!-- 追加情報セクション -->
      <DescriptionSection
        v-model="description"
        v-if="description.Title !== ''"
      />

      <!-- 追加術式セクション -->
      <template v-if="additionalProcedure.Title !== ''">
        <div class="flex-content">
          <div class="w30"></div>
          <div class="w20">
            <div>
              <span>付随する実施手術</span>
            </div>
          </div>
          <div class="w40">
            <div style="padding-left: 1rem;">
              <span>{{additionalProcedure.Title}}</span>
            </div>
          </div>
          <div class="w10"></div>
        </div>
        <DescriptionSection
          v-model="additionalProcedure.description"
        />
      </template>

      <FreewordSection
        v-model="freewordText"
        :disabled="!UserEditingAllowed"
        @click-search="SetCandidateItemsByFreeword"/>
    </EditSection>
  </TheWrapper>
</template>

<script>
import EditItemMixins from '@/mixins/EditItemMixins'
import Master from '@/modules/Masters/ProcedureItemList'
import * as Popups from '@/modules/Popups'

import TheWrapper from '@/components/Atoms/TheWrapper'
import EditSection from '@/components/Molecules/EditSection'
import ThreePaneSelections from '@/components/Molecules/3PaneSelections'
import DescriptionSection from '@/components/Molecules/DescriptionSection'
import FreewordSection from '@/components/Molecules/EditSectionFreeword'

const ProceduresTree = new Master()

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
  data () {
    return ({
      category: '',
      target: '',
      candidates: [],
      selectedItem: '',
      freewordText: '',
      description: {
        Title: '',
        Options: [],
        Multi: false,
        Value: []
      },
      additionalProcedure: {
        Title: '',
        description: {
          Title: '',
          Options: [],
          Multi: false,
          Value: []
        }
      }
    })
  },
  created () {
    if (this.ItemIndex > -1) {
      // ItemIndex != -1 の場合は新規ではなく再編集
      // Chainの解釈
      if (this.ItemValue.Chain) {
        if (this.ItemValue.Chain[0]) {
          this.category = this.ItemValue.Chain[0]
          if (this.ItemValue.Chain[1]) {
            this.target = this.ItemValue.Chain[1]
          }
        }
      }

      if (this.catgegory !== '') {
        // カテゴリと対象が選択されているので選択リストの展開
        this.SetCandidateItemsBySelection()

        const text = this.ItemValue.Text
        if (text !== '') {
          if (this.candidates.includes(text)) {
            // 選択肢に該当項目がある場合選択する
            this.selectedItem = text
          } else {
            // 選択肢に入力されている項目がなければ自由入力に展開される
            this.freewordText = text
          }
        }
      }
    }
  },
  mounted () {
    if (this.selectedItem !== '') {
      // 選択肢に付随術式などの情報がある場合展開する
      this.OnCandidateSelected()
      this.$nextTick().then(_ => {
        // 付随情報を設定する
        if (this.description.Title !== '' &&
          this.ItemValue?.Description?.length > 0
        ) {
          this.description.Value.splice(0)
          for (const index in this.ItemValue.Description) {
            this.$set(this.description.Value, index, this.ItemValue.Description[index])
          }
        }
        // 標準併施手術についての付随情報を設定する
        if (this.additionalProcedure.Title !== '') {
          const additionalDescriptionLength =
            this.ItemValue?.AdditionalProcedure?.Description?.length

          if (additionalDescriptionLength > 0) {
            this.additionalProcedure.description.Value.splice(0)
            for (const index in this.ItemValue.AdditionalProcedure.Description) {
              this.$set(this.additionalProcedure.description.Value, index,
                this.ItemValue.AdditionalProcedure.Description[index]
              )
            }
          } else {
            console.log('expand additional')
            const blankItem = this.additionalProcedure.description.Options
              .filter(item => item[item.length - 1] === '$')
            if (blankItem.length > 0) {
              this.additionalProcedure.description.Value.splice(0)
              this.$set(this.additionalProcedure.description.Value, 0, blankItem[0])
            }
          }
        }
      })
      this.$nextTick()
    }
  },
  computed: {
    Categories () {
      return ProceduresTree.Categories()
    },
    TargetOrgans () {
      return ProceduresTree.Targets(this.category)
    }
  },
  methods: {
    SetCandidateItemsBySelection () {
      this.candidates = ProceduresTree.ItemTexts(this.category, this.target, this.year)
      this.selectedItem = ''
      this.$set(this.description, 'Title', '')
      this.$set(this.additionalProcedure, 'Title', '')
      this.$nextTick()
    },

    SetCandidateItemsByFreeword () {
      if (this.freewordText && this.UserEditingAllowed) {
        const arr = ProceduresTree.Matches(this.freewordText, this.category, this.target || '', this.year)
        this.candidates.splice(0, this.candidates.length, ...arr)

        this.selectedItem = ''
        this.$set(this.description, 'Title', '')
        this.$set(this.additionalProcedure, 'Title', '')
        this.$nextTick()
      }
    },

    OnCandidateSelected () {
      const newValue = this.selectedItem
      if (newValue) {
        const selectedItem = ProceduresTree.getItem(newValue, this.category, this.target, this.year)
        this.setDescriptionSection(selectedItem)
        this.setAdditionalProcedureSection(selectedItem)
        this.$nextTick()
      }
    },

    setAdditionalProcedureSection (item) {
      const additionalProcedure = Master.getAdditioninalProcedure(item)
      if (additionalProcedure) {
        this.$set(this.additionalProcedure, 'Title', additionalProcedure)

        const additionalItem = ProceduresTree.getItem(additionalProcedure, this.category, this.target, this.year)

        this.$set(this.additionalProcedure.description, 'Title', Master.getDescriptionTitle(additionalItem))
        this.$set(this.additionalProcedure.description, 'Multi', Master.isDescriptionMultiple(additionalItem))
        const options = Master.getDescriptionValue(additionalItem)
        if (options && options.length > 0) {
          this.additionalProcedure.description.Options.splice(0, this.additionalProcedure.description.Options.length, ...options)
        } else {
          this.additionalProcedure.description.Options.splice(0)
        }
      } else {
        this.$set(this.additionalProcedure, 'Title', '')
      }
    },

    setDescriptionSection (item) {
      this.description.Value.splice(0)

      const title = Master.getDescriptionTitle(item)
      if (title) {
        this.$set(this.description, 'Title', title)
        this.$set(this.description, 'Multi', Master.isDescriptionMultiple(item))

        const options = Master.getDescriptionValue(item)
        if (options && options.length > 0) {
          this.description.Options.splice(0, this.description.Options.length, ...options)
        } else {
          this.description.Options.splice(0)
        }
      } else {
        this.$set(this.description, 'Title', '')
      }
    },

    async CommitChanges () {
      const temporaryItem = {}

      if (this.selectedItem !== '') {
        // 選択された内容が最優先
        // 選択されたものには適切な付随情報を収納
        temporaryItem.Text = this.selectedItem
        temporaryItem.Chain = [this.category, ...(this.target !== '' ? [this.target] : [])]

        const ditto = Master.getDittos(ProceduresTree.getItem(temporaryItem.Text, temporaryItem.Chain[0], temporaryItem.Chain[1], this.year))
        if (ditto) {
          temporaryItem.Ditto = [...ditto]
        }

        // 術式付随情報
        if (this.description.Title !== '') {
          if (this.description.Value.length === 0) {
            return
          }
          // 登録対象外項目を除外
          const descriptionValue = this.description.Value.filter(item => item.substr(-1) !== '$')
          if (descriptionValue.length > 0) {
            temporaryItem.Description = [...descriptionValue]
          }
        }

        // 従たる術式に関する情報
        if (this.additionalProcedure.Title !== '') {
          if (this.additionalProcedure.description.length === 0) {
            return
          }
          // descriptionと同じロジック
          const descriptionValue = this.additionalProcedure.description.Value.filter(item => item.substr(-1) !== '$')
          if (descriptionValue.length > 0) {
            temporaryItem.AdditionalProcedure = {
              Text: this.additionalProcedure.Title,
              Description: [...descriptionValue]
            }
          }
        }
      } else {
        if (this.freewordText.trim() !== '') {
          // 自由入力は兎にも角にも候補入力を優先させる.
          this.SetCandidateItemsByFreeword()
          if (
            this.candidates.length !== 0 &&
            await Popups.confirm('実施手術の候補があります,選択を優先してください.') === false
          ) {
            return
          }
          // 候補に入力と同じものがある場合は何が何でも選択させる.
          if (this.candidates.indexOf(this.freewordText.trim()) !== -1) {
            await Popups.information('自由入力の内容が候補にありますので選択してください.')
            return
          }
          // 最終確認
          if (await Popups.confirm('直接入力した実施術式の登録は可能な限り控えてください.') === false) {
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
        this.$emit('data-upsert', 'Procedures', this.ItemIndex, temporaryItem)
        this.GoBack()
      }
    }
  }
}
</script>
