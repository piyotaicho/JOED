<template>
  <div class="QueryBuilder">
    <div style="min-width: 300px; flex-grow: 1;">
      <QueryPane title="登録項目"
        :container="this.listRecord"
        :erasable="true"
        @erase="removeAssignment"
        @dropped="itemDropped"
        />
    </div>
    <div style="min-width: 300px; flex-grow: 1;">
      <QueryPane
        :draggable="true"
        :container="this.listContainer"
        @dragged="CSVitemDragged"
        v-show="source === 'CSV'">
        <template #title>
          <span @click="ToggleSource">&#x1f5d8; CSVファイルのフィールド</span>
          <span @click="CSVcursor('prev')">&#x229f;</span>
          <span @click="CSVcursor('home')">&#x1f56e;</span>
          <span @click="CSVcursor('next')">&#x229e;</span>
        </template>
      </QueryPane>
      <QueryPane
        :draggable="true"
        :container="listFunctions"
        @dragged="functionalitemDragged"
        v-show="source === 'functions'">
        <template #title>
          <span @click="ToggleSource">&#x1f5d8; 生成値</span>
        </template>
      </QueryPane>
    </div>
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
    }
  },
  data () {
    return {
      recordAssignment: {},
      source: 'CSV',
      previewIndex: -1
    }
  },
  watch: {
    recordAssignment () {
      this.$emit('change', this.recordAssignment)
    }
  },
  computed: {
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
            return { [item]: '\u21fd ' + labelvalue }
          }
        })
    }
  },
  methods: {
    ToggleSource () {
      this.source = this.source === 'CSV' ? 'functions' : 'CSV'
    },
    CSVcursor (vector) {
      if (vector === 'home') {
        this.previewIndex = -1
      } else {
        const nextindex = this.previewIndex + (vector === 'prev' ? -1 : 1)
        this.previewIndex = nextindex < 0 ? 0 : (nextindex >= this.CSV.length ? this.CSV.length - 1 : nextindex)
      }
      this.$nextTick()
    },
    removeAssignment (index) {
      if (this.recordAssignment[this.records[index]]) {
        this.$delete(this.recordAssignment, this.records[index])
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
              this.$set(this.recordAssignment, this.records[index], { constants: inputvalue })
            }
          } else {
            this.$set(this.recordAssignment, this.records[index], data)
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
  margin: 0.2rem 0.5rem 0.2rem 0.2rem
  padding: 0.3rem 0.3rem
  min-height: 31rem
  resize: vertical
  overflow-y: hidden
  display: flex
  justify-content: space-space-around
  flex-direction: column
  // flex-wrap: wrap
</style>
