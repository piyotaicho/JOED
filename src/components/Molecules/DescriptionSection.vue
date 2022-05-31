<template>
  <div class="flex-content">
    <div class="w30"></div>
    <div class="w20 selectionbox">
      <div>
        <span>{{ Container.Title }}</span>
      </div>
    </div>
    <div class="w40 selectionbox">
      <template v-if="IsMultipleSelection">
        <template v-for="item of Source">
          <div :key="item">
            <LabeledCheckbox v-model="SelectedArrayValue" :value="item" :key="item">
              {{ ItemCaption(item) }}
            </LabeledCheckbox>
          </div>
        </template>
      </template>
      <template v-else>
        <select v-model="SelectedSingleValue">
          <option v-for="item of Source" :key="item" :value="item">
            {{ ItemCaption(item) }}
          </option>
        </select>
      </template>
    </div>
    <div class="w10"></div>
  </div>
</template>

<script>
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'

export default {
  name: 'DescriptionSection',
  components: {
    LabeledCheckbox
  },
  model: {
    prop: 'Container',
    event: 'update'
  },
  props: {
    Container: {
      type: Object, // .Title, .SelectionMode, .Options[], .Value[]
      required: true
    }
  },
  computed: {
    Source () {
      return this.Container?.Options || []
    },
    IsMultipleSelection () {
      // .SelectionModeは'one'がデフォルトで設定されていないことも想定
      return (
        this.Container?.SelectionMode === 'any' ||
        this.Container?.SelectionMode === 'anyornone'
      )
    },
    SelectedArrayValue: {
      get () {
        return this.Container.Value ? this.Container.Value : []
      },
      set (value) {
        this.EmitValue(value)
      }
    },
    SelectedSingleValue: {
      get () {
        if (this.Container.Value.length === 0) {
          return undefined
        } else {
          if (this.Container.Value.length > 1) {
            this.EmitValue(this.Container.Value[0])
          }
          return this.Container.Value[0]
        }
      },
      set (value) {
        this.EmitValue(value)
      }
    }
  },
  methods: {
    ItemCaption (str) {
      return str.replace(/\[.+\]/g, '').replace(/\$$/, '')
    },
    EmitValue (value) {
      const newvalue = []
      if (value === undefined || typeof value === 'string') {
        // SELECTから
        if (value && this.Container.Options.indexOf(value) !== -1) {
          newvalue.push(value)
        }
      }
      if (Array.isArray(value)) {
        // CHECKBOXから

        // Optionsからvalueに該当するものをピックアップ > Optionsの順番を維持して保持
        const filtedvalue = this.Container.Options.filter(
          (option) => value.indexOf(option) !== -1
        )
        if (filtedvalue.length > 0 || newvalue.SelectionMode === 'anyornone') {
          newvalue.push(...filtedvalue)
        }
      }

      const newContainer = Object.assign(this.Container, { Value: newvalue })
      this.$emit('update', newContainer)
    }
  }
}
</script>
