# Unicode
Unicode true
# モダンUIを使用
!include MUI2.nsh
# 日本語UI
LoadLanguageFile "${NSISDIR}\Contrib\Language files\Japanese.nlf"

Name "JOED5"
Caption "JOED5 インストーラー"
OutFile "JOED5-installer.exe"
SetCompressor lzma

# 64bit - $PROGRAMFILES64 win-unpacked
InstallDir "$PROGRAMFILES32\JOED5"
File /r "dist_electron/win-ia32-unpacked\*.*"

RequestExecutionLevel user
ShowInstDetails show
ShowUnInstDetails show

!insertmacro MUI_PAGE_LICENSE "build/license.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_LANGUAGE "Japanese"

Section 
    SetOutPath "$INSTDIR"
    WriteUninstaller "$INSTDIR\Uninstall.exe"
    CreateDirectory "$SMPROGRAMS\日本産科婦人科内視鏡学会"
    CreateShortCut "$SMPROGRAMS\日本産科婦人科内視鏡学会\症例登録システム.lnk" "$INSTDIR\JOED5.exe" ""
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOED5" "DisplayName" "日本産科婦人科内視鏡学会"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOED5" "UninstallString" '"$INSTDIR\Uninstall.exe"'
SectionEnd

Section "Uninstall"

SectionEnd

