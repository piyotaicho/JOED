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
  data () {
    return {
      Category: '',
      TargetOrgan: '',
      SelectedItem: '',
      EditableItem: '',
      ExpandEditsection: false
    }
  },
  mounted () {
    this.ExpandEditsection = (this.ItemValue && this.ItemValue.UserTyped === true)
  },
  computed: {
    UserEditingAllowed () {
      return !!this.Category && !this.SelectedItem
    },

    TrimmedEditableItem () {
      const enteredValue = this.EditableItem.toString().replace(/^[\s|\u3000]+$/g, '')
      return enteredValue
    },

    IsReadyToCommit () {
      return (this.TrimmedEditableItem !== '')
    },

    IsItemEdited () {
      return this.SelectedItem !== this.EditableItem
    }
  },
  methods: {
    spliceMarker (str) {
      return str[str.length - 1] !== '$' ? str : str.substr(0, str.length - 1)
    },

    ToggleEditsection () {
      this.ExpandEditsection = !this.ExpandEditsection || (this.ItemValue.UserTyped === true) || this.IsItemEdited
    },

    async CategoryIsChanged () {
      this.TargetOrgan = ''
      if (this.SelectedItem !== '') {
        this.EditableItem = ''
      }

      this.SelectedItem = ''
      this.CandidateItems.splice(0)

      await this.$nextTick()

      if (this.TargetOrgans.length === 1) {
        this.TargetOrgan = this.TargetOrgans[0]
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
