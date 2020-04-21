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
  mounted () {
    if (this.ItemValue) {
      var tree = this.GetItemValueTree
      switch (tree.length) {
        case 3:
          [this.Category, this.TargetOrgan, this.SelectedItem] = [...tree]
          this.EditableItem = tree[2]
          break
        case 2:
          [this.Category, this.EditableItem] = [...tree]
          break
        case 1:
          this.EditableItem = tree[0]
          break
      }
    }
  },
  computed: {
    GetCategories () {
      // mixinでは特になにもしない {} はデータソースオブジェクト
      return Object.keys({})
    },
    GetTargetOrgans () {
      // mixinでは特になにもしない {} はデータソースオブジェクト
      return ({}[this.Category]) ? Object.keys({}[this.Category]) : []
    },
    GetCandidateItems () {
      // mixinでは特になにもしない {} はデータソースオブジェクト
      return (this.Category !== '' && this.TargetOrgan !== '') ? {}[this.Category][this.TargetOrgan] : []
    },
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
      var GetTextInHash = (h = {}) => {
      // ハッシュを辿って Text のkeyをもつ最初の値を返す
        if (h.Text) {
          return h.Text
        } else {
          for (var i in h) {
            return GetTextInHash(h[i])
          }
          return ''
        }
      }
      return GetTextInHash(this.ItemValue)
    },
    GetItemValueTree () {
      var GetKeysInHash = (h = {}, a = []) => {
        if (h.Text) {
          return a.push(h.Text) && a
        } else {
          for (var i in h) {
            return GetKeysInHash(h[i], a.push(i) && a)
          }
          return a
        }
      }
      return GetKeysInHash(this.ItemValue)
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
      // do nothing in mixin
    }
  }
}
</script>
