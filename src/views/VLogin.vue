<script setup>
import { onMounted, computed, ref } from 'vue'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import LargeIcon from '@/components/Atoms/LargeIcon'

const store = useStore()
const router = useRouter()

const tilte = computed(() => [
  '日本産科婦人科内視鏡学会',
  '症例登録システム ' +
  store.getters['system/ApplicationName'] +
  ' version ' +
  store.getters['system/ApplicationVersion']
])

const password = ref('')
const loginFailed = ref(false)

const disablePasswordField = ref(false)

onMounted(async () => {
  // 初回起動時
  await store.dispatch('password/Authenticate', { PasswordString: '' })
  disablePasswordField.value = !store.getters.isPasswordRequired
})

async function performAuthentication () {
  await store.dispatch('password/Authenticate', { PasswordString: password.value })
    .then(_ => {
      router.push({ name: 'list' })
    })
    .catch(_ => { loginFailed.value = true })
}
</script>

<template>
  <div class="login-dialog">
    <div class="w30" id="auth-logo"><LargeIcon/></div>
    <div class="w70" id="auth">
      <div class="title">{{tilte[0]}}</div>
      <div class="subtitle">{{tilte[1]}}</div>

      <div>
        <label>
          パスワード :
          <el-badge value="パスワードが違います" :hidden="!loginFailed">
            <input type="password" v-model="password" id="password-entry-box"
              @keyup.13="performAuthentication" :disabled="disablePasswordField" />
          </el-badge>
        </label>
      </div>

      <div>
          <el-button type="primary" style="float: right" @click="performAuthentication">ログイン</el-button>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
div.login-dialog
  position: relative
  border: 1px black solid
  border-radius: 0.5rem
  background-color: ivory
  margin-top: 3rem
  margin-left: 148px
  padding: 1rem 1.5rem
  width: 600px
  display: flex
  flex-direction: row

#auth-logo
  display: flex
  flex-direction: row
  justify-content: space-around
  svg
    width: 100%
    height: 100%
    padding: 10px
    margin: auto 0
#auth
  display: flex
  flex-direction: column
  justify-content: space-around
  margin: 0 3rem
  div
    margin: 0.3rem 0
  div:first-child
    margin-top: 0
  div:last-child
    margin-bottom: 0
</style>
