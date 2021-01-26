<template>
  <div class="utility">
    <div>
      <div class="title">データ読み込み</div>
      <div class="subtitle">ファイル種別の指定</div>
      <div>
        <select v-model="ImportMode">
          <option value="csv">ExcelやFilemaker等から出力した CSVファイル</option>
          <option value="merge" selected>症例登録システム version4 で入力・出力した mergeファイル</option>
          <option value="json">JOED5のバックアップ形式に準拠した jsonファイル</option>
        </select>
      </div>
      <input-file @load="LoadFile" ButtonText="ファイルの指定" :AcceptFileTypes="FileExtentions[ImportMode]"/>
    </div>

    <!-- Importerセクション -->
    <import-CSV v-if="ImportMode === 'csv'" :stream="FileStream" :disabled="!FileStream" @done="Processed"/>
    <import-merge-v4 v-if="ImportMode === 'merge'" :stream="FileStream" :disabled="!FileStream" @done="Processed"/>
    <!-- <import-json v-if="ImportMode === 'json'" :stream="FileStream" :disabled="!FileStream" @done="Processed"/> -->

    <div>
      <el-button type="primary" :disabled="CreatedDocument.length === 0 || Committing > 0" @click="CommitImported">変換したデータの登録</el-button>
    </div>
    <div class="progress-views">
      <step-indicator :step="1" :stepcount="Committing" icon="el-icon-eleme" description="登録">
        <el-progress v-show="Committing > 0" :percentage="ProgressBar"/>
      </step-indicator>
    </div>

    <TheWrapper prevent-close v-if="Processing"/>
  </div>
</template>

<script>
import InputFile from '@/components/Molecules/InputFile'
import StepIndicator from '@/components/Molecules/StepIndicator'
import ImportMergeV4 from '@/components/ImportMergeV4'
import ImportCSV from '@/components/ImportCSV'
import TheWrapper from '@/components/Atoms/TheWrapper'
import * as Popups from '@/modules/Popups'

export default {
  name: 'Import',
  components: { InputFile, StepIndicator, ImportMergeV4, ImportCSV, TheWrapper },
  data () {
    return ({
      Processing: false,
      Committing: 0,
      ImportMode: 'merge',
      FileExtentions: {
        json: '.json',
        csv: '.csv',
        merge: '.mer'
      },
      FileStream: '',
      DocumentProcessed: false,
      CreatedDocument: [],
      ProgressBar: 0
    })
  },
  watch: {
    ImportMode () {
      this.ResetState()
    }
  },
  computed: {
    StepCommit () {
      if (this.CreatedDocument.length === 0) {
        return -1
      }
      if (this.Committing) {
        return 0
      } else {
        return 1
      }
    }
  },
  methods: {
    ResetState () {
      this.Processing = false
      this.Committing = 0

      this.DocumentProcessed = false

      this.FileStream = ''
      this.CreatedDocument.splice(0)
      this.ProgressBar = 0
    },
    LoadFile (content) {
      this.ResetState()
      this.FileStream = content
    },
    Processed (newdocuments) {
      this.CreatedDocument.splice(0)
      this.CreatedDocument.splice(0, 0, ...newdocuments)
    },
    async CommitImported () {
      if (this.CreatedDocument.length === 0) {
        return
      }

      this.Committing = 1
      this.ProgressBar = 0
      this.Processing = true

      let count = 0
      const errors = []

      for (const record of this.CreatedDocument) {
        await this.$store.dispatch('UpsertDocument', record)
          .then(_ => { this.ProgressBar = Math.round(++count * 100 / this.CreatedDocument.length) })
          .catch(error => errors.push(error.Message || error + '\n' + JSON.stringify(record)))
      }

      this.ImportProgress = 100
      this.Committing = 2
      this.Processing = false
      await this.$nextTick()

      let message = count + ' 例を登録しました.'
      if (errors.length > 0) {
        message += '\n' + errors.length + ' 件の登録に失敗しました.(重複登録の可能性があります.)'
        Popups.alert(message)
      } else {
        Popups.information(message)
      }

      this.CreatedDocument.splice(0)
      this.$nextTick()
      // ステータスをリセットする
      // this.ResetState()
    }
  }
}
</script>
