#!/bin/bash

echo "========================================="
echo "  MEGA BOT DISCORD - Instalator v2.0"
echo "  155 komend | Automatyczna instalacja"
echo "========================================="
echo ""

# Kolory dla lepszej czytelności
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funkcja sprawdzająca czy komenda istnieje
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# KROK 1: Sprawdzenie Node.js
echo "=== KROK 1/6: Sprawdzanie Node.js ==="
if command_exists node; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js zainstalowane: $NODE_VERSION"
    
    # Sprawdzenie wersji (potrzebne minimum v16)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -lt 16 ]; then
        echo -e "${RED}✗${NC} Wymagane Node.js v16 lub nowsze (masz v$NODE_MAJOR)"
        echo "   Zaktualizuj Node.js: https://nodejs.org/"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} Node.js nie jest zainstalowane!"
    echo "   Zainstaluj Node.js: https://nodejs.org/"
    exit 1
fi

# KROK 2: Sprawdzenie npm
echo ""
echo "=== KROK 2/6: Sprawdzanie npm ==="
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm zainstalowane: v$NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm nie jest zainstalowane!"
    exit 1
fi

# KROK 3: Sprawdzenie package.json
echo ""
echo "=== KROK 3/6: Sprawdzanie plików projektu ==="
if [ ! -f "package.json" ]; then
    echo -e "${RED}✗${NC} Brak pliku package.json!"
    echo "   Upewnij się że jesteś w katalogu projektu."
    exit 1
fi
echo -e "${GREEN}✓${NC} package.json znaleziony"

if [ ! -f "index.js" ]; then
    echo -e "${RED}✗${NC} Brak pliku index.js!"
    exit 1
fi
echo -e "${GREEN}✓${NC} index.js znaleziony"

if [ ! -d "commands" ]; then
    echo -e "${RED}✗${NC} Brak folderu commands/!"
    exit 1
fi
echo -e "${GREEN}✓${NC} Folder commands/ znaleziony"

# KROK 4: Czyszczenie starych pakietów
echo ""
echo "=== KROK 4/6: Czyszczenie starych pakietów ==="
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}⚠${NC} Usuwam stary folder node_modules..."
    rm -rf node_modules
    echo -e "${GREEN}✓${NC} node_modules usunięty"
fi

if [ -f "package-lock.json" ]; then
    echo -e "${YELLOW}⚠${NC} Usuwam stary package-lock.json..."
    rm -f package-lock.json
    echo -e "${GREEN}✓${NC} package-lock.json usunięty"
fi

# KROK 5: Instalacja pakietów npm
echo ""
echo "=== KROK 5/6: Instalacja pakietów npm ==="
echo "To może potrwać 2-5 minut..."
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓${NC} Wszystkie pakiety zainstalowane pomyślnie!"
else
    echo ""
    echo -e "${RED}✗${NC} Błąd podczas instalacji pakietów!"
    echo "   Sprawdź logi powyżej aby zobaczyć problem."
    exit 1
fi

# KROK 6: Sprawdzenie zmiennych środowiskowych
echo ""
echo "=== KROK 6/6: Sprawdzanie zmiennych środowiskowych ==="

MISSING_VARS=0

if [ -z "$DISCORD_BOT_TOKEN" ]; then
    echo -e "${RED}✗${NC} Brak zmiennej: DISCORD_BOT_TOKEN"
    MISSING_VARS=1
else
    echo -e "${GREEN}✓${NC} DISCORD_BOT_TOKEN ustawiony"
fi

if [ -z "$CLIENT_ID" ]; then
    echo -e "${RED}✗${NC} Brak zmiennej: CLIENT_ID"
    MISSING_VARS=1
else
    echo -e "${GREEN}✓${NC} CLIENT_ID ustawiony"
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}⚠${NC} Brak zmiennej: OPENAI_API_KEY (opcjonalne - dla komend AI)"
else
    echo -e "${GREEN}✓${NC} OPENAI_API_KEY ustawiony"
fi

# KROK 7: Sprawdzenie ffmpeg (opcjonalne)
echo ""
echo "=== BONUS: Sprawdzanie ffmpeg (dla YouTube/muzyki) ==="
if command_exists ffmpeg; then
    FFMPEG_VERSION=$(ffmpeg -version | head -n1)
    echo -e "${GREEN}✓${NC} ffmpeg zainstalowane: $FFMPEG_VERSION"
else
    echo -e "${YELLOW}⚠${NC} ffmpeg nie jest zainstalowane (komendy /play i /download mogą nie działać)"
    echo "   Instalacja (Ubuntu/Debian): sudo apt install ffmpeg"
    echo "   Instalacja (CentOS/RHEL): sudo yum install ffmpeg"
fi

# Tworzenie folderu downloads jeśli nie istnieje
if [ ! -d "downloads" ]; then
    mkdir -p downloads
    echo -e "${GREEN}✓${NC} Utworzono folder downloads/"
fi

# Tworzenie folderu data jeśli nie istnieje
if [ ! -d "data" ]; then
    mkdir -p data
    echo "{}" > data/economy.json
    echo "{}" > data/levels.json
    echo "{}" > data/stats.json
    echo "[]" > data/tempbans.json
    echo -e "${GREEN}✓${NC} Utworzono folder data/ z plikami JSON"
fi

# Podsumowanie
echo ""
echo "========================================="
echo "          PODSUMOWANIE INSTALACJI"
echo "========================================="
echo ""

if [ $MISSING_VARS -eq 1 ]; then
    echo -e "${YELLOW}⚠ UWAGA:${NC} Brakujące zmienne środowiskowe!"
    echo ""
    echo "Ustaw je w panelu hostingu (Environment Variables):"
    echo "  - DISCORD_BOT_TOKEN"
    echo "  - CLIENT_ID"
    echo "  - OPENAI_API_KEY (opcjonalnie)"
    echo ""
fi

echo -e "${GREEN}✓ INSTALACJA ZAKOŃCZONA POMYŚLNIE!${NC}"
echo ""
echo "========================================="
echo "         JAK URUCHOMIĆ BOTA?"
echo "========================================="
echo ""
echo "1. REJESTRACJA SLASH COMMANDS (jednorazowo):"
echo "   node registerCommands.js"
echo ""
echo "2. URUCHOMIENIE BOTA:"
echo "   npm start"
echo "   LUB"
echo "   node index.js"
echo ""
echo "3. WERYFIKACJA:"
echo "   Bot powinien wyświetlić: 'Zalogowano jako [nazwa bota]'"
echo "   Discord pokaże bota jako ONLINE"
echo ""
echo "========================================="
echo "  Bot gotowy! 155 komend czeka na Ciebie!"
echo "========================================="
echo ""
