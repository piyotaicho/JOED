# JOED5 サポートユーティリティ
## create-fillexport

Windows用。データベースファイルからバックアップ形式のエクスポート用データを作成します。  
PowerShellの実行知識があれば`create-fullexport.ps1`を実行できると思いますが、多くの方には困難なのでバッチファイルでラップした`create-fullexport.cmd`を用意しました。実行環境は、Windows11のPowerShell 5.1環境以降とさせていただきます。

## generate-json.js

ソースツリーからJSONのアレイ形式でマスタの内容を出力します。
ES6記法とモジュールのパス解決ができないのでnodeでは動作しません、Bunで動作させてください。

|オプション||
|:---|:--|
|diagnosis|診断マスタを出力|
|procedure|術式マスタを出力|
|year|年次に対して有効なマスタを出力します|
|dump|アレイ形式では無く、マスタの階層構造で出力します|
|output|ファイルに出力します|

```
> # 診断マスタの内容を列挙
> bun generate-json.js --diagnosis
```

```
> # 2020年の術式マスタの内容を列挙
> bun generate-json.js --procedure --year 2020
```

