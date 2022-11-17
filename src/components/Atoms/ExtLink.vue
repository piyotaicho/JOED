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
      if (window?.Version) {
        // electron環境
        window.API.OpenURL(this.url)
      } else {
        // ブラウザ環境
        window.open(this.url, '_blank')
      }
    }
  }
}
</script>
