<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from '@/store'
import InputTextField from '@/components/Molecules/InputTextField.vue'
import InputSwitchField from '@/components/Molecules/InputSwitchField.vue'
import * as Popups from '@/modules/Popups'

const store = useStore()

const systemUseAuthentication = computed(() => store.getters['password/isPasswordRequired'])

// フォーム内容
const useAuthentication = ref(true)
const password = reactive({
  current: '',
  new: '',
  verify: ''
})

onMounted(() => {
  useAuthentication.value = store.getters['password/isPasswordRequired']
  password.current = ''
  password.new = ''
  password.verify = ''
})

async function commit () {
  try {
    // パスワードが設定されている場合は変更に認証が必要.(システムの認証状態は変更させない.)
    if (store.getters['password/isPasswordRequired']) {
      await store.dispatch('password/Authenticate',
        { PasswordString: password.current, SuppressStateChange: true })
        .catch(() => { throw new Error('パスワードが違います.') })
    }

    let newPassword = ''
    if (useAuthentication.value === true) {
      if (password.new.length < 5) throw new Error('パスワードは5文字以上で設定してください.')
      if (password.new === password.verify) {
        newPassword = password.new
      } else {
        throw new Error('新しいパスワードが確認できません.')
      }
    }
    await store.dispatch('password/SetPassword', newPassword)
    Popups.information('認証設定が変更されました.')

    // フォーム内容の初期化
    useAuthentication.value = systemUseAuthentication.value
    password.current = ''
    password.new = ''
    password.verify = ''
  } catch (error) {
    Popups.alert(error.message)
  }
}
</script>

<template>
  <div class="utility">
    <div class="utility-switches">
      <InputSwitchField
        v-model="useAuthentication"
        title="起動時のパスワード確認"
        :options="[{text: 'しない'}, {text: 'する'}]" />

      <InputTextField
        password
        v-model="password.current"
        title="現在のパスワード"
        placeholder="********"
        :required="true"
        v-if="systemUseAuthentication" />

      <InputTextField
        password
        v-model="password.new"
        title="新しいパスワード"
        placeholder="********"
        :required="true"
        v-if="useAuthentication" />
      <InputTextField
        password
        v-model="password.verify"
        title="新しいパスワード(確認)"
        placeholder="********"
        :required="true"
        v-if="useAuthentication" />
    </div>
    <div>
      <el-button type="primary" @click="commit">上記設定を保存</el-button>
    </div>
  </div>
</template>
