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
      // webpackのコンパイルで条件分岐
      if (process.env.VUE_APP_ELECTRON) {
        window.API.OpenURL(this.url)
      } else {
        window.open(this.url, '_blank')
      }
    }
  }
}
</script>
