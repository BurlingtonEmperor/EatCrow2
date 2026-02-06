@echo off

set installation_error=0

python --version >nul 2>&1
if %errorlevel% neq 0 (
  echo Python is NOT installed or not in PATH.
  echo Installing python...

  winget install -e --id Python.Python.3.13 --scope machine
)

python -m pip install arduino-python3 pyserial flask requests meteostat pandas geo-city-locator nava
if %errorlevel% neq 0 (
  set installation_error=1
)

setlocal
cd /d %~dp0

python interface.py