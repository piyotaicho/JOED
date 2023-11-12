<template>
  <div class="utility">
    <!-- <div class="title">施設の設定</div> -->
    <div class="utility-switches">
      <InputTextField
        :value.sync="InstitutionName"
        title="施設名称"
        placeholder=" 未設定 "
        :required="true" />

      <InputTextField
        :value.sync="InstitutionID"
        title="施設番号"
        placeholder=" 未設定 "
        :required="true">
        <template #title>
          施設番号
          <el-tooltip placement="bottom-start" :tabindex="-1">
            <template #content><div>施設名称の一部や、＠に続いて都道府県名で検索してリストから選択が可能です.</div></template>
            <i class="el-icon-question" style="padding-top: 0.36rem; margin-left: 0.6rem;"/>
          </el-tooltip>
        </template>
      </InputTextField>

      <div>
        <div class="label"></div>
        <div class="field">
          <el-button type="primary"
            @click="ListInstitutes"
            :disabled="InstitutionName === '' || InstitutionID !== ''">
            施設番号を施設名から検索
          </el-button>
        </div>
      </div>
    </div>
    <el-collapse-transition>
      <div v-if="ShowList">
        <el-table
          :data="InstituteList"
          @row-click="SetInstituteProperties"
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
            label="施設ID"
            prop="ID"
            width="100"
          />
        </el-table>
      </div>
    </el-collapse-transition>

    <div class="utility-switches">
      <InputTextField
        :value.sync="JSOGoncologyboardID"
        title="腫瘍登録施設番号"
        placeholder="日産婦の腫瘍登録施設番号" />
    </div>
    <div>
      <el-button type="primary" @click="CommitSettings" :disabled="!ReadyToCommit">上記設定を保存</el-button>
    </div>
  </div>
</template>

<script>
import InputTextField from '@/components/Molecules/InputTextField'
import * as Popups from '@/modules/Popups'
import { InstituteIDFormat } from '@/modules/CaseValidater'
import { ZenToHanNumbers } from '@/modules/ZenHanChars'

export default {
  name: 'SettingOfInstutute',
  components: {
    InputTextField
  },
  data () {
    return ({
      InstitutionName: '',
      InstitutionID: '',
      JSOGoncologyboardID: '',
      InstituteList: [],
      ShowList: false,
      Preserve: ''
    })
  },
  created () {
    const settings = this.$store.getters['system/InstituteInformation']
    this.InstitutionName = settings.InstitutionName
    this.InstitutionID = settings.InstitutionID
    this.JSOGoncologyboardID = settings.JSOGoncologyboardID
    this.Preserve = JSON.stringify(
      [
        this.InstitutionName,
        this.InstitutionID,
        this.JSOGoncologyboardID
      ])
  },
  computed: {
    ReadyToCommit () {
      return this.InstitutionName.trim() !== '' &&
        this.InstitutionID.trim() !== '' &&
        this.Preserve !== JSON.stringify(
          [
            this.InstitutionName,
            this.InstitutionID,
            this.JSOGoncologyboardID
          ])
    }
  },
  methods: {
    ListInstitutes () {
      this.InstituteList.splice(0)
      this.ShowList = true

      if (this.InstitutionName.trim() === '') return

      // @県名 でもリストできる.
      const [, search, , , pref] = /^([^@＠]*)(([@＠](.+))|)/.exec(this.InstitutionName.trim())

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

        this.InstituteList.splice(0, 0, ...filteredlist)
      })
    },

    SetInstituteProperties (instituteProperties) {
      this.InstitutionName = instituteProperties.name
      this.InstitutionID = instituteProperties.ID

      this.InstituteListView = false
    },

    async CommitSettings () {
      if (this.InstitutionName !== '' && this.InstitutionID !== '') {
        this.InstitutionID = ZenToHanNumbers(this.InstitutionID)
        if (this.InstitutionID.match(InstituteIDFormat) !== null) {
          this.$store.commit('system/SetPreferences',
            {
              InstitutionName: this.InstitutionName,
              InstitutionID: this.InstitutionID,
              JSOGoncologyboardID: this.JSOGoncologyboardID
            })
          await this.$store.dispatch('system/SavePreferences')
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
  }
}
</script>
