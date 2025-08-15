@echo off
echo ♻️ Restarting Dev Database...

set SCRIPT_DIR=%~dp0

call "%SCRIPT_DIR%stop_dev_docker.bat"
call "%SCRIPT_DIR%start_dev_docker.bat"

echo ✅ Restart complete!
