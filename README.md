# 合併症アンケートシステム JOED version.5

日本産科婦人科内視鏡学会の合併症アンケートシステムの最新版開発環境です.

## 構成

- vue2 + vuex + router
- electron

追加パッケージ

- nedb (seald/nedb)
- Element
- Vue.Draggable
- Vuejs Datepicker
- Vue infinite loading
- js-xxhash
- Difflib.js
- encoding.js
- electron store

## 配布
リリースから最新版バイナリをダウンロードしてください.

### アプリケーション版での注意事項
Windowsではデータをユーザのデータフォルダに格納するのでインストールもユーザフォルダとなります. 

データベースの削除は, Windowsでは %AppData%¥JOED5¥joed.nedb* , macosでは ~/Library/ApplicationSupport/JOED5/joed.nedb* で可能です.
設定やその他のファイルも削除したい場合は当該フォルダを削除して下さい.

### コマンドラインオプション
#### --datadir=ディレクトリ
データベースの保存ディレクトリをフルパスで指定. このオプションを使用した場合はロックファイルを作成し, 同時にアクセス可能なのは1台に限られます.
共有フォルダなどを指定することが出来ますが, データベースへの複数インスタンスからの同時アクセスはできません.

#### --unlock
--datadirオプション使用中に発生したデータベースへのロックを解除.

#### --config=パス
アプリケーションの設定ファイルもしくは, 設定ファイルを保存するディレクトリを指定します. ディレクトリを指定した場合のファイル名はconfig.jsonです.

#### --drop-database[=all|lock]
データベースの削除.
allでバックアップも削除.
lockでは何らかの原因でロックがかかったままになった場合, ロックファイルを削除してロックを解除.(--unlockに移動)

## 変更履歴
- 2024-01-19 [1.5.1845]症例編集画面で削除ボタンで削除後にリストに戻らない現象を修正.
- 2024-01-13 [1.5.1839]ロボット支援下単純子宮全摘出術のチェックに問題があったため修正, 関連するルーチンでもチェック問題を回避するよう対処.
- 2024-01-05 [Version 1.5.1831] 各種リファクタリング, ドキュメント更新. 正式リリース.
- 2024-12-30 Version 1.5.1825.登録拒否の入力を導入, 諸般の問題に対応. Electron32にアップデート.32ビットWindowsのサポート終了.
- 2024-07-08 手術入力で併施入力手術が表示されない問題を修正.
- 2024-06-17 施設リストを更新. インポートの動作に不安定な部分があるので修正.
- 2024-01-30 v1.4.1490 Electronを28.xにアップデート.
- 2024-01-09 ファイル書き出しのバグを修正.
- 2024-01-05 Electronを27.xにアップデートこれにともないサポートOSがWindows10、macOS10.13以降に.
- 2023-11-16 コンポーネントのCompositionAPI化に伴うリファクタリングを完了.v1.4.1416にバージョンアップ.
- 2023-11-15 Vue2を2.7.15に更新.
- 2023-11-12 腫瘍登録番号とNCD管理番号を患者属性情報入力に移動、登録拒否フラグ入力を実装.
- 2023-11-09 インポートのデフォルトをJSONに、Notificationがインポートされない問題を修正.
- 2023-11-08 各種ライブラリをアップデート. ElectronはWindows 7対応の最終バージョンである22.3.27へ.
<br/><a href="Changelog.md">Changelog</a>

## データの仕様

### 提出データ
JSONでエクスポートされる.

```
[
    { 提出データヘッダ },
    { 症例データ1 },
    { 症例データ2 },
    ...
    { 症例データn }
]
```
Validationは診断・実施術式・合併症のマスタを参照するので結構コストが掛かるため、そこは提出を受け付けてから行う.大まかな整合性チェックはすべて症例入力の際に行われている.
(データインポートのため整合性チェックのルーチンは必要だが、それは別アプリケーションでもよいかもしれない)

### オブジェクト:提出データヘッダ
|名称                        |タイプ  |フォーマット規則|解説|
|:--------------------------|:-----:|:---------:|:--|
|InstitutionName            |string | |施設名|
|InstitutionID              |string |\d{5}|施設コード|
|Timestump                  |integer | |提出データ作成日時のUNIX timestump|
|Year                       |string |20(19\|[23]\d)|提出データの年次|
|NumberOfCases              |integer| |登録手術数（サードパーティーからの書き出しに対するエラーチェック用）|
|NumberOfDenial             |integer| |登録拒否数|
|Version                    |string | |提出データ作成時のソフトウエアのバージョン|
|Plathome                   |string | |使用環境 plathome (arch)|
|hash                       |string | |症例データ部分だけのハッシュ値|

### 症例データベースオブジェクト:Case
|名称                        | タイプ |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|DocumentId                 |integer| |X| |連続番号
|hash                       |string | |x|X|レコードのユニークキーであるPatientIdとDateOfProcedureのハッシュ値(提出データにのみ算出して付加)
|Name                       |string | | | |患者名
|Age                        |integer| | | |年齢
|PatientId                  |string | |X| |施設での患者ID
|JSOGId                     |string | | | |日産婦腫瘍登録番号 **(登録非推奨)** 
|NCDId                      |string |\d{18}-\d{2}-\d{2}-\d{2}| | |NCD症例識別コード～ロボット登録にけるNCD側の患者番号 **(登録非推奨)** 
|Denial                     |boolean| | | |登録拒否表明フラグ
|DateOfProcedure            |string |20(19\|[23][0-9])-(0[1-9]\|1[012])-([0-2][0-9]\|3[01])|X||手術日
|ProcedureTime              |string | |X|X|手術時間表記テーブルから引用される
|TypeOfProcedure            |string |(腹腔鏡\|腹腔鏡悪性\|ロボット支援下\|ロボット支援下悪性\|子宮鏡\|卵管鏡)|X|X|主たる診断の最初のカテゴリが採用される
|PresentAE                  |boolean| |X|X|合併症の登録があればtrue =(AE.length>0)
|Diagnoses                  |array  | |X|X|診断オブジェクト - Diagnosis
|Procedures                 |array  | |X|X|術式オブジェクト - Procedure
|AEs                        |array  | | |X|合併症オブジェクト - AE
|Imported                   |boolean| | | |読み込まれたデータで欠損などが明らかなもの
|Notification               |string | | | |データチェックによる確認内容（エラーを含む）の内容

### オブジェクト:Diagnosis
インポートの際にはDiagnosisItemsから検索して適当なChainを割り付ける.

|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|Text                       |string | |X|X|診断名マスタから引用|
|Chain                      |array  | | | |選択ツリー[category, Target]|
|Description                |string | | |X|補足情報(将来の拡張用)|
|UserTyped                  |boolean| | |X|手入力情報|

### オブジェクト:Procedure
インポートの際にDiagnosisItemsから検索して適当なChainを割り付ける.

|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|Text                       |string | |X|X|術式名、術式マスタから引用
|Chain                      |array  | | | |選択ツリー[category, Target]
|Description                |array  | | |x|付随情報
|AdditionalProcedure        |object | | | |併施術式 - これも同じ構造を取る(提出データでは別のProcedureオブジェクトとなる)
|Ditto                      |array  | | | |重複確認の対象となる術式名
|UserTyped                  |boolean| | |X|手入力情報|

### オブジェクト:AE
|名称                        |タイプ  |フォーマット規則|必須項目|エクスポート対象|解説|
|:--------------------------|:-----:|:--:|:--:|:--:|:--|
|category                   |string | |X|X|合併症の発生カテゴリ
|Title                      |string | |X|X|合併症の名称
|Cause                      |array  | | |X|合併症の原因
|Location                   |array  | | |X|合併症の発生部位
|BloodCount                 |string | | |X|出血の場合の出血量 もしくは '不明'
|Grade                      |string |([1245]\|3[ab])|X|X|合併症のグレード
|Course                     |array  | |X|X|合併症の転帰

