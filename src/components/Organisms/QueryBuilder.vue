<template>
  <div class="QueryBuilder">
    <QueryPane title="登録項目"
      :container="this.listRecord"
      :erasable="true"
      @erase="removeAssignment"
      @dropped="itemDropped"
      />
    <QueryPane
      :draggable="true"
      :container="this.listContainer"
      @dragged="CSVitemDragged"
      v-show="source === 'CSV'">
      <template #title>
        <div class="sourceTitle">
          <span>CSVファイルのフィールド</span>
          <el-switch v-model="source"
            inactive-value="CSV"
            active-value="functions"></el-switch>
          <span>生成値</span>
          <div class="record_control">
            <span></span>
            <span @click="CSVcursor('prev')">◀</span>
            <span @click="CSVcursor('home')">インデックス</span>
            <span @click="CSVcursor('next')">▶</span>
          </div>
        </div>
      </template>
    </QueryPane>
    <QueryPane
      :draggable="true"
      :container="listFunctions"
      @dragged="functionalitemDragged"
      v-show="source === 'functions'">
      <template #title>
        <div class="sourceTitle">
          <span>CSVファイルのフィールド</span>
          <el-switch v-model="source"
            inactive-value="CSV"
            active-value="functions"></el-switch>
          <span>生成値</span>
        </div>
      </template>
    </QueryPane>
  </div>
</template>

<script>
import QueryPane from '@/components/Molecules/QueryPane'
import { prompt } from '@/modules/Popups'

function encodeRowName (value) {
  const rowlabel = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (value >= rowlabel.length) {
    const prefix = encodeRowName(((value / rowlabel.length) | 0) - 1)
    return prefix + rowlabel[value % rowlabel.length]
  } else {
    return rowlabel[value]
  }
}

export default {
  name: 'QueryBuilder',
  components: {
    QueryPane
  },
  props: {
    records: {
      type: Array,
      require: true
    },
    functions: {
      type: Object
    },
    CSV: {
      type: Array,
      require: true
    },
    CSVhasTitleRow: {
      type: Boolean,
      default: false
    },
    ruleset: {
      type: Object
    }
  },
  data () {
    return {
      // recordAssignment: {},
      source: 'CSV',
      previewIndex: -1
    }
  },
  computed: {
    recordAssignment () {
      return this.ruleset
    },
    listFunctions () {
      return Object.keys(this.functions)
    },
    listContainer () {
      if (this.previewIndex === -1) {
        return this.listContainerTitle
      } else {
        return this.CSV[this.previewIndex]
      }
    },
    listContainerTitle () {
      if (this.CSVhasTitleRow) {
        return this.CSV[0]
      } else {
        return this.CSV[0].map((element, index) => '列' + encodeRowName(index))
      }
    },
    listRecord () {
      return this.records
        .map(item => {
          const assignedvalue = this.recordAssignment[item]
          if (!assignedvalue) {
            return { [item]: '' }
          } else {
            let labelvalue = ''
            if (assignedvalue.column !== undefined) {
              labelvalue = this.listContainerTitle[assignedvalue.column]
            }
            if (assignedvalue.constants !== undefined) {
              labelvalue = '"' + (assignedvalue.title ? assignedvalue.title : assignedvalue.constants) + '"'
            }
            if (assignedvalue.compute !== undefined) {
              labelvalue = assignedvalue.title
            }
            return { [item]: '\u25C0 ' + labelvalue }
          }
        })
    }
  },
  methods: {
    CSVcursor (vector) {
      if (vector === 'home') {
        this.previewIndex = -1
      } else {
        const nextindex = this.previewIndex + (vector === 'prev' ? -1 : 1)
        this.previewIndex = nextindex < 0 ? 0 : (nextindex >= this.CSV.length ? this.CSV.length - 1 : nextindex)
      }
      this.$nextTick(() => {})
    },
    removeAssignment (index) {
      if (this.recordAssignment[this.records[index]]) {
        // this.$delete(this.recordAssignment, this.records[index])
        this.$emit('delete', this.records[index])
      }
    },
    async itemDropped (index, dragevent) {
      try {
        const data = JSON.parse(dragevent.dataTransfer.getData('text/plain'))
        // ドロップされるオブジェクトは column:, constants:, compute: のいずれか
        if (
          data.column !== undefined ||
          data.constants !== undefined ||
          data.compute !== undefined
        ) {
          // ユーザ入力の定数の場合は prompt で入力を促す
          if (data.constants === '$') {
            let inputvalue = null
            if (data.rule !== undefined) {
              inputvalue = await prompt(data.title, data.rule)
            } else {
              inputvalue = await prompt(data.title)
            }
            if (inputvalue !== null) {
              // this.$set(this.recordAssignment, this.records[index], { constants: inputvalue })
              this.$emit('set', this.records[index], { constants: inputvalue })
            }
          } else {
            // this.$set(this.recordAssignment, this.records[index], data)
            this.$emit('set', this.records[index], data)
          }
        }
      } catch {
        // 全く想定外のドロップを受けたときには無視
      }
    },
    functionalitemDragged (index, dragevent) {
      dragevent.dataTransfer.setData(
        'text/plain',
        JSON.stringify(this.functions[Object.keys(this.functions)[index]])
      )
    },
    CSVitemDragged (index, dragevent) {
      dragevent.dataTransfer.setData(
        'text/plain',
        JSON.stringify({ column: index })
      )
    }
  }
}
</script>

<style lang="sass">
div.QueryBuilder
  border: 1px solid var(--color-text-regular)
  border-radius: 0.3rem
  width: 700px
  min-height: 31rem
  margin: 0.2rem 0.5rem 0.2rem 0.2rem
  padding: 0.3rem 0.3rem
  display: flex
  flex-direction: column
  justify-content: space-between
  align-content: stretch
  resize: vertical
  overflow-y: hidden

div.sourceTitle
  display: inline-flex
  flex-direction: row
  justify-content: space-between
  span
    display: flexbox
    padding-right: 1rem
  div
    padding-right: 1rem

div.record_control
  display: inline-block
  :hover
    color: var(--color-primary)
    cursor: pointer
</style>
