#!/usr/bin/env pwsh
<#
.SYNOPSIS
バージョン更新スクリプト - 基準日からの経過日数をパッチレベルとして使用

.DESCRIPTION
2020-01-01を基準日として、現在日までの経過日数をパッチレベルに設定します。
メジャーバージョンやマイナーバージョンの変更も可能です。

.PARAMETER PackageJsonPath
package.jsonファイルのパス（デフォルト: "package.json"）

.PARAMETER DryRun
実際にファイルを更新せず、変更内容のみを表示

.PARAMETER Major
メジャーバージョンを指定（数値または "major.minor" 形式）
例: -Major 3 または -Major "3.0"

.PARAMETER Minor
マイナーバージョンを明示的に指定（数値）
例: -Minor 5

.PARAMETER IncrementMinor
マイナーバージョンをインクリメント
注意: -Minor オプションが指定された場合、そちらが優先されます

.EXAMPLE
.\update-patch-version.ps1 -DryRun
ドライランで現在の設定を確認

.EXAMPLE
.\update-patch-version.ps1 -Major 3
メジャーバージョンを3に変更

.EXAMPLE
.\update-patch-version.ps1 -Major "3.0"
メジャーバージョンを3、マイナーバージョンを0に変更

.EXAMPLE
.\update-patch-version.ps1 -IncrementMinor
マイナーバージョンをインクリメント

.EXAMPLE
.\update-patch-version.ps1 -Minor 5
マイナーバージョンを5に明示的に設定
#>

param(
    [string]$PackageJsonPath = "package.json",
    [switch]$DryRun = $false,
    [string]$Major = "",
    [string]$Minor = "",
    [switch]$IncrementMinor = $false,
    [switch]$Help = $false
)

# ヘルプ表示
if ($Help) {
    Get-Help $MyInvocation.MyCommand.Path -Full
    exit 0
}

# 基準日の設定 (最初のリリースビルド作成日の基準)
$BaseDate = Get-Date "2020-01-01"

# 現在の日付から経過日数を計算
$CurrentDate = Get-Date
$DaysSinceBase = ($CurrentDate - $BaseDate).Days

Write-Host "バージョン更新スクリプト" -ForegroundColor Green
Write-Host "基準日: $($BaseDate.ToString('yyyy-MM-dd'))" -ForegroundColor Cyan
Write-Host "現在日: $($CurrentDate.ToString('yyyy-MM-dd'))" -ForegroundColor Cyan
Write-Host "経過日数: $DaysSinceBase 日" -ForegroundColor Yellow

# package.jsonの読み込み
if (-not (Test-Path $PackageJsonPath)) {
    Write-Error "package.json が見つかりません: $PackageJsonPath"
    exit 1
}

$packageContent = Get-Content $PackageJsonPath -Raw | ConvertFrom-Json

# 現在のバージョンを表示
Write-Host "現在のバージョン: $($packageContent.version)" -ForegroundColor Cyan

# バージョンを解析 (major.minor.patch 形式を想定)
if ($packageContent.version -match '^(\d+)\.(\d+)\.(\d+)$') {
    $currentMajor = [int]$matches[1]
    $currentMinor = [int]$matches[2]
    $currentPatch = [int]$matches[3]
    
    # 新しいメジャーバージョンの決定
    $newMajor = $currentMajor
    $newMinor = $currentMinor
    
    # メジャーバージョンの処理
    if ($Major -ne "") {
        if ($Major -match '^(\d+)\.(\d+)$') {
            # メジャー.マイナーの形式で指定された場合
            $newMajor = [int]$matches[1]
            $newMinor = [int]$matches[2]
            Write-Host "メジャー.マイナーバージョンを指定: $newMajor.$newMinor" -ForegroundColor Yellow
        } elseif ($Major -match '^\d+$') {
            # メジャーバージョンのみ指定された場合
            $newMajor = [int]$Major
            Write-Host "メジャーバージョンを指定: $newMajor" -ForegroundColor Yellow
        } else {
            Write-Error "メジャーバージョンの形式が不正です: $Major (数値または major.minor 形式で指定してください)"
            exit 1
        }
    }
    
    # マイナーバージョンの処理（メジャー.マイナー指定がない場合のみ）
    if ($Major -notmatch '^(\d+)\.(\d+)$') {
        if ($Minor -ne "") {
            # マイナーバージョンが明示的に指定された場合（優先）
            if ($Minor -match '^\d+$') {
                $newMinor = [int]$Minor
                Write-Host "マイナーバージョンを指定: $newMinor" -ForegroundColor Yellow
            } else {
                Write-Error "マイナーバージョンの形式が不正です: $Minor (数値で指定してください)"
                exit 1
            }
        } elseif ($IncrementMinor) {
            # マイナーバージョンをインクリメント
            $newMinor = $currentMinor + 1
            Write-Host "マイナーバージョンをインクリメント: $newMinor" -ForegroundColor Yellow
        }
    }
    
    $newVersion = "$newMajor.$newMinor.$DaysSinceBase"
    Write-Host "新しいバージョン: $newVersion" -ForegroundColor Green
    
    if ($currentMajor -eq $newMajor -and $currentMinor -eq $newMinor -and $currentPatch -eq $DaysSinceBase) {
        Write-Host "バージョンは既に最新です。" -ForegroundColor Yellow
        exit 0
    }
    
    if (-not $DryRun) {
        # package.jsonを更新
        $packageContent.version = $newVersion
        $updatedContent = $packageContent | ConvertTo-Json -Depth 100 | ForEach-Object { $_ -replace '\\u0026', '&' -replace '\\u003c', '<' -replace '\\u003e', '>' }
        
        # 元のフォーマットに近づけるための調整
        $updatedContent = $updatedContent -replace '  ', '  '  # インデントを維持
        
        Set-Content -Path $PackageJsonPath -Value $updatedContent -Encoding UTF8
        Write-Host "package.json を更新しました。" -ForegroundColor Green
    } else {
        Write-Host "[DRY RUN] package.json は更新されませんでした。" -ForegroundColor Yellow
    }
    
} else {
    Write-Error "バージョン形式が不正です: $($packageContent.version)"
    exit 1
}

Write-Host "完了" -ForegroundColor Green