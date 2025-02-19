@echo off
REM Ir a la carpeta del proyecto
cd /d %~dp0

REM Activar el entorno virtual del backend
echo Activando el entorno virtual...
call .venv\Scripts\activate

REM Iniciar el servidor de Django en una nueva ventana
echo Iniciando el servidor de Django...
start "Backend Server" cmd /k "cd backend && python manage.py runserver"

REM Iniciar el servidor de React en otra nueva ventana
echo Iniciando el servidor de React...
start "Frontend Server" cmd /k "cd Frontend && npm start"

echo Listo! El backend y el frontend están corriendo.