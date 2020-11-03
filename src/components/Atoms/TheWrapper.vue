<template>
  <div class="thewrapper" :style="Style" @click="Click" ref="wrapper">
  <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'TheWrapper',
  props: {
    alpha: {
      type: [String, Number],
      validator (val) {
        return val >= 0 && val <= 100
      },
      default: 0
    }
  },
  mounted () {
    // TheWrapper コンポーネントの内部以外のコントロールへの tabIndex を抑止する.
    const myelements = Array.prototype.filter.call(
      this.$refs.wrapper.getElementsByTagName('*'),
      element => element.tabIndex === 0
    )

    if (myelements.length > 0) {
      const documentelements = Array.prototype.filter.call(
        this.$root.$el.getElementsByTagName('*'),
        element => element.tabIndex === 0
      )
      documentelements.forEach(element => {
        if (Array.prototype.indexOf.call(myelements, element) === -1) {
          element.tabIndex = -2
        }
      })
    } else {
      // TheWrapper コンポーネントが空っぽの場合はドキュメントの tabIndex を全部抑止
      Array.prototype.filter.call(
        this.$root.$el.getElementsByTagName('*'),
        element => element.tabIndex === 0
      )
        .forEach(element => { element.tabIndex = -2 })
    }
  },
  beforeDestroy () {
    // tabIndex の復旧
    Array.prototype.filter.call(
      document.getElementsByTagName('*'),
      element => element.tabIndex === -2
    )
      .forEach(element => { element.tabIndex = 0 })
  },
  computed: {
    Style () {
      return 'background-color: rgba(0,0,0,' + this.alpha / 100 + ')'
    }
  },
  methods: {
    Click (event) {
      this.$emit('click', event)
    }
  }
}
</script>

<style lang="sass">
div.thewrapper
  position: fixed
  z-index: +999
  left: 0
  top: 0
  right: 0
  bottom: 0
</style>
