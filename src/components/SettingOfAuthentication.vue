<template>
  <div class="utility">
    <!-- <div class="title">パスワード認証の設定</div> -->
    <div class="utility-switches">
      <InputSwitchField
        v-model="UseAuthentication"
        title="起動時のパスワード確認"
        :options="{'しない': false, 'する': true}" />

      <InputPasswordField
        v-model.lazy="PasswordString"
        title="現在のパスワード"
        placeholder="********"
        :required="true"
        v-if="$store.getters['password/isPasswordRequired']" />

      <InputPasswordField
        v-model.lazy="NewPasswordString"
        title="新しいパスワード"
        placeholder="********"
        :required="true"
        v-if="UseAuthentication" />
      <InputPasswordField
        v-model.lazy="NewPasswordStringVerify"
        title="新しいパスワード(確認)"
        placeholder="********"
        :required="true"
        v-if="UseAuthentication" />
    </div>
    <div>
      <el-button type="primary" @click="Commit">上記設定を保存</el-button>
    </div>
  </div>
</template>

<script>
import InputPasswordField from '@/components/Molecules/InputPasswordField'
import InputSwitchField from '@/components/Molecules/InputSwitchField'
import Popups from '@/modules/Popups'

export default {
  name: 'SettingOfAuthentication',
  components: {
    InputPasswordField, InputSwitchField
  },
  data () {
    return ({
      UseAuthentication: true,
      PasswordString: '',
      NewPasswordString: '',
      NewPasswordStringVerify: ''
    })
  },
  created () {
    this.ResetState()
  },
  methods: {
    ResetState () {
      this.UseAuthentication = this.$store.getters['password/isPasswordRequired']
      this.PasswordString = ''
      this.NewPasswordString = ''
      this.NewPasswordStringVerify = ''
    },
    async Commit () {
      try {
        // パスワードが設定されているので兎にも角にも認証が必要.(システムの認証状態は変更させない.)
        if (this.$store.getters['password/isPasswordRequired']) {
          await this.$store.dispatch('password/Authenticate',
            { PasswordString: this.PasswordString, SuppressStateChange: true })
            .catch(_ => { throw new Error('パスワードが違います.') })
        }
        let newPassword = ''
        if (this.UseAuthentication) {
          if (this.UseAuthentication === true) {
            if (this.NewPasswordString.length < 5) throw new Error('パスワードは5文字以上で設定してください.')
            if (this.NewPasswordString === this.NewPasswordStringVerify) {
              newPassword = this.NewPasswordString
            } else {
              throw new Error('新しいパスワードが確認できません.')
            }
          }
        }
        await this.$store.dispatch('password/SetPassword', newPassword)
        Popups.information('認証設定が変更されました.')

        this.ResetState()
      } catch (error) {
        Popups.alert(error.message)
      }
    }
  }
}
</script>
