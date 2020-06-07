<script>
export default {
  props: {
    ItemIndex: {
      type: Number,
      default: -1
    },
    ItemValue: {
      type: Object
    }
  },
  data () {
    return {
      Category: '',
      TargetOrgan: '',
      SelectedItem: '',
      EditableItem: ''
    }
  },
  computed: {
    TrimmedEditableItem () {
      const enteredValue = this.EditableItem.toString().replace(/^[\s|\u3000]+$/g, '')
      return enteredValue
    },

    IsReadyToCommit () {
      return (this.TrimmedEditableItem !== '')
    },

    IsItemEdited () {
      return this.SelectedItem !== this.EditableItem
    },

    IsUsertypedItem () {
      return (this.ItemValue.UserTyped === true)
    }
  },
  methods: {
    GoBack () {
      this.$router.go(-1)
    },

    SubmitOnEnterkey (event) {
      if (event.keyCode === 13) {
        this.CommitChanges()
      }
    }
  }
}
</script>
