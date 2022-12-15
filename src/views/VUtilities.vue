<template>
  <div>
    <el-tabs v-model="SelectedTab" tab-position="left">
      <el-tab-pane name="list">
        <template v-slot:label>
          <span><i class="el-icon-d-arrow-left" /> 戻る</span>
        </template>
      </el-tab-pane>
      <el-tab-pane label="データ出力" name="export">
        <ExportData/>
      </el-tab-pane>
      <el-tab-pane label="データ読み込み" name="import">
        <ImportData/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ExportData from '@/components/Export'
import ImportData from '@/components/Import'

export default {
  name: 'ViewUtilities',
  components: {
    ExportData, ImportData
  },
  data () {
    return ({
      SelectedTabName: ''
    })
  },
  created () {
    this.SelectedTabName = this.$route.name
  },
  mounted () {
    document.addEventListener('keydown', this.EventLister, true)
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.EventLister, true)
  },
  beforeRouteUpdate (to, from, next) {
    if (to.name !== from.name) {
      this.SelectedTabName = to.name
      next()
    }
  },
  computed: {
    SelectedTab: {
      get () {
        return this.SelectedTabName
      },
      set (value) {
        this.SelectedTabName = value
        this.$router.push({ name: value }).catch(_ => {})
      }
    }
  },
  methods: {
    EventLister (event) {
      if (this.$store.getters['system/Platform'] === 'darwin'
        ? (event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) // macOS - command
        : (event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) // Windows - Ctrl
      ) {
        if (event.code === 'KeyU') {
          this.goBack()
        }
      }
    },
    goBack () {
      this.$router.push({ name: 'list' })
    }
  }
}
</script>
