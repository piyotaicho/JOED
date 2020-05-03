<template>
  <span>
    {{Title}}
  </span>
</template>

<script>
import SelectionTree from '@/assets/ItemHandler'

export default {
  name: 'ItemLabel',
  props: {
    Item: {
      type: Object,
      required: true
    }
  },
  computed: {
    Title () {
      return SelectionTree.getPropertyValue(this.Item)
    }
  }
}
</script>
