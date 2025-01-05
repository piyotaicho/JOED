<script setup>
import { reactive, computed } from 'vue'
import { useStore } from '@/store'
import InputTextField from '@/components/Molecules/InputTextField'
import * as Popups from '@/modules/Popups'
import { InstituteIDFormat } from '@/modules/CaseValidater'
import { ZenToHanNumbers } from '@/modules/ZenHanChars'

const store = useStore()
const data = reactive({
  InstitutionName: '',
  InstitutionID: '',
  JSOGoncologyboardID: '',
  Preserve: ''
})

const instituteList = reactive({
  list: [],
  show: false
})

const settings = store.getters['system/InstituteInformation']

data.InstitutionName = settings.InstitutionName
data.InstitutionID = settings.InstitutionID
data.JSOGoncologyboardID = settings.JSOGoncologyboardID

data.Preserve = JSON.stringify(
  [
    data.InstitutionName,
    data.InstitutionID,
    data.JSOGoncologyboardID
  ])

const readyForCommit = computed(() => {
  return data.InstitutionName.trim() !== '' &&
    data.InstitutionID.trim() !== '' &&
    data.Preserve !== JSON.stringify(
      [
        data.InstitutionName,
        data.InstitutionID,
        data.JSOGoncologyboardID
      ])
})

function listInstitutes () {
  instituteList.list.splice(0)
  instituteList.show = true

  if (data.InstitutionName.trim() === '') return

  // @県名 でもリストできる.
  const [, search, , , pref] = /^([^@＠]*)(([@＠](.+))|)/.exec(data.InstitutionName.trim())

  if (search === '' && pref === '') return

  import('@/modules/Masters/InstituteList').then(({ ListOfInstitutions, ListOfPrefectures }) => {
    let prefecturesMatch = ''
    if (pref) {
      const matched = ListOfPrefectures
        .map((item, index) => item.match('^' + pref)
          ? ('0' + (Number(index) + 1).toString(10)).slice(-2)
          : undefined
        )
        .filter(item => item)
      if (matched.length > 0) {
        prefecturesMatch = '^(' + matched.join('|') + ')'
      }
    }

    const filteredlist = ListOfInstitutions
      .filter(item =>
        (!prefecturesMatch || item.ID.match(prefecturesMatch)) && !!item.name.match(search)
      )
      .map(item => {
        item.Prefecture = ListOfPrefectures[Number(item.ID.substring(0, 2)) - 1]
        return item
      })

    instituteList.list.splice(0, 0, ...filteredlist)
  })
}

function setInstituteFromList (instituteProperties) {
  data.InstitutionName = instituteProperties.name
  data.InstitutionID = instituteProperties.ID

  instituteList.show = false
}

async function commitSettings () {
  if (data.InstitutionName !== '' && data.InstitutionID !== '') {
    data.InstitutionID = ZenToHanNumbers(data.InstitutionID)
    if (data.InstitutionID.match(InstituteIDFormat) !== null) {
      store.commit('system/SetPreferences',
        {
          InstitutionName: data.InstitutionName,
          InstitutionID: data.InstitutionID,
          JSOGoncologyboardID: data.JSOGoncologyboardID
        })
      await store.dispatch('system/SavePreferences')
      Popups.information('設定を保存しました.')
      this.Preserve = JSON.stringify(
        [
          this.InstitutionName,
          this.InstitutionID,
          this.JSOGoncologyboardID
        ])
    } else {
      Popups.alert('施設IDを確認してください.')
    }
  }
}
</script>

<template>
  <div class="utility">
    <div class="utility-switches">
      <InputTextField
        :value.sync="data.InstitutionName"
        title="施設名称"
        placeholder=" 未設定 "
        :required="true">
        <template #title>
          施設名称
          <el-tooltip placement="bottom-start" :tabindex="-1">
            <template #content><div>施設名称の一部や、＠に続いて都道府県名で検索して登録施設リストから選択が可能です.</div></template>
            <i class="el-icon-question" style="padding-top: 0.36rem; margin-left: 0.6rem;"/>
          </el-tooltip>
        </template>
      </InputTextField>

      <InputTextField
        :value.sync="data.InstitutionID"
        title="施設コード"
        placeholder=" 未設定 "
        :required="true">
      </InputTextField>

      <div>
        <div class="label"></div>
        <div class="field">
          <el-button type="primary"
            @click="listInstitutes"
            :disabled="data.InstitutionName === '' || data.InstitutionID !== ''">
            施設コードを施設名から検索
          </el-button>
        </div>
      </div>
    </div>
    <el-collapse-transition>
      <div v-if="instituteList.show">
        <el-table
          :data="instituteList.list"
          @row-click="setInstituteFromList"
          height="300"
          style="width: 80%; border-radius: 5px;"
          >
          <el-table-column
            label="所在"
            prop="Prefecture"
            width="100"
          />
          <el-table-column
            label="施設名"
            prop="name"
          />
          <el-table-column
            label="施設コード"
            prop="ID"
            width="100"
          />
        </el-table>
      </div>
    </el-collapse-transition>

    <div class="utility-switches" v-if="data.JSOGoncologyboardID !== ''">
      <InputTextField
        :value.sync="data.JSOGoncologyboardID"
        title="腫瘍登録施設番号"
        placeholder="日産婦の腫瘍登録施設番号" />
    </div>
    <div>
      <el-button type="primary" @click="commitSettings" :disabled="!readyForCommit">上記設定を保存</el-button>
    </div>
  </div>
</template>
