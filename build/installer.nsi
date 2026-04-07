Unicode true
# NSIS installer configuration for JOED5
# - require installer.nsh to define Japanese messages.
ManifestDPIAware true
!include MUI2.nsh

Name "症例登録システム"
Caption "日本産科婦人科内視鏡・ロボティクス学会 症例登録システム"

SetCompressor lzma

InstallDir "$LOCALAPPDATA\Programs\JOED5"

Var /Global NO_SANDBOX

RequestExecutionLevel user
ShowInstDetails show
ShowUnInstDetails show

!define MUI_WELCOMEPAGE_TITLE "症例登録システムのセットアップへようこそ"
!define MUI_FINISHPAGE_TITLE "症例登録システムのセットアップは完了しました"
!define MUI_FINISHPAGE_RUN_TEXT "症例登録システムを起動する"
!define MUI_UNFINISHPAGE_TITLE "症例登録システムを削除しました"
!define MUI_UNFINISHPAGE_TEXT "ご協力ありがとうございました."
!define MUI_UNCONFIRMPAGE_TEXT_TOP "症例登録システムのプログラムをシステムから削除します."

!insertmacro MUI_PAGE_WELCOME

!insertmacro MUI_PAGE_LICENSE "${BUILD_RESOURCES_DIR}\license.txt"

!define MUI_PAGE_CUSTOMFUNCTION_LEAVE verifyInstDir
!insertmacro MUI_PAGE_DIRECTORY

!insertmacro MUI_PAGE_INSTFILES

!define MUI_FINISHPAGE_RUN "$INSTDIR\JOED5.exe"
!define MUI_FINISHPAGE_RUN_PARAMETERS "$NO_SANDBOX"
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!define MUI_FINISHPAGE_SHOWREADME
!define MUI_FINISHPAGE_SHOWREADME_NOTCHECKED
!define MUI_FINISHPAGE_SHOWREADME_TEXT "設定とデータファイルも削除する場合はチェックしてください."
!define MUI_FINISHPAGE_SHOWREADME_FUNCTION un.DeleteDataFolder
!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "Japanese"

!define MUI_NOLEFTIMAGE

!define REGPATH_UNINSTSUBKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOED5"

!define MENUDIRNAME "$SMPROGRAMS\日本産科婦人科内視鏡・ロボティクス学会"
!define MENUDIRNAME_OLD "$SMPROGRAMS\日本産科婦人科内視鏡学会"
!define MENUITEM1NAME "${MENUDIRNAME}\症例登録システム.lnk"
!define MENUITEM1NAME_OLD "${MENUDIRNAME_OLD}\症例登録システム.lnk"
!define MENUITEM2OLDNAME "${MENUDIRNAME}\アンインストール.lnk"
!define MENUITEM2OLDNAME_OLD "${MENUDIRNAME_OLD}\アンインストール.lnk"
!define MENUITEM2NAME "${MENUDIRNAME}\症例登録アンインストール.lnk"
!define MENUITEM2NAME_OLD "${MENUDIRNAME_OLD}\症例登録アンインストール.lnk"

!define /ifndef DRIVE_REMOVABLE 3
!define /ifndef DRIVE_FIXED 3
!define /ifndef DRIVE_REMOTE 4

Section 
    Call PreInstallCleanup

    SetOutPath "$INSTDIR"

    File /r "${PROJECT_DIR}\dist-electron\win-unpacked\*.*"

    # prepare uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"

    # start menu
    IfFileExists "${MENUDIRNAME_OLD}\*.*" 0 +5
        CreateDirectory "${MENUDIRNAME}"
        CopyFiles /SILENT "${MENUDIRNAME_OLD}\*.*" "${MENUDIRNAME}\"
        Delete "${MENUDIRNAME_OLD}\*.*"
        RMDIR "${MENUDIRNAME_OLD}"

    CreateDirectory "${MENUDIRNAME}"
    IfFileExists "${MENUITEM1NAME_OLD}" +1 +2
        DELETE "${MENUITEM1NAME_OLD}"
    IfFileExists "${MENUITEM2NAME_OLD}" +1 +2
        DELETE "${MENUITEM2NAME_OLD}"
    CreateShortCut "${MENUITEM1NAME}" "$INSTDIR\JOED5.exe" "$NO_SANDBOX"
    IfFileExists "${MENUITEM2OLDNAME}" +1 +2
        DELETE "${MENUITEM2OLDNAME}"
    IfFileExists "${MENUITEM2OLDNAME_OLD}" +1 +2
        DELETE "${MENUITEM2OLDNAME_OLD}"
    CreateShortCut "${MENUITEM2NAME}" "$INSTDIR\Uninstall.exe" ""

    # user registory
    WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "DisplayName" "症例登録システム"
    WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "Publisher" "P4mohnet and 日本産科婦人科内視鏡・ロボティクス学会"
    WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "DisplayVersion" "${VERSION}"
    WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "DisplayIcon" "$INSTDIR\JOED5.exe,0"
    WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "UninstallString" '"$INSTDIR\Uninstall.exe"'
    DeleteRegValue HKCU "${REGPATH_UNINSTSUBKEY}" "QuietUninstallString"
    WriteRegDWORD HKCU "${REGPATH_UNINSTSUBKEY}" "NoModify" 1
    WriteRegDWORD HKCU "${REGPATH_UNINSTSUBKEY}" "NoRepair" 1

SectionEnd

Section "Uninstall" 
    DELETE "${MENUITEM1NAME}"
    DELETE "${MENUITEM1NAME_OLD}"
    DELETE "${MENUITEM2NAME}"
    DELETE "${MENUITEM2NAME_OLD}"
    IfFileExists "${MENUITEM2OLDNAME}" +1 +2
        DELETE "${MENUITEM2OLDNAME}"
    IfFileExists "${MENUITEM2OLDNAME_OLD}" +1 +2
        DELETE "${MENUITEM2OLDNAME_OLD}"
    RMDIR "${MENUDIRNAME}"
    RMDIR "${MENUDIRNAME_OLD}"
    Delete "$INSTDIR\Uninstall.exe"
    RMDIR /r "$INSTDIR"
    DeleteRegKey HKCU "${REGPATH_UNINSTSUBKEY}"
SectionEnd

Function un.DeleteDataFolder
    MessageBox MB_YESNO "設定とデータファイルを削除します, よろしいですか？" IDNO done IDYES proceed
    proceed:
        RMDIR /r "$APPDATA\JOED5"
        MessageBox MB_ICONINFORMATION|MB_OK "設定とデータファイル等を削除しました."
    done:
FunctionEnd

Function PreInstallCleanup
    # remove old binaries before install
    IfFileExists "$INSTDIR\*.*" 0 +2
        RMDIR /r "$INSTDIR"

    # remove old appdata except preserved files
    IfFileExists "$APPDATA\JOED5\*.*" 0 cleanup_done
        Call BackupPreservedAppData
        RMDIR /r "$APPDATA\JOED5"
        Call RestorePreservedAppData

    cleanup_done:
FunctionEnd

Function BackupPreservedAppData
    InitPluginsDir
    RMDIR /r "$PLUGINSDIR\joed5_keep"
    CreateDirectory "$PLUGINSDIR\joed5_keep"

    IfFileExists "$APPDATA\JOED5\config.json" 0 +2
        CopyFiles /SILENT "$APPDATA\JOED5\config.json" "$PLUGINSDIR\joed5_keep\config.json"

    IfFileExists "$APPDATA\JOED5\joed.nedb" 0 +2
        CopyFiles /SILENT "$APPDATA\JOED5\joed.nedb*" "$PLUGINSDIR\joed5_keep\"

    IfFileExists "$APPDATA\JOED5\joed.nedb.*" 0 +2
        CopyFiles /SILENT "$APPDATA\JOED5\joed.nedb.*" "$PLUGINSDIR\joed5_keep\"
FunctionEnd

Function RestorePreservedAppData
    CreateDirectory "$APPDATA\JOED5"

    IfFileExists "$PLUGINSDIR\joed5_keep\config.json" 0 +2
        CopyFiles /SILENT "$PLUGINSDIR\joed5_keep\config.json" "$APPDATA\JOED5\config.json"

    IfFileExists "$PLUGINSDIR\joed5_keep\joed.nedb" 0 +2
        CopyFiles /SILENT "$PLUGINSDIR\joed5_keep\joed.nedb" "$APPDATA\JOED5\"

    IfFileExists "$PLUGINSDIR\joed5_keep\joed.nedb.*" 0 +2
        CopyFiles /SILENT "$PLUGINSDIR\joed5_keep\joed.nedb.*" "$APPDATA\JOED5\"
FunctionEnd

Function verifyInstDir
    StrCpy $NO_SANDBOX ''

    StrCpy $0 $INSTDIR 2
    # UNC
    StrCmp $0 "\\" remote

    # check drive type
    StrCpy $0 "$0\"
    System::Call 'KERNEL32::GetDriveType(tr0) i .r1'
    IntCmp $1 ${DRIVE_REMOTE} remote noremote noremote

    remote:
        MessageBox MB_OKCANCEL "ネットワーク共有ドライブへのインストールはセキュリティ上推奨できません.$\r$\n上記を了承の上オプションの設定をしてインストールを継続しますか?" IDCANCEL goback IDOK setoption
        goback:
            Abort
        setoption:
            StrCpy $NO_SANDBOX '--no-sandbox'
    noremote:
FunctionEnd
