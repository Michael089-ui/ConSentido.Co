@echo off
color 0A
cls
echo ===========================================================
echo           INICIALIZANDO BACKEND CONSENTIDO.CO              
echo ===========================================================

REM Verificar MySQL (WAMP)
echo [1/2] Verificando MySQL con WAMP...
echo.
echo IMPORTANTE: Asegurate que WAMP esta activo (icono verde en la bandeja)
echo Si no esta activo, por favor activalo ahora.
echo.
echo Comprobando servicios MySQL...

sc query wampmysqld64 | find "RUNNING" >nul
if %errorlevel% == 0 (
    echo [OK] MySQL esta ejecutandose correctamente
) else (
    echo [ADVERTENCIA] No se detecto el servicio MySQL de WAMP
    echo Por favor verifica que WAMP esta ejecutandose correctamente
    echo con el icono en verde en la bandeja del sistema
    echo.
    echo Presiona cualquier tecla para continuar cuando MySQL este activo...
    pause >nul
)

echo.
echo [2/2] Iniciando backend Spring Boot...
echo.

REM Iniciar backend en una nueva ventana
cd backend
start "Spring Boot Backend" cmd /c "color 0B && echo Iniciando Spring Boot... && mvn spring-boot:run"
cd ..

echo Backend iniciado en http://localhost:8080
echo Esperando a que Spring Boot se inicialice (15 segundos)...
timeout /t 15 /nobreak >nul

echo ===========================================================
echo                 BACKEND INICIADO CORRECTAMENTE             
echo ===========================================================
echo  Backend: http://localhost:8080
echo.
echo  Tu frontend ya puede consumir los servicios REST.
echo  Recuerda que debes usar Live Server para servir el frontend.
echo ===========================================================

pause