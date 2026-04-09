/**
 * src/types/data.ts
 * アプリケーション全体で使用するコアデータ型定義
 * (旧 src/modules/definitions.js のクラス定義をTypeScriptに移行)
 */

// -------- 施設情報 --------

export interface Institution {
  InstitutionName: string
  InstitutionId: string
  LockedInstitutionProperty: boolean
}

// -------- データベースプロパティ --------

export interface DatabaseProperty {
  ApplicationVersion: string
  CreateDate: string // ISO date string (YYYY-MM-DD)
  Year: string
}

// -------- 症例データ構造 --------

/**
 * 診断項目
 * Diagnoses[] の各要素
 */
export interface DiagnosisItem {
  Text: string
  // [カテゴリ, 対象臓器] の 2 要素配列
  Chain?: [string, string?]
  UserTyped?: boolean
  // MIGRATION ISSUE: ICD10コードなどマスタ固有プロパティは診断マスタ側で定義するが
  // DBに保存されるCaseDocument内では利用されないため省略
}

/**
 * 術式追加情報
 */
export interface ProcedureDescription {
  Text: string
  Values: string[]
}

/**
 * 実施術式の追加術式
 */
export interface AdditionalProcedure {
  Text: string
  Description?: ProcedureDescription
}

/**
 * 実施術式項目
 * Procedures[] の各要素
 */
export interface ProcedureItem {
  Text: string
  Chain?: [string, string?]
  AssociatedProcedures?: string[]
  Description?: ProcedureDescription
  AdditionalProcedure?: AdditionalProcedure
  UserTyped?: boolean
}

/**
 * 合併症・偶発症項目
 * AEs[] の各要素
 */
export interface AEItem {
  Category: string
  Title?: string | string[]
  Cause?: string | string[]
  Location?: string | string[]
  BloodCount?: string | number
  Grade: string
  Course?: string | string[]
}

/**
 * アプローチ法
 * Approach プロパティの値型
 * キー: カテゴリ文字列, 値: 選択されたアプローチの配列
 */
export type ApproachValue = Record<string, string[]>

/**
 * 症例ドキュメント (NeDB の 1 レコード)
 */
export interface CaseDocument {
  _id?: string                    // NeDB が自動付与
  DocumentId: number
  UniqueId?: string               // エクスポート時に生成
  Name?: string
  Age?: number
  PatientId: string
  JSOGId?: string
  NCDId?: string
  DateOfProcedure: string         // YYYY-MM-DD
  ProcedureTime?: string
  TypeOfProcedure?: string
  PresentAE?: boolean
  AEs?: AEItem[]
  Diagnoses?: DiagnosisItem[]
  Procedures?: ProcedureItem[]
  Approach?: ApproachValue
  Denial?: boolean
  Note?: string
  Notification?: string
  Imported?: boolean
  ValidationReport?: string[]
}

// -------- エクスポート用データ --------

/**
 * 提出用ヘッダレコード
 */
export interface ExportHeader {
  InstitutionName: string
  InstitutionID: string
  Year?: string
}

/**
 * 提出用症例レコード (CaseDocument の提出用サブセット)
 */
export interface ExportCaseRecord {
  YearOfProcedure: string
  ProcedureTime?: string
  TypeOfProcedure?: string
  Diagnoses?: Array<{ Text: string; Description?: ProcedureDescription }>
  Procedures?: Array<{ Text: string; Description?: ProcedureDescription }>
  Approach?: ApproachValue
  PresentAE?: boolean
  AEs?: AEItem[]
  Imported?: boolean
}

// -------- インポート検証結果 --------

export interface ImportValidationResult {
  length: number
  hasHeader: boolean
  anonymised: boolean
}

// -------- 設定データ --------

export interface ViewSettings {
  Filters: FilterCondition[]
  Sort: SortCondition
}

export interface FilterCondition {
  Field: string
  Value: unknown
}

export type SortCondition = Record<string, 1 | -1>

export interface AppSettings {
  Salt: number
  InstitutionName: string
  InstitutionID: string
  JSOGoncologyboardID: string
  EditJSOGId: boolean
  EditNCDId: boolean
  ShowNote: boolean
  Approach: string        // JSON 文字列化された ApproachValue
  ShowStartupDialog: boolean
  EnableAdvancedSettings: boolean
  View: ViewSettings
  UnlockExportJSOGId: boolean
  UnlockExportNCDId: false
  CSVruleset: string      // JSON 文字列化された CSV ルールセット
}
