# 事前リスク観点（実修正なし）

本リポジトリは、Electron + Vue 3 + Vuex + NeDB を前提とした症例登録アプリであり、業務ルールが複雑なため、見落としやすい不具合がいくつか潜んでいます。実際の修正は行わず、今後の対応で要確認とする事項を記録する。

## 1. インポート処理がグローバル状態に依存しており、連続インポート時に状態が混ざる可能性がある

- 該当箇所
  - `src/modules/ImportJSON.ts`: `let year = ''`, `let internalcounter = 1`
  - `src/modules/ImportCSV.ts`: `let staticCount = 0`
- 問題点
  - `ValidateRecords()` で `year` と `internalcounter` をリセットしている一方、通常の import フローで各ファイルごとの遷移が明示的でない。
  - CSV の `staticCount` はモジュール単位で保持されるため、複数ファイル読込や同一セッション内で再インポートした際に、ID が連番でなくなり、重複や意図しない番号割当が起き得る。
  - JSON でも `year` の初期化依存が強く、ヘッダなし・異常データ・再利用時に不正なデフォルト日付や自動生成 ID が発生しやすい。
- 影響
  - 患者 ID の重複、年次判定のズレ、インポート済みデータの再読み込み時の不整合。

## 2. JSON と CSV の取り込みロジックが別物で、業務ルールの不整合が起こりやすい

- 該当箇所
  - `src/modules/ImportJSON.ts`
  - `src/modules/ImportCSV.ts`
  - `src/modules/CaseValidater.ts`
- 問題点
  - JSON import は `CheckCategoryMatch()` を使ってカテゴリ判定を行うが、CSV import は `DiagnosesAndProcedures()` 内で `TypeOfProcedure = CaseData.Diagnoses[0].Chain[0]` を直接決めている。
  - 2020 年以前/2021 年以後のルールが `CaseValidater.ts` に埋め込まれており、インポート時に使うロジックと正式な検証ロジックとの間がズレやすい。
  - ルールが複数箇所に散っているため、CSV/JSON の同一データで最終的な `TypeOfProcedure` が変わるリスクがある。
- 影響
  - 同じ症例が別インポート手段で異なる扱いになる、マスタ整合性が崩れる、分類値の再計算時にブレが出る。

## 3. 年次依存のビジネスルールが複雑で、境界値と異常値に弱い

- 該当箇所
  - `src/modules/CaseValidater.ts`: `CheckCategoryMatch()`
  - `src/modules/Masters/ApproachMaster.ts`、`src/modules/Masters/Master.ts`
- 問題点
  - 年が `2020` 以前と以後でカテゴリ判定アルゴリズムが切り替わる。
  - `year` が `undefined` や `''` だと代替分岐が進み、同じ症例でも年次不明時に判定が変わる。
  - ルール自体が「主たる診断と主たる施行術式のカテゴリが一致していない場合にエラー」となっており、症例のばらつきが多い業務データに対して例外の再判定が難しい。
- 影響
  - 年次が不正または欠落したデータで、保存時に不正なカテゴリが採用される、あるいはエラーで弾かれる。

## 4. DB のロック・バックアップ処理が、共有ディレクトリや異常終了に対して脆い

- 該当箇所
  - `src/background.ts`: `app.requestSingleInstanceLock()`, `--datadir`, `drop-database`, `unlock`, `createDatabaseInstance()`
  - `README.md`: コマンドラインオプション説明
- 問題点
  - `--datadir` で共有フォルダやネットワークドライブを指すと、ロック整合性と競合が発生しやすい。
  - lock ファイルや backup ファイルの削除が `fs.unlinkSync` に依存しており、ファイルが存在しない／別プロセスがロック中／アクセス権の問題で例外が起きる。
  - `ParseCommandLineOptions` で `fs.statSync` と `path` の前提が強く、ディレクトリ名やパスの不正時に即終了してしまう。
- 影響
  - 共有環境や長時間稼働後にアプリ起動失敗、データベースがロックされたまま再開不能、バックアップ/ロック削除の誤動作。

## 5. 重要なデータ I/O が IPC / Electron で分散しており、バグ検出がしにくい

- 該当箇所
  - `src/background.ts`
  - `src/modules/electron/NedbAccess.ts`
  - `src/modules/serve/NedbAccess.ts`
- 問題点
  - DB アクセスが IPC 経由と直接アクセスの両方で扱われており、同じ処理が複数経路に存在する。
  - `escapeProxyObject()` による `RegExp` JSON 化の回避など、バックエンドとフロントエンドの境界での特殊変換が多い。
  - 変換が複雑なため、検索条件や更新条件の一部が落ちたり、ネスト構造が異なる場合に型/実行時不整合が起こりやすい。
- 影響
  - 一見動くが、検索や更新の一部だけ失敗しやすい。再現条件が限られ、デバッグが難しい。

## 6. 主要機能の自動テストが少なく、インポート/DB/IPC/画面遷移のドリフトが見逃されやすい

- 該当箇所
  - `package.json` の `vitest` 実行設定
  - `src/modules/Masters/DiagnosisMaster.test.js`
  - `src/modules/Masters/ProcedureMaster.test.js`
- 問題点
  - 実行されたテスト結果では 2 ファイル / 4 テストが通っているが、対象はマスタ整合性中心。
  - インポート処理、CSV/JSON 差分、DB 保存、Electron のロック・バックアップ、画面のデータフローのテストはほぼ見当たらない。
  - 今回のような不整合は「実運用でのみ発見」しやすく、回帰テストが弱い。
- 影響
  - リリース後の重大不具合が残りやすく、修正履歴が読めても再発防止が難しい。

## 7. 例外処理が「通知として見える」設計で、データ破損に繋がるリスクがある

- 該当箇所
  - `src/modules/ImportJSON.ts` の `catch` ブロック
  - `src/modules/ImportCSV.ts` の `catch` ブロック
- 問題点
  - 不正なデータで `Imported = true` と `Notification` を付けるだけで、保存やアクセスの妥当性を強制していない。
  - 例外を握りつぶす実装が多く、ユーザには「警告が出た」と見えても、データの実体が移行されたままになる可能性がある。
- 影響
  - 手入力・CSV/JSON インポート後のデータが未検証のまま保存され、後続の検証処理で不整合が表面化する。

## 優先度の目安

1. インポート時の状態保持と ID 発行の一貫性
2. CSV/JSON/正式検証ロジックの単一化
3. DB ロックとデータ保存先の整合性
4. E2E / 回帰テストの拡張
5. 例外ハンドリングの厳密化

上記は「コード修正を行わないレビュー」であり、将来の修正計画に対する注意点として扱う。

### 年次依存の改善（CaseValidater.ts）

- `src/modules/CaseValidater.ts` では、年次の判定を `item.DateOfProcedure.substring(0, 4)` のような直接切り出しではなく、`resolveReferenceYear()` に集約した。
- これにより、日付が欠落している・`yyyy-mm-dd` 以外のフォーマットが混ざる・比較対象が `undefined` のケースでも、年比較を 4 桁の安全な年文字列へ正規化してから処理する。
- `ValidateCase()`、`CheckCategoryMatch()`、`ValidateDiagnoses()`、`ValidateProcedures()`、`ValidateApproach()`、`ValidateAEs()` で同一ヘルパーを使うことで、マスタの選定ロジックと検証ロジックのズレを抑えた。
- フォールバックとして `DEFAULT_MASTER_YEAR = '2026'` を導入し、年不明時に最新マスタ年に寄せて誤判定を防止する設計とした。
- なお、今回の変更は実修正そのものではなく、年次依存の管理方法を安全に整理する改善を行うもの。今後の再利用時にはこのヘルパーを基準にメンテナンスすることを推奨する。
