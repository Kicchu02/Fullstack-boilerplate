@echo off
echo 🚀 Bootstrap script starting...
echo Setting up Full Stack Boilerplate...

REM Change to the workspace root directory
cd /d "%~dp0"

echo.
echo 🔧 Setting up Server (WS)...
echo Running start_dev_docker.bat...
cd WS\scripts
call start_dev_docker.bat
cd ..\..

echo.
echo 🎨 Setting up Frontend (FE)...
echo Running npm install...
cd FE
call npm install
cd ..

echo.
echo ✅ Bootstrap complete! Both server and frontend are set up.
echo.
echo Server (WS): Docker containers are running with database and migrations
echo Frontend (FE): Dependencies are installed
echo.
echo You can now start development:
echo - Server: The backend is already running via Docker
echo - Frontend: cd FE ^&^& npm run dev
