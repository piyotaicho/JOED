<script setup>
import { computed, reactive } from 'vue'
import { useStore } from '@/store'
import InputSwitchField from '@/components/Molecules/InputSwitchField.vue'

const store = useStore()
const emit = defineEmits(['changed'])

const settings = reactive({
  IgnoreQuery: false,
  UseRegexp: false,
  Field: '',
  Search: ''
})

const OnCreated = () => {
  if (store.getters.ViewSettings.Search) {
    const preservedSearch = JSON.parse(store.getters.ViewSettings.Search.Preserve || '{}')

    for (const key in settings) {
      if (preservedSearch[key] !== undefined) {
        settings[key] = preservedSearch[key]
      }
    }
  }
}
OnCreated()

/**
 * 指定した正規表現オブジェクトを生成
 * @param str 検索対象の文字列
 * @param regex 正規表現を使用するかどうか
 * @param multiline 複数行にまたがる検索を行うかどうか
 */
const makeRegex = (str = '', regex = false, multiline = false) => {
  let queryRegex
  if (regex) {
    // 正規表現のエラーがあったら空の正規表現を返す
    try {
      queryRegex = new RegExp(str, 'i' + (multiline ? 'm' : ''))
    } catch {
      queryRegex = new RegExp()
    }
  } else {
    // 文字列の正規表現シンタックスをエスケープして文字列検索パターンを生成
    queryRegex = new RegExp(str.replace(/[\\/.*+?^$-|{}()\][]/g, '\\$&'), 'i' + (multiline ? 'm' : ''))
  }
  return queryRegex
}

// 検索設定
const SearchSetting = {
  Id: {
    title: '患者ID',
    regexp: false,
    multiple: true,
    createquery: (query) => {
      // 検索文字から区切り文字を消して、区切り文字を含んだ検索を可能にする
      // ハイフンに類似した文字
      //  U+002D ASCIIのハイフン
      //  U+30FC 全角の長音
      //  U+2010 別のハイフン
      //  U+2011 改行しないハイフン
      //  U+2013 ENダッシュ
      //  U+2014 EMダッシュ
      //  U+2015 全角のダッシュ
      //  U+2212 全角のマイナス
      //  U+FF70 半角カナの長音
      // チルダに類似した文字
      //  U+007E 半角チルダ
      //  U+301C WAVE DASH
      //  U+FF5E 全角チルダ
      const queries = query.split(/[\s,，]+/)
        .map(item => item
          .replace(/[\u{002d}\u{2010}\u{2013}\u{2014}\u{2212}\u{30fc}\u{007e}\u{301c}\u{ff5e}]/gu, '')
          .replace(/./g, '$&[\u{002d}\u{2010}\u{2013}\u{2014}\u{2212}\u{30fc}\u{007e}\u{301c}\u{ff5e}]*')
        )

      if (queries.length > 0) {
        const regexp = '^(' + queries.join('|') + ')$'
        return {
          PatientId: { $regex: new RegExp(regexp, 'u') }
        }
      } else {
        return {}
      }
    }
  },
  Name: {
    title: '患者名',
    regexp: true,
    createquery: (query, regexp) => {
      return { Name: { $regex: makeRegex(query, regexp) } }
    }
  },
  Diagnoses: {
    title: '手術診断',
    regexp: true,
    createquery: (query, regexp) => {
      return {
        Diagnoses: {
          $elemMatch: {
            Text: { $regex: makeRegex(query, regexp) }
          }
        }
      }
    }
  },
  DiagnosesMain: {
    title: '手術診断 (主たる診断のみ)',
    regexp: true,
    createquery: (query, regexp) => {
      return {
        'Diagnoses.0.Text': { $regex: makeRegex(query, regexp) }
      }
    }
  },
  Procedures: {
    title: '実施手術',
    regexp: true,
    createquery: (query, regexp) => {
      return {
        $or: [
          {
            Procedures: {
              $elemMatch: {
                Text: { $regex: makeRegex(query, regexp) }
              }
            }
          },
          {
            Procedures: {
              $elemMatch: {
                'AdditionalProcedure.Text': { $regex: makeRegex(query, regexp) }
              }
            }
          }
        ]
      }
    }
  },
  ProceduresMain: {
    title: '実施手術 (主たる手術のみ)',
    regexp: true,
    createquery: (query, regexp) => {
      return {
        'Procedures.0.Text': { $regex: makeRegex(query, regexp) }
      }
    }
  },
  Note: {
    title: 'メモ',
    regexp: true,
    createquery: (query, regexp) => {
      return { Note: { $regex: makeRegex(query, regexp) } }
    }
  },
  NoteMultiline: {
    title: 'メモ(行ごとに評価)',
    regexp: true,
    createquery: (query, regexp) => {
      return { Note: { $regex: makeRegex(query, regexp, true) } }
    }
  },
  Hash: {
    title: '問い合わせレコード識別子',
    regexp: false,
    multiple: false,
    createquery: (query) => {
      if (query && query.trim().length > 0) {
        return { Hash: query.trim() }
      } else {
        return {}
      }
    }
  }
}

// 正規表現使用の有効/無効
const RegexpDisabled = computed(() => {
  const preset = SearchSetting[settings.Field]

  if (preset && preset.regexp !== undefined) {
    return !preset.regexp
  } else {
    return true
  }
})

const SearchActivated = computed(() => store.getters.SearchActivated)

const MultipleQueryAccepted = computed(() => {
  const preset = SearchSetting[settings.Field]

  if (preset && preset?.multiple !== undefined) {
    return SearchSetting[settings.Field].multiple
  } else {
    return false
  }
})

const performQuery = () => {
  if (settings.Field && settings.Search) {
    const [field, value] = Object.entries(
      SearchSetting[settings.Field]?.createquery(settings.Search, settings.UseRegexp) || {}
    ).flat()

    if (field !== undefined && value !== undefined) {
      store.commit('SetSearch', {
        IgnoreQuery: settings.IgnoreQuery,
        Filter: {
          Field: field,
          Value: value
        },
        Preserve: JSON.stringify(settings)
      })
      emit('changed')
    }
  }
}

const cancelQuery = () => {
  store.commit('SetSearch', {
    Filter: {}
  })
  emit('changed')
}
</script>

<template>
  <div class="menu-item">
    <div class="subtilte-section">検索対象</div>
    <div>
      <InputSwitchField
        v-model="settings.IgnoreQuery"
        title=""
        :options="[{ text: '全データ', value: true }, { text: '現在の表示設定', value: false }]"
      />
    </div>
    <div class="menu-item-content">
      <div>
        <div>
          <select v-model="settings.Field">
            <option value="" disabled style="display: none;">検索する項目を選択してください.</option>
            <template v-for="(preset, key) in SearchSetting" :key="key">
              <option :value="key">{{ preset.title }}</option>
            </template>
          </select>
        </div>
      </div>
    </div>

    <div class="subtilte-section">
      検索内容
      <span style="font-size: 0.8rem;" v-show="MultipleQueryAccepted">
        区切り文字で区切って複数の検索が可能です.
      </span>
    </div>
    <div class="menu-item-content">
      <input type="text" v-model="settings.Search" />
    </div>
    <div>
      <InputSwitchField
        v-model="settings.UseRegexp"
        title=""
        :options="[{ text: '部分一致', value: false }, { text: '正規表現', value: true }]"
        :disabled="RegexpDisabled"
      />
    </div>

    <div class="menu-item-bottom">
      <el-button type="primary" :disabled="settings.Field === '' || settings.Search.trim() === ''" @click="performQuery">検索</el-button>
      <el-button type="success" :disabled="!SearchActivated" @click="cancelQuery">検索の解除</el-button>
    </div>
  </div>
</template>
