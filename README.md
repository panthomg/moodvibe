# MoodVibe 🧘✨ - Your Personal Wellness Companion

![Version: 0.0.25.01](https://img.shields.io/badge/version-0.0.25.01-brightgreen.svg)
![Technology: React](https://img.shields.io/badge/Made%20with-React-61DAFB.svg)
![License: Proprietary](https://img.shields.io/badge/license-Proprietary-red.svg)

**MoodVibe is a comprehensive, privacy-first mood tracking Progressive Web App (PWA) designed to help you understand your emotional patterns, set wellness goals, and cultivate a greater sense of well-being. It's built as your personal, offline-first digital journal that you can optionally sync across devices in real-time.**

This repository serves as the official home for MoodVibe's public information, feature tracking, and user feedback.

[**➡️ View the Live Demo**](https://moodvibee.netlify.app/)

<p align="center">
  <!-- Replace this with a GIF or screenshot of the app in action -->
  <img src="https://via.placeholder.com/800x450.png?text=MoodVibe+App+Showcase" alt="MoodVibe App Showcase"/>
</p>

---

## Table of Contents

1.  [Why MoodVibe?](#-why-moodvibe)
2.  [🚀 What's New in This Version? (v0.0.25.01)](#-whats-new-in-this-version-v002501)
3.  [✨ Core Features In-Depth](#-core-features-in-depth)
    *   [Intelligent Journaling & Tracking](#intelligent-journaling--tracking)
    *   [Holistic Wellness Suite](#holistic-wellness-suite)
    *   [Data Insights & Visualization](#data-insights--visualization)
    *   [Privacy, Security & Personalization](#privacy-security--personalization)
    *   [Advanced Data Management](#advanced-data-management)
4.  [🧠 The Role of AI](#-the-role-of-ai)
5.  [🛠️ Architectural Deep Dive](#️-architectural-deep-dive)
    *   [Technology Stack](#technology-stack)
    *   [Offline-First Philosophy](#offline-first-philosophy)
    *   [Data Storage & Sync Model](#data-storage--sync-model)
6.  [💬 Feedback & Support](#-feedback--support)
7.  [📜 License & Copyright](#-license--copyright)
8.  [✍️ Authors](#️-authors)

---

## 🤔 Why MoodVibe?

In a world of data breaches and subscription fatigue, MoodVibe stands for user empowerment and privacy.

*   🔒 **Privacy First:** Your data is yours. It's stored on your device by default. Cloud sync is a strictly opt-in feature. We have no servers, no ads, and no access to your personal information.
*   🌐 **Offline & PWA:** Works flawlessly without an internet connection. You can "install" it to your home screen on any device for a native-app experience.
*   💰 **Free & Feature-Complete:** MoodVibe is free to use. All features are available to all users without subscriptions or advertisements.
*   🧩 **Infinitely Customizable:** From your personal mood palette to a powerful Theme Pack engine, make the app truly your own.

---

## 🚀 What's New in This Version? (v0.0.25.01)

This major update introduces a suite of features focused on data safety, user experience, and deeper insights.

*   ☁️ **Live Cloud Sync & Backup:** Sign in with your Google account to seamlessly sync your data in real-time across all your devices. Your data is protected with a version history, allowing you to view and restore from your last 10 cloud backups.
*   🗑️ **Recycle Bin:** Accidentally deleted an entry, goal, or measurable? No problem. The new Recycle Bin lets you restore any deleted item for up to 30 days.
*   🎙️ **Speech-to-Text Journaling:** Log your thoughts hands-free! Use the new voice dictation feature to speak your notes directly into your mood entries.
*   🎨 **Theme Pack Engine:** Go beyond simple themes. Import custom Theme Packs (`.json` files) to completely overhaul MoodVibe's appearance, colors, and even layout elements for ultimate personalization.
*   📅 **Year in Pixels:** Visualize your entire year at a glance with the new "Year in Pixels" report. See your dominant mood for each day and download the grid as a high-quality image.
*   🚀 **Smarter Universal Search:** The global search now includes a "Take Me There" button to instantly jump to any search result in its original context. It also keeps track of your recently viewed items.
*   💡 **Proactive AI Suggestions:** The app can now intelligently analyze your data in the background and offer proactive suggestions and goals on your dashboard.
*   📏 **New Measurables Layout:** Choose between the detailed dashboard view, a new compact grid view, or a simple list layout for your measurables.

---

## ✨ Core Features In-Depth

### Intelligent Journaling & Tracking
*   **Custom Mood Palette:** Define your emotional vocabulary. Add, edit, or remove moods with custom names, emojis, and colors.
*   **Encrypted Private Notes:** A separate, AES-encrypted space for your most sensitive thoughts, protected by a dedicated password.
*   **Rich Media & Formatting:** Attach photos (<1MB) to your entries and use Markdown formatting for headers, lists, bolding, and more.
*   **Tagging System:** Organize entries with tags and use the tag library to quickly find and reuse them.

### Holistic Wellness Suite
*   **Measurables:** Track any quantifiable activity, from sleep and exercise to caffeine intake and screen time. Supports values, timers (duration), ratings, and boolean (yes/no) check-ins.
*   **AI-Assisted Goal Wizard:** Set specific, actionable wellness goals with help from an AI-powered suggestion engine that considers your intentions and recent mood history.
*   **Event Calendar:** Log important one-time or recurring events to contextualize your mood entries and see patterns around key dates.

### Data Insights & Visualization
*   **Advanced Charts:** Dive deep into your data with interactive charts for mood distribution, intensity trends, and tag correlations.
*   **Correlation Scatter Plot:** Discover potential links between your mood intensity and your tracked measurables (e.g., "Does more sleep correlate with a better mood?").

### Privacy, Security & Personalization
*   **App Lock:** Secure the entire application with a master password for complete privacy.
*   **Full Data Ownership:** Your data is stored on-device in `LocalStorage`. You can export your entire dataset as a JSON backup at any time.
*   **Custom Themes & UI:** Choose from multiple built-in color themes, adjust the UI scale, and import custom Theme Packs for a unique look and feel.

### Advanced Data Management
*   **PDF & CSV Exports:** Generate beautifully formatted PDF reports for printing or sharing, or export raw data to CSV for analysis in other tools.
*   **Cloud Backup Management:** If you use cloud sync, you can view, download, or restore your data from any of the last 10 saved versions.

---

## 🧠 The Role of AI

MoodVibe integrates optional, on-demand AI features powered by the OpenRouter.ai API. These features require you to provide your own API key, ensuring you have full control over usage and costs.

*   **AI Trends Analysis:** Get a high-level summary of your mood patterns over the last 30 days.
*   **AI Chatbot ("Mood-Therapist"):** Have a supportive, empathetic conversation about your feelings. You can provide context from your "About Me" notes, goals, and events for a more personalized chat.
*   **AI Summaries:** Generate a quick summary for individual mood entries.

> **Privacy Note:** Using these features sends the relevant, anonymized entry data to the OpenRouter API for processing. Your API key is stored securely on your device and is never sent to us. **We advise against sharing highly sensitive personal information with the AI features.**

---

## 🛠️ Architectural Deep Dive

### Technology Stack
*   **Frontend Framework:** React 18 (using hooks and functional components, no build step)
*   **Data Visualization:** Chart.js
*   **Client-Side Storage:** Browser `LocalStorage`
*   **Cloud Sync & Auth (Optional):** Firebase (Firestore & Google Authentication)
*   **AI Integration:** OpenRouter.ai API
*   **PDF Generation:** jsPDF & html2canvas
*   **Encryption:** CryptoJS (AES for private notes)

### Offline-First Philosophy
MoodVibe is engineered to be a true Progressive Web App (PWA). Its core architecture is built around the `LocalStorage` API, meaning all data is stored directly in your browser. This design ensures that the app is:
*   **Always Available:** Fully functional even without an internet connection.
*   **Fast & Responsive:** Reading from local storage is instantaneous, providing a snappy user experience.
*   **Private by Default:** Your data never leaves your device unless you explicitly opt-in to cloud sync.

### Data Storage & Sync Model
MoodVibe uses a hybrid data storage model to prioritize privacy and flexibility.

1.  **LocalStorage (Primary):** All your data (moods, settings, goals, etc.) is saved directly in your browser's `LocalStorage`.

2.  **Firebase Firestore (Optional Sync Layer):** When a user signs in with Google, a sync process is initiated:
    *   **Real-Time Sync:** A debounced listener watches for changes in the application's state. When changes occur, the entire dataset is sent to a secure Firestore database linked to the user's unique ID.
    *   **Data Chunking:** To handle large amounts of data without hitting Firestore's 1MB document limit, large arrays (like mood entries) are automatically split into smaller, numbered chunks. Upon restoration, these chunks are seamlessly reassembled.
    *   **Version History:** Each sync creates a new versioned backup (up to a maximum of 10). This provides a safety net, allowing users to restore their entire dataset to a previous point in time.

---

## 💬 Feedback & Support

We are committed to making MoodVibe the best personal wellness tool it can be. If you encounter a bug, have a feature request, or need support, please:

*   **Contact Us:** For other inquiries, you can reach out to us at `(https://itzpanth.netlify.app/contact)`.
*   **Our Landing Page:** https://tintools.netlify.app/android
---

## 📜 License & Copyright

**Copyright © 2025 Itzpanth Solutions & TinWood Solutions. All Rights Reserved.**

This software is proprietary. You may use the live version of this application according to its terms of service. You are not permitted to copy, modify, distribute, sell, or lease any part of our software, nor may you reverse engineer or attempt to extract the source code, unless laws prohibit these restrictions or you have our written permission.

---

## ✍️ Authors

MoodVibe is a collaborative project by:

*   **@Itzpanth Solutions**
*   **@TinWood Solutions**
