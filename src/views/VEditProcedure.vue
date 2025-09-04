<template>
  <TheWrapper alpha="10">
    <EditSection @commit="CommitChanges" @discard="GoBack">
      <ThreePaneSelections
        Pane3Title="実施手術の候補"
        v-model:Pane1="category"
        :Pane1Items="Categories"
        @pane1change="CategoryIsChanged()"
        v-model:Pane2="target"
        :Pane2Items="TargetOrgans"
        @pane2change="SetCandidateItemsBySelection()"
        v-model:Pane3="selectedItemText"
        :Pane3Items="candidates"
        @pane3change="OnCandidateSelected()"
        @pane3dblclick="CommitChanges()"
        ref="paneSection"
      />

      <!-- 追加情報セクション -->
      <DescriptionSection
        :title="description.Title"
        :selectionMode="description.SelectionMode"
        :options="description.Options"
        v-model:value="description.Value"
        v-if="description.Title !== ''"
      />

      <!-- 追加術式セクション -->
      <template v-if="additionalProcedure.Title !== ''">
        <div class="flex-content">
          <div class="w30"></div>
          <div class="w20">
            <div>
              <span>付随する実施手術</span>
            </div>
          </div>
          <div class="w40">
            <div style="padding-left: 1rem">
              <span>{{ additionalProcedure.Title }}</span>
            </div>
          </div>
          <div class="w10"></div>
        </div>
        <DescriptionSection
          :title="additionalProcedure.Title"
          :selectionMode="additionalProcedure.SelectionMode"
          :options="additionalProcedure.Options"
          v-model:value="additionalProcedure.Value"
         />
      </template>

      <FreewordSection
        v-model:value="freewordText"
        :disabled="!UserEditingAllowed"
        @click-search="SetCandidateItemsByFreeword"
        ref="freewordSection"
      />
    </EditSection>
  </TheWrapper>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Master from '@/modules/Masters/ProcedureMaster'
import * as Popups from '@/modules/Popups'

import TheWrapper from '@/components/Atoms/TheWrapper.vue'
import EditSection from '@/components/Molecules/EditSection.vue'
import ThreePaneSelections from '@/components/Molecules/ThreePaneSelections.vue'
import DescriptionSection from '@/components/Molecules/DescriptionSection.vue'
import FreewordSection from '@/components/Molecules/EditSectionFreeword.vue'

const ProceduresMaster = new Master()

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
    type: String,
    default: ''
  }
})
const emit = defineEmits(['data-upsert'])
const paneSection = ref()
const freewordSection = ref()

const category = ref('')
const target = ref('')
const candidates = ref([])
const selectedItemText = ref('')
const freewordText = ref('')

const description = reactive({
  Title: '',
  Options: [],
  SelectionMode: 'one',
  Value: []
})

const additionalProcedure = reactive({
  Text: '',
  Title: '',
  Options: [],
  SelectionMode: 'one',
  Value: []
})

const Categories = computed(() => ProceduresMaster.Categories())

const TargetOrgans = computed(() => ProceduresMaster.Targets(category.value))

const UserEditingAllowed = computed(() => !!category.value && !selectedItemText.value)

const ClearSelectedEntry = async () => {
  selectedItemText.value = ''
  setDescription(undefined)
  additionalProcedure.Title = ''
  setDescription(
    undefined,
    additionalProcedure
  )
}

const CategoryIsChanged = async () => {
  freewordText.value = ''
  candidates.value.splice(0)
  await ClearSelectedEntry()

  // 対象臓器が1つだけのときはそれを選択する
  if (TargetOrgans.value.length === 1) {
    target.value = TargetOrgans.value[0]
    await nextTick()

    SetCandidateItemsBySelection()
  } else {
    target.value = ''
    await nextTick()
  }
}

const SetCandidateItemsBySelection = async () => {
  candidates.value = ProceduresMaster.Items(
    category.value, target.value, props.year
  ).map(item => item.Text)

  await ClearSelectedEntry()
}

const SetCandidateItemsByFreeword = async () => {
  if (UserEditingAllowed.value && freewordText.value) {
    const matches = ProceduresMaster.Matches(
      freewordText.value,
      category.value,
      target.value || '',
      props.year
    )
    candidates.value.splice(0, candidates.value.length, ...matches)

    await ClearSelectedEntry()
  }
}

const OnCandidateSelected = async () => {
  if (selectedItemText.value) {
    const masterItem = ProceduresMaster.getItem(
      selectedItemText.value,
      category.value,
      target.value,
      props.year
    )
    await setDescription(masterItem)
    await setAdditionalProcedure(masterItem)
  }
}

const setDescription = async (item, descriptionObj = description, splicedefault = true) => {
  // descriptionの設定を削除
  descriptionObj.Value.splice(0)
  descriptionObj.Options.splice(0)

  if (Master.getDescriptionObject(item) === undefined) {
    // descriptionの設定を初期化
    descriptionObj.Title = ''
    descriptionObj.SelectionMode = 'one'

    await nextTick()
    return
  }

  // descriptionの設定をマスタからコピー
  descriptionObj.Title = Master.getDescriptionTitle(item)
  descriptionObj.SelectionMode = Master.getDescriptionSelectionMode(item)

  // 単独入力不可項目の対応
  if (splicedefault) {
    descriptionObj.Options.splice(0, 0, ...Master.getDescriptionOptions(item).filter(option => option.slice(-1) !== '$'))
  } else {
    descriptionObj.Options.splice(0, 0, ...Master.getDescriptionOptions(item))
  }
  await nextTick()
}

const setAdditionalProcedure = async (item) => {
  const procedureTitle = Master.getAdditioninalProcedure(item)
  if (procedureTitle) {
    // Textに術式名を保存し付随種々の情報を展開
    additionalProcedure.Text = procedureTitle

    const additionalItem = ProceduresMaster.getItem(
      procedureTitle,
      category.value,
      target.value,
      props.year
    )
    await setDescription(
      additionalItem,
      additionalProcedure,
      false
    )
  } else {
    additionalProcedure.Text = ''

    await setDescription(
      undefined,
      additionalProcedure
    )
  }
}

const CommitChanges = async () => {
  const temporaryItem = {}

  if (selectedItemText.value !== '') {
    // 選択された内容が最優先

    // 選択内容を保存
    temporaryItem.Text = selectedItemText.value
    temporaryItem.Chain = [
      category.value,
      ...(target.value !== '' ? [target.value] : [])
    ]

    // 選択枝の重複確認情報があればマスタから引用して保存
    const ditto = Master.getDittos(
      ProceduresMaster.getItem(
        temporaryItem.Text,
        temporaryItem.Chain[0],
        temporaryItem.Chain[1],
        props.year
      )
    )
    if (ditto) {
      temporaryItem.Ditto = [...ditto]
    }

    // 術式付随情報があれば保存
    if (description.Title !== '') {
      // 選択枝にないものと単独保存対象外設定された項目(デフォルト)を除外
      const descriptionValue = description.Value
        .filter(item => item.slice(-1) !== '$')
        .filter(item => description.Options.indexOf(item) !== -1)

      if (
        descriptionValue.length === 0 &&
        description.SelectionMode !== 'anyornone'
      ) {
        // 選択必須だが選択がない
        await Popups.information('詳細情報の入力が不足しています.')
        return
      }

      if (descriptionValue.length > 0) {
        temporaryItem.Description = [...descriptionValue]
      }
    }

    // 従たる術式に関する情報
    if (additionalProcedure.Text !== '') {
      if (
        additionalProcedure.Value.length === 0 &&
        additionalProcedure.SelectionMode !== 'anyornone'
      ) {
        // 選択必須だが選択がない
        await Popups.information(
          '付随術式に関する情報の入力が不足しています.'
        )
        return
      }
      // 保存対象外設定された項目(デフォルト)を除外
      const descriptionValue =
        additionalProcedure.Value
          .filter(item => item.slice(-1) !== '$')
          .filter(item => additionalProcedure.Options.indexOf(item) !== -1)

      if (descriptionValue.length > 0) {
        temporaryItem.AdditionalProcedure = {
          Text: additionalProcedure.Text,
          Description: [...descriptionValue]
        }
      }
    }
  } else {
    if (freewordText.value.trim() !== '') {
      // 自由入力は兎にも角にも候補入力を優先させる.
      SetCandidateItemsByFreeword()
      await nextTick()

      if (
        candidates.value.length !== 0 &&
        (await Popups.confirm(
          '実施手術の候補があります,選択を優先してください.'
        )) === false
      ) {
        return
      }
      // 候補に入力と同じものがある場合は何が何でも選択させる.
      if (candidates.value.indexOf(freewordText.value.trim()) !== -1) {
        await Popups.information(
          '自由入力の内容が候補にありますので選択してください.'
        )
        return
      }
      // 最終確認
      if (
        (await Popups.confirm(
          '直接入力した実施術式の登録は可能な限り控えてください.'
        )) === false
      ) {
        return
      }

      // ユーザ手入力の場合は選択が掛かっていないので最低限の情報のみかつフラグを必ず立てる
      temporaryItem.Text = freewordText.value.trim()
      temporaryItem.Chain = [category.value]
      temporaryItem.UserTyped = true
    }
  }
  // 新しいレコードが作成されていたら登録, そうでなければなにもしない.
  if (temporaryItem.Text) {
    emit('data-upsert', 'Procedures', props.ItemIndex, JSON.stringify(temporaryItem))
    GoBack()
  }
}

const GoBack = () => router.replace('./')

onMounted(async () => {
  const item = JSON.parse(props.ItemValue || '{}')
  if (props.ItemIndex > -1) {
    // ItemIndex != -1 の場合は新規ではなく再編集になるのでItemValueから最低限必要な情報を展開する

    // カテゴリ・対象の解釈
    const dummyChain = [...(item?.Chain || []), ' ', ' ']
    category.value = dummyChain[0]
    target.value = dummyChain[1]
    await nextTick()

    // カテゴリとあれば対象に応じた選択リストの生成
    await SetCandidateItemsBySelection()

    // 入力値の解釈
    const text = item?.Text || ''

    if (text !== '') {
      if (candidates.value.includes(text)) {
      // 選択肢に該当項目がある場合選択する
        selectedItemText.value = text
        freewordText.value = ''
      } else {
        // 選択肢に入力されている項目がなければ自由入力に展開する
        selectedItemText.value = ''
        freewordText.value = text
      }
      nextTick()
    }
  }

  // 再編集で術式の選択がある場合DOMの初期化が必要
  if (selectedItemText.value !== '') {
    // 選択肢に応じたDOM構成を展開
    await OnCandidateSelected()

    // 付随情報の入力の必要性があればItemValueから展開する
    if (description.Title !== '') {
      if (item?.Description && item.Description.length > 0) {
        description.Value.splice(0)
        description.Value.splice(0, 0, ...item.Description)
      }
    }

    // 付随手術の入力の必要性があればItemValueから展開する
    if (additionalProcedure.Text !== '') {
      additionalProcedure.Value.splice(0)
      if (item?.AdditionalProcedure?.Description &&
        item.AdditionalProcedure.Description.length > 0) {
        additionalProcedure.Value.splice(0, 0,
          ...item.AdditionalProcedure.Description
        )
      } else {
        // 既存入力が無い場合、デフォルト設定があれば設定
        const defaultValue =
          additionalProcedure.Options.filter(
            (item) => item.slice(-1) === '$'
          )[0]
        if (defaultValue) {
          additionalProcedure.Value.splice(0, 0, defaultValue)
        }
      }
    }
    // リアクティブの発火と選択枝にフォーカス
    await nextTick()
    paneSection.value.$el.getElementsByTagName('select')[2].focus()
  }
  // 自由入力にフォーカス
  if (freewordText.value !== '') {
    freewordSection.value.open()
  }
})
</script>
