<template>
  <SectionBlock title="合併症"
    :draggable="false"
    :container.sync="items"
    @addnewitem='AddNewItem()'>
    <template #beforeitemlist>
      <LabeledCheckbox v-model="option">合併症なし</LabeledCheckbox>
      <div class="section-item-list" style="display: none;"><div class="item-description"></div></div>
    </template>
    <template #default="itemprops">
      <SectionAEItem :item="itemprops.item" @remove="RemoveItem(itemprops.index)" />
    </template>
  </SectionBlock>
</template>

<script>
import SectionBlock from '@/components/Molecules/Section'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'
import SectionAEItem from '@/components/SectionAEItem'

export default {
  name: 'SectionAEs',
  components: {
    SectionBlock, LabeledCheckbox, SectionAEItem
  },
  props: {
    container: {
      type: Array,
      required: true
    },
    optionValue: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    items: {
      get () {
        return this.container
      },
      set (value) {
        this.$emit('update:container', value)
      }
    },
    option: {
      get () {
        return this.optionValue
      },
      set (value) {
        this.$emit('update:optionValue', value)
      }
    }
  },
  methods: {
    AddNewItem () {
      this.$emit('addnewitem')
    },
    RemoveItem (index) {
      this.$emit('removeitem', index)
    }
  }
}
</script>
