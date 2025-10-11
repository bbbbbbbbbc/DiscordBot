# Wielofunkcyjny Bot Discord

## Przegląd projektu
Bot Discord napisany w Node.js z wieloma funkcjonalnościami:
- Moderacja (ban, kick, clear)
- 13+ gier multiplayer
- Integracja AI (OpenAI)
- Pobieranie filmów/muzyki z YouTube na Google Drive
- Powiadomienia o nowych filmach YouTube
- Komendy użytkowe

## Ostatnie zmiany
- 2025-10-11: Utworzenie pełnego bota Discord z wszystkimi funkcjami
- Dodano 13+ gier interaktywnych
- Zaimplementowano pobieranie z YouTube i upload do Google Drive
- Dodano system powiadomień YouTube
- Skonfigurowano integracje Discord i Google Drive

## Struktura projektu
```
.
├── index.js                 # Główny plik bota
├── commands/
│   ├── moderation/         # Komendy moderacyjne
│   ├── games/              # 13+ gier
│   ├── utility/            # Komendy użytkowe
│   ├── ai/                 # Komendy AI
│   └── youtube/            # YouTube download & notify
├── utils/
│   └── googleDrive.js      # Google Drive integration
└── downloads/              # Tymczasowe pliki (gitignore)
```

## Integracje
- Discord (connector) - połączony
- Google Drive (connector) - połączony
- OpenAI API - wymaga klucza API

## Konfiguracja
### Wymagane zmienne środowiskowe:
- `DISCORD_BOT_TOKEN` - Token bota Discord (WYMAGANE)
- `OPENAI_API_KEY` - Klucz OpenAI (opcjonalnie, dla AI)

### Google Drive
Automatycznie skonfigurowane przez Replit connector.

## Uruchomienie
Bot uruchamia się przez workflow: `node index.js`

## Funkcje
1. **Moderacja**: ban, kick, clear messages
2. **Gry**: guess, dice, rps, tictactoe, hangman, trivia, blackjack, roulette, emoji, typerace, math, geography, wordchain
3. **AI**: chat z OpenAI GPT-3.5
4. **YouTube**: pobieranie i upload do Drive, powiadomienia
5. **Utility**: ping, serverinfo, avatar, userinfo, help
