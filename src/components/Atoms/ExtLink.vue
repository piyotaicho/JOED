<template>
  <span class="extlink" @click="Click" style="text-decoration: underline;">
    <slot>{{url}}</slot>
  </span>
</template>

<script>
export default {
  name: 'ExtLink',
  props: {
    url: {
      type: String,
      required: true
    }
  },
  methods: {
    Click () {
      if (process.env.VUE_APP_ELECTRON) {
        try {
          const { shell } = require('electron')
          shell.openExternal(this.url)
        } catch (_) {
          // noop
        }
      } else {
        window.open(this.url, '_blank')
      }
    }
  }
}
</script>
