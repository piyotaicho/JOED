<template>
  <div class="edititem">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'EditSection',
  mounted () {
    document.addEventListener('keydown', this.KeyboardEventhandler, true)
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.KeyboardEventhandler, true)
  },
  methods: {
    KeyboardEventhandler (event) {
      if (event.repeat) return

      if (this.$store.getters['system/Platform'] === 'darwin'
        ? (event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey)
        : (event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey)
      ) {
        switch (event.code) {
          case 'KeyU':
            this.$emit('discard')
            break
          case 'Enter':
            event.preventDefault()
            this.$emit('commit')
            break
        }
      }
    }
  }
}
</script>
