<template>
  <TheWrapper alpha="10">
    <EditSection @commit="CommitChanges" @discard="GoBack">
      <div class="flex-content" ref="panes">
        <div class="w20 selectionbox">
          <SelectPane title="カテゴリ" v-model="category" :items="categorySelections" />
        </div>
        <div class="w20 selectionbox">
          <SelectPane title="対象臓器" v-model="target" :items="targetSelections" />
        </div>
        <div class="w60 selectionbox">
          <SelectPane title="実施手術の候補" v-model="selectedItem" :items="candidates" @dblclick="CommitChanges()" />
        </div>
      </div>

      <!-- 追加情報セクション -->
      <DescriptionSection
        v-model="description.Value"
        :title="description.Title"
        :selectionMode="description.SelectionMode"
        :options="description.Options"
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
          v-model="additionalProcedure.Value"
         />
      </template>

      <FreewordSection
        v-model="freewordText"
        :disabled="!UserEditingAllowed"
        @search="SetCandidateItemsByFreeword"
        ref="freewordSection"
      />
    </EditSection>
  </TheWrapper>
</template>

<script setup>
import { ref, useTemplateRef, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Master from '@/modules/Masters/ProcedureMaster'
import * as Popups from '@/modules/Popups'

import TheWrapper from '@/components/Atoms/TheWrapper.vue'
import EditSection from '@/components/Molecules/EditSection.vue'
import SelectPane from '@/components/Molecules/SelectPane.vue'
import DescriptionSection from '@/components/Molecules/DescriptionSection.vue'
import FreewordSection from '@/components/Molecules/EditSectionFreeword.vue'

const ProceduresMaster = new Master()

const router = useRouter()
const props = defineProps({
  index: {
    type: Number,
    default: -1
  },
  value: {
    type: String
  },
  year: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['data-upsert'])

// Element refs
const panes = useTemplateRef('panes')
const freewordSection = ref()

// Reactive states
const category = ref('')
const categorySelections = computed(() => ProceduresMaster.Categories())

const target = ref('')
const targetSelections = computed(() => ProceduresMaster.Targets(category.value))

const candidates = ref([])
const selectedItem = ref('')
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

const UserEditingAllowed = computed(() => !!category.value && !selectedItem.value)

onMounted(async () => {
  const selectElements = panes.value.getElementsByTagName('SELECT')

  if (props.index < 0) {
    // 新規編集の場合はカテゴリにフォーカスする
    if (selectElements && selectElements.length >= 1) {
      selectElements[0].focus()
    }
    return
  }

  // 再編集 valueから情報を展開する
  const item = JSON.parse(props.value || '{}')

  // カテゴリ・対象の解釈
  if (item?.Chain && Array.isArray(item.Chain)) {
    if (item?.Chain[0] !== undefined) {
      category.value = item.Chain[0]
      await nextTick()
      if (item.Chain[1] !== undefined) {
        target.value = item.Chain[1]
        await nextTick()
      }
    }
  }

  // カテゴリとあれば対象に応じた選択リストの生成
  await SetCandidateItemsBySelection()

  // 入力値の解釈
  const text = item?.Text || ''

  if (text !== '') {
    if (candidates.value.includes(text)) {
    // 選択肢に該当項目がある場合選択する
      selectedItem.value = text
      freewordText.value = ''
      await nextTick()
      if (selectElements && selectElements.length >= 3) {
        selectElements[2].focus()
      }
    } else {
      // 選択肢に入力されている項目がなければ自由入力に展開して自由入力欄を開く
      selectedItem.value = ''
      freewordText.value = text
      await nextTick()
      freewordSection.value.Open()
    }
  }

  // 術式の選択である場合DOMの初期化を行う
  if (selectedItem.value !== '') {
    // 選択肢に応じたDOM構成を展開
    await OnCandidateSelected()

    // 付随情報の入力の必要性があればvalueから展開する
    if (description.Title !== '') {
      if (item?.Description && item.Description.length > 0) {
        description.Value.splice(0)
        description.Value.splice(0, 0, ...item.Description)
      }
    }

    // 付随手術の入力の必要性があればvalueから展開する
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
    panes.value?.getElementsByTagName('select')[2].focus()
  }
  // 自由入力がある場合は自由入力セクションを開く
  if (freewordText.value !== '') {
    freewordSection.value.Open()
  }
})

watch(category, async () => {
  // カテゴリが変更されたら現在の入力は全部クリア
  // (自由入力欄の内容は残す)
  selectedItem.value = ''
  target.value = ''
  await nextTick()

  // targetSelectionが一つだけの時はそれを選択
  if (targetSelections.value.length === 1) {
    target.value = targetSelections.value[0]
    await nextTick()
  }
  SetCandidateItemsBySelection()
})

watch(target, () => {
  if (target.value !== '') {
    SetCandidateItemsBySelection()
  }
})

watch(selectedItem, async () => {
  if (selectedItem.value !== '') {
    await OnCandidateSelected()
  } else {
    // 選択がクリアされた場合は付随情報もクリア
    await ClearSelectedEntry()
  }
  await nextTick()
})

const ClearSelectedEntry = async () => {
  // selectedItem.value = '' が前提(watcherで対応)
  // descriptionのクリア
  SetDescription(undefined)

  // additionalProcedureのクリア
  additionalProcedure.Title = ''
  SetDescription(
    undefined,
    additionalProcedure
  )
}

const SetCandidateItemsBySelection = async () => {
  candidates.value = ProceduresMaster.Items(
    category.value, target.value, props.year
  ).map(item => item.Text)
  selectedItem.value = ''
  await nextTick()
}

const SetCandidateItemsByFreeword = async () => {
  if (freewordText.value && UserEditingAllowed.value) {
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
  if (selectedItem.value) {
    // 選択肢から入力に応じたマスタ情報を取得
    const masterItem = ProceduresMaster.getItem(
      selectedItem.value,
      category.value,
      target.value,
      props.year
    )
    await SetDescription(masterItem)
    await SetAdditionalProcedure(masterItem)
  }
}

const SetDescription = async (item, descriptionObj = description, splicedefault = true) => {
  // descriptionの設定を削除
  descriptionObj.Value.splice(0)
  descriptionObj.Options.splice(0)

  const masterItem = Master.getDescriptionObject(item)
  if (item === undefined || masterItem === undefined) {
    // descriptionObjectの設定を初期化
    descriptionObj.Title = ''
    descriptionObj.SelectionMode = 'one'
    return
  }

  // descriptionの設定をマスタからコピー
  descriptionObj.Title = masterItem?.Text || ''
  descriptionObj.SelectionMode = masterItem?.Selection || 'one'
  descriptionObj.Options.splice(0, 0, ...(masterItem?.Values || []))

  // 単独入力不可項目の対応 - デフォルト項目は除外する
  if (splicedefault) {
    const spliceIndex = descriptionObj.Options.findIndex(option => option.slice(-1) === '$')
    if (spliceIndex !== -1) {
      descriptionObj.Options.splice(spliceIndex, 1)
    }
  }
  await nextTick()
}

const SetAdditionalProcedure = async (item) => {
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
    await SetDescription(
      additionalItem,
      additionalProcedure,
      false
    )
  } else {
    additionalProcedure.Text = ''

    await SetDescription(
      undefined,
      additionalProcedure
    )
  }
}

const CommitChanges = async () => {
  const temporaryItem = {}
  // 選択チェーンの構築
  temporaryItem.Chain = [
    category.value,
    ...(target.value !== '' ? [target.value] : [])
  ]

  // Text以下の設定
  if (selectedItem.value !== '') {
    // 選択された内容が保存される

    // 選択内容を保存
    temporaryItem.Text = selectedItem.value

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
        .filter(item => description.Options.includes(item))

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
          .filter(item => additionalProcedure.Options.includes(item))

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
      if (candidates.value.includes(freewordText.value.trim())) {
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
      temporaryItem.UserTyped = true
    }
  }
  // 新しいレコードが作成されていたら登録, そうでなければなにもしない.
  if (temporaryItem.Text) {
    emit('data-upsert', 'Procedures', props.index, JSON.stringify(temporaryItem))
    GoBack()
  }
}

const GoBack = () => router.replace('./')
</script>
