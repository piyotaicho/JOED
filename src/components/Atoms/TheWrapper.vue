<template>
  <div class="thewrapper" :style="Style" @click="Click" ref="wrapper">
  <div><slot></slot></div>
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
    },
    preventClose: {
      type: Boolean,
      default: false
    }
  },
  created () {
    document.getElementsByTagName('html')[0].style.overflowY = 'hidden'
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

    // beforeUnloadの抑止をつける
    if (this.preventClose) {
      window.addEventListener('beforeunload', this.BeforeUnloadLister)
    }
  },
  beforeDestroy () {
    document.getElementsByTagName('html')[0].style.overflowY = 'auto'

    // beforeUnloadの抑止を終了
    if (this.preventClose) {
      window.removeEventListener('beforeunload', this.BeforeUnloadLister)
    }
    // tabIndex の復帰
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
    },
    BeforeUnloadLister (event) {
      event.preventDefault()
      event.returnValue = ''
      return false
    }
  }
}
</script>

<style lang="sass">
div.thewrapper
  position: fixed
  z-index: +10
  left: 0
  top: 0
  width: 100%
  height: 100%
  overflow: auto
</style>
