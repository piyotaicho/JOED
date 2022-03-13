<template>
  <div class="flex-content">
    <div class="w30"></div>
    <div class="w20 selectionbox">
      <div>
        <span>{{DescriptionContainer.Title}}</span>
      </div>
    </div>
    <div class="w40 selectionbox">
      <template v-if="IsMultipleSelection">
        <template v-for="item of Source">
          <div :key="item">
            <LabeledCheckbox v-model="SelectedValue" :value="item" :key="item">
              {{spliceMarker(item)}}
            </LabeledCheckbox>
          </div>
        </template>
      </template>
      <template v-else>
        <select v-model="SelectedValue[0]">
          <option v-for="item of Source" :key="item" :value="item">
            {{spliceMarker(item)}}
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
    prop: 'DescriptionContainer',
    event: 'update'
  },
  props: {
    DescriptionContainer: {
      type: Object, // .Title, .SelectionMode, .Options[], .Value[]
      required: true
    }
  },
  computed: {
    Source () {
      return this.DescriptionContainer.Options || []
    },
    IsMultipleSelection () {
      return (
        this.DescriptionContainer.SelectionMode === 'any' ||
        this.DescriptionContainer.SelectionMode === 'anyornone'
      )
    },
    SelectedValue: {
      get () {
        return this.DescriptionContainer.Value ? this.DescriptionContainer.Value : []
      },
      set (value) {
        const description = Object.assign({}, this.DescriptionContainer)
        /*
          Title: this.DescriptionContainer.Title,
          Options: this.DescriptionContainer.Options,
          Multi: this.DescriptionContainer.SelectionMode,
          Value: []
        }
        */
        if (value === undefined || typeof value === 'string') {
          // SELECTからのイベント
          if (value) {
            description.Value = [value]
          }
        }
        if (Array.isArray(value)) {
          // CHECKBOXからのイベント
          if (value.length > 0 || description.SelectionMode === 'anyornone') {
            description.Value = [...value]
          }
        }
        this.$emit('update', description)
      }
    }
  },
  methods: {
    spliceMarker (str) {
      return str.replace(/\[.+\]/g, '').replace(/\$$/, '')
    }
  }
}
</script>
