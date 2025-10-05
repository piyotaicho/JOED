<template>
  <TheWrapper alpha="10">
    <EditSection @commit="CommitChanges" @discard="GoBack">
      <!-- カテゴリの設定 -->
      <div class="flex-content">
        <div class="w20 subtitle">
          <span>合併症の分類</span>
        </div>
        <div class="w80">
          <select ref="firstelement" v-model="Category" @change="categoryChanged()">
            <option value="" disabled style="display:none;">リストから選択</option>
            <template v-for="item of master.Category" :key="item.Value">
              <option :value="item.Value"> {{item.Text}} </option>
            </template>
          </select>
        </div>
      </div>

      <!-- コンポーネントの展開 -->
      <template v-for="(component, compoIndex) of components" :key="compoIndex">
        <div class="flex-content">
          <!-- Bloodcount はスペシャルコンポーネント -->
          <template v-if="component === 'Bloodcount'">
          <div class="w20 subtitle">
            <span>出血量</span>
          </div>
          <div class="w80 AEcheckboxes">
            <div>
              <input type="text" v-model="AE.BloodCount" :disabled="inaccurateBloodCount" placeholder="出血量を入力してください"/> ml
            </div>
            <div>
              <LabeledCheckbox :container="inaccurateBloodCount" @update:container="unknownBleedCountsChanged">出血量不明</LabeledCheckbox>
            </div>
          </div>
          </template>
          <!-- その他のチェックボックスコンポーネント -->
          <template v-else>
            <div class="w20 subtitle">
              <span>{{master.Components[component].Title}}</span>
            </div>
            <div class="w80 AEcheckboxes">
              <EditAESelect v-model:value="AE[master.Components[component].Element]" :items="master.Components[component].Items" />
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
            <template v-for="grade in master.Grading" :key="grade.Grading">
              <option :value="grade.Grade"> {{grade.Text}} </option>
            </template>
          </select>
        </div>
      </div>
      <div class="flex-content"> <!-- Course -->
        <div class="w20 subtitle">
          <span>転帰</span>
        </div>
        <div class="w80">
          <div v-show="showByGrading(0)"><el-icon style="transform: rotate(90deg)"><MoreFilled/></el-icon></div>
          <template v-for="(course, courseIndex) in master.Courses" :key="courseIndex" >
            <!-- eslint-disable-next-line vue/no-v-for-template-key-on-child -->
            <div v-show="showByGrading(course.Min)">
              <el-divider class="AEgrading-divider" content-position="left">
                {{course.Title}}
              </el-divider>
              <EditAESelect v-model:value="AE.Course" :items="course.Items" />
           </div>
          </template>

        </div>
      </div>
    </EditSection>
  </TheWrapper>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TheWrapper from '@/components/Atoms/TheWrapper.vue'
import EditSection from '@/components/Molecules/EditSection.vue'
import EditAESelect from '@/components/Molecules/EditAESelect.vue'
import LabeledCheckbox from '@/components/Atoms/LabeledCheckbox.vue'
import { ElNotification as Notification } from 'element-plus'
import { MoreFilled } from '@element-plus/icons-vue'
import AEmaster from '@/modules/Masters/AE'
import { ZenToHanNumbers } from '@/modules/ZenHanChars'
import { alert } from '@/modules/Popups'

const router = useRouter()

const props = defineProps({
  ItemIndex: {
    type: Number,
    default: -1
  },
  ItemValue: {
    type: String
  },
  year: {
    type: [String, Number]
  }
})
const emit = defineEmits(['data-upsert'])

// マスタは non-reactive (props.yearがこのコンポーネント実行中に変わることはない)
const master = new AEmaster(props.year)

// フォーム入力項目
const Category = ref('')
const AE = reactive({
  Title: [],
  Cause: [],
  Location: [],
  BloodCount: '',
  Grade: '',
  Course: []
})
// 出血量不明フラグ
const inaccurateBloodCount = ref(false)

const firstelement = ref()

// 規定値から省かれた値があるときに通知する為のフラグ
let irregularItemValue = false

// 規定値が与えられた場合mount前に値を展開する
if (props.ItemValue) {
  try {
    const payload = JSON.parse(props.ItemValue)
    // カテゴリ
    if (master.Category.map(element => element.Value).indexOf(payload.Category) === -1) {
      throw new Error()
    }
    Category.value = payload.Category

    // コンポーネント設定の取得
    const components = master.Category.find(element => element.Value === Category.value)?.Components || []
    if (components.length === 0) {
      throw new TypeError()
    }

    // コンポーネントの値の展開
    for (const key in ['Title', 'Cause', 'Location']) {
      if (payload[key] === undefined) {
        continue
      }

      const masteritems = components
        .map(component => master.Components[component])
        .filter(component => component.Element === key)
        .map(component => component.Items)
        .flat(3)
        .map(item => typeof item === 'string' ? item : item.Value)

      // マスタの選択肢に含まれるものだけを値として採用
      for (const value of item[key]) {
        if (masteritems.includes(value)) {
          AE[key].push(value)
        } else {
          irregularItemValue = true
        }
      }
    }

    // 出血は不明を解釈してコピー
    if (payload?.BloodCount) {
      if (Category.value !== '出血') {
        // 出血以外のカテゴリで出血量が指定されていたら不正入力値として扱う
        irregularItemValue = true
        AE.BloodCount = ''
      } else {
        if (payload.BloodCount === '不明') {
          inaccurateBloodCount.value = true
          AE.BloodCount = ''
        } else {
          inaccurateBloodCount.value = false
          AE.BloodCount = payload.BloodCount
        }
      }
    }

    // Gradeのコピー
    if (payload?.Grade && /([1245]|3[ab])/.test(payload.Grade)) {
      AE.Grade = payload.Grade
    } else {
      irregularItemValue = true
      AE.Grade = ''
    }

    // Courseを処理(Gradeの入力がなければ展開しない)
    if (payload?.Course !== undefined && AE.Grade !== '') {
      // マスタの転帰選択肢を展開
      const courseitems = master.Courses
        .filter(element => element.Max <= Number(AE.Grade[0]) || element.Min <= Number(AE.Grade[0]))
        .map(element => element.Items)
        .flat(2)
        .map(item => typeof item === 'object' ? item.Value : item)
      // マスタの転帰選択肢に含まれるものだけを値として採用
      for (const value of payload.Course) {
        if (courseitems.includes(value)) {
          AE.Course.push(value)
        } else {
          irregularItemValue = true
        }
      }
    }
  } catch {
    // NOP
  }
}

onMounted(() => {
  if (irregularItemValue) {
    Notification({
      title: 'マスタとの整合性に問題があります',
      message: 'マスタと整合のない既存の入力は自動的に削除されました.',
      duration: 5000
    })
  }
  firstelement.value.focus()
})

const components = computed(() => {
  if (Category.value === '' || master === undefined) {
    return []
  } else {
    return master.Category.find(element => element.Value === Category.value)?.Components || []
  }
})

const showByGrading = computed(() => (value) => {
  return AE.Grade ? Number(AE.Grade[0]) >= (value || undefined) : !value
})

const categoryChanged = () => {
  AE.Title.splice(0)
  AE.Cause.splice(0)
  AE.Location.splice(0)
  AE.BloodCount = ''
}

const unknownBleedCountsChanged = (value) => {
  if (value) {
    inaccurateBloodCount.value = true
    AE.BloodCount = '不明'
  } else {
    inaccurateBloodCount.value = false
    if (AE.BloodCount === '不明') {
      AE.BloodCount = ''
    }
  }
}

const GoBack = () => {
  router.replace('./')
}

const CommitChanges = async () => {
  // 出血量を念のため半角数字にトリム
  if (AE.BloodCount !== '不明' && AE.BloodCount !== '') {
    AE.BloodCount = ZenToHanNumbers(AE.BloodCount.trim())
  }

  // ドキュメントの雛型を作成
  const documentAEItem = { Category: Category.value }
  for (const key in AE) {
    if (Array.isArray(AE[key])
      ? AE[key].length > 0
      : AE[key] !== ''
    ) {
      documentAEItem[key] = AE[key]
    }
  }

  // エラーチェック
  try {
    master.validate(documentAEItem)
  } catch (e) {
    alert(e.message)
    return
  }

  emit('data-upsert', 'AEs', props.ItemIndex, JSON.stringify(documentAEItem))
  GoBack()
}
</script>

<style lang="sass">
div.AEcheckboxes
  div
    padding: 0.2rem 0 0
div.AEgrading-divider
  margin: 1.2rem 0
</style>
