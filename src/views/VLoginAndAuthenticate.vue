<template>
  <div class="app-dialog w600p">
    <div class="title-section">JOED version 5DEV</div>

    <div>
      <span>パスワード : </span>
      <input type="password" v-model="PasswordString" id="password-entry-box" :disabled="isPasswordFieldIsDisabled" />
    </div>

    <div>
        <input type="button" value="ログイン" @click="PerformAuthentication" />
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

<style lang="sass">
div.authentication
  position: relative
  width: 600px
  top: 50%
  margin: auto auto
  padding: 10px
  border: black 1px solid
  border-radius: 5px
  background-color: ivory
  display: flex
  flex-direction: column
  div
    margin: 14px
    text-align: center
  .authentication-title
    font-size: 1.35rem
</style>
