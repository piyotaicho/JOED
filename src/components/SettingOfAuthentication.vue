<script setup>
import { reactive, computed } from 'vue'
import { useStore } from '@/store'
import InputPasswordField from '@/components/Molecules/InputPasswordField'
import InputSwitchField from '@/components/Molecules/InputSwitchField'
import * as Popups from '@/modules/Popups'

const store = useStore()

const data = reactive({
  UseAuthentication: true,
  PasswordString: '',
  NewPasswordString: '',
  NewPasswordStringVerify: ''
})

const passwordRequired = computed(() => store.getters['password/isPasswordRequired'])

function resetState () {
  data.UseAuthentication = store.getters['password/isPasswordRequired']
  data.PasswordString = ''
  data.NewPasswordString = ''
  data.NewPasswordStringVerify = ''
}

resetState()

async function commit () {
  try {
    // パスワードが設定されている場合は変更に認証が必要.(システムの認証状態は変更させない.)
    if (store.getters['password/isPasswordRequired']) {
      await store.dispatch('password/Authenticate',
        { PasswordString: data.PasswordString, SuppressStateChange: true })
        .catch(_ => { throw new Error('パスワードが違います.') })
    }

    let newPassword = ''
    if (data.UseAuthentication) {
      if (data.UseAuthentication === true) {
        if (data.NewPasswordString.length < 5) throw new Error('パスワードは5文字以上で設定してください.')
        if (data.NewPasswordString === data.NewPasswordStringVerify) {
          newPassword = data.NewPasswordString
        } else {
          throw new Error('新しいパスワードが確認できません.')
        }
      }
    }
    await store.dispatch('password/SetPassword', newPassword)
    Popups.information('認証設定が変更されました.')

    resetState()
  } catch (error) {
    Popups.alert(error.message)
  }
}
</script>

<template>
  <div class="utility">
    <div class="utility-switches">
      <InputSwitchField
        :value.sync="data.UseAuthentication"
        title="起動時のパスワード確認"
        :options="{'しない': false, 'する': true}" />

      <InputPasswordField
        :value.sync="data.PasswordString"
        title="現在のパスワード"
        placeholder="********"
        :required="true"
        v-if="passwordRequired" />

      <InputPasswordField
        :value.sync="data.NewPasswordString"
        title="新しいパスワード"
        placeholder="********"
        :required="true"
        v-if="data.UseAuthentication" />
      <InputPasswordField
        :value.sync="data.NewPasswordStringVerify"
        title="新しいパスワード(確認)"
        placeholder="********"
        :required="true"
        v-if="data.UseAuthentication" />
    </div>
    <div>
      <el-button type="primary" @click="commit">上記設定を保存</el-button>
    </div>
  </div>
</template>
