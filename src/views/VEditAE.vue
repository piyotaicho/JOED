<template>
  <TheWrapper alpha="10">
    <EditSection @commit="CommitChanges" @discard="GoBack">
      <!-- カテゴリの設定 -->
      <div class="flex-content">
        <div class="w20 subtitle">
          <span>合併症の分類</span>
        </div>
        <div class="w80">
          <select v-model="Category" @change="CategoryChanged()" ref="firstelement">
            <option value="" disabled style="display:none;">リストから選択</option>
            <option v-for="item of master.Category" :key="item.Value" :value="item.Value">
              {{item.Text}}
            </option>
          </select>
        </div>
      </div>

      <!-- コンポーネントの展開 -->
      <template v-for="component of components">
        <div class="flex-content" :key="component">
          <!-- Bloodcount はスペシャルコンポーネント -->
          <template v-if="component === 'Bloodcount'">
          <div class="w20 subtitle">
            <span>出血量</span>
          </div>
          <div class="w80 AEcheckboxes">
            <div>
              <input type="text" v-model="AE.BloodCount" :disabled="unknownBloodCounts" placeholder="出血量を入力してください"/> ml
            </div>
            <div>
              <LabeledCheckbox :container="unknownBloodCounts" @update:container="UnknownBleedCountsChanged">出血量不明</LabeledCheckbox>
            </div>
          </div>
          </template>
          <!-- その他のチェックボックスコンポーネント -->
          <template v-else>
            <div class="w20 subtitle">
              <span>{{master.Components[component].Title}}</span>
            </div>
            <div class="w80 AEcheckboxes">
              <EditAESelect :value.sync="AE[master.Components[component].Element]" :items="master.Components[component].Items" />
            </div>
          </template>
        </div>
      </template>

      <div class="flex-content"> <!-- Grade -->
        <div class="w20 subtitle">
          <span>合併症の程度</span>
        </div>
        <div class="w80">
          <select v-model="AE.Grade">
            <option value="" disabled style="display:none;">リストから選択</option>
            <option v-for="grade in master.Grading" :key="grade.Grading" :value="grade.Grade">
              {{grade.Text}}
            </option>
          </select>
        </div>
      </div>
      <div class="flex-content"> <!-- Course -->
        <div class="w20 subtitle">
          <span>転帰</span>
        </div>
        <div class="w80">
          <div v-show="showByGrading(0)"><i class="el-icon-more" style="transform: rotate(90deg)"></i></div>
          <template v-for="course in master.Courses">
            <div :key="course.Title" v-show="showByGrading(course.Min)">
              <el-divider class="AEgrading-divider" content-position="left">
                {{course.Title}}
              </el-divider>
              <EditAESelect :value.sync="AE.Course" :items="course.Items" />
           </div>
          </template>

        </div>
      </div>
    </EditSection>
  </TheWrapper>
</template>

<script>
import TheWrapper from '@/components/Atoms/TheWrapper'
import EditSection from '@/components/Molecules/EditSection'
import EditAESelect from '@/components/Molecules/EditAESelect'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox'

import AEmaster from '@/modules/Masters/AE'
import { ZenToHanNumbers } from '@/modules/ZenHanChars'
import { alert } from '@/modules/Popups'

export default {
  components: {
    TheWrapper,
    EditSection,
    EditAESelect,
    LabeledCheckbox
  },
  props: {
    ItemIndex: {
      type: Number,
      default: -1
    },
    ItemValue: {
      type: Object
    },
    year: {
      type: [String, Number]
    }
  },
  data () {
    return {
      Category: '',
      AE: {
        Title: [],
        Cause: [],
        Location: [],
        BloodCount: '',
        Grade: '',
        Course: []
      },
      unknownBloodCounts: false,
      master: undefined
    }
  },
  created () {
    this.$set(this, 'master', new AEmaster(this.year))
  },
  mounted () {
    this.$refs.firstelement.focus()
  },
  computed: {
    components () {
      if (this.Category === '') {
        return []
      } else {
        return this.master.Category.find(element => element.Value === this.Category).Components
      }
    },
    showByGrading () {
      return value => {
        return this.AE.Grade ? Number(this.AE.Grade[0]) >= (value || undefined) : !value
      }
    }

  },
  methods: {
    CategoryChanged () {
      this.AE.Title.splice(0)
      this.AE.Cause.splice(0)
      this.AE.Location.splice(0)
      this.AE.BloodCount = ''
    },
    UnknownBleedCountsChanged (value) {
      if (value) {
        this.unknownBloodCounts = true
        this.AE.BloodCount = '不明'
      } else {
        this.unknownBloodCounts = false
        if (this.AE.BloodCount === '不明') {
          this.AE.BloodCount = ''
        }
      }
    },
    GoBack () {
      this.$router.replace('./')
    },
    async CommitChanges () {
      // 出血量を念のため半角数字にトリム
      if (this.AE.BloodCount !== '不明' && this.AE.BloodCount !== '') {
        this.AE.BloodCount = ZenToHanNumbers(this.AE.BloodCount.trim())
      }
      await this.$nextTick()

      // ドキュメントの雛型を作成
      const documentAEItem = { Category: this.Category }
      for (const key in this.AE) {
        if (Array.isArray(this.AE[key])
          ? this.AE[key].length > 0
          : this.AE[key] !== ''
        ) {
          documentAEItem[key] = this.AE[key]
        }
      }

      // エラーチェック
      try {
        this.master.validate(documentAEItem)
      } catch (e) {
        alert(e.message, this)
        return
      }

      this.$emit('data-upsert', 'AEs', this.ItemIndex, documentAEItem)
      this.GoBack()
    }
  }
}
</script>

<style lang="sass">
div.AEcheckboxes
  div
    padding: 0.2rem 0 0
div.AEgrading-divider
  margin: 1.2rem 0
</style>
