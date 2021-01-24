<template>
  <div class="QueryBuilder">
    <div class="w45">
      <QueryPane title="登録項目"
        :container="this.listRecord"
        :erasable="true"
        @erase-clicked="removeAssignment"
        @item-dropped="itemDropped"
        />
    </div>
    <div class="w50">
      <QueryPane
        :draggable="true"
        :container="this.listContainer"
        @item-dragged="CSVitemDragged"
        v-show="source === 'CSV'">
        <template #title>
          <span @click="ToggleSource">CSVファイルのフィールド &#x25b6;</span>
        </template>
      </QueryPane>
      <QueryPane
        :draggable="true"
        :container="listFunctions"
        @item-dragged="functionalitemDragged"
        v-show="source === 'functions'">
        <template #title>
          <span @click="ToggleSource">&#x25c0; 生成データ</span>
        </template>
      </QueryPane>
    </div>
  </div>
</template>

<script>
import QueryPane from '@/components/Atoms/QueryPane'
import { prompt } from '@/modules/Popups'

const rowlabel = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
function encodeRowName (value) {
  if (value >= rowlabel.length) {
    const prefix = encodeRowName(((value / rowlabel.length) | 0) - 1)
    return prefix + rowlabel[value % rowlabel.length]
  } else {
    return rowlabel[value]
  }
}

// eslint-disable-next-line no-unused-vars
function decodeRowName (str) {
  if (!str) {
    return undefined
  }
  let decodedvalue = 0
  for (let index = 0; index < str.length; index++) {
    const value = rowlabel.indexOf(str[index])
    if (value > -1) {
      decodedvalue = decodedvalue * rowlabel.length + value + 1
    }
  }
  return --decodedvalue
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
      source: 'CSV'
    }
  },
  watch: {
    recordAssignment () {
      this.$emit('changed', this.recordAssignment)
    }
  },
  computed: {
    listFunctions () {
      return Object.keys(this.functions)
    },
    listContainer () {
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
              labelvalue = '"' + this.listContainer[assignedvalue.column] + '"'
            }
            if (assignedvalue.constants !== undefined) {
              labelvalue = assignedvalue.title ? assignedvalue.title : assignedvalue.constants
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
  border: 1px solid black
  border-radius: 0.3rem
  margin: 0.2rem
  padding: 0.3rem
  height: 16rem
  display: flex
  flex-direction: row
  justify-content: space-between
</style>
