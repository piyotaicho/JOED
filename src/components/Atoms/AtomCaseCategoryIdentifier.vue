<template>
  <div class="casecategoryidentifier" :style="{backgroundColor: BoxColor}"></div>
</template>

<script>
export default {
  name: 'AtomCaseCategoryIdentifier',
  props: {
    category: {
      type: String,
      required: true
    }
  },
  computed: {
    BoxColor () {
      switch (this.category) {
        case '腹腔鏡':
        case '腹腔鏡悪性':
          return '#31FF00'
        case 'ロボット':
        case 'ロボット悪性':
          return '#22B200'
        // case '悪性手術':
        // return '#EDFF00'
        case '子宮鏡':
          return '#00FFDC'
        case '卵管鏡':
          return '#6D9FFF'
        default:
          return '#111111'
      }
    }
  }
}
</script>

<style lang='sass' scoped>
div.casecategoryidentifier
  position: relative
  border: black 1px solid
  margin: auto
  width: 32px
  height: 32px
</style>
