<template>
  <div class="edititem">
    <slot></slot>

    <div class="content-bottom">
      <div class="controls">
        <el-button type="primary" @click="emitDiscard">取り消し</el-button>
        <el-button type="primary" @click="emitCommit">登録</el-button>
      </div>
    </div>
  </div>
</template>

<script>
// 編集セクションの登録・取り消しボタン部分(とキーボードショートカット)の大きな雛型 slotに内容を

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

      const platform = process.env.VUE_APP_ELECTRON
        ? process.platform
        : (window.navigator.platform.includes('Mac') ? 'darwin' : 'win32')

      if (platform === 'darwin'
        ? (event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) // macOS - command
        : (event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) // Windows - Ctrl
      ) {
        switch (event.code) {
          case 'KeyU':
            this.emitDiscard()
            break
          case 'Enter':
            event.preventDefault()
            this.emitCommit()
            break
        }
      }
    },
    emitDiscard () {
      this.$emit('discard')
    },
    emitCommit () {
      this.$emit('commit')
    }
  }
}
</script>
