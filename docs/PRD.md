# Product Requirements Document: LocalPlayer

## 1. Overview
LocalPlayer is a desktop application designed to provide a premium, Netflix-like viewing experience for locally stored video files. It scans user-specified directories, organizes media into a visually appealing layout (Movies and Series), and allows users to play videos seamlessly within the app.

## 2. Target Platform & Tech Stack
- **Platform:** Desktop Application (Windows, macOS, Linux)
- **Recommended Stack:** Electron or Tauri with Web Technologies (React, HTML, CSS, JS). (This provides the flexibility to create a stunning, dynamic UI similar to Netflix).

## 3. Core Features

### 3.1 Media Library & Scanning
- **Custom Root Directories:** Users can specify one or more root directories in the app's settings. The app will recursively scan these directories for supported video files.
- **Library Organization:** The app categorizes discovered videos into Movies and Series, displaying them in a grid or horizontal scrolling list.
- **Manual Metadata Fetching:** Metadata (posters, descriptions, titles) is not fetched automatically. Instead, users have a manual "Fetch/Update Metadata" button to pull information for their entire collection on demand (e.g., via the TMDB API). 

### 3.2 Video Playback
- **In-App Player:** High-performance video playback directly within the application.
- **Subtitle Support:** Comprehensive subtitle support, including:
  - External subtitle files (e.g., `.srt`, `.vtt`) placed alongside the video file.
  - Embedded subtitles within video containers (e.g., `.mkv`, `.mp4`).

### 3.3 Progress Tracking & "Continue Watching"
- **Automatic Resume:** The app automatically saves the precise playback position (hour, minute, second) when a user stops watching.
- **Series Tracking:** For TV series, it tracks the last watched Season and Episode, along with the timestamp.
- **Continue Watching Section:** A prominent section on the home screen displaying recently watched media. Users can click a card to instantly resume playback from their exact last saved position.
- **Manual Marking:** Users can select a list of episodes or movies and manually update their watch status (e.g., mark as watched or set a specific progress mark).

### 3.4 User Profile
- **Single User Profile:** The application operates under a single user profile for simplicity in V1. All watch history, progress, and settings are tied to this global profile.

## 4. User Interface & Aesthetics
- **Design Philosophy:** Premium, state-of-the-art UI with a sleek dark mode.
- **Interactions:** Dynamic design with smooth micro-animations, hover effects on media cards, and modern typography to encourage user engagement.
- **Layout:** Netflix-style horizontal rows for categories like "Continue Watching", "Recently Added", "Movies", and "Series".

## 5. Future Considerations (V2+)
- Support for multiple user profiles with separate watch histories.
- Automatic folder monitoring for new media.
- Local network streaming to other devices.
