# Mega Bot Discord

## Overview
Mega Bot Discord is a powerful Node.js Discord bot designed to provide a comprehensive suite of features across 12 categories, totaling 158 commands. Its purpose is to enhance Discord server functionality through moderation, engaging games, economic systems, entertainment, utility, AI capabilities, social interactions, music playback, leveling systems, and YouTube integrations. The project aims to deliver a stable, reliable, and feature-rich bot experience for a wide range of Discord communities.

## User Preferences
- Język: Polski
- Wszystkie odpowiedzi i komunikaty w języku polskim

## System Architecture
The bot is built on Node.js and utilizes modern Discord.js slash commands for enhanced user interaction and discoverability. It supports User App installations, allowing most commands to function in Direct Messages. Architectural decisions include dynamic command categorization, robust error handling, and a modular command structure (categorized in `commands/`). Data persistence for economy, leveling, and user statistics is managed through JSON files in the `data/` directory. Economy settings are stored per-guild in `data/economySettings.json`, allowing server owners to customize earning rates and bank limits (1-10,000 range). Temporary download files are stored in `downloads/`. The music system leverages `play-dl` and `youtube-dl-exec` with `ffmpeg` for media processing, including advanced features like playlist support (YouTube, Spotify with official SDK and full pagination), automatic queue management, sequential playback, persistent voice connection (bot stays until manual `/wyjdz` or `/stop`), and file upload options (Google Drive, Discord attachment). Spotify integration uses official `@spotify/web-api-ts-sdk` with Replit's connector for secure credential management. AI functionalities require an OpenAI API key. The bot is designed for per-server command registration to overcome Discord's 100-command global limit, ensuring all 158 commands are available. Installation scripts (`install.sh`, `install.bat`) are provided for easy setup on various operating systems.

### Command Registration Solution (158 Commands)
**Problem:** Discord returns `BASE_TYPE_MAX_LENGTH` error when attempting to register all 158 commands at once via single PUT request.

**Root Cause:** Discord has an undocumented limit on bulk command registration. While individual command validation passes, registering >100-150 commands simultaneously triggers cumulative payload validation errors.

**Solution:** Hybrid registration approach implemented in `registerCommands.js`:
1. **PUT** first 78 commands (bulk registration, replaces all existing)
2. **POST** remaining 80 commands individually (adds without replacing)
3. **Retry Logic**: 3 attempts with exponential backoff (1s, 2s, 4s) for Discord API timeouts
4. Result: All 158 commands successfully registered

**Usage:**
```bash
node registerCommands.js
```

**Important Notes:**
- Requires `GUILD_ID` environment variable to be set for hybrid registration
- Script may take 2-4 minutes to complete due to rate limiting
- If Discord API is experiencing issues, retry after a few minutes
- Check final report for any failed commands

**Technical Details:**
- PUT method: Bulk overwrites all guild commands (fast, but limited to ~78-100 commands)
- POST method: Creates/updates individual commands (slower, but no limit)
- Hybrid approach combines speed of PUT with reliability of POST
- Includes rate limiting (300ms delay between POST requests) to avoid API throttling
- Retry logic handles temporary Discord API timeouts gracefully
- Detailed progress tracking and final report show successful/failed commands
- Automatic verification confirms all 158 commands are registered

### UI/UX Decisions
- All commands are implemented as Discord slash commands (`/`) for a modern and intuitive user experience.
- Dynamic categorization and pagination for the `/help` command ensure easy navigation through the extensive command list.
- Detailed status messages provide clear feedback during processes like media downloads and uploads.

### Technical Implementations
- **Command Handling:** Utilizes Discord.js slash commands with a modular command structure.
- **Media Processing:** Integrates `youtube-dl-exec` and `ffmpeg` for robust YouTube and Spotify media downloading, conversion (MP3/MP4), and quality selection.
- **Data Storage:** JSON files are used for persistent storage of economy, leveling, and user statistics.
- **API Integrations:** Supports OpenAI API for AI commands and Google Drive API for file uploads.
- **Concurrency/Asynchronous Operations:** Node.js non-blocking I/O model for handling multiple user requests efficiently.
- **Error Handling:** Comprehensive error handling mechanisms prevent bot crashes and provide informative user feedback.

### Feature Specifications
- **Moderation:** Ban, kick, mute, warn, slowmode, automod, word filter, announcements (with custom embeds, colors, auto @everyone/here based on time using correct allowedMentions).
- **Games:** 15 diverse games including gambling, multiplayer, and trivia.
- **Economy:** Virtual currency, daily rewards, work, shop, inventory, leaderboard. Customizable earning rates and bank limits per server (1-10,000 range, owner-only `/ekonomia-ustawienia` command).
- **Leveling:** XP gain per message, rank display, level leaderboard.
- **Music:** 9 commands - play, stop, skip, queue, pause, resume, volume, wyjdz (manual disconnect). Full playlist support (YouTube, Spotify via official SDK) with automatic queueing, sequential playback, and persistent voice connection (bot stays until manual `/wyjdz` or `/stop`, auto-resumes when adding songs to idle queue).
- **Reminders & Timers:** User-definable reminders and countdown timers.
- **Polls & Voting:** Create polls and quick yes/no votes.
- **Entertainment:** Memes, animal pictures, jokes.
- **Statistics:** Server, user, and activity stats.
- **Utility:** Ping, server/user info, avatar, help.
- **AI:** Chat with AI, generate game maps, Minecraft plugins.
- **YouTube Integration:** Download videos/audio to Google Drive/Discord, YouTube notifications.
- **Automated Features:** XP gain, level-up announcements, automoderation, anti-spam, activity tracking.

## External Dependencies
- **Discord:** Core platform for bot operation, utilizing Discord.js library.
- **Google Drive API:** For uploading downloaded media files.
- **OpenAI API:** (Optional) Powers AI-driven commands like chat, map generation, and plugin generation.
- **`youtube-dl-exec`:** External tool for downloading media from YouTube and other platforms.
- **`ffmpeg`:** System dependency required for audio/video conversion (e.g., MP4 to MP3).
- **`play-dl`:** Node.js package for playing media streams, used in the music system.
- **`@spotify/web-api-ts-sdk`:** Official Spotify Web API SDK for TypeScript/JavaScript, used for playlist and track metadata retrieval.

## Recent Changes

### v2.7.0 - Music System Persistent Connection & Spotify SDK (Nov 13, 2025)
- **Music Persistent Voice Connection**: Bot now stays in voice channel when queue empties, only disconnects on manual `/wyjdz` or `/stop` command
- **Auto-Resume Playback**: When adding songs to empty idle queue, playback automatically resumes without manual intervention
- **New Command `/wyjdz`**: Manual disconnect command (158 commands total, was 157)
- **Spotify SDK Migration**: Replaced broken `spotify-url-info` with official `@spotify/web-api-ts-sdk` for reliable metadata retrieval
- **Spotify Playlist Fix**: Fixed pagination for playlists >50 tracks using SDK's `getPlaylistItems()` with offset/limit
- **Spotify Single Track Fix**: Fixed single track handling to properly extract track data from SDK response
- **Economy Bank Limit**: Added bank limit configuration to `/ekonomia-ustawienia` (1-10,000 range with validation)
- **Announcement Fix**: Corrected allowedMentions to `{ parse: ['everyone'] }` for both @everyone and @here mentions

### v2.6.0 - Economy Settings (Previous)
- Added `/ekonomia-ustawienia` command for server owners to customize work/daily earnings and bank limits per guild
- Economy settings stored in `data/economySettings.json` with per-guild configuration
- Updated work.js, daily.js, deposit.js to use customizable settings