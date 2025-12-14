# NSIS installer configuration for JOED5
# - require installer.nsh to define Japanese messages.
Unicode true
ManifestDPIAware true
!include MUI2.nsh

Name "症例登録システム"
Caption "日本産科婦人科内視鏡学会 症例登録システム"

SetCompressor lzma

InstallDir "$LOCALAPPDATA\Programs\JOED5"

Var /Global NO_SANDBOX

RequestExecutionLevel user
ShowInstDetails show
ShowUnInstDetails show

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
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_NOTCHECKED
!define MUI_FINISHPAGE_RUN_FUNCTION un.DeleteDataFolder
!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "Japanese"
!define MUI_WELCOMEPAGE_TITLE "症例登録システムのセットアップへようこそ"
!define MUI_FINISHPAGE_TITLE "症例登録システムのセットアップは完了しました"
!define MUI_FINISHPAGE_RUN_TEXT "症例登録システムを起動する"
!define MUI_UNFINISHPAGE_TITLE "症例登録システムを削除しました"
!define MUI_UNFINISHPAGE_TEXT "ご協力ありがとうございました."
!define MUI_UNCONFIRMPAGE_TEXT_TOP "症例登録システムのプログラムをシステムから削除します."
!define MUI_UNFINISHPAGE_RUN_TEXT "設定とデータファイルも削除する場合はチェックしてください."

!define MUI_NOLEFTIMAGE

!define REGPATH_UNINSTSUBKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\JOED5"

!define MENUDIRNAME "$SMPROGRAMS\日本産科婦人科内視鏡学会"
!define MENUITEM1NAME "$SMPROGRAMS\日本産科婦人科内視鏡学会\症例登録システム.lnk"
!define MENUITEM2OLDNAME "$SMPROGRAMS\日本産科婦人科内視鏡学会\アンインストール.lnk"
!define MENUITEM2NAME "$SMPROGRAMS\日本産科婦人科内視鏡学会\症例登録アンインストール.lnk"

!define /ifndef DRIVE_REMOVABLE 3
!define /ifndef DRIVE_FIXED 3
!define /ifndef DRIVE_REMOTE 4

Section 
    SetOutPath "$INSTDIR"
    # clean-up locales/ and resources/ before update - 1.3.1000 hack
    RMDIR /r "$INSTDIR\locales"
    RMDIR /r "$INSTDIR\resources"

    File /r "${PROJECT_DIR}\dist-electron\win-unpacked\*.*"

    # prepare uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"

    # start menu
    CreateDirectory "${MENUDIRNAME}"
    CreateShortCut "${MENUITEM1NAME}" "$INSTDIR\JOED5.exe" "$NO_SANDBOX"
    IfFileExists "${MENUITEM2OLDNAME}" +1 +2
        DELETE "${MENUITEM2OLDNAME}"
    CreateShortCut "${MENUITEM2NAME}" "$INSTDIR\Uninstall.exe" ""

    # user registory
    WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "DisplayName" "${INSTALLERCAPTION}"
    WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "Publisher" "${JOEDPUBLISHER}"
    WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "DisplayVersion" "%__APP_VERSION__%"
    WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "DisplayIcon" "$INSTDIR\JOED5.exe,0"
    WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "UninstallString" '"$INSTDIR\Uninstall.exe"'
    WriteRegStr HKCU "${REGPATH_UNINSTSUBKEY}" "QuietUninstallString" '"$INSTDIR\Uninstall.exe" /S'
    WriteRegDWORD HKCU "${REGPATH_UNINSTSUBKEY}" "NoModify" 1
    WriteRegDWORD HKCU "${REGPATH_UNINSTSUBKEY}" "NoRepair" 1

    # clean up APPDATA/JOED5
    RMDIR /r "$APPDATA\JOED5\Dictionaries"
    RMDIR /r "$APPDATA\JOED5\Cache"
    RMDIR /r "$APPDATA\JOED5\Code Cache"
    RMDIR /r "$APPDATA\JOED5\DawnCache"
    RMDIR /r "$APPDATA\JOED5\GPUCache"
SectionEnd

Section "Uninstall" 
    DELETE "${MENUITEM1NAME}"
    DELETE "${MENUITEM2NAME}"
    IfFileExists "${MENUITEM2OLDNAME}" +1 +2
        DELETE "${MENUITEM2OLDNAME}"
    RMDIR "${MENUDIRNAME}"
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
