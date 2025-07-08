@echo off
powershell -ExecutionPolicy Bypass -NoProfile -Command ^
    "$EntireScript = Get-Content -Path '%~f0' -Raw -Encoding UTF8;" ^
    "$Escape = '::';" ^
    "$StartMarker = $Escape + 'PS_SCRIPT_BEGIN' + $Escape;" ^
    "$EndMarker = $Escape + 'PS_SCRIPT_END' + $Escape;" ^
    "$StartIndex = $EntireScript.IndexOf($StartMarker) + $StartMarker.Length;" ^
    "$EndIndex = $EntireScript.IndexOf($EndMarker, $StartIndex);" ^
    "if ($StartIndex -ge $StartMarker.Length -and $EndIndex -gt $StartIndex) {" ^
    "    $PowerShellCode = $EntireScript.Substring($StartIndex, $EndIndex - $StartIndex);" ^
    "    Invoke-Expression $PowerShellCode;" ^
    "} else {" ^
    "    Write-Error 'Failed to parse the script block';" ^
    "    exit 1;" ^
    "};"

if %ERRORLEVEL% neq 0 (
    echo Script terminated with error code %ERRORLEVEL%.
    pause
    exit /b %ERRORLEVEL%
)
goto :EOF

::PS_SCRIPT_BEGIN::
#
# JOED5ソフトウエア サポートスクリプト : バックアップデータの作成
#
# Copyright (c) 2023-2025 P4mohnet
# Licensed under the MIT License.

# データフォルダをデフォルトから移動していた場合のコマンドラインパラメータ取得
param(
    [string]$DataPath = $ENV:APPDATA + "\JOED5"
)

# ダイアログ表示のためのモジュールをインポート
$WindowsFormsLoaded = $false
try {
    Add-Type -AssemblyName System.Windows.Forms
    $WindowsFormsLoaded = $true
}
catch {
    # System.Windows.Forms アセンブリの読み込みに失敗した場合、保存先はデスクトップになる旨を通知する
    show-message "バックアップデータの保存先はデスクトップの joed5-full-export.json になります。"
}

# メッセージダイアログを表示する
function Show-Message {
    param (
        [string]$message,
        [bool]$isError = $false
    )
    if ($WindowsFormsLoaded) {
        if ($isError) {
            $icon = [System.Windows.Forms.MessageBoxIcon]::Error
            Write-Warning $message
        } else {
            $icon = [System.Windows.Forms.MessageBoxIcon]::Information
        }
        [System.Windows.Forms.MessageBox]::Show($message, "JOED5 バックアップ", [System.Windows.Forms.MessageBoxButtons]::OK, $icon)
    } else {
        if ($isError) {
            $flags = 16
            Write-Warning $message
        } else {
            $flags = 64
        }
        $shell = New-Object -ComObject "WScript.Shell"
        $shell.Popup($message, 0, "JOED5 バックアップ", $flags)
    }
}

# データフォルダの存在確認
if (-not (Test-Path -Path $DataPath)) {
    show-message "データフォルダが見つかりません: $DataPath" -isError $true
    exit 3
}

# データファイルの存在確認
if (-not (Test-Path -Path "$DataPath\joed.nedb")) {
    Show-Message "JOED5のデータファイルが見つかりません: $DataPath\joed.nedb" -isError $true
    exit 3
}

# JSONファイルの取得
$data = Get-Content -Path "$DataPath\joed.nedb" -Encoding UTF8

# JSONファイルデータのチェック
$errorData = $false
$data | foreach {
    try {
        $json = ConvertFrom-Json $_
    } catch {
        $errorData = $true
        if ( $_ -match "`"PatientId`":`"(.*?)`"") {
            $id = $matches[1]
            Show-Message "不正なレコードが検出されました: (患者認識子: $id)" -isError $true
        } ekse {
            Show-Message "JOED5のデータファイルが不正です: $DataPath\joed.nedb" -isError $true
        }
    }
}

if ($errorData) {
    Show-Message "JOED5のデータファイルにエラーが検出されたため、バックアップを作成できません。" -isError $true
    exit 13
}

# バックアップファイルの保存先を決定
$saveFileName = [System.Environment]::GetFolderPath("Desktop") + "\joed5-full-export.json"
$saveByYear = $false
if ($WindowsFormsLoaded) {
    # Windows Forms を使用して保存ダイアログを表示
    $saveFileDialog = New-Object System.Windows.Forms.SaveFileDialog
    $saveFileDialog.Title = "JOED5 バックアップファイルの保存先"
    $saveFileDialog.Filter = "JOED5バックアップファイル(*.json)|*.json|JOED5バックアップファイル-年次ごと(*.json)|*.json"
    $saveFileDialog.InitialDirectory = [System.Environment]::GetFolderPath("Desktop")
    $saveFileDialog.FileName = "joed5-full-export.json"

    if ($saveFileDialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        $saveFileName = $saveFileDialog.FileName

        if ($saveFileDialog.FilterIndex -eq 2) {
            $saveByYear = $true
        }
    } else {
        Show-Message "バックアップがキャンセルされました。"
        exit 0
    }
}

# バックアップデータの生成
$parsedData = $data | ConvertFrom-Json
$backupData = @{}
foreach ($record in $parsedData) {
    # 症例レコードのみをバックアップ対象とする
    if ($record.PSObject.Properties["PatientId"]) {
        if ($saveByYear) {
            # 年次ごとに保存する場合、年号文字列をキーにする
            $year = ([datetime]($record.DateOfProcedure)).Year
        } else {
            # 年次ごとに保存しない場合は、単一のキーを使用
            $year = "all"
        }

        # 管理用のプロパティを削除
        $record.PSObject.Properties.Remove("_id")
        $record.PSObject.Properties.Remove("DocumentId")

        if ($backupData.Keys -contains $year) {
            $backupData[$year] += $record
        } else {
            $backupData[$year] = @($record)
        }
    }
}

# バックアップファイルにバックアップデータを保存
try {
    if ($backupData.Count -eq 0) {
        Show-Message "出力するデータがありませんでした。" -isError $true
        exit 259
    }

    # UTF-8 BOMなしでエンコードして保存するために.NETメソッドを使用
    #(WindowsではPS5.1が基本なのでBOMなしにはこの対応が必要)
    $utf8wobom = New-Object System.Text.UTF8Encoding $false

    foreach ($year in $backupData.Keys) {
        # 年次ごとに保存する場合、ファイル名を変更
        if ($year -ne "all") {
            $realFileName = $saveFileName -replace "\.json$", "($year).json"
        } else {
            $realFileName = $saveFileName
        }

        # 年次ごとのストリームを生成して保存
        $outputStream = $backupData[$year] | ConvertTo-Json -Depth 10
        $streamWriter = New-Object System.IO.StreamWriter $realFileName, $false, $utf8wobom
        $streamWriter.Write($outputStream)
        $streamWriter.Close()
    }
    Show-Message "バックアップファイルが正常に作成されました: $saveFileName"
} catch {
    Show-Message "バックアップファイルの保存に失敗しました: $_" -isError $true
    exit 82
}

::PS_SCRIPT_END::

exit /b 0
