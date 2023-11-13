<template>
  <TheWrapper alpha="10">
    <EditSection @commit="CommitChanges" @discard="GoBack">
      <ThreePaneSelections
        Pane3Title="実施手術の候補"
        :Pane1.sync="category"
        :Pane1Items="Categories"
        @pane1change="CategoryIsChanged()"
        :Pane2.sync="target"
        :Pane2Items="TargetOrgans"
        @pane2change="SetCandidateListBySelection()"
        :Pane3.sync="selectedItemText"
        :Pane3Items="candidates"
        @pane3change="OnCandidateSelected()"
        @pane3dblclick="CommitChanges()"
      />

      <!-- 追加情報セクション -->
      <DescriptionSection
        :Container.sync="description"
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
            <div style="padding-left: 1rem">
              <span>{{ additionalProcedure.Title }}</span>
            </div>
          </div>
          <div class="w10"></div>
        </div>
        <DescriptionSection :Container.sync="additionalProcedure.description" />
      </template>

      <FreewordSection
        :value.sync="freewordText"
        :disabled="!UserEditingAllowed"
        @click-search="SetCandidateListByFreeword"
      />
    </EditSection>
  </TheWrapper>
</template>

<script>
import Master from '@/modules/Masters/ProcedureMaster'
import * as Popups from '@/modules/Popups'

import TheWrapper from '@/components/Atoms/TheWrapper'
import EditSection from '@/components/Molecules/EditSection'
import ThreePaneSelections from '@/components/Molecules/ThreeSelections'
import DescriptionSection from '@/components/Molecules/DescriptionSection'
import FreewordSection from '@/components/Molecules/EditSectionFreeword'

const ProceduresTree = new Master()

export default {
  name: 'ViewEditItemProcedure',
  components: {
    TheWrapper,
    EditSection,
    ThreePaneSelections,
    DescriptionSection,
    FreewordSection
  },
  props: {
    ItemIndex: {
      type: Number,
      default: -1
    },
    ItemValue: {
      type: Object
    },
    year: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      category: '',
      target: '',
      candidates: [],
      selectedItemText: '',
      freewordText: '',
      description: {
        Title: '',
        Options: [],
        SelectionMode: 'one',
        Value: []
      },
      additionalProcedure: {
        Title: '',
        description: {
          Title: '',
          Options: [],
          SelectionMode: 'one',
          Value: []
        }
      }
    }
  },
  created () {
    if (this.ItemIndex > -1) {
      // ItemIndex != -1 の場合は新規ではなく再編集になるのでItemValueから最低限必要な情報を展開する

      // カテゴリ・対象の解釈
      if (this.ItemValue.Chain) {
        if (this.ItemValue.Chain[0]) {
          this.category = this.ItemValue.Chain[0]
          // 選択したものでも対象は無いことがある
          if (this.ItemValue.Chain[1]) {
            this.target = this.ItemValue.Chain[1]
          }

          // 入力値の解釈
          const text = this.ItemValue.Text
          if (text !== '') {
            // カテゴリとあれば対象に応じた選択リストの生成
            this.SetCandidateListBySelection()

            if (this.candidates.includes(text)) {
              // 選択肢に該当項目がある場合選択する
              this.selectedItemText = text
            } else {
              // 選択肢に入力されている項目がなければ自由入力に展開する
              this.freewordText = text
            }
          }
        }
      }
    }
  },
  async mounted () {
    // 再編集で術式の選択がある場合のコントロールの初期化
    if (this.selectedItemText !== '') {
      // 選択肢に応じたDOM構成を展開
      this.OnCandidateSelected()
      await this.$nextTick()

      // 付随情報の初期値をItemValueから設定する
      if (
        this.description.Title !== '' &&
        this.ItemValue?.Description?.length > 0
      ) {
        // Description -> description
        for (const index in this.ItemValue.Description) {
          this.$set(
            this.description.Value,
            index,
            this.ItemValue.Description[index]
          )
        }
      }

      if (this.additionalProcedure.Title !== '') {
        if (this.ItemValue?.AdditionalProcedure?.Description?.length > 0) {
          // AdditionalProcedure -> additionalProcedure
          for (const index in this.ItemValue.AdditionalProcedure.Description) {
            this.$set(
              this.additionalProcedure.description.Value,
              index,
              this.ItemValue.AdditionalProcedure.Description[index]
            )
          }
        } else {
          // additionalProcedureが空白の場合、有効なデフォルト設定があれば設定
          const defaultValue =
            this.additionalProcedure.description.Options.filter(
              (item) => item.slice(-1) === '$'
            )[0]
          if (defaultValue) {
            this.$set(
              this.additionalProcedure.description.Value,
              0,
              defaultValue
            )
          }
        }
      }
    }
  },
  computed: {
    Categories () {
      return ProceduresTree.Categories()
    },
    TargetOrgans () {
      return ProceduresTree.Targets(this.category)
    },
    UserEditingAllowed () {
      return !!this.category && !this.selectedItemText
    }
  },
  methods: {
    async ClearSelectedEntry () {
      this.selectedItemText = ''
      this.setDescriptionSection(undefined)
      this.$set(this.additionalProcedure, 'Title', '')
      this.setDescriptionSection(
        undefined,
        this.additionalProcedure.description
      )
      await this.$nextTick()
    },
    async CategoryIsChanged () {
      this.freewordText = ''
      this.candidates.splice(0)
      await this.ClearSelectedEntry()

      // 対象臓器が1つだけのときはそれを選択する
      if (this.TargetOrgans.length === 1) {
        this.target = this.TargetOrgans[0]
        this.SetCandidateListBySelection()
      } else {
        this.target = ''
        await this.$nextTick()
      }
    },

    async SetCandidateListBySelection () {
      this.candidates = ProceduresTree.Items(
        this.category, this.target, this.year
      ).map(item => item.Text)
      await this.ClearSelectedEntry()
    },

    async SetCandidateListByFreeword () {
      if (this.UserEditingAllowed && this.freewordText) {
        const matches = ProceduresTree.Matches(
          this.freewordText,
          this.category,
          this.target || '',
          this.year
        )
        this.candidates.splice(0, this.candidates.length, ...matches)
        await this.ClearSelectedEntry()
      }
    },

    async OnCandidateSelected () {
      if (this.selectedItemText) {
        const masterItem = ProceduresTree.getItem(
          this.selectedItemText,
          this.category,
          this.target,
          this.year
        )
        this.setDescriptionSection(masterItem)
        this.setAdditionalProcedureSection(masterItem)
        await this.$nextTick()
      }
    },

    setDescriptionSection (item, description = this.description, splicedefault = true) {
      // descriptionの設定を削除
      description.Value.splice(0)
      description.Options.splice(0)

      if (Master.getDescriptionObject(item) !== undefined) {
        // descriptionの設定をマスタからコピー
        this.$set(description, 'Title', Master.getDescriptionTitle(item))
        this.$set(
          description,
          'SelectionMode',
          Master.getDescriptionSelectionMode(item)
        )

        // 単独入力不可項目の対応
        if (splicedefault) {
          description.Options.splice(0, 0, ...Master.getDescriptionOptions(item).filter(option => option.slice(-1) !== '$'))
        } else {
          description.Options.splice(0, 0, ...Master.getDescriptionOptions(item))
        }
      } else {
        // descriptionの設定を完全に削除
        this.$set(description, 'Title', '')
        this.$set(description, 'SelectionMode', 'one')
      }
      this.$nextTick(() => {})
    },

    setAdditionalProcedureSection (item) {
      const additionalProcedure = Master.getAdditioninalProcedure(item)
      if (additionalProcedure) {
        // 付随種々の情報を展開
        this.$set(this.additionalProcedure, 'Title', additionalProcedure)

        const additionalItem = ProceduresTree.getItem(
          additionalProcedure,
          this.category,
          this.target,
          this.year
        )
        this.setDescriptionSection(
          additionalItem,
          this.additionalProcedure.description,
          false
        )
      } else {
        this.$set(this.additionalProcedure, 'Title', '')

        this.setDescriptionSection(
          undefined,
          this.additionalProcedure.description
        )
      }
    },

    async CommitChanges () {
      const temporaryItem = {}

      if (this.selectedItemText !== '') {
        // 選択された内容が最優先

        // 選択内容を保存
        temporaryItem.Text = this.selectedItemText
        temporaryItem.Chain = [
          this.category,
          ...(this.target !== '' ? [this.target] : [])
        ]

        // 選択枝の重複確認情報を保存
        const ditto = Master.getDittos(
          ProceduresTree.getItem(
            temporaryItem.Text,
            temporaryItem.Chain[0],
            temporaryItem.Chain[1],
            this.year
          )
        )
        if (ditto) {
          temporaryItem.Ditto = [...ditto]
        }

        // 術式付随情報があれば保存
        if (this.description.Title !== '') {
          // 選択枝にないものと単独保存対象外設定された項目(デフォルト)を除外
          const descriptionValue = this.description.Value
            .filter(item => item.slice(-1) !== '$')
            .filter(item => this.description.Options.indexOf(item) !== -1)

          if (
            descriptionValue.length === 0 &&
            this.description.SelectionMode !== 'anyornone'
          ) {
            // 選択必須だが選択がない
            await Popups.information('詳細情報の入力が不足しています.')
            return
          }

          if (descriptionValue.length > 0) {
            temporaryItem.Description = [...descriptionValue]
          }
        }

        // 従たる術式に関する情報
        if (this.additionalProcedure.Title !== '') {
          if (
            this.additionalProcedure.description.length === 0 &&
            this.additionalProcedure.description.SelectionMode !== 'anyornone'
          ) {
            // 選択必須だが選択がない
            await Popups.information(
              '付随術式に関する情報の入力が不足しています.'
            )
            return
          }
          // 保存対象外設定された項目(デフォルト)を除外
          const descriptionValue =
            this.additionalProcedure.description.Value.filter(
              (item) => item.slice(-1) !== '$'
            )
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
          this.SetCandidateListByFreeword()
          if (
            this.candidates.length !== 0 &&
            (await Popups.confirm(
              '実施手術の候補があります,選択を優先してください.'
            )) === false
          ) {
            return
          }
          // 候補に入力と同じものがある場合は何が何でも選択させる.
          if (this.candidates.indexOf(this.freewordText.trim()) !== -1) {
            await Popups.information(
              '自由入力の内容が候補にありますので選択してください.'
            )
            return
          }
          // 最終確認
          if (
            (await Popups.confirm(
              '直接入力した実施術式の登録は可能な限り控えてください.'
            )) === false
          ) {
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
    },

    GoBack () {
      this.$router.replace('./')
    }
  }
}
</script>
