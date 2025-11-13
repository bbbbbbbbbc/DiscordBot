# Mega Bot Discord

## Overview
Mega Bot Discord is a powerful Node.js Discord bot designed to provide a comprehensive suite of features across 12 categories, totaling 156 commands. Its purpose is to enhance Discord server functionality through moderation, engaging games, economic systems, entertainment, utility, AI capabilities, social interactions, music playback, leveling systems, and YouTube integrations. The project aims to deliver a stable, reliable, and feature-rich bot experience for a wide range of Discord communities.

## User Preferences
- Język: Polski
- Wszystkie odpowiedzi i komunikaty w języku polskim

## System Architecture
The bot is built on Node.js and utilizes modern Discord.js slash commands for enhanced user interaction and discoverability. It supports User App installations, allowing most commands to function in Direct Messages. Architectural decisions include dynamic command categorization, robust error handling, and a modular command structure (categorized in `commands/`). Data persistence for economy, leveling, and user statistics is managed through JSON files in the `data/` directory. Temporary download files are stored in `downloads/`. The music system leverages `play-dl` and `youtube-dl-exec` with `ffmpeg` for media processing, including advanced features like playlist support (YouTube, Spotify with full pagination), automatic queue management, sequential playback, and file upload options (Google Drive, Discord attachment). Spotify integration uses Replit's connector for secure credential management. AI functionalities require an OpenAI API key. The bot is designed for per-server command registration to overcome Discord's 100-command global limit, ensuring all 156 commands are available. Installation scripts (`install.sh`, `install.bat`) are provided for easy setup on various operating systems.

### Command Registration Solution (156 Commands)
**Problem:** Discord returns `BASE_TYPE_MAX_LENGTH` error when attempting to register all 156 commands at once via single PUT request.

**Root Cause:** Discord has an undocumented limit on bulk command registration. While individual command validation passes, registering >100-150 commands simultaneously triggers cumulative payload validation errors.

**Solution:** Hybrid registration approach implemented in `registerCommands.js`:
1. **PUT** first 78 commands (bulk registration, replaces all existing)
2. **POST** remaining 78 commands individually (adds without replacing)
3. **Retry Logic**: 3 attempts with exponential backoff (1s, 2s, 4s) for Discord API timeouts
4. Result: All 156 commands successfully registered

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
- Automatic verification confirms all 156 commands are registered

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
- **Moderation:** Ban, kick, mute, warn, slowmode, automod, word filter, announcements (with custom embeds, colors, and mentions).
- **Games:** 15 diverse games including gambling, multiplayer, and trivia.
- **Economy:** Virtual currency, daily rewards, work, shop, inventory, leaderboard.
- **Leveling:** XP gain per message, rank display, level leaderboard.
- **Music:** Play, stop, skip, queue, pause, resume, volume control for YouTube and Spotify. Full playlist support (YouTube, Spotify) with automatic queueing and sequential playback.
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