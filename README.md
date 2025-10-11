# 🤖 Wielofunkcyjny Bot Discord

Bot Discord z wieloma funkcjonalnościami: moderacja, gry, AI, pobieranie z YouTube i więcej!

## 🚀 Funkcje

### 🛡️ Moderacja
- `!ban` - Banowanie użytkowników
- `!kick` - Wyrzucanie użytkowników  
- `!clear` - Usuwanie wiadomości

### 🎮 Gry (15+ gier!)
- `!guess` - Zgadywanka liczb
- `!dice` - Rzut kostką
- `!rps` - Kamień, papier, nożyce
- `!tictactoe` - Kółko i krzyżyk
- `!hangman` - Wisielec
- `!trivia` - Quiz wiedzy
- `!blackjack` - Blackjack
- `!roulette` - Rosyjska ruletka
- `!emoji` - Zgadnij emoji
- `!typerace` - Wyścig pisania
- `!math` - Quiz matematyczny
- `!geography` - Quiz geograficzny
- `!wordchain` - Łańcuch słów

### 📊 Komendy Użytkowe
- `!ping` - Sprawdź opóźnienie bota
- `!serverinfo` - Informacje o serwerze
- `!avatar` - Pokaż avatar użytkownika
- `!userinfo` - Informacje o użytkowniku

### 🤖 AI (OpenAI)
- `!chat` - Rozmawiaj z AI
- `!ask` - Zadaj pytanie AI

### 📺 YouTube
- `!download [link]` - Pobierz film/muzykę z YouTube i prześlij na Google Drive
- `!ytnotify [ID kanału]` - Powiadomienia o nowych filmach

## ⚙️ Konfiguracja

### 1. Utwórz bota Discord
1. Wejdź na https://discord.com/developers/applications
2. Kliknij "New Application"
3. Przejdź do zakładki "Bot"
4. Kliknij "Add Bot"
5. Skopiuj token bota

### 2. Ustaw zmienne środowiskowe w Replit Secrets
- `DISCORD_BOT_TOKEN` - Token bota Discord
- `OPENAI_API_KEY` - Klucz API OpenAI (opcjonalny, dla funkcji AI)

### 3. Zaproś bota na serwer
Użyj tego linku (zamień CLIENT_ID na ID aplikacji):
```
https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8&scope=bot
```

### 4. Uruchom bota
Bot uruchomi się automatycznie w Replit!

## 📝 Uwagi

- Integracja z Google Drive jest skonfigurowana automatycznie przez Replit
- Pobieranie z YouTube działa tylko dla legalnych treści
- Funkcje AI wymagają klucza OpenAI API

## 🛠️ Technologie
- Node.js
- Discord.js
- OpenAI API
- Google Drive API
- ytdl-core
