# Wielofunkcyjny Bot Discord

## Przegląd projektu
Zaawansowany bot Discord napisany w Node.js z szerokim zakresem funkcjonalności:
- Moderacja (ban, kick, clear, automoderacja, filtr słów)
- 15 gier multiplayer
- System ekonomii (waluta, sklep, rankingi)
- System poziomów/XP (automatyczne nagrody za aktywność)
- Odtwarzacz muzyki (YouTube w kanale głosowym)
- Przypomnienia i timery
- Ankiety i głosowania
- Zabawne komendy (memy, zdjęcia zwierząt, żarty)
- Integracja AI (OpenAI)
- Pobieranie filmów/muzyki z YouTube na Google Drive
- Powiadomienia o nowych filmach YouTube
- Statystyki serwera i użytkowników
- Komendy użytkowe

## Ostatnie zmiany
- 2025-10-11: Utworzenie pełnego bota Discord z podstawowymi funkcjami (24 komendy)
- 2025-10-11: Rozszerzenie bota o zaawansowane funkcje (58 komend):
  - Dodano system ekonomii z wirtualną walutą
  - Zaimplementowano system poziomów/XP
  - Dodano odtwarzacz muzyki z YouTube
  - Dodano przypomnienia i timery
  - Dodano ankiety i głosowania
  - Dodano zabawne komendy z obrazkami
  - Zaimplementowano automatyczną moderację (filtr wulgaryzmów, anty-spam)
  - Dodano system statystyk użytkowników i serwera

## Struktura projektu
```
.
├── index.js                 # Główny plik bota z integracjami
├── commands/
│   ├── moderation/         # Moderacja (5 komend)
│   ├── games/              # 15 gier
│   ├── economy/            # System ekonomii (8 komend)
│   ├── leveling/           # System poziomów (3 komendy)
│   ├── music/              # Odtwarzacz muzyki (7 komend)
│   ├── reminders/          # Przypomnienia (3 komendy)
│   ├── polls/              # Ankiety (2 komendy)
│   ├── fun/                # Rozrywka (4 komendy)
│   ├── stats/              # Statystyki (3 komendy)
│   ├── utility/            # Komendy użytkowe (5 komend)
│   ├── ai/                 # Komendy AI (1 komenda)
│   └── youtube/            # YouTube (2 komendy)
├── utils/
│   └── googleDrive.js      # Google Drive integration
├── data/
│   ├── economy.json        # Dane ekonomiczne użytkowników
│   ├── levels.json         # Poziomy i XP użytkowników
│   └── stats.json          # Statystyki użytkowników
└── downloads/              # Tymczasowe pliki (gitignore)
```

## Integracje
- Discord (connector) - połączony
- Google Drive (connector) - połączony
- OpenAI API - wymaga klucza API (opcjonalnie)

## Konfiguracja
### Wymagane zmienne środowiskowe:
- `DISCORD_BOT_TOKEN` - Token bota Discord (WYMAGANE) ✅
- `OPENAI_API_KEY` - Klucz OpenAI (opcjonalnie, dla AI)
- `YOUTUBE_API_KEY` - Klucz YouTube Data API (opcjonalnie, dla powiadomień)

### Google Drive
Automatycznie skonfigurowane przez Replit connector ✅

### Discord Intents
Wymagane intenty:
- Guilds
- GuildMessages
- MessageContent
- GuildMembers

## Uruchomienie
Bot uruchamia się przez workflow: `node index.js`
Status: ✅ DZIAŁA (58 komend załadowanych)

## Wszystkie funkcje (58 komend)

### 🛡️ Moderacja (5 komend)
- `!ban` - Banuje użytkownika
- `!kick` - Wyrzuca użytkownika
- `!clear` - Usuwa wiadomości
- `!automod` - Włącz/wyłącz automoderację
- `!filter` - Zarządzaj filtrem słów

### 🎮 Gry (15 komend)
- `!guess` - Zgadywanka liczb
- `!dice` - Rzut kostką
- `!rps` - Kamień, papier, nożyce
- `!tictactoe` - Kółko i krzyżyk (2 graczy)
- `!hangman` - Wisielec
- `!trivia` - Quiz wiedzy
- `!blackjack` - Blackjack
- `!roulette` - Rosyjska ruletka
- `!emoji` - Zgadnij emoji
- `!typerace` - Wyścig pisania
- `!math` - Quiz matematyczny
- `!geography` - Quiz geograficzny
- `!wordchain` - Łańcuch słów
- `!memory` - Gra memory
- `!imagequiz` - Quiz obrazkowy

### 💰 Ekonomia (8 komend)
- `!balance` - Sprawdź saldo
- `!daily` - Dzienna nagroda
- `!work` - Pracuj aby zarobić
- `!shop` - Sklep z przedmiotami
- `!buy` - Kup przedmiot
- `!inventory` - Twój ekwipunek
- `!pay` - Przekaż pieniądze
- `!leaderboard` - Ranking najbogatszych

### ⭐ Poziomy (3 komendy)
- `!rank` - Twój poziom i XP
- `!levels` - Ranking poziomów
- `!setxp` - (Admin) Ustaw XP użytkownika

**System XP:** Użytkownicy automatycznie dostają 15-25 XP za każdą wiadomość

### 🎵 Muzyka (7 komend)
- `!play` - Odtwórz muzykę z YouTube
- `!stop` - Zatrzymaj muzykę
- `!skip` - Pomiń utwór
- `!queue` - Kolejka utworów
- `!pause` - Pauza
- `!resume` - Wznów odtwarzanie
- `!volume` - Ustaw głośność

### ⏰ Przypomnienia (3 komendy)
- `!remind` - Ustaw przypomnienie
- `!timer` - Timer odliczający
- `!reminders` - Lista przypomnień

### 📊 Ankiety (2 komendy)
- `!poll` - Stwórz ankietę
- `!vote` - Szybkie głosowanie tak/nie

### 😂 Rozrywka (4 komendy)
- `!meme` - Losowy mem
- `!cat` - Zdjęcie kota
- `!dog` - Zdjęcie psa
- `!joke` - Losowy żart

### 📈 Statystyki (3 komendy)
- `!serverstats` - Statystyki serwera
- `!userstats` - Statystyki użytkownika
- `!activity` - Wykres aktywności

### 📊 Użytkowe (5 komend)
- `!ping` - Opóźnienie bota
- `!serverinfo` - Info o serwerze
- `!avatar` - Avatar użytkownika
- `!userinfo` - Info o użytkowniku
- `!help` - Lista wszystkich komend

### 🤖 AI (1 komenda)
- `!chat` / `!ask` - Rozmawiaj z AI

### 📺 YouTube (2 komendy)
- `!download` - Pobierz film/muzykę i prześlij na Drive
- `!ytnotify` - Powiadomienia o nowych filmach

## Automatyczne funkcje
- **System XP:** Automatyczne przyznawanie 15-25 XP za wiadomość
- **Awanse:** Powiadomienia o awansie na wyższy poziom
- **Automoderacja:** Automatyczne usuwanie wulgaryzmów (gdy włączone)
- **Anty-spam:** Blokowanie użytkowników wysyłających >5 wiadomości w 5 sekund
- **Statystyki:** Automatyczne śledzenie wiadomości i komend

## Preferencje użytkownika
- Język: Polski
- Wszystkie odpowiedzi i komunikaty w języku polskim
