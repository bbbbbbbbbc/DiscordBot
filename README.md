# 🤖 Wielofunkcyjny Bot Discord

Zaawansowany bot Discord z 58 komendami w 13 kategoriach!

## 🚀 Wszystkie Funkcje (58 Komend)

### 🛡️ Moderacja (5 komend)
- `!ban @użytkownik [powód]` - Banuje użytkownika
- `!kick @użytkownik [powód]` - Wyrzuca użytkownika
- `!clear [liczba]` - Usuwa wiadomości (1-100)
- `!automod [on/off]` - Włącz/wyłącz automatyczną moderację
- `!filter [add/remove/list] [słowo]` - Zarządzaj filtrem słów

### 🎮 Gry (15 komend)
- `!guess` - Zgadywanka liczb (1-100)
- `!dice [ściany]` - Rzut kostką
- `!rps [kamień/papier/nożyce]` - Kamień, papier, nożyce
- `!tictactoe @przeciwnik` - Kółko i krzyżyk
- `!hangman` - Wisielec
- `!trivia` - Quiz wiedzy ogólnej
- `!blackjack` - Gra w blackjacka
- `!roulette` - Rosyjska ruletka
- `!emoji` - Zgadnij co oznacza emoji
- `!typerace` - Wyścig pisania
- `!math` - Quiz matematyczny
- `!geography` - Quiz geograficzny
- `!wordchain` - Łańcuch słów
- `!memory` - Gra memory z emoji
- `!imagequiz` - Quiz rozpoznawania obrazków

### 💰 Ekonomia (8 komend)
- `!balance [@użytkownik]` - Sprawdź saldo portfela i banku
- `!daily` - Odbierz codzienną nagrodę (24h cooldown)
- `!work` - Pracuj aby zarobić pieniądze
- `!shop` - Wyświetl sklep z przedmiotami
- `!buy [nazwa]` - Kup przedmiot ze sklepu
- `!inventory [@użytkownik]` - Zobacz ekwipunek
- `!pay @użytkownik [kwota]` - Przekaż pieniądze innemu użytkownikowi
- `!leaderboard` - Ranking najbogatszych użytkowników

### ⭐ System Poziomów (3 komendy)
- `!rank [@użytkownik]` - Zobacz poziom, XP i pasek postępu
- `!levels` - Ranking poziomów
- `!setxp @użytkownik [xp]` - (Admin) Ustaw XP użytkownika

**Automatyczny system XP:** Użytkownicy dostają 15-25 XP za każdą wiadomość!

### 🎵 Muzyka (7 komend)
- `!play [link/zapytanie]` - Odtwórz muzykę z YouTube
- `!stop` - Zatrzymaj muzykę i opuść kanał głosowy
- `!skip` - Pomiń aktualny utwór
- `!queue` - Pokaż kolejkę utworów
- `!pause` - Wstrzymaj odtwarzanie
- `!resume` - Wznów odtwarzanie
- `!volume [1-100]` - Ustaw głośność

### ⏰ Przypomnienia (3 komendy)
- `!remind [czas] [wiadomość]` - Ustaw przypomnienie (np. 10m, 2h, 1d)
- `!timer [czas]` - Timer odliczający z aktualizacją co sekundę
- `!reminders` - Lista aktywnych przypomnień

### 📊 Ankiety (2 komendy)
- `!poll [pytanie] | [opcja1] | [opcja2] ...` - Stwórz ankietę (max 10 opcji)
- `!vote [pytanie]` - Szybkie głosowanie TAK/NIE

### 😂 Rozrywka (4 komendy)
- `!meme` - Losowy mem z Reddit
- `!cat` - Losowe zdjęcie kota
- `!dog` - Losowe zdjęcie psa
- `!joke` - Losowy żart

### 📈 Statystyki (3 komendy)
- `!serverstats` - Statystyki serwera (członkowie, kanały, role)
- `!userstats [@użytkownik]` - Statystyki użytkownika (wiadomości, komendy)
- `!activity` - Wykres aktywności (top 10 użytkowników)

### 📊 Użytkowe (5 komend)
- `!ping` - Sprawdź opóźnienie bota
- `!serverinfo` - Szczegółowe informacje o serwerze
- `!avatar [@użytkownik]` - Pokaż avatar użytkownika
- `!userinfo [@użytkownik]` - Informacje o użytkowniku
- `!help` - Lista wszystkich komend

### 🤖 AI (1 komenda)
- `!chat [pytanie]` / `!ask [pytanie]` - Rozmawiaj z AI (wymaga OpenAI API)

### 📺 YouTube (2 komendy)
- `!download [link]` - Pobierz film/muzykę z YouTube i prześlij na Google Drive
- `!ytnotify [ID kanału]` - Ustaw powiadomienia o nowych filmach

## 🔥 Automatyczne Funkcje

### System XP i Poziomów
- Automatyczne przyznawanie **15-25 XP** za każdą wiadomość
- Powiadomienia o awansie na wyższy poziom
- Rankingi i śledzenie postępów

### Automatyczna Moderacja
- **Filtr wulgaryzmów** - automatyczne usuwanie wiadomości z niepożądanymi słowami
- **Anty-spam** - blokowanie użytkowników wysyłających >5 wiadomości w 5 sekund
- Konfigurowalny słownik filtrowanych słów

### Śledzenie Statystyk
- Automatyczne śledzenie liczby wiadomości
- Licznik użytych komend
- Wykresy aktywności użytkowników

## ⚙️ Instalacja i Konfiguracja

### 1. Wymagania
- Node.js 20+
- Konto Discord Developer
- (Opcjonalnie) Klucz API OpenAI dla funkcji AI

### 2. Utwórz Bota Discord

1. Wejdź na https://discord.com/developers/applications
2. Kliknij "New Application" i nadaj nazwę
3. Przejdź do zakładki "Bot"
4. Kliknij "Add Bot" i potwierdź
5. **WAŻNE:** Włącz w "Privileged Gateway Intents":
   - ✅ MESSAGE CONTENT INTENT
   - ✅ SERVER MEMBERS INTENT
6. Skopiuj token bota

### 3. Zaproś Bota na Serwer

1. Przejdź do OAuth2 → URL Generator
2. Zaznacz Scopes: `bot`
3. Zaznacz Bot Permissions: `Administrator` (lub wybrane)
4. Skopiuj wygenerowany link i otwórz w przeglądarce
5. Wybierz serwer i autoryzuj

### 4. Ustaw Zmienne Środowiskowe

W Replit Secrets dodaj:
```
DISCORD_BOT_TOKEN=twój_token_discord
OPENAI_API_KEY=twój_klucz_openai (opcjonalnie)
```

### 5. Uruchom Bota

W Replit bot uruchomi się automatycznie!

## 📁 Struktura Projektu

```
.
├── index.js                 # Główny plik bota
├── commands/
│   ├── moderation/         # 5 komend moderacyjnych
│   ├── games/              # 15 gier
│   ├── economy/            # 8 komend ekonomicznych
│   ├── leveling/           # 3 komendy poziomów
│   ├── music/              # 7 komend muzycznych
│   ├── reminders/          # 3 komendy przypomnień
│   ├── polls/              # 2 komendy ankiet
│   ├── fun/                # 4 komendy rozrywkowe
│   ├── stats/              # 3 komendy statystyk
│   ├── utility/            # 5 komend użytkowych
│   ├── ai/                 # 1 komenda AI
│   └── youtube/            # 2 komendy YouTube
├── utils/
│   └── googleDrive.js      # Integracja Google Drive
├── data/
│   ├── economy.json        # Dane ekonomii użytkowników
│   ├── levels.json         # Poziomy i XP
│   ├── stats.json          # Statystyki
│   ├── automod.json        # Ustawienia automod
│   └── filter.json         # Filtr słów
└── downloads/              # Tymczasowe pliki

```

## 🛠️ Technologie

- **Discord.js v14** - Framework Discord
- **@discordjs/voice** - Odtwarzanie muzyki
- **play-dl** - Pobieranie muzyki z YouTube
- **OpenAI** - Integracja AI
- **Google Drive API** - Upload plików
- **ytdl-core** - Pobieranie z YouTube
- **Axios** - HTTP requests
- **Canvas** - Generowanie grafik

## 📝 Przykłady Użycia

### Gry Multiplayer
```
!tictactoe @przyjaciel     # Zagraj w kółko i krzyżyk
!blackjack                 # Zagraj w blackjacka
!memory                    # Gra memory
```

### System Ekonomii
```
!daily                     # Odbierz codzienną nagrodę
!work                      # Pracuj aby zarobić
!shop                      # Zobacz sklep
!buy Pizza                 # Kup pizzę
!pay @przyjaciel 100       # Daj 100 monet
```

### Muzyka
```
!play Despacito            # Odtwórz muzykę
!queue                     # Zobacz kolejkę
!volume 50                 # Ustaw głośność na 50%
```

### Moderacja
```
!automod on                # Włącz automoderację
!filter add słowo          # Dodaj słowo do filtra
!ban @użytkownik spam      # Zbanuj za spam
```

## 🎯 Funkcje Premium

- ✅ 58 komend w 13 kategoriach
- ✅ System ekonomii z wirtualną walutą
- ✅ Automatyczne poziomy i XP
- ✅ Odtwarzacz muzyki z YouTube
- ✅ Automatyczna moderacja
- ✅ Pobieranie z YouTube na Drive
- ✅ Integracja AI
- ✅ Statystyki i rankingi

## 📄 Licencja

Ten bot został stworzony na Replit dla celów edukacyjnych i rozrywkowych.

## 🆘 Wsparcie

Jeśli masz pytania lub problemy:
1. Sprawdź czy wszystkie Intents są włączone w Discord Developer Portal
2. Upewnij się że token bota jest poprawny
3. Sprawdź logi bota w konsoli Replit

---

**Bot gotowy do użycia! Wpisz `!help` na serwerze Discord aby rozpocząć zabawę! 🎉**
