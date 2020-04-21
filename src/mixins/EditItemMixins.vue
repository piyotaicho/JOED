<script>
import SelectionTree from '@/views/ItemHandler'

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
  mounted () {
    if (this.ItemValue) {
      const tree = SelectionTree.getItemChain(this.ItemValue)
      const enterdItem = tree.pop()

      this.Category = tree[0]
      this.TargetOrgan = tree[1]
      this.SelectedItem = enterdItem

      this.EditableItem = enterdItem
    }
  },
  computed: {
    // 以下はmixinでは定義できない
    //
    // GetCategories () {
    //   return Object.keys({ /* SelectionTree */ })
    // },
    //
    // GetTargetOrgans () {
    //   return ({ /* SelectionTree */ }[this.Category]) ? Object.keys({ /* SelectionTree */ }[this.Category]) : []
    // },
    //
    // GetCandidateItems () {
    //   return (this.Category !== '' && this.TargetOrgan !== '') ? { /* SelectionTree */ }[this.Category][this.TargetOrgan] : []
    // },

    TrimmedEditableItem () {
      return this.EditableItem.replace(/^[\s|\u3000]+$/g, '')
    },

    IsReadyToCommit () {
      return (this.TrimmedEditableItem !== '')
    },

    IsItemEdited () {
      return this.SelectedItem !== this.EditableItem
    },

    GetItemValueAsText () {
      return SelectionTree.getPropertyValue(this.ItemValue)
    },

    GetItemValueTree () {
      return SelectionTree.getItemChain(this.ItemValue)
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
    },

    CommitChanges () {
      this.EmitItem(this.IsItemEdited
        ? { Text: this.TrimmedEditableItem, UserTyped: true }
        : { [this.Category]: { [this.TargetOrgan]: { Text: this.TrimmedEditableItem } } })
      this.GoBack()
    },

    EraseItem () {
      this.EmitItem('')
      this.GoBack()
    },

    EmitItem (value) {
      // mixinの中ではなにもしない
    }
  }
}
</script>
