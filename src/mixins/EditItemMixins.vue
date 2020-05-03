<script>
import SelectionTree from '@/assets/ItemHandler'

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
    if (Object.keys(this.ItemValue).length > 0) {
      const tree = SelectionTree.getItemChain(this.ItemValue)
      const enterdItem = tree.pop()

      this.Category = tree[0]
      this.$nextTick().then(() => {
        this.TargetOrgan = tree[1]
        this.$nextTick().then(() => {
          this.SelectedItem = enterdItem
          this.$nextTick().then(() => {
            this.EditableItem = enterdItem
          })
        })
      })
    }
  },
  computed: {
    TrimmedEditableItem () {
      const enteredValue = this.EditableItem.toString().trim()
      return enteredValue.replace(/^[\s|\u3000]+$/g, '')
    },

    IsReadyToCommit () {
      return (this.TrimmedEditableItem !== '')
    },

    IsItemEdited () {
      return this.SelectedItem !== this.EditableItem
    } /*,

    GetItemValueAsText () {
      return SelectionTree.getPropertyValue(this.ItemValue)
    },

    GetItemValueTree () {
      return SelectionTree.getItemChain(this.ItemValue)
    } */
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
        : { Text: this.TrimmedEditableItem, Chain: [this.Category, this.TargetOrgan] })
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
