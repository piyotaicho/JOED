<template>
  <div class="utility">
    <div>
      <div class="title-section">mergeファイルからのデータ読み込み</div>
      <div>
        症例登録システムver.4で生成されたmergeファイルから症例データを読み込むことが出来ます.<br/>
        システムの大幅な変更に伴い,データの修正は必ず必要になります.併せて以下の制限がありますがご了承ください.<br/>
        <ul>
          <li>この処理で読み込まれたデータについては, 全て編集と確認が必要になります.</li>
          <li>合併症については「合併症なし」以外は自動での読み込みが出来ません. ご面倒ですが個々に入力を御願いします.</li>
        </ul>
      </div>
    </div>
    <div>
      <InputFile @change="LoadFile"></InputFile>
      <el-button type="primary" :disabled="InFile.length <= 0" @click="ProcessFile()">読み込みを開始</el-button>
      <el-button type="primary" :disabled="!ReadyToRegister" :loading="Processing" @click="CommitImported">読み込んだデータの登録</el-button>
    </div>

    <el-collapse-transition>
      <div class="progress-views" v-show="ProcessStep">
        <el-steps :active="ProcessStep" process-status="warning" finish-status="success" direction="vertical" space="42px">
          <el-step title="入力ファイルのフォーマット検証">
            <template #description>
              <span>ファイル中に{{InFile.length}}件のデータがあります.<br/></span>
              <span v-if="DeIdentified">指定のファイルは提出用データです.患者IDは登録番号から自動生成されます.</span>
            </template>
          </el-step>
          <el-step title="フィールドの割り当てとレコードの検証">
            <template #description>
              <span v-if="QueryDocuments.length > 0">{{QueryDocuments.length}}件のデータが対象になります.</span>
            </template>
          </el-step>
          <el-step title="登録">
            <template #description>
              <el-progress  v-show="Processing" :percentage="ImportProgress"></el-progress>
            </template>
          </el-step>
        </el-steps>
      </div>
    </el-collapse-transition>

    <TheWrapper v-if="Processing"/>
  </div>
</template>

<script>
import InputFile from '@/components/Molecules/InputFile'
import TheWrapper from '@/components/Atoms/TheWrapper'
import { phraseTitledCSV, CreateDocument } from '@/modules/CSVimporter'
import Popups from 'depmodules/Popups'

export default {
  name: 'ViewImport',
  components: { InputFile, TheWrapper },
  data () {
    return ({
      Processing: false,
      ProcessStep: 0,
      ImportProgress: 0,
      InFile: [],
      DeIdentified: false,
      ReadyToRegister: false,
      QueryDocuments: []
    })
  },
  methods: {
    ResetState () {
      this.Processing = false
      this.ProcessStep = 0
      this.ReadyToRegister = false
      this.InFile.splice(0)
      this.QueryDocuments.splice(0)
    },
    LoadFile (eventvalue) {
      const records = phraseTitledCSV(eventvalue)
      this.InFile.splice(0)
      if ((Array.isArray(records) && records.length > 0) &&
        (records[0]['内部ID'] && records[0]['手術時間'])) {
        this.DeIdentified = !records[0].ID
        Object.assign(this.InFile, records)
      } else {
        Popups.alert('指定されたファイルは 症例登録システムJOE-D version 4 から適切に出力されたmergeファイル(.mer)ではありません.')
        this.ResetState()
      }
      this.ProcessStep = 0
    },
    ProcessFile () {
      this.QueryDocuments.splice(0)
      try {
        this.ProcessStep = 1
        for (const record of this.InFile) {
          try {
            const createddocument = CreateDocument(record)
            this.QueryDocuments.push(createddocument)
          } catch (error) {
            if (!Popups.confirm('指定されたファイル中に不適切なレコードがあります.\n残りの処理を続行しますか?')) {
              throw new Error('不適切なレコード\n', JSON.stringify(record))
            }
          }
        }
        this.ProcessStep = 2
        this.ReadyToRegister = true
      } catch (error) {
        console.log(error)
        this.ResetState()
      }
    },
    async CommitImported () {
      this.ProcessStep = 3
      this.ImportProgress = 0
      this.Processing = true
      let count = 0
      const errors = []

      for (const newdocument of this.QueryDocuments) {
        await this.$store.dispatch('UpsertDocument', newdocument)
          .then(_ => { this.ImportProgress = Math.round(++count * 100 / this.QueryDocuments.length) })
          .catch(error => errors.push(error.Message || error + '\n' + JSON.stringify(newdocument)))
      }

      let message = count + ' 例を登録しました.'
      if (errors.length > 0) {
        console.log(errors)
        message += '\n' + errors.length + ' 件の登録に失敗しました.(重複登録の可能性があります.)'
        Popups.alert(message)
      } else {
        Popups.information(message)
      }

      // ステータスをリセットする
      this.ResetState()
    }
  }
}
</script>
