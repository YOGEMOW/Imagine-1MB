@echo off
setlocal EnableExtensions
title Uninstall Imagine-1MB

net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Requesting administrator privileges...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

echo Stopping Imagine-1MB...
taskkill /IM Imagine-1MB.exe /F >nul 2>&1
taskkill /IM Imagine.exe /F >nul 2>&1

echo Removing shortcuts...
del /f /q "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Imagine-1MB.lnk" >nul 2>&1
del /f /q "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Imagine.lnk" >nul 2>&1

echo Removing registry entries...
reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Imagine-1MB" /f >nul 2>&1
reg delete "HKLM\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\Imagine-1MB" /f >nul 2>&1
reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\09dc0688-32e9-521b-a09a-61be9f591552" /f >nul 2>&1

echo Removing installation files...
set "INSTALL_DIR=C:\Program Files\Imagine"
set "TMPBAT=%TEMP%\remove-imagine-1mb-%RANDOM%.bat"

(
  echo @echo off
  echo timeout /t 2 /nobreak ^>nul
  echo rd /s /q "%INSTALL_DIR%"
  echo del /f /q "%~f0"
  echo del /f /q "%TMPBAT%"
) > "%TMPBAT%"

start "" /min "%TMPBAT%"
exit /b 0
