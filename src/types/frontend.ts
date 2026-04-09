/**
 * src/types/frontend.ts
 * フロントエンド (Vue レンダラー) 固有の型定義
 * Vuex Store のステート型、ルーター関連型など
 */

import type { CaseDocument, FilterCondition, SortCondition, AppSettings, ViewSettings } from './data'

// -------- Vuex Store ステート型 --------

export interface DocumentIds {
  List: number[]
  TotalCount: number
  Range: number
  Identifier: number
}

export interface SearchState {
  IgnoreQuery: boolean
  Filter: FilterCondition[]
  Preserve: string
}

export interface RootState {
  DataStore: CaseDocument[]
  DocumentIds: DocumentIds
  Filters: FilterCondition[]
  Sort: SortCondition
  Search: SearchState
  Selected: number[]
}

export interface SystemState {
  settings: AppSettings
  StartupDialogStatus: boolean
  Platform: string
}

export interface PasswordState {
  Authenticated: boolean
  PasswordRequired: boolean
}

// -------- Vuex Store 型付け useStore --------

export interface StoreStateWithModules extends RootState {
  system: SystemState
  password: PasswordState
}

// -------- Vuex Store のカスタム型 --------
// useStore() の戻り値に型を付けるための再エクスポート

// MIGRATION ISSUE: vuexの型解決がpackage exportsにより不安定なため一旦 any を採用。
// 将来的には pinia への移行、または vuex 型の再解決で置き換えを想定。
export type AppStore = any

// -------- ルーター関連 --------

export interface RouteMetaOptions {
  requireLogin?: boolean
}

// -------- CSV インポートルールセット --------

export interface CsvFieldRule {
  column?: number
  constants?: unknown
  compute?: string
}

export type CsvRuleset = Record<string, CsvFieldRule>

// -------- CSV ジェネレータ定義 --------

export interface GeneratorFunction {
  compute?: string
  constants?: unknown
  title?: string
  rule?: string
}

// -------- Master 共通型 --------

/**
 * マスタアイテムの基本形 (文字列もしくはオブジェクト)
 */
export type MasterItemRaw = string | MasterItemObject

export interface MasterItemObject {
  Text: string
  ValidFrom?: string
  ValidTo?: string
  // MIGRATION ISSUE: 診断マスタと術式マスタでそれぞれ固有のプロパティを持つため
  // ここでは共通部分のみ定義し、サブクラス側で拡張する
  [key: string]: unknown
}

/**
 * マスタの 3 層ツリー構造
 * { カテゴリ: { 対象臓器: MasterItemRaw[] } }
 */
export type MasterTree = Record<string, Record<string, MasterItemRaw[]>>

// -------- AE 関連の選択肢型 --------

export interface AECategoryDefinition {
  Text: string
  Value: string
  Components: string[]
  Optional?: string[]
}

export interface AEComponentDefinition {
  Title: string
  Element: string
  Items: Array<Array<string | { Text: string; Value: string }>>
}

export interface AEGradeDefinition {
  Grade: string
  Text: string
}

export interface AECourseDefinition {
  Min: number
  Title: string
  Items: Array<string | { Text: string; Value: string }>
}

// -------- アプローチマスタ型 --------

export interface ApproachDirective {
  oneOf?: string[]
  anyOf?: string[]
  check?: string[]
}

export type ApproachTree = Record<string, ApproachDirective[]>
