<template>
  <div id="password-authentication">
    <div class="title">JOED version 5DEV</div>

    <div class="dialog-row">
      <span>パスワード : </span>
      <input type="password" v-model="PasswordString" id="password-entry-box" v-bind:disabled="isPasswordFieldIsDisabled" />
    </div>

    <div class="dialog-row">
        <input type="button" value="ログイン" v-on:click="PerformAuthentication" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ViewLoginAndAuthenticate',
  prop: {
    PasswordRequired: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return ({
      PasswordString: ''
    })
  },
  computed: {
    isPasswordFieldIsDisabled () {
      return !this.PasswordRequired
    }
  },
  methods: {
    PerformAuthentication () {
      if (this.isPasswordFieldIsDisabled || this.PasswordString === 'passed') {
        this.$router.push('/list')
      } else {
        this.PasswordString = ''
      }
    }
  }
}
</script>

<style lang="sass" scoped>
div#password-authentication
  position: relative
  width: 800px
  top: 50%
  background-color: ivory
  text-align: center
  margin: auto auto
  padding: 10px
  border: black 1px solid
  border-radius: 5px

div.title
  margin: 14px
  text-align: center
  font-size: 150%

div.dialog-row
  margin: 14px
  text-align: center
</style>
