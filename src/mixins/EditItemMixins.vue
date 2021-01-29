<script>
export default {
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
  computed: {
    UserEditingAllowed () {
      return !!this.category && !this.selectedItem
    }
  },
  methods: {
    spliceMarker (str) {
      return str[str.length - 1] !== '$' ? str : str.substr(0, str.length - 1)
    },

    async CategoryIsChanged () {
      this.target = ''
      if (this.selectedItem !== '') {
        this.freewordText = ''
      }

      this.selectedItem = ''
      if (this.CandidateItems) {
        this.CandidateItems.splice(0)
      }

      if (this.Description) {
        this.Description.Title = ''
      }

      if (this.AdditionalProcedure) {
        this.AdditionalProcedure.Title = ''
      }

      await this.$nextTick()

      // 対象臓器が1つだけのときはそれを選択する
      if (this.TargetOrgans.length === 1) {
        this.target = this.TargetOrgans[0]
        await this.$nextTick()

        this.SetCandidateItemsBySelection()
        await this.$nextTick()
      }
    },

    GoBack () {
      this.$router.replace('./')
    }
  }
}
</script>
