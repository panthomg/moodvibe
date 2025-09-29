# MoodVibe - Privacy-First Mood & Wellness Tracker

A comprehensive, client-side mood and wellness tracking application designed with privacy as its foremost principle. All data is stored directly in your browser - no servers, no tracking, just you and your data.

![MoodVibe](https://img.shields.io/badge/Version-0.0.21-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Privacy-First](https://img.shields.io/badge/Privacy-First-green.svg)

## 🌟 Features

### Core Functionality
- **Customizable Mood Logging** - Log your mood, intensity, notes, and tags with a fully configurable mood palette
- **Structured Context** - Enrich entries with tags for people, places, and activities
- **Wellness Tracking** - Set and track goals, log measurable metrics (sleep, water intake, etc.)
- **Data Visualization** - Interactive charts showing mood trends, distribution, and activity correlations
- **Global Search** - Unified search across all your entries

### Privacy & Security
- **100% Client-Side** - All data stays on your device
- **Optional App Lock** - Password protection for your journal
- **Private Notes** - Separate password protection for sensitive notes
- **Data Portability** - Full export capabilities for backup and analysis

### Advanced Features
- **AI-Powered Insights** - Optional AI suggestions and trend summaries via OpenRouter API
- **Gamification** - Streak tracking and unlockable achievements
- **Multiple Themes** - Light, Dark, Solarized, Forest, and more
- **Reminder System** - Customizable mood logging reminders
- **PDF Reports** - Generate printable reports of your data

## 🚀 Technology Stack

- **Frontend**: React 18 with Hooks
- **Styling**: CSS3 with Custom Properties (Variables)
- **Charts**: Chart.js for data visualization
- **Storage**: Browser localStorage (client-side only)
- **PDF Generation**: jsPDF + html2canvas
- **AI Integration**: OpenRouter.ai API (optional)
- **Build**: Zero-build setup with in-browser Babel transpilation

## 🏗️ Architecture

MoodVibe follows a **privacy-first, client-side only** architecture:

- **Single-Page Application** - Fast, app-like experience
- **Component-Based Design** - Modular, reusable React components
- **Declarative State Management** - React hooks (useState, useEffect, useMemo)
- **Local Data Persistence** - All data stored in browser's localStorage

## 📁 Project Structure
