# JOED TypeScript Migration Instructions

## 目的
- 段階的に TypeScript 厳密化を進める。
- まずは `@ts-nocheck` を全廃し、`npm run type-check` を常に通す。
- その後、`any` を計画的に削減し、型安全性を上げる。

## これまでの方針（継続）
- 変更は小さく、壊さないことを優先する。
- `@ts-nocheck` 除去時にエラーが大量発生する箇所は、まず最小限の `any` で収束させる。
- 依存関係が強い層から順に進める（Masters → Validators → Store/Router → Views）。
- 各バッチごとに `npm run type-check` を実行し、常にグリーンを維持する。
- 既存挙動を変えない（入力・DB・IPC・ルーティングの動作互換を最優先）。

## LLM使用のコメント方針
- 型定義などで不明な点があればコメントでそれがわかるように // MIGRATION ISSUE というコメント行に続けて不明点の内容を記載してください
- 動作が不安定になり得る部分も // MIGRATION PROBLEM のコメント行に続けて内容を記載してください

## 優先度付きの次タスク

### P1: Store / Router の `any` 削減
- 対象:
  - `src/store/index.ts`
  - `src/store/modules/system.ts`
  - `src/store/modules/passwordauth.ts`
  - `src/router/index.ts`
- やること:
  - Vuex の state/getters/actions の型を `src/types/frontend.ts` / `src/types/data.ts` から組み立てる。
  - `payload: any` をユースケース別の型に分解する。
  - `routes: any[]` を `RouteRecordRaw[]` 化し、router guards の型を明示する。

### P1: Views の `any` 削減（VEdit 系）
- 対象:
  - `src/views/VEditProcedure.vue`
  - `src/views/VEditAE.vue`
  - `src/views/VEditDiagnosis.vue`
  - `src/views/VEditApproach.vue`
  - `src/App.vue`
- やること:
  - `ref<any>`, `reactive<any>`, `Record<string, any>` を具体型へ置換。
  - `MasterItemRaw` の string/object union を型ガード関数で吸収。
  - emit payload（JSON文字列化前のオブジェクト）を共通 interface 化する。

### P2: Modules の `any` 削減（import/validation）
- 対象:
  - `src/modules/CaseValidater.ts`
  - `src/modules/ImportCSV.ts`
  - `src/modules/ImportJSON.ts`
  - `src/modules/ImportMergeV4.ts`
  - `src/modules/Popups.ts`
- やること:
  - `CaseLike`, `JsonRecord`, `MergeRecord` を段階的に具体型化。
  - `allSettled` の戻り型を厳密化。
  - Element Plus の `as any`（iconClass 互換回避）をラッパー関数で隔離。

### P2: Electron 境界層の `any` 整理
- 対象:
  - `src/background.ts`
  - `src/preload.ts`
- やること:
  - IPC payload/response の共通型を `src/types/preload.d.ts` と一致させる。
  - `MenuTemplate: any[]` などの広い `any` を局所 interface へ置換。

## 実行ルール
- 1バッチで対象は 1〜3 ファイルまで。
- 各バッチ後に必ず `npm run type-check`。
- エラーが増える変更は分割して戻しやすくする。
- 不可避の `any` はコメントで「理由・将来の置換先」を残す。

## 受け入れ基準
- `npm run type-check` が成功する。
- 新規 `@ts-nocheck` を追加しない。
- 既存機能（CSV import/export, edit, menu, IPC, DB 操作）に挙動変更がない。
