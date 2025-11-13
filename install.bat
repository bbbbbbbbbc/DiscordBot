@echo off
chcp 65001 >nul
cls

echo =========================================
echo   MEGA BOT DISCORD - Instalator v2.0
echo   155 komend - Automatyczna instalacja
echo =========================================
echo.

REM KROK 1: Sprawdzenie Node.js
echo === KROK 1/6: Sprawdzanie Node.js ===
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js nie jest zainstalowane!
    echo     Pobierz Node.js: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js zainstalowane: %NODE_VERSION%

REM KROK 2: Sprawdzenie npm
echo.
echo === KROK 2/6: Sprawdzanie npm ===
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] npm nie jest zainstalowane!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm zainstalowane: v%NPM_VERSION%

REM KROK 3: Sprawdzenie plików projektu
echo.
echo === KROK 3/6: Sprawdzanie plików projektu ===
if not exist "package.json" (
    echo [X] Brak pliku package.json!
    echo     Upewnij się że jesteś w katalogu projektu.
    pause
    exit /b 1
)
echo [OK] package.json znaleziony

if not exist "index.js" (
    echo [X] Brak pliku index.js!
    pause
    exit /b 1
)
echo [OK] index.js znaleziony

if not exist "commands\" (
    echo [X] Brak folderu commands\!
    pause
    exit /b 1
)
echo [OK] Folder commands\ znaleziony

REM KROK 4: Czyszczenie starych pakietów
echo.
echo === KROK 4/6: Czyszczenie starych pakietów ===
if exist "node_modules\" (
    echo [!] Usuwam stary folder node_modules...
    rmdir /s /q node_modules
    echo [OK] node_modules usunięty
)

if exist "package-lock.json" (
    echo [!] Usuwam stary package-lock.json...
    del /f /q package-lock.json
    echo [OK] package-lock.json usunięty
)

REM KROK 5: Instalacja pakietów
echo.
echo === KROK 5/6: Instalacja pakietów npm ===
echo To może potrwać 2-5 minut...
echo.

call npm install

if %errorlevel% neq 0 (
    echo.
    echo [X] Błąd podczas instalacji pakietów!
    echo     Sprawdź logi powyżej aby zobaczyć problem.
    pause
    exit /b 1
)

echo.
echo [OK] Wszystkie pakiety zainstalowane pomyślnie!

REM KROK 6: Sprawdzenie zmiennych środowiskowych
echo.
echo === KROK 6/6: Sprawdzanie zmiennych środowiskowych ===

set MISSING_VARS=0

if "%DISCORD_BOT_TOKEN%"=="" (
    echo [X] Brak zmiennej: DISCORD_BOT_TOKEN
    set MISSING_VARS=1
) else (
    echo [OK] DISCORD_BOT_TOKEN ustawiony
)

if "%CLIENT_ID%"=="" (
    echo [X] Brak zmiennej: CLIENT_ID
    set MISSING_VARS=1
) else (
    echo [OK] CLIENT_ID ustawiony
)

if "%OPENAI_API_KEY%"=="" (
    echo [!] Brak zmiennej: OPENAI_API_KEY (opcjonalne - dla komend AI)
) else (
    echo [OK] OPENAI_API_KEY ustawiony
)

REM Sprawdzenie ffmpeg
echo.
echo === BONUS: Sprawdzanie ffmpeg (dla YouTube/muzyki) ===
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] ffmpeg nie jest zainstalowane (komendy /play i /download mogą nie działać)
    echo     Pobierz: https://ffmpeg.org/download.html
) else (
    echo [OK] ffmpeg zainstalowane
)

REM Tworzenie folderów
if not exist "downloads\" mkdir downloads
echo [OK] Folder downloads\ gotowy

if not exist "data\" (
    mkdir data
    echo {} > data\economy.json
    echo {} > data\levels.json
    echo {} > data\stats.json
    echo [] > data\tempbans.json
    echo [OK] Utworzono folder data\ z plikami JSON
)

REM Podsumowanie
echo.
echo =========================================
echo           PODSUMOWANIE INSTALACJI
echo =========================================
echo.

if %MISSING_VARS%==1 (
    echo [!] UWAGA: Brakujące zmienne środowiskowe!
    echo.
    echo Ustaw je w systemie (Ustawienia -^> Zmienne środowiskowe):
    echo   - DISCORD_BOT_TOKEN
    echo   - CLIENT_ID
    echo   - OPENAI_API_KEY (opcjonalnie)
    echo.
)

echo [OK] INSTALACJA ZAKOŃCZONA POMYŚLNIE!
echo.
echo =========================================
echo          JAK URUCHOMIĆ BOTA?
echo =========================================
echo.
echo 1. REJESTRACJA SLASH COMMANDS (jednorazowo):
echo    node registerCommands.js
echo.
echo 2. URUCHOMIENIE BOTA:
echo    npm start
echo    LUB
echo    node index.js
echo.
echo 3. WERYFIKACJA:
echo    Bot powinien wyświetlić: "Zalogowano jako [nazwa bota]"
echo    Discord pokaże bota jako ONLINE
echo.
echo =========================================
echo   Bot gotowy! 155 komend czeka na Ciebie!
echo =========================================
echo.

pause
