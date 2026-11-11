/* eslint-disable @typescript-eslint/no-unused-vars */
// REFACTORING: クラスベースの仮定義をTypeScriptインターフェースに移行し src/types/data.ts に集約
// 後方互換のため型名を再エクスポートする
export type {
  Institution,
  DatabaseProperty,
  CaseDocument as Cases,
  DiagnosisItem as Diagnosis,
  ProcedureItem as Procedure,
  AEItem as AE,
} from '@/types/data'
