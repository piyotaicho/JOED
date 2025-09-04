<template>
  <div class="QueryBuilder">
    <QueryPane title="登録項目"
      :container="fieldPaneContent"
      :erasable="true"
      @erase="removeAssignment"
      @dropped="itemDropped"
      />

    <QueryPane
      :draggable="true"
      :container="paneMode === 'csv' ? csvPaneContent : generatorFunctionsKeys"
      @dragged="itemDragged">
      <template #title>
        <div class="sourceTitle">
          <span>CSVファイルのフィールド</span>
          <el-switch v-model="paneMode"
            inactive-value="csv"
            active-value="functions"></el-switch>
          <span>生成値</span>

          <div class="record_control" v-show="paneMode === 'csv'">
            <span></span>
            <span @click="moveCursor('prev')">◀</span>
            <span @click="moveCursor('home')">インデックス</span>
            <span @click="moveCursor('next')">▶</span>
          </div>
        </div>
      </template>
    </QueryPane>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QueryPane from '@/components/Molecules/QueryPane.vue'
import { prompt } from '@/modules/Popups'
import { fieldNames, generatorFunctions } from '@/modules/ImportCSV.js'

const props = defineProps({
  csv: {
    type: Array,
    require: true
  },
  csvHeader: {
    type: Boolean,
    default: false
  },
  ruleset: {
    type: String
  }
})

const emit = defineEmits(['set', 'delete'])

/**
 * Excel型(A...Z,AA...AZ,BA...)のカラムラベル生成
 * @param {Number} value
 */
function encodeToColumnLabel (value) {
  const rowlabel = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (value >= rowlabel.length) {
    const prefix = encodeToColumnLabel(((value / rowlabel.length) | 0) - 1)
    return prefix + rowlabel[value % rowlabel.length]
  } else {
    return rowlabel[value]
  }
}

const generatorFunctionsKeys = Object.keys(generatorFunctions)

const paneMode = ref('csv')
const previewIndex = ref(-1)

const ruleset = computed(() => JSON.parse(props.ruleset))

const csvPaneContent = computed(() => {
  if (previewIndex.value === -1) {
    return csvColumnLabel.value
  } else {
    return props?.csv ? props.csv[previewIndex.value] : []
  }
})

const csvColumnLabel = computed(() => {
  if (props.csvHeader) {
    return props.csv[0]
  } else {
    return props.csv[0].map((element, index) => '列' + encodeToColumnLabel(index))
  }
})

const fieldPaneContent = computed(() => fieldNames.map(
  fieldName => {
    const assignedvalue = ruleset.value[fieldName]
    if (!assignedvalue) {
      return [fieldName, '']
    } else {
      let labelText = ''
      switch (true) {
        case assignedvalue?.column !== undefined:
          labelText = csvColumnLabel.value[assignedvalue.column]
          break
        case assignedvalue?.constants !== undefined:
          labelText = '"' + (assignedvalue.title ? assignedvalue.title : assignedvalue.constants) + '"'
          break
        case assignedvalue?.compute !== undefined:
          labelText = assignedvalue.title
          break
      }
      return [fieldName, '\u25C0 ' + labelText]
    }
  })
)

const moveCursor = (vector) => {
  if (vector === 'home') {
    previewIndex.value = -1
  } else {
    const lastIndex = props?.csv ? props.csv.length : 0
    const nextIndex = previewIndex.value + (vector === 'prev' ? -1 : 1)
    previewIndex.value = nextIndex < 0 ? 0 : (nextIndex >= lastIndex ? lastIndex - 1 : nextIndex)
  }
}

const removeAssignment = (index) => {
  if (ruleset.value[fieldNames[index]]) {
    emit('delete', fieldNames[index])
  }
}

const itemDropped = async (index, dragevent) => {
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
          emit('set', fieldNames[index], { constants: inputvalue })
        }
      } else {
        emit('set', fieldNames[index], data)
      }
    }
  } catch {
    // 全く想定外のドロップを受けたときには無視
  }
}

const itemDragged = (index, dragevent) => dragDataTransfer(
  paneMode.value === 'csv'
    ? { column: index }
    : generatorFunctions[generatorFunctionsKeys[index]],
  dragevent
)

const dragDataTransfer = (data, dragevent) => dragevent.dataTransfer.setData(
  'text/plain',
  JSON.stringify(data)
)
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
