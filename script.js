const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ----- 1. CONSTANTS & CONFIGURATION -----
const APP_NAME = "MoodVibe";
const APP_VERSION = "0.0.21.4"; // --- UPDATED ---
const STORAGE_KEYS = {
    MOOD_ENTRIES: 'moodVibeEntries_v2',
    SETTINGS: 'moodVibeSettings_v5', // --- UPDATED --- Version bump for new features
    EVENTS: 'moodVibeEvents_v1',
    GOALS: 'moodVibeGoals_v1',
    MEASURABLES: 'moodVibeMeasurables_v2', 
    MEASURABLE_LOGS: 'moodVibeMeasurableLogs_v1',
    ACTIVE_SLEEP_SESSION: 'moodVibeActiveSleep_v1',
    MIGRATION_DONE: 'moodVibeMigration_v2_done',
    // --- NEW ---
    REVIEWS: 'moodVibeReviews_v1',
    ANALYSIS_CACHE: 'moodVibeAnalysisCache_v1',
    AI_QUOTES: 'moodVibeAiQuotes_v1', // <-- This was from the last request
    // --- ADD THESE LINES ---
    POMODORO_SETTINGS: 'moodVibePomodoro_v1',
    WEEKLY_TIMETABLE: 'moodVibeTimetable_v1',
    DAILY_SCHEDULE: 'moodVibeDailySchedule_v1'
};
const TAG_LIBRARY_THRESHOLD = 7; 

const DEFAULT_MOOD_PALETTE = [
    { id: 'happy', name: 'Happy', emoji: '😊', colorTheme: { bg: 'var(--mood-happy-bg)', text: 'var(--mood-happy-text)', border: 'var(--mood-happy-border)'}, intensityColor: 'var(--mood-happy-border)' },
    { id: 'sad', name: 'Sad', emoji: '😢', colorTheme: { bg: 'var(--mood-sad-bg)', text: 'var(--mood-sad-text)', border: 'var(--mood-sad-border)' }, intensityColor: 'var(--mood-sad-border)' },
    { id: 'anxious', name: 'Anxious', emoji: '😟', colorTheme: { bg: 'var(--mood-anxious-bg)', text: 'var(--mood-anxious-text)', border: 'var(--mood-anxious-border)' }, intensityColor: 'var(--mood-anxious-border)' },
    { id: 'calm', name: 'Calm', emoji: '😌', colorTheme: { bg: 'var(--mood-calm-bg)', text: 'var(--mood-calm-text)', border: 'var(--mood-calm-border)' }, intensityColor: 'var(--mood-calm-border)' },
    { id: 'excited', name: 'Excited', emoji: '🤩', colorTheme: { bg: 'var(--mood-excited-bg)', text: 'var(--mood-excited-text)', border: 'var(--mood-excited-border)' }, intensityColor: 'var(--mood-excited-border)' },
    { id: 'tired', name: 'Tired', emoji: '😴', colorTheme: { bg: 'var(--mood-tired-bg)', text: 'var(--mood-tired-text)', border: 'var(--mood-tired-border)' }, intensityColor: 'var(--mood-tired-border)' },
    { id: 'neutral', name: 'Neutral', emoji: '😐', colorTheme: { bg: 'var(--mood-neutral-bg)', text: 'var(--mood-neutral-text)', border: 'var(--mood-neutral-border)' }, intensityColor: 'var(--mood-neutral-border)' },
];

const DEFAULT_MOOD_COLORS = {
    happy: '#FFD600',
    sad: '#2196F3',
    anxious: '#9C27B0',
    calm: '#00BFAE',
    excited: '#FF6D00',
    tired: '#757575',
    neutral: '#BDBDBD'
};

const DEFAULT_SETTINGS = {
    theme: 'light',
    userName: '',
    hasCompletedOnboarding: false,
    moodPalette: DEFAULT_MOOD_PALETTE,
    soundEffectsEnabled: false,
    dashboardOrder: ['aisuggestion', 'review', 'onthisday', 'memory', 'quote', 'goals'], // --- UPDATED ---
    pfp: null,
    pfpStyle: { zoom: 1, top: 0, left: 0 },
    aboutMeNotes: [],
    // Passwords & API Keys
    notesPassword: '',
    appPassword: '',
    aiApiKey: '',
    weatherApiKey: '',
    // Feature Toggles
    showStreaks: true,
    showQuotes: true,
    enableJournalPrompts: false,
    enablePhotoAttachments: false, 
    enableWeatherLogging: false,
    enableGlobalSearch: true,
    showReports: true,
    showGoals: true,
    showMeasurables: true,
    mergeFeaturesToDashboard: false,
    uiScale: 100,
    optimizeForLandscape: true, 
    reminders: [],
    calendarEventReminders: true,
    enableRichTextFormatting: true,
    // --- NEW SETTINGS ---
    enableStructuredContext: true,
    enableAiSuggestions: true,
    enableWeeklyReview: true,
    lastReviewDate: null,
    enableMemoryLane: true, // Turn the feature on by default
    memoryLaneLocation: 'dashboard', // 'dashboard' or 'history'
    enableLocationLogging: false, // Add this line
    enableWeatherLogging: false, // Add this line
    enableAiQuotes: false, // Add this line
};

const VIEWS = {
    LOG: 'log',
    HISTORY: 'history',
    SEARCH: 'search',
    REPORTS: 'reports',
    MEASURABLES: 'measurables',
    GOALS: 'goals',
    TRENDS: 'trends',
    CALENDAR: 'calendar',
    DASHBOARD: 'dashboard',
    SETTINGS: 'settings',
    PROFILE: 'profile',
    // --- ADD THIS LINE ---
    PRODUCTIVITY: 'productivity',
};

const DEFAULT_MEASURABLES = [
    { id: 'sleep_default', name: 'Sleep', unit: 'hours', icon: '😴', type: 'duration', target: 7, targetType: 'min' },
    { id: 'water_default', name: 'Water Intake', unit: 'glasses', icon: '💧', type: 'value', target: 8, targetType: 'min' },
    { id: 'mindfulness_default', name: 'Mindfulness', unit: 'minutes', icon: '🧘', type: 'value', target: 10, targetType: 'min' },
    { id: 'exercise_default', name: 'Exercise', unit: 'minutes', icon: '💪', type: 'value', target: 30, targetType: 'min' },
    { id: 'screentime_default', name: 'Screen Time', unit: 'hours', icon: '📱', type: 'value', target: 3, targetType: 'max' },
    { id: 'caffeine_default', name: 'Caffeine', unit: 'mg', icon: '☕', type: 'value', target: 400, targetType: 'max' },
];

// --- NEW: Structured Context Options ---
const CONTEXT_OPTIONS = {
    people: { label: 'People', options: ['Alone', 'Partner', 'Family', 'Friends', 'Co-workers'] },
    place: { label: 'Place', options: ['Home', 'Work', 'Outdoors', 'Commuting', 'Social Venue'] },
    activity: { label: 'Activity', options: ['Working', 'Exercising', 'Eating', 'Relaxing', 'Socializing'] }
};

// --- NEW: Achievements Library ---
const ACHIEVEMENTS_LIBRARY = [
    // Streaks
    { id: 'streak3', name: '3-Day Warrior', emoji: '🌱', requirement: 3, type: 'streak', description: "Maintain a 3-day logging streak." },
    { id: 'streak7', name: 'Week Champion', emoji: '🌿', requirement: 7, type: 'streak', description: "Maintain a 7-day logging streak." },
    { id: 'streak30', name: 'Monthly Master', emoji: '🌳', requirement: 30, type: 'streak', description: "Maintain a 30-day logging streak." },
    // Entries
    { id: 'entries10', name: 'Getting Started', emoji: '🎯', requirement: 10, type: 'entries', description: "Log 10 mood entries." },
    { id: 'entries50', name: 'Dedicated Logger', emoji: '🏆', requirement: 50, type: 'entries', description: "Log 50 mood entries." },
    { id: 'entries100', name: 'Centurion', emoji: '👑', requirement: 100, type: 'entries', description: "Log 100 mood entries." },
    // Exploration & New Features
    { id: 'full_spectrum', name: 'Full Spectrum', emoji: '🌈', type: 'exploration', subType: 'allMoods', description: "Use every mood from your palette." },
    { id: 'night_owl', name: 'Night Owl', emoji: '🦉', type: 'hidden', subType: 'logTime', description: "Log an entry between 2 AM and 4 AM." },
    { id: 'photographer', name: 'Photographer', emoji: '📸', type: 'exploration', subType: 'photo', requirement: 5, description: "Attach 5 photos to your entries." },
    // Goals & Measurables
    { id: 'goal_setter', name: 'Goal Setter', emoji: '✍️', type: 'goals', subType: 'created', requirement: 3, description: "Create 3 wellness goals." },
    { id: 'goal_achiever', name: 'Goal Achiever', emoji: '🏅', type: 'goals', subType: 'completed', requirement: 1, description: "Complete your first goal." },
    { id: 'consistent_tracker', name: 'Consistent Tracker', emoji: '📏', type: 'measurables', subType: 'logs', requirement: 25, description: "Log 25 entries in any measurable." },
];


const JOURNAL_PROMPTS = [
    "What was the best part of your day and why?",
    "Describe a small moment of joy you experienced today.",
    "What is one thing you're grateful for right now?",
    "What challenge did you face today, and how did you handle it?",
    "If you could give your past self one piece of advice, what would it be?",
    "What are you looking forward to tomorrow?",
    "Write about something that made you laugh today.",
    "What's a simple pleasure you often overlook?",
];

const AI_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// ----- 2. HELPER & UTILITY FUNCTIONS -----

const LocalStorageService = {
    getItem: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error getting item ${key} from localStorage:`, error);
            return null;
        }
    },
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting item ${key} in localStorage:`, error);
        }
    },
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item ${key} from localStorage:`, error);
        }
    }
};

const SoundUtils = {
    playSound: (soundId, settings) => {
        if (settings && !settings.soundEffectsEnabled) return;
        try {
            const sound = document.getElementById(soundId);
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => console.warn("Sound play interrupted:", e));
            }
        } catch (e) {
            console.error("Error playing sound:", e);
        }
    }
};


const DateTimeUtils = {
    // FIX: Create a robust date parsing function to handle Safari's strictness.
    _parseDate: (dateInput) => {
        if (!dateInput) return null;
        if (dateInput instanceof Date) return new Date(dateInput);
        if (typeof dateInput === 'string' && dateInput.length === 10 && dateInput.includes('-')) {
            return new Date(`${dateInput}T00:00:00`);
        }
        return new Date(dateInput);
    },

    formatTimestamp: (isoString, options = { dateStyle: 'medium', timeStyle: 'short' }) => {
        const date = DateTimeUtils._parseDate(isoString);
        if (!date || isNaN(date.getTime())) return "Invalid Date";
        try {
            return date.toLocaleString(undefined, options);
        } catch (e) { return "Invalid Date"; }
    },
    isSameDay: (date1, date2) => {
        const d1 = DateTimeUtils._parseDate(date1);
        const d2 = DateTimeUtils._parseDate(date2);
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    },
     isSameDateIgnoringYear: (date1, date2) => {
        const d1 = DateTimeUtils._parseDate(date1);
        const d2 = DateTimeUtils._parseDate(date2);
        if (!d1 || !d2) return false;
        return d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    },
    getStartOfDay: (date) => {
        const d = DateTimeUtils._parseDate(date);
        if (!d || isNaN(d.getTime())) return null;
        d.setHours(0, 0, 0, 0);
        return d;
    },
    getStartOfDayISO: (date) => {
        const d = DateTimeUtils._parseDate(date);
        if (!d || isNaN(d.getTime())) return null;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    getDaysInMonth: (year, month) => new Date(year, month + 1, 0).getDate(),
    getFirstDayOfMonth: (year, month) => new Date(year, month, 1).getDay(),
    daysBetween: (date1, date2) => {
        const d1 = DateTimeUtils.getStartOfDay(date1);
        const d2 = DateTimeUtils.getStartOfDay(date2);
        if (!d1 || !d2) return 0;
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    formatDuration: (ms) => {
        if (ms < 0) ms = 0;
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    },
    durationToHours: (ms) => {
        if (ms < 0) ms = 0;
        return ms / (1000 * 60 * 60);
    }
};

const EventUtils = {
    isEventOnDay: (event, date) => {
        const eventStart = DateTimeUtils.getStartOfDay(new Date(event.startDate + 'T00:00:00'));
        const checkDate = DateTimeUtils.getStartOfDay(new Date(date));
        
        if (checkDate < eventStart) return false;

        const eventEnd = event.endDate ? DateTimeUtils.getStartOfDay(new Date(event.endDate + 'T00:00:00')) : null;
        if (eventEnd && checkDate > eventEnd) return false;

        switch (event.recurrence) {
            case 'one-time':
                return DateTimeUtils.isSameDay(checkDate, eventStart);
            case 'daily':
                return true; 
            case 'alternate': {
                const diffTime = Math.abs(checkDate - eventStart);
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                return diffDays % 2 === 0;
            }
            case 'weekly':
                return checkDate.getDay() === eventStart.getDay();
            case 'monthly':
                return checkDate.getDate() === eventStart.getDate();
            case 'yearly':
                return checkDate.getDate() === eventStart.getDate() && checkDate.getMonth() === eventStart.getMonth();
            default:
                return false;
        }
    },
    getEventsForDay: (date, allEvents) => {
        return allEvents.filter(event => EventUtils.isEventOnDay(event, date));
    }
};

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

async function callDeepSeekAPI(messages, apiKey, model = "openrouter/auto", max_tokens = 250) {
    if (!apiKey) {
        throw new Error("AI API Key is not set in settings.");
    }

    try {
        const response = await fetch(AI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'X-Title': APP_NAME
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.7,
                max_tokens: max_tokens,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error Response:", errorData);
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling DeepSeek API:", error);
        throw error;
    }
}

const NotificationService = {
    intervalId: null,
    
    requestPermission: async () => {
        if (!('Notification' in window)) {
            console.log("This browser does not support desktop notification");
            return 'denied';
        }
        return await Notification.requestPermission();
    },
    startMoodReminders: (settings) => {
        if (NotificationService.intervalId) {
            clearInterval(NotificationService.intervalId);
        }
        
        NotificationService.intervalId = setInterval(() => {
            const reminders = settings.reminders || [];
            if (reminders.length === 0 || Notification.permission !== 'granted') return;

            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            reminders.forEach(time => {
                if (time === currentTime) {
                    const lastNotifKey = `moodvibe_lastNotif_${time}`;
                    const lastNotifDate = LocalStorageService.getItem(lastNotifKey);
                    const todayStr = DateTimeUtils.getStartOfDayISO(now);
                    
                    if (lastNotifDate !== todayStr) {
                        new Notification("👋 How are you feeling?", {
                            body: `Time to log your mood in ${APP_NAME}.`,
                            icon: 'moodvibe.png'
                        });
                        LocalStorageService.setItem(lastNotifKey, todayStr);
                    }
                }
            });
        }, 60000);
    },
    
    checkEventNotifications: (events, settings) => {
        if (!settings.calendarEventReminders || Notification.permission !== 'granted') return;
        const now = new Date();
        const today = DateTimeUtils.getStartOfDay(now);

        events.forEach(event => {
            if (!event.reminder || event.reminder === 'none') return;

            const eventDate = new Date(event.startDate + 'T09:00:00');
            let notificationDate = new Date(eventDate);
            if (event.reminder === '1-day-before') {
                notificationDate.setDate(notificationDate.getDate() - 1);
            }
            
            if (DateTimeUtils.isSameDay(notificationDate, today)) {
                 const notifiedKey = `notified_event_${event.id}_${DateTimeUtils.getStartOfDayISO(notificationDate)}`;
                 if (!LocalStorageService.getItem(notifiedKey)) {
                     const title = event.reminder === '1-day-before' ? `Reminder: '${event.title}' is tomorrow!` : `Reminder: '${event.title}' is today!`;
                     new Notification(title, {
                         body: event.notes || 'Check your calendar for details.',
                         icon: 'moodvibe.png',
                         tag: event.id
                     });
                     LocalStorageService.setItem(notifiedKey, true);
                 }
            }
        });
    },

    stop: () => {
        if (NotificationService.intervalId) {
            clearInterval(NotificationService.intervalId);
            NotificationService.intervalId = null;
        }
    }
};

const MigrationService = {
    run: () => {
        const isMigrationDone = LocalStorageService.getItem(STORAGE_KEYS.MIGRATION_DONE);
        if (isMigrationDone) return;

        console.log("Running one-time data migration...");

        const oldSettings = LocalStorageService.getItem('moodVibeSettings_v3');
        if (oldSettings && !LocalStorageService.getItem(STORAGE_KEYS.SETTINGS)) {
            console.log("Migrating settings from v3 to v4...");
            const newSettings = { ...oldSettings };
            if (newSettings.hasOwnProperty('mergeCalendarAndGoals')) {
                newSettings.mergeFeaturesToDashboard = newSettings.mergeCalendarAndGoals;
                delete newSettings.mergeCalendarAndGoals;
            }
            LocalStorageService.setItem(STORAGE_KEYS.SETTINGS, newSettings);
            LocalStorageService.removeItem('moodVibeSettings_v3');
        }

        const oldMeasurables = LocalStorageService.getItem('moodVibeMeasurables_v1');
        if (oldMeasurables && !LocalStorageService.getItem(STORAGE_KEYS.MEASURABLES)) {
            console.log("Migrating measurables from v1 to v2...");
            const newMeasurables = oldMeasurables.map(m => ({
                ...m,
                target: m.target || null,
                targetType: m.targetType || 'min'
            }));
            LocalStorageService.setItem(STORAGE_KEYS.MEASURABLES, newMeasurables);
            LocalStorageService.removeItem('moodVibeMeasurables_v1');
        }

        LocalStorageService.setItem(STORAGE_KEYS.MIGRATION_DONE, true);
        console.log("Migration complete.");
    }
};

// ----- Export Utilities -----
const ExportUtils = {
    generateCSV: (entries, measurables, measurableLogs, startDate, endDate, includeMeasurables, settings) => {
        const moodPalette = settings.moodPalette || DEFAULT_MOOD_PALETTE;
        const filteredEntries = entries.filter(e => {
            const entryDate = new Date(e.timestamp);
            return entryDate >= startDate && entryDate <= endDate;
        });

        if (filteredEntries.length > 0) {
            const moodMap = moodPalette.reduce((acc, mood) => ({...acc, [mood.id]: mood}), {});
            const headers = ['id', 'timestamp', 'mood', 'intensity', 'notes', 'privateNotes', 'tags', 'weather_condition', 'weather_temp_c', 'context_people', 'context_place', 'context_activity'];
            const csvRows = [headers.join(',')];

            for (const entry of filteredEntries) {
                const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""')}"`;
                const values = [
                    entry.id, entry.timestamp, moodMap[entry.moodId]?.name || entry.moodId,
                    entry.intensity, escapeCsv(entry.notes), escapeCsv(entry.privateNotes),
                    escapeCsv(entry.tags?.join(';')),
                    escapeCsv(entry.weather?.condition), entry.weather?.temp_c,
                    escapeCsv(entry.context?.people), escapeCsv(entry.context?.place), escapeCsv(entry.context?.activity)
                ];
                csvRows.push(values.join(','));
            }
            ExportUtils.downloadFile(csvRows.join('\n'), `MoodVibe_Moods_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`, 'text/csv');
        } else {
             alert("No mood data available for the selected date range.");
        }

        if (includeMeasurables) {
            const filteredLogs = measurableLogs.filter(l => {
                const logDate = new Date(l.endTimestamp);
                return logDate >= startDate && logDate <= endDate;
            });

            if (filteredLogs.length > 0) {
                const measurableMap = measurables.reduce((acc, m) => ({...acc, [m.id]: m}), {});
                const headers = ['log_id', 'measurable_name', 'measurable_unit', 'value', 'start_timestamp', 'end_timestamp', 'notes'];
                const csvRows = [headers.join(',')];

                for (const log of filteredLogs) {
                    const m = measurableMap[log.measurableId] || { name: 'Unknown', unit: ''};
                    const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""')}"`;
                    const values = [
                        log.id, m.name, m.unit, log.value, 
                        log.startTimestamp || '', log.endTimestamp, escapeCsv(log.notes),
                    ];
                    csvRows.push(values.join(','));
                }
                ExportUtils.downloadFile(csvRows.join('\n'), `MoodVibe_Measurables_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`, 'text/csv');
                alert("Moods CSV and Measurables CSV are being downloaded.");
            } else {
                alert("No measurable data found for the selected date range.");
            }
        }
    },
    
    generateDailySummaryCSV: (data, startDate, endDate) => {
        const { entries, goals, measurables, measurableLogs, settings } = data;
        const moodPalette = settings.moodPalette || DEFAULT_MOOD_PALETTE;

        const dailyData = {};
        const start = DateTimeUtils.getStartOfDay(startDate);
        const end = DateTimeUtils.getStartOfDay(endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const isoDate = DateTimeUtils.getStartOfDayISO(d);
            dailyData[isoDate] = {
                moods: [],
                logs: {},
                goals: {},
            };
        }
        
        entries.forEach(e => {
            const isoDate = DateTimeUtils.getStartOfDayISO(new Date(e.timestamp));
            if (dailyData[isoDate]) dailyData[isoDate].moods.push(e);
        });
        measurableLogs.forEach(l => {
            const isoDate = DateTimeUtils.getStartOfDayISO(new Date(l.endTimestamp));
            if (dailyData[isoDate]) {
                if (!dailyData[isoDate].logs[l.measurableId]) {
                    dailyData[isoDate].logs[l.measurableId] = [];
                }
                dailyData[isoDate].logs[l.measurableId].push(l);
            }
        });
        goals.forEach(g => {
            for (const isoDate in g.progress) {
                if (dailyData[isoDate]) {
                    dailyData[isoDate].goals[g.id] = g.progress[isoDate];
                }
            }
        });

        const measurableHeaders = measurables.map(m => `Measurable: ${m.name} (${m.unit})`);
        const goalHeaders = goals.map(g => `Goal: ${g.title}`);
        const moodCountHeaders = moodPalette.map(m => `Mood Count: ${m.name}`);
        const headers = ['Date', 'Avg Intensity', 'Dominant Mood', ...moodCountHeaders, ...measurableHeaders, ...goalHeaders].join(',');
        
        const csvRows = [headers];

        for (const isoDate in dailyData) {
            const day = dailyData[isoDate];
            const row = [isoDate];
            
            if (day.moods.length > 0) {
                const totalIntensity = day.moods.reduce((sum, e) => sum + e.intensity, 0);
                row.push((totalIntensity / day.moods.length).toFixed(2));
                const moodCounts = day.moods.reduce((acc, e) => ({...acc, [e.moodId]: (acc[e.moodId] || 0) + 1}), {});
                const dominantMoodId = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b, null);
                row.push(moodPalette.find(m => m.id === dominantMoodId)?.name || '');
                moodPalette.forEach(m => row.push(moodCounts[m.id] || 0));
            } else {
                row.push('', '', ...Array(moodPalette.length).fill(0));
            }
            
            measurables.forEach(m => {
                const logsForDay = day.logs[m.id] || [];
                if (logsForDay.length > 0) {
                    const totalValue = logsForDay.reduce((sum, l) => sum + l.value, 0);
                    const avgValue = m.type === 'duration' ? DateTimeUtils.durationToHours(totalValue / logsForDay.length).toFixed(2) : (totalValue / logsForDay.length).toFixed(1);
                    row.push(avgValue);
                } else {
                    row.push('');
                }
            });
            
            goals.forEach(g => {
                const status = day.goals[g.id];
                row.push(status === true ? '1' : status === false ? '0' : '');
            });

            csvRows.push(row.join(','));
        }
        
        ExportUtils.downloadFile(csvRows.join('\n'), `MoodVibe_DailySummary_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`, 'text/csv');
        alert("Daily Summary CSV is being downloaded.");
    },

    downloadFile: (content, fileName, contentType) => {
        const blob = new Blob([content], { type: `${contentType};charset=utf-8;` });
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    generatePDF: async (data, startDate, endDate, includeMeasurables) => {
        const { jsPDF } = window.jspdf;
        if (!jsPDF || !window.html2canvas) {
            alert("PDF generation library not loaded. Please check your internet connection and try again.");
            return;
        }

        const { entries, settings, goals, measurables, measurableLogs } = data;
        
        const startOfDay = new Date(startDate); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate); endOfDay.setHours(23, 59, 59, 999);
        
        const filteredEntries = entries.filter(e => new Date(e.timestamp) >= startOfDay && new Date(e.timestamp) <= endOfDay);
        const filteredGoals = settings.showGoals ? goals.filter(g => new Date(g.startDate) <= endOfDay && (g.endDate ? new Date(g.endDate) : new Date()) >= startOfDay) : [];
        const filteredMeasurableLogs = includeMeasurables ? measurableLogs.filter(l => new Date(l.endTimestamp) >= startOfDay && new Date(l.endTimestamp) <= endOfDay) : [];

        if (filteredEntries.length === 0 && filteredGoals.length === 0 && filteredMeasurableLogs.length === 0) {
            alert("No data available for the selected date range to generate a PDF.");
            return;
        }
        
        alert("Generating PDF... This may take a moment. Please don't close the tab.");

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        let yPos = 20;

        const addFooter = () => {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8).setTextColor(150);
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Page ${i} of ${pageCount} | MoodVibe Report`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
        };
        const checkPageBreak = (neededHeight) => {
            if (yPos + neededHeight > pageHeight - 20) { doc.addPage(); yPos = 20; }
        };

        // Add logo at the top of the first page (now using webp)
        const logoImg = new Image();
        logoImg.src = 'mvlogo.png';
        await new Promise(resolve => { logoImg.onload = resolve; logoImg.onerror = resolve; });
        if (logoImg.complete && logoImg.naturalWidth > 0) {
            const logoWidth = 40;
            const logoHeight = 40;
            doc.addImage(logoImg, 'PNG', (pageWidth - logoWidth) / 2, 20, logoWidth, logoHeight);
            yPos = 20 + logoHeight + 10;
        } else {
            yPos = 40;
        }
        // ... existing code ...
        doc.setFontSize(32).setFont(undefined, 'bold').text("MoodVibe Wellness Report", pageWidth / 2, yPos + 10, { align: 'center' });
        yPos += 30;
        // Add clickable site link below the title
        const siteUrl = 'https://moodvibee.netlify.app/';
        doc.setFontSize(12).setTextColor(0, 102, 204).textWithLink(siteUrl, pageWidth / 2, yPos + 5, { align: 'center', url: siteUrl });
        yPos += 10;
        doc.setFontSize(16).setFont(undefined, 'normal').setTextColor(0).text(`For: ${settings.userName || 'User'}`, pageWidth / 2, yPos + 10, { align: 'center' });
        yPos += 15;
        doc.setFontSize(12).setTextColor(100).text(`Report for period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, pageWidth / 2, yPos + 10, { align: 'center' });
        yPos += 15;
        // ... existing code ...

        if (filteredEntries.length > 0) {
            doc.addPage(); yPos = 20;
            doc.setFontSize(18).setTextColor(40).text("Visual Summary", margin, yPos); yPos += 15;
            
            const reportContainer = document.createElement('div');
            reportContainer.style.position = 'absolute'; reportContainer.style.top = '-9999px'; reportContainer.style.left = '0';
            reportContainer.style.width = '800px'; reportContainer.style.background = 'white'; reportContainer.style.padding = '20px';
            document.body.appendChild(reportContainer);
            const tempRoot = ReactDOM.createRoot(reportContainer);
            
            await new Promise(resolve => {
                tempRoot.render(
                    React.createElement(React.Fragment, null, 
                        React.createElement(MoodDistributionChart, { entries: filteredEntries, settings: settings, chartTitle: "Mood Distribution" }),
                        React.createElement("div", {style: {height: '20px'}}),
                        React.createElement(MoodTrendChart, { entries: filteredEntries, settings: settings, chartTitle: "Mood Trend" })
                    )
                );
                setTimeout(resolve, 1500);
            });

            const canvas = await window.html2canvas(reportContainer, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const imgHeight = (canvas.height * (pageWidth - margin * 2)) / canvas.width;
            doc.addImage(imgData, 'PNG', margin, yPos, pageWidth - (margin * 2), imgHeight > 240 ? 240 : imgHeight);
            
            tempRoot.unmount(); document.body.removeChild(reportContainer);
        }

        if (includeMeasurables && filteredMeasurableLogs.length > 0) {
            doc.addPage(); yPos = 20;
            doc.setFontSize(18).setTextColor(40).text("Measurables Report", margin, yPos); yPos += 15;
            
            const measurableMap = measurables.reduce((acc, m) => ({ ...acc, [m.id]: m }), {});
            const logsByMeasurable = filteredMeasurableLogs.reduce((acc, log) => {
                if (!acc[log.measurableId]) acc[log.measurableId] = [];
                acc[log.measurableId].push(log);
                return acc;
            }, {});

            for (const measurableId in logsByMeasurable) {
                const m = measurableMap[measurableId];
                if (!m) continue;

                checkPageBreak(20);
                doc.setFontSize(14).setFont(undefined, 'bold').text(`${m.icon} ${m.name}`, margin, yPos); yPos += 8;

                logsByMeasurable[measurableId].forEach(log => {
                    const valueStr = m.type === 'duration' ? DateTimeUtils.formatDuration(log.value) : `${log.value} ${m.unit}`;
                    const line = `${DateTimeUtils.formatTimestamp(log.endTimestamp, {dateStyle: 'short'})}: ${valueStr}`;
                    checkPageBreak(10);
                    doc.setFontSize(10).setFont(undefined, 'normal').setTextColor(80).text(line, margin + 5, yPos);
                    yPos += 5;
                    if(log.notes) {
                        const splitNotes = doc.splitTextToSize(`  - Notes: ${log.notes}`, pageWidth - (margin*2) - 10);
                        checkPageBreak(splitNotes.length * 4);
                        doc.setFont(undefined, 'italic').setTextColor(120).text(splitNotes, margin + 5, yPos);
                        yPos += splitNotes.length * 4;
                    }
                    yPos += 2;
                });
                yPos += 5;
                doc.setDrawColor(220).line(margin, yPos - 3, pageWidth - margin, yPos - 3);
            }
        }

        if (filteredGoals.length > 0) {
            doc.addPage(); yPos = 20;
            doc.setFontSize(18).setTextColor(40).text("Wellness Goals Summary", margin, yPos); yPos += 15;

            filteredGoals.forEach(goal => {
                checkPageBreak(40);
                doc.setFontSize(14).setFont(undefined, 'bold').text(goal.title, margin, yPos); yPos += 6;
                doc.setFontSize(10).setFont(undefined, 'italic').setTextColor(100);
                const splitDesc = doc.splitTextToSize(goal.description, pageWidth - (margin * 2));
                doc.text(splitDesc, margin, yPos); yPos += splitDesc.length * 4 + 2;
                yPos += 10;
                doc.setDrawColor(220).line(margin, yPos, pageWidth - margin, yPos); yPos += 8;
            });
        }
        
        if (filteredEntries.length > 0) {
            doc.addPage(); yPos = 20;
            doc.setFontSize(18).setTextColor(40).text("Detailed Mood Log", margin, yPos); yPos += 15;
            const moodMap = (settings.moodPalette || DEFAULT_MOOD_PALETTE).reduce((acc, mood) => ({...acc, [mood.id]: mood}), {});

            filteredEntries.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp)).forEach(entry => {
                const mood = moodMap[entry.moodId] || {emoji: '?', name: 'Unknown'};
                const moodColor = (settings.moodColors && settings.moodColors[entry.moodId]) || '#cccccc';
                
                let cardHeight = 25 + (doc.splitTextToSize(entry.notes || '', pageWidth - (margin*2) - 15).length * 4);
                if(entry.tags?.length > 0) cardHeight += 10;
                checkPageBreak(cardHeight);

                doc.setDrawColor(220).setFillColor(250, 250, 250).roundedRect(margin, yPos, pageWidth - (margin*2), cardHeight - 8, 3, 3, 'FD');
                doc.setFillColor(moodColor).rect(margin, yPos, 3, cardHeight - 8, 'F');
                let textX = margin + 8; let innerY = yPos + 7;
                doc.setFontSize(12).setFont(undefined, 'bold').setTextColor(40).text(`${mood.emoji} ${mood.name} (Intensity: ${entry.intensity}/10)`, textX, innerY);
                doc.setFontSize(9).setFont(undefined, 'normal').setTextColor(150).text(DateTimeUtils.formatTimestamp(entry.timestamp), pageWidth - margin - 5, innerY, { align: 'right' }); innerY += 7;
                if (entry.notes) {
                    doc.setFont(undefined, 'normal').setTextColor(80);
                    const splitNotes = doc.splitTextToSize(entry.notes, pageWidth - (margin*2) - 15);
                    doc.text(splitNotes, textX, innerY); innerY += splitNotes.length * 4 + 2;
                }
                if (entry.tags?.length > 0) {
                    doc.setFont(undefined, 'bold').setTextColor(120).text(`Tags: ${entry.tags.join(', ')}`, textX, innerY);
                }
                yPos += cardHeight;
            });
        }

        addFooter();
        doc.save(`MoodVibe_Report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`);
    }
};

// ----- 3. REACT COMPONENTS -----

// --- 3.1 UI & Navigation Components ---

function ImageViewerModal({ src, onClose }) {
    if (!src) return null;
    return React.createElement("div", { className: "image-viewer-overlay", onClick: onClose },
        React.createElement("button", { className: "image-viewer-close" }, "×"),
        React.createElement("img", { src: src, className: "image-viewer-content", alt: "Full screen view" })
    );
}


function AppHeader({ appName, settings, streak, setCurrentView }) {
    return (
        React.createElement("header", { className: "app-header text-center card mb-4" },
            React.createElement("div", { 
                style: { 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-2)'
                } 
            },
                streak > 0 && React.createElement("div", { 
                    style: { 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '1.2em',
                        fontWeight: 'bold',
                        color: 'var(--accent-primary)'
                    } 
                },
                    React.createElement("span", { role: "img", "aria-label": "fire emoji" }, "🔥"),
                    React.createElement("span", null, streak)
                ),
                React.createElement("div", { style: { flex: 1, textAlign: 'center' } },
                    React.createElement("h1", { style: { color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '10px' } }, 
                        React.createElement("img", { src: "mvlogo.png", alt: "MoodVibe Logo", style: { width: 36, height: 36, objectFit: 'contain', verticalAlign: 'middle', marginRight: 4 } }),
                        appName
                    ),
                    settings.userName && React.createElement("h2", { 
                        className: "text-tertiary",
                        style: { fontSize: '1.5em', marginTop: 'var(--spacing-2)', display: 'block' }
                    }, getGreeting(settings.userName)),
                    React.createElement("p", { className: "text-tertiary" }, "Your personal mood companion.")
                ),
                React.createElement("button", {
                    onClick: () => setCurrentView(VIEWS.PROFILE),
                    className: "profile-button",
                    title: "View Profile",
                    style: {
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--border-radius-md)',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '2px solid var(--border-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        color: 'var(--text-primary)',
                        fontSize: '1.2em',
                        padding: 0,
                        overflow: 'hidden'
                    }
                }, 
                    settings.pfp ?
                        React.createElement("img", { src: settings.pfp, style: { width: '100%', height: '100%', objectFit: 'cover' }}) :
                        "👤"
                )
            )
        )
    );
}

function AppNavigation({ currentView, setCurrentView, settings }) {
    const baseNavItems = [
        { id: VIEWS.LOG, label: 'Log Mood', icon: '✍️' },
        { id: VIEWS.HISTORY, label: 'History', icon: '📜' },
        { id: VIEWS.SEARCH, label: 'Search', icon: '🔍', setting: 'enableGlobalSearch' },
        { id: VIEWS.REPORTS, label: 'Reports', icon: '📈', setting: 'showReports' },
        { id: VIEWS.TRENDS, label: 'Trends', icon: '📊' },
        { id: VIEWS.PRODUCTIVITY, label: 'Productivity', icon: '⏱️' }, 
        { id: 'dashboard', isDashboard: true, label: 'Dashboard', icon: '📅' },
        { id: VIEWS.SETTINGS, label: 'Settings', icon: '⚙️' },
    ];

    const navItems = baseNavItems.map(item => {
        if (item.isDashboard) {
            if (settings.mergeFeaturesToDashboard) {
                return { id: VIEWS.DASHBOARD, label: 'Dashboard', icon: '🏠' };
            } else {
                return [
                    { id: VIEWS.CALENDAR, label: 'Calendar', icon: '📅', setting: 'showCalendar' },
                    { id: VIEWS.MEASURABLES, label: 'Measurables', icon: '📏', setting: 'showMeasurables' },
                    { id: VIEWS.GOALS, label: 'Goals', icon: '🎯', setting: 'showGoals' },
                ];
            }
        }
        return item;
    }).flat().filter(item => {
        return item.setting ? !!settings[item.setting] : true;
    });

    return (
        React.createElement("nav", { className: "app-nav" },
            navItems.map(item =>
                React.createElement("button", {
                    key: item.id,
                    className: `nav-link ${currentView === item.id ? 'active' : ''}`,
                    onClick: () => {
                        setCurrentView(item.id);
                        SoundUtils.playSound('audio-click', settings);
                    },
                    title: item.label
                }, 
                React.createElement("span", { className: "section-icon", role: "img", "aria-label": item.label, style: { marginRight: settings.interfaceStyle === 'minimal' ? 0 : '8px' } }, item.icon),
                settings.interfaceStyle !== 'minimal' && React.createElement("span", { className: "nav-link-text" }, item.label)
                )
            )
        )
    );
}

// --- 3.2 Mood Logging Components ---

function InspirationalQuote({ settings, quote }) {
    if (!settings.showQuotes || !quote) return null;
    return React.createElement("div", {
        className: "card text-center",
        style: {
            fontStyle: 'italic',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--spacing-6)'
        }
    }, `"${quote}"`);
}

function TagInput({ tags, setTags, allTags, placeholderText }) { 
    const [inputValue, setInputValue] = useState('');
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [librarySearch, setLibrarySearch] = useState('');

    const handleInputChange = (e) => setInputValue(e.target.value);

    const addTag = (tag) => {
        const newTag = tag.trim().toLowerCase();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
            setInputValue('');
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            setTags(tags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSelectFromLibrary = (tag) => {
        addTag(tag);
        setIsLibraryOpen(false);
        setLibrarySearch('');
    };
    
    const filteredLibraryTags = allTags.filter(
        tag => !tags.includes(tag) && tag.toLowerCase().includes(librarySearch.toLowerCase())
    );

    return (
        React.createElement("div", { className: "form-group" },
            React.createElement("label", { htmlFor: "tags-input", className: "form-label" }, "Tags (optional, comma or Enter to add)"),
            React.createElement("div", { className: "tag-input-wrapper" },
                React.createElement("div", { className: "tag-input-container" },
                    tags.map(tag => (
                        React.createElement("span", { key: tag, className: "tag-item" },
                            tag,
                            React.createElement("button", { type: "button", onClick: () => removeTag(tag), title: `Remove ${tag}` }, "×")
                        )
                    )),
                    React.createElement("input", {
                        type: "text",
                        id: "tags-input",
                        className: "tag-input-field",
                        value: inputValue,
                        onChange: handleInputChange,
                        onKeyDown: handleInputKeyDown,
                        placeholder: tags.length === 0 ? (placeholderText || "e.g., work, relax") : ""
                    })
                ),
                allTags.length > TAG_LIBRARY_THRESHOLD && React.createElement("button", {
                    type: "button",
                    className: "btn btn-secondary btn-sm",
                    onClick: () => setIsLibraryOpen(true),
                    title: "Add from library"
                }, "📚")
            ),
            isLibraryOpen && React.createElement("div", { className: "modal-overlay", onClick: () => setIsLibraryOpen(false) },
                React.createElement("div", { className: "tag-library-modal", onClick: e => e.stopPropagation() },
                    React.createElement("h3", null, "Tag Library"),
                    React.createElement("input", {
                        type: "text",
                        className: "form-input",
                        placeholder: "Search your tags...",
                        value: librarySearch,
                        onChange: e => setLibrarySearch(e.target.value),
                        autoFocus: true
                    }),
                    React.createElement("div", { className: "tag-library-list" },
                        filteredLibraryTags.length > 0 ?
                        filteredLibraryTags.map(tag => (
                            React.createElement("span", {
                                key: tag,
                                className: "tag-library-item",
                                onClick: () => handleSelectFromLibrary(tag)
                            }, `#${tag}`)
                        )) : React.createElement("p", { className: "text-tertiary" }, "No matching tags found.")
                    )
                )
            )
        )
    );
}

// --- NEW: Context Selector Component ---
function ContextSelector({ context, setContext }) {
    const handleSelect = (category, value) => {
        setContext(prev => ({ ...prev, [category]: prev[category] === value ? null : value }));
    };

    return React.createElement("div", { className: "form-group" },
        React.createElement("label", { className: "form-label" }, "Context (optional)"),
        React.createElement("div", { className: "context-selector-grid" },
            Object.entries(CONTEXT_OPTIONS).map(([key, { label, options }]) =>
                React.createElement("div", { key: key, className: "context-category" },
                    React.createElement("span", { className: "context-category-label" }, label),
                    React.createElement("div", { className: "context-options" },
                        options.map(option =>
                            React.createElement("button", {
                                key: option,
                                type: "button",
                                className: `btn btn-sm ${context[key] === option ? 'btn-primary' : 'btn-secondary'}`,
                                onClick: () => handleSelect(key, option)
                            }, option)
                        )
                    )
                )
            )
        )
    );
}


function DailyGoalCheckin({ goals, onUpdateGoal }) {
    const today = DateTimeUtils.getStartOfDayISO(new Date());

    const goalsNeedingCheckin = goals.filter(goal => {
        const goalStart = DateTimeUtils.getStartOfDayISO(new Date(goal.startDate));
        const goalEnd = goal.endDate ? DateTimeUtils.getStartOfDayISO(new Date(goal.endDate)) : null;
        const hasCheckedInToday = goal.progress && goal.progress.hasOwnProperty(today);

        return goal.status === 'active' &&
               !hasCheckedInToday &&
               today >= goalStart &&
               (!goalEnd || today <= goalEnd);
    });

    if (goalsNeedingCheckin.length === 0) {
        return null;
    }

    const handleCheckin = (goal, metGoal) => {
        const updatedProgress = { ...goal.progress, [today]: metGoal };
        onUpdateGoal({ ...goal, progress: updatedProgress });
    };

    return React.createElement("div", { className: "card", style: { border: '2px solid var(--accent-secondary)'} },
        React.createElement("h3", null, 
            React.createElement("span", { className: "section-icon" }, "🎯"),
            React.createElement("span", { className: "section-title-text" }, "Daily Goal Check-in")
        ),
        goalsNeedingCheckin.map(goal => {
            return React.createElement("div", { key: goal.id, className: "goal-checkin-prompt" },
                React.createElement("p", { style: { fontWeight: '500', margin: 0, marginBottom: 'var(--spacing-2)' } }, goal.description),
                React.createElement("p", { className: "text-tertiary", style: { margin: 0 } }, "Did you complete this today?"),
                React.createElement("div", { style: { display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' } },
                    React.createElement("button", {
                        onClick: () => handleCheckin(goal, true),
                        className: `btn btn-secondary btn-sm`,
                    }, "✅ Yes"),
                    React.createElement("button", {
                        onClick: () => handleCheckin(goal, false),
                        className: `btn btn-secondary btn-sm`,
                    }, "❌ No")
                )
            )
        })
    );
}

function JournalPrompt({ onNewPrompt, currentPrompt }) {
    return React.createElement("div", { className: "journal-prompt-container" },
        React.createElement("p", { className: "journal-prompt-text" }, `"${currentPrompt}"`),
        React.createElement("button", {
            type: "button",
            onClick: onNewPrompt,
            className: "btn btn-secondary btn-sm"
        }, "New Prompt")
    );
}

function OnThisDay({ entries, moodPalette }) {
    const today = new Date();
    const onThisDayEntries = entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return DateTimeUtils.isSameDateIgnoringYear(today, entryDate) && today.getFullYear() !== entryDate.getFullYear();
    });

    if (onThisDayEntries.length === 0) return null;

    const moodMap = moodPalette.reduce((acc, m) => ({...acc, [m.id]: m}), {});

    return React.createElement("div", { className: "on-this-day-card" },
        React.createElement("h4", null, "On This Day... 🗓️"),
        onThisDayEntries.map(entry => {
            const mood = moodMap[entry.moodId] || { name: 'Unknown', emoji: '?' };
            return React.createElement("div", { key: entry.id, className: "on-this-day-item" },
                React.createElement("span", { className: "emoji" }, mood.emoji),
                React.createElement("span", null, 
                    `${new Date(entry.timestamp).getFullYear()}: You felt ${mood.name}. ` +
                    (entry.notes ? `Notes: "${entry.notes.substring(0, 30)}..."` : "")
                )
            );
        })
    );
}

// --- NEW: Memory Lane Component ---
function MemoryLaneCard({ entries, moodPalette }) {
    const positiveEntry = useMemo(() => {
        const positiveMoods = new Set(['happy', 'excited', 'calm']);
        const potentialEntries = entries.filter(e => 
            (positiveMoods.has(e.moodId) || e.intensity > 6) && e.notes
        );
        if (potentialEntries.length === 0) return null;
        return potentialEntries[Math.floor(Math.random() * potentialEntries.length)];
    }, [entries]);

    if (!positiveEntry) return null;

    const mood = moodPalette.find(m => m.id === positiveEntry.moodId) || { name: 'Unknown', emoji: '✨' };

    return React.createElement("div", { className: "on-this-day-card memory-lane-card" },
        React.createElement("h4", null, "From the Memory Lane... 🎞️"),
        React.createElement("div", { className: "on-this-day-item" },
            React.createElement("span", { className: "emoji" }, mood.emoji),
            React.createElement("span", null,
                `On ${DateTimeUtils.formatTimestamp(positiveEntry.timestamp, {dateStyle: 'long'})}, you felt ${mood.name} and wrote: "${positiveEntry.notes.substring(0, 80)}..."`
            )
        )
    );
}

// --- NEW: Weekly Review Notification ---
function WeeklyReviewNotification({ settings, onStartReview }) {
    if (!settings.enableWeeklyReview) return null;

    const today = new Date();
    const lastReview = settings.lastReviewDate ? new Date(settings.lastReviewDate) : null;

    // Check if a review is due (e.g., if it's Sunday and no review this week)
    const isReviewDue = !lastReview || DateTimeUtils.daysBetween(lastReview, today) >= 7;

    if (!isReviewDue) return null;

    return React.createElement("div", { className: "card", style: { border: '2px solid var(--accent-primary)', cursor: 'pointer' } , onClick: onStartReview },
        React.createElement("h3", null, 
            React.createElement("span", { className: "section-icon" }, "🧐"),
            React.createElement("span", { className: "section-title-text" }, "Weekly Review Ready!")
        ),
        React.createElement("p", { className: "text-tertiary", style:{margin:0} }, "Take a moment to reflect on your past week. Click here to start.")
    );
}

// --- NEW: Proactive AI Suggestion Card ---
function ProactiveAISuggestionCard({ suggestion, onDismiss, onSetGoal }) {
    if (!suggestion) return null;

    return React.createElement("div", { className: "card", style: { border: '2px solid var(--mood-calm-border)' } },
        React.createElement("div", { style: {display: 'flex', justifyContent: 'space-between', alignItems: 'center'}},
            React.createElement("h3", { style: {color: 'var(--mood-calm-text)'} }, 
                React.createElement("span", { className: "section-icon" }, "💡"),
                "A Quick Observation"
            ),
            React.createElement("button", { onClick: onDismiss, className: "delete-btn", title:"Dismiss"}, "×")
        ),
        React.createElement("p", { className: "text-tertiary", style: { marginTop: 'var(--spacing-2)'} }, suggestion.observation),
        suggestion.goal && React.createElement("div", { style: { display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-3)' } },
            React.createElement("button", { onClick: () => onSetGoal(suggestion.goal), className: "btn btn-primary btn-sm" }, "Set this as a Goal")
        )
    );
}

function RichTextToolbar({ onCommand }) {
    const handleCommand = (command, value = null) => {
        document.execCommand(command, false, value);
    };

    return React.createElement("div", { className: "rich-text-toolbar" },
        React.createElement("button", { onClick: () => handleCommand('bold'), title: "Bold" }, React.createElement("strong", null, "B")),
        React.createElement("button", { onClick: () => handleCommand('italic'), title: "Italic" }, React.createElement("em", null, "I")),
        React.createElement("button", { onClick: () => handleCommand('underline'), title: "Underline" }, React.createElement("u", null, "U")),
        React.createElement("select", { onChange: e => handleCommand('formatBlock', e.target.value), className: "toolbar-select" },
            React.createElement("option", { value: "p" }, "Paragraph"),
            React.createElement("option", { value: "h3" }, "Heading"),
            React.createElement("option", { value: "h4" }, "Sub-heading")
        ),
        React.createElement("label", { title: "Text Color", className: "toolbar-color-label" }, "🎨",
            React.createElement("input", { type: "color", onChange: e => handleCommand('foreColor', e.target.value), className: "toolbar-color-input" })
        )
    );
}

function RichTextEditor({ html, onChange }) {
    const editorRef = useRef(null);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return React.createElement("div", {
        ref: editorRef,
        className: "rich-text-editor form-textarea", // Re-use textarea styles
        contentEditable: true,
        onInput: handleInput,
        dangerouslySetInnerHTML: { __html: html }
    });
}

function MoodLogger({ onAddMood, onUpdateMoodEntry, allTags, settings, goals, onUpdateGoal, entries, onStartReview, aiSuggestion, onDismissSuggestion, onSetGoal, displayQuote }) {
    const moodPalette = settings.moodPalette || DEFAULT_MOOD_PALETTE;
    const [selectedMood, setSelectedMood] = useState(moodPalette[0]);
    const [intensity, setIntensity] = useState(5);
    const [notes, setNotes] = useState('');
    const [privateNotes, setPrivateNotes] = useState('');
    const [tags, setTags] = useState([]);
    const [context, setContext] = useState({}); // --- NEW ---
    const [isSaving, setIsSaving] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [prompt, setPrompt] = useState(JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]);
    const [location, setLocation] = useState(null);

    useEffect(() => {
        if (!moodPalette.find(m => m.id === selectedMood?.id)) {
            setSelectedMood(moodPalette[0] || {});
        }
    }, [moodPalette, selectedMood]);
    
    const handleNewPrompt = () => {
        let newPrompt = prompt;
        while (newPrompt === prompt) {
            newPrompt = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
        }
        setPrompt(newPrompt);
    };
    
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1 * 1024 * 1024) {
            alert("Image is too large. Please choose a file smaller than 1MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (loadEvent) => setImageUrl(loadEvent.target.result);
        reader.readAsDataURL(file);
    };

    const handleAttachLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lon: longitude });
                alert("Location captured!");
            },
            () => {
                alert("Unable to retrieve your location. Please check your browser permissions.");
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMood || !selectedMood.id) {
            alert('Please select a mood.');
            return;
        }
        setIsSaving(true);
        const now = new Date();
        const newEntry = {
            id: generateId(),
            timestamp: now.toISOString(),
            exactTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
            moodId: selectedMood.id,
            intensity: parseInt(intensity, 10),
            notes: notes.trim(),
            privateNotes: privateNotes.trim(),
            tags: tags,
            context: context, // --- NEW ---
            imageUrl: imageUrl,
            weather: null,
            location: location, // Add this line
        };

        onAddMood(newEntry);
        SoundUtils.playSound('audio-log-success', settings);
        
        setIntensity(5);
        setNotes('');
        setPrivateNotes('');
        setTags([]);
        setContext({}); // --- NEW ---
        setImageUrl(null);
        setLocation(null); // Add this line
        setIsSaving(false);

        if (settings.enableWeatherLogging && settings.weatherApiKey) {
            try {
                const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 }));
                const { latitude, longitude } = position.coords;
                const weatherResponse = await fetch(`https://api.weatherapi.com/v1/current.json?key=${settings.weatherApiKey}&q=${latitude},${longitude}`);
                if (!weatherResponse.ok) throw new Error('Weather API request failed');
                const weatherData = await weatherResponse.json();
                
                const weatherInfo = {
                    temp_c: weatherData.current.temp_c,
                    condition: weatherData.current.condition.text,
                    icon: weatherData.current.condition.icon,
                };
                
                onUpdateMoodEntry({ ...newEntry, weather: weatherInfo });

            } catch (error) {
                console.warn("Could not fetch weather data:", error.message);
            }
        }
    };
    
    const handleVoiceInput = () => {
        alert("Voice input feature is planned but not implemented in this demo.");
    };

    const dashboardComponents = {
        'quote': React.createElement(InspirationalQuote, { key: 'quote', settings: settings, quote: displayQuote }),
        'goals': settings.showGoals ? React.createElement(DailyGoalCheckin, { key: 'goals', goals: goals, onUpdateGoal: onUpdateGoal }) : null,
        'onthisday': React.createElement(OnThisDay, { key: 'onthisday', entries: entries, moodPalette: moodPalette }),
        'memory': settings.enableMemoryLane && settings.memoryLaneLocation === 'dashboard'
            ? React.createElement(MemoryLaneCard, { key: 'memory', entries: entries, moodPalette: moodPalette })
            : null,
        'review': React.createElement(WeeklyReviewNotification, { key: 'review', settings: settings, onStartReview: onStartReview }),
        'aisuggestion': settings.enableAiSuggestions ? React.createElement(ProactiveAISuggestionCard, { key: 'aisuggestion', suggestion: aiSuggestion, onDismiss: onDismissSuggestion, onSetGoal: onSetGoal }) : null,
    };

    return (
        React.createElement("div", { className: "mood-logger-view" },
            (settings.dashboardOrder || []).map(key => dashboardComponents[key]),
            React.createElement("div", { className: "card mood-logger" },
                React.createElement("h2", null,
                    React.createElement("span", { className: "section-icon" }, "✍️"),
                    settings.interfaceStyle !== 'minimal' && React.createElement("span", { className: "section-title-text" }, "How are you feeling today?")
                ),
                settings.enableJournalPrompts && React.createElement(JournalPrompt, { onNewPrompt: handleNewPrompt, currentPrompt: prompt }),
                React.createElement("form", { onSubmit: handleSubmit },
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { className: "form-label" }, "Select Mood:"),
                        React.createElement("div", { className: "mood-palette" },
                            moodPalette.map(mood =>
                                React.createElement("button", {
                                    type: "button",
                                    key: mood.id,
                                    onClick: () => setSelectedMood(mood),
                                    className: `mood-button ${selectedMood?.id === mood.id ? 'selected' : ''}`,
                                    style: selectedMood?.id === mood.id ? { backgroundColor: mood.colorTheme.border, borderColor: mood.colorTheme.border } : {}
                                }, 
                                React.createElement("span", { className: "emoji" }, mood.emoji), mood.name
                                )
                            )
                        )
                    ),
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { htmlFor: "intensity", className: "form-label" }, "Intensity: ",
                            React.createElement("span", { className: "intensity-display", style: { color: selectedMood?.intensityColor } }, intensity, "/10")
                        ),
                        React.createElement("input", {
                            type: "range",
                            id: "intensity",
                            min: "1",
                            max: "10",
                            value: intensity,
                            onChange: (e) => setIntensity(e.target.value),
                            style: { '--accent-primary': selectedMood?.intensityColor }
                        })
                    ),
                    settings.enableStructuredContext && React.createElement(ContextSelector, { context, setContext }),
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { htmlFor: "notes", className: "form-label" }, "Public Notes (optional):"),
                        React.createElement("textarea", {
                            id: "notes",
                            className: "form-textarea",
                            value: notes,
                            onChange: (e) => setNotes(e.target.value),
                            rows: "3",
                            placeholder: "What's on your mind? Any specific events or thoughts?"
                        })
                    ),
                    React.createElement("div", { className: "form-group" },
                        React.createElement("label", { htmlFor: "private-notes", className: "form-label" }, "Private Notes (optional, will be hidden if password is set):"),
                        React.createElement("textarea", {
                            id: "private-notes",
                            className: "form-textarea",
                            value: privateNotes,
                            onChange: (e) => setPrivateNotes(e.target.value),
                            rows: "3",
                            placeholder: "Sensitive details you want to keep private..."
                        })
                    ),
                    React.createElement(TagInput, { 
                        tags: tags, 
                        setTags: setTags, 
                        allTags: allTags,
                        placeholderText: "e.g., work, family, relax"
                    }),
                    settings.enablePhotoAttachments && React.createElement("div", { className: "form-group" },
                        React.createElement("label", { className: "form-label" }, "Attach a Photo (optional, max 1MB)"),
                        React.createElement("input", { type: "file", className: "form-input", accept: "image/*", onChange: handleImageUpload, key: imageUrl }),
                        imageUrl && React.createElement("div", { className: "mt-2" }, 
                           React.createElement("img", { src: imageUrl, className: "image-preview-sm", alt: "Preview"}),
                           React.createElement("button", { type: "button", onClick: () => setImageUrl(null), className: "btn btn-danger btn-sm ms-2" }, "Remove")
                        )
                    ),
                    React.createElement("div", { className: "form-group", style: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' } },
                        React.createElement("button", { 
                            type: "submit", 
                            className: `btn btn-primary ${isSaving ? 'btn-success' : ''}`, 
                            style: { flexGrow: 1 },
                            disabled: isSaving
                        }, isSaving ? "Saving..." : "Log Mood Entry"),
                         React.createElement("button", { 
                            type: "button", 
                            onClick: handleVoiceInput,
                            className: "btn btn-secondary btn-sm",
                            title: "Log with voice (Demo Placeholder)"
                        }, 
                            React.createElement("span", { role: "img", "aria-label": "microphone", style: { fontSize: '1.2em'} }, "🎤")
                        ),
                        React.createElement("button", { 
                            type: "button", 
                            onClick: handleAttachLocation,
                            className: "btn btn-secondary btn-sm",
                            title: "Attach Location",
                            disabled: !settings.enableLocationLogging || !!location
                        }, 
                            React.createElement("span", { role: "img", "aria-label": "location pin", style: { fontSize: '1.2em'} }, location ? '✅' : '📍')
                        )
                    )
                )
            )
        )
    );
}

// --- 3.3 Mood History Components ---

function MoodItemSkeleton() {
    return React.createElement("div", { className: "mood-item-skeleton" },
        React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' } },
            React.createElement("div", { className: "skeleton", style: { width: '40%', height: '24px' } }),
            React.createElement("div", { className: "skeleton", style: { width: '24px', height: '24px', borderRadius: '50%' } })
        ),
        React.createElement("div", { className: "skeleton", style: { width: '60%', height: '16px', marginBottom: 'var(--spacing-3)' } }),
        React.createElement("div", { className: "skeleton", style: { width: '100%', height: '16px', marginBottom: 'var(--spacing-1)' } }),
        React.createElement("div", { className: "skeleton", style: { width: '80%', height: '16px' } })
    );
}

function MoodItem({ entry, moodConfig, onDeleteEntry, onEditEntry, settings, onImageView }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPrivateVisible, setIsPrivateVisible] = useState(false);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [enteredPassword, setEnteredPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [aiSummary, setAiSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState('');

    const isPrivateNotesCollapsible = settings.privateNotesStyle === 'collapsible';
    const [isUnprotectedPrivateVisible, setIsUnprotectedPrivateVisible] = useState(!isPrivateNotesCollapsible);


    if (!moodConfig) {
        moodConfig = { name: 'Unknown', emoji: '❓', colorTheme: { border: 'var(--border-secondary)', text: 'var(--text-primary)' } };
    }

    const words = entry.notes ? entry.notes.split(/\s+/) : [];
    const shouldTruncate = words.length > 15;
    const truncatedNotes = shouldTruncate ? words.slice(0, 15).join(' ') + '...' : entry.notes;

    const handleViewPrivateNotes = () => {
        setShowPasswordPrompt(true);
        setPasswordError('');
    };

    const handlePasswordSubmit = () => {
        if (enteredPassword === settings.notesPassword) {
            setIsPrivateVisible(true);
            setShowPasswordPrompt(false);
            setEnteredPassword('');
            setPasswordError('');
        } else {
            setPasswordError('Incorrect password. Please try again.');
        }
    };

    const handleHidePrivateNotes = () => {
        setIsPrivateVisible(false);
        setEnteredPassword('');
        setPasswordError('');
    };

    const handleGenerateSummary = async () => {
        if (isGeneratingSummary || !settings.aiApiKey) return;

        setIsGeneratingSummary(true);
        setSummaryError('');
        setAiSummary('');

        const combinedNotes = `Mood: ${moodConfig.name}, Intensity: ${entry.intensity}/10.
Notes: ${entry.notes || 'No public notes.'}
` + (entry.privateNotes && (isPrivateVisible || !settings.notesPassword) ? `Private Notes: ${entry.privateNotes}` : '');
        
        try {
            const messages = [
                { role: "system", content: "You are a helpful assistant that summarizes mood diary entries. Provide a concise summary of the user's mood and notes, focusing on the core sentiment and events. Keep it brief, max 50 words. Do not add conversational filler. Start directly with the summary." },
                { role: "user", content: `Summarize the following mood entry:\n\n${combinedNotes}` }
            ];
            const summary = await callDeepSeekAPI(messages, settings.aiApiKey, "openrouter/auto", 100);
            setAiSummary(summary);
        } catch (err) {
            setSummaryError("Failed to generate summary: " + err.message);
        } finally {
            setIsGeneratingSummary(false);
        }
    };
    
    const ApiKeyPrompt = () => (
        React.createElement("div", { className: "api-key-prompt" },
            React.createElement("p", null, 
                "Set your API key in Settings to use AI features. Get a key at ",
                React.createElement("a", { href: "https://openrouter.ai/keys", target: "_blank", rel: "noopener noreferrer" }, "OpenRouter.ai"),
                "."
            )
        )
    );
    
    const WeatherDisplay = ({ weather }) => {
        if (!weather || !weather.condition) return null;
        return React.createElement("div", {
            style: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' }
        },
            React.createElement("img", { src: `https:${weather.icon}`, alt: weather.condition, title: weather.condition, style: { width: '24px', height: '24px' } }),
            React.createElement("span", { className: "text-tertiary", style: { fontSize: '0.9em' } }, `${weather.temp_c}°C, ${weather.condition}`)
        );
    };

    const ContextDisplay = ({ context }) => {
        if (!context || Object.values(context).every(v => !v)) return null;
        const contextItems = [
            { icon: '👥', value: context.people },
            { icon: '📍', value: context.place },
            { icon: '🏃', value: context.activity }
        ].filter(item => item.value);

        return React.createElement("div", { className: "context-display" },
            contextItems.map(item => React.createElement("span", { key: item.value, className: "context-tag", title: item.value }, `${item.icon} ${item.value}`))
        );
    };

    const LocationDisplay = ({ location }) => {
        if (!location) return null;
        return React.createElement("div", { className: "location-display" },
            "📍 ",
            React.createElement("a", {
                href: `https://www.google.com/maps?q=${location.lat},${location.lon}`,
                target: "_blank",
                rel: "noopener noreferrer"
            }, `Location Logged (${location.lat.toFixed(2)}, ${location.lon.toFixed(2)})`)
        );
    };

    return (
        React.createElement("div", { className: "mood-item", style: { borderColor: moodConfig.colorTheme.border } },
            React.createElement("div", { className: "mood-item-header" },
                React.createElement("h3", { className: "mood-item-title", style: { color: moodConfig.colorTheme.text } },
                    React.createElement("span", { className: "emoji" }, moodConfig.emoji),
                    `${moodConfig.name} (Intensity: ${entry.intensity}/10)`
                ),
                React.createElement("div", { className: "mood-item-controls", style: { display: 'flex', gap: 'var(--spacing-2)' } },
                    React.createElement("button", { onClick: () => onEditEntry(entry), className: "btn btn-secondary btn-sm" }, "Edit"),
                    React.createElement("button", { onClick: () => onDeleteEntry(entry.id), className: "delete-btn", title: "Delete this entry" }, "🗑️")
                )
            ),
            React.createElement("p", { className: "timestamp" }, 
                DateTimeUtils.formatTimestamp(entry.timestamp, { dateStyle: 'medium' }) + 
                (entry.exactTime ? ` at ${entry.exactTime}` : ` at ${new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}`)
            ),
            React.createElement(ContextDisplay, { context: entry.context }),
            React.createElement(LocationDisplay, { location: entry.location }),
            React.createElement(WeatherDisplay, { weather: entry.weather }),
            entry.imageUrl && React.createElement("img", { src: entry.imageUrl, alt: "User uploaded photo for this mood entry", className: "mood-item-photo", onClick: () => onImageView(entry.imageUrl) }),
            entry.notes && entry.notes.trim() !== '' && React.createElement("div", { className: "notes-container" },
                React.createElement("h4", { style: { fontSize: '0.9em', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-1)'}}, "Public Notes:"),
                React.createElement("p", { 
                    className: "notes",
                    style: shouldTruncate ? { cursor: 'pointer' } : {},
                    onClick: shouldTruncate ? () => setIsExpanded(!isExpanded) : undefined
                }, 
                    isExpanded ? entry.notes : truncatedNotes,
                    shouldTruncate && React.createElement("span", { 
                        className: "expand-button",
                        style: { 
                            marginLeft: '0.5rem',
                            color: 'var(--accent-primary)',
                            fontSize: '0.9em'
                        }
                    }, 
                        isExpanded ? '(Show Less)' : '(Show More)'
                    )
                )
            ),
            entry.tags && entry.tags.length > 0 &&
                React.createElement("div", { className: "tags-container" },
                    entry.tags.map(tag => React.createElement("span", { key: tag, className: "mood-tag" }, `#${tag}`))
                ),
            
            entry.privateNotes && entry.privateNotes.trim() !== '' && React.createElement("div", { className: "mood-item-private-notes"},
                settings.notesPassword ? (
                    isPrivateVisible ? (
                        React.createElement(React.Fragment, null,
                            React.createElement("h4", null, "Private Notes:"),
                            React.createElement("p", { className: "notes" }, entry.privateNotes),
                            React.createElement("button", { onClick: handleHidePrivateNotes, className: "btn btn-secondary btn-sm" }, "Hide Private Notes")
                        )
                    ) : (
                        React.createElement(React.Fragment, null,
                            React.createElement("button", { onClick: handleViewPrivateNotes, className: "btn btn-secondary btn-sm" }, "View Private Notes 🔒"),
                            showPasswordPrompt && React.createElement("div", { className: "private-notes-prompt-form" },
                                React.createElement("input", { 
                                    type: "password", 
                                    className: "form-input",
                                    value: enteredPassword, 
                                    onChange: (e) => setEnteredPassword(e.target.value), 
                                    placeholder: "Enter password",
                                    autoFocus: true
                                }),
                                React.createElement("button", { onClick: handlePasswordSubmit, className: "btn btn-primary btn-sm" }, "Unlock"),
                                passwordError && React.createElement("p", { className: "error-message" }, passwordError)
                            )
                        )
                    )
                ) : (
                    isUnprotectedPrivateVisible ? 
                    (React.createElement(React.Fragment, null,
                        React.createElement("h4", null, "Private Notes (Unprotected):"),
                        React.createElement("p", { className: "notes" }, entry.privateNotes),
                         isPrivateNotesCollapsible && React.createElement("button", { onClick: () => setIsUnprotectedPrivateVisible(false), className: "btn btn-secondary btn-sm mt-2"}, "Collapse"),
                        React.createElement("p", { className: "setting-description", style: {fontSize: '0.8em', marginTop: 'var(--spacing-1)'}}, "Set a password in Settings to secure these notes.")
                    )) : (
                        React.createElement("button", { onClick: () => setIsUnprotectedPrivateVisible(true), className: "btn btn-secondary btn-sm" }, "View Private Notes")
                    )
                )
            ),
            
            (entry.notes || (entry.privateNotes && (isPrivateVisible || isUnprotectedPrivateVisible))) && React.createElement("div", { className: "ai-summary-section mt-4" },
                !settings.aiApiKey ? React.createElement(ApiKeyPrompt, null) :
                !aiSummary && !isGeneratingSummary && !summaryError ?
                    React.createElement(React.Fragment, null,
                        React.createElement("button", { 
                            onClick: handleGenerateSummary, 
                            className: "btn btn-secondary btn-sm",
                            disabled: isGeneratingSummary
                        }, isGeneratingSummary ? "Generating..." : "Get AI Summary 🤖"),
                        React.createElement("p", { className: "setting-description", style: { fontSize: '0.8em', marginTop: 'var(--spacing-1)', marginBottom: 0 } },
                            "Sends notes to a third-party AI. Use with caution."
                        )
                    ) : null,
                
                isGeneratingSummary && React.createElement("div", { className: "loader" }),
                
                aiSummary && React.createElement("div", { className: "ai-summary-display mood-item-private-notes" },
                    React.createElement("h4", null, "AI Summary:"),
                    React.createElement("p", null, aiSummary),
                    React.createElement("button", { onClick: () => setAiSummary(''), className: "btn btn-secondary btn-sm mt-2" }, "Hide Summary")
                ),
                
                summaryError && React.createElement("p", { className: "error-message" }, summaryError)
            )
        )
    );
}

function MoodEditModal({ isOpen, onClose, onSave, entryToEdit, allTags, settings }) {
    const [editedEntry, setEditedEntry] = useState(null);
    const moodPalette = settings.moodPalette || DEFAULT_MOOD_PALETTE;

    useEffect(() => {
        if (entryToEdit) {
            setEditedEntry(JSON.parse(JSON.stringify(entryToEdit)));
        }
    }, [entryToEdit]);

    if (!isOpen || !editedEntry) return null;

    const handleSave = (e) => {
        e.preventDefault();
        onSave(editedEntry);
        onClose();
    };

    const selectedMood = moodPalette.find(m => m.id === editedEntry.moodId) || moodPalette[0];

    return React.createElement("div", { className: "modal-overlay", onClick: onClose },
        React.createElement("div", { className: "modal-content-wrapper", onClick: e => e.stopPropagation() },
            React.createElement("h2", null, "Edit Mood Entry"),
            React.createElement("p", { className: "text-tertiary" }, DateTimeUtils.formatTimestamp(editedEntry.timestamp)),
            React.createElement("form", { onSubmit: handleSave },
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Select Mood:"),
                    React.createElement("div", { className: "mood-palette" },
                        moodPalette.map(mood =>
                            React.createElement("button", {
                                type: "button",
                                key: mood.id,
                                onClick: () => setEditedEntry({ ...editedEntry, moodId: mood.id }),
                                className: `mood-button ${editedEntry.moodId === mood.id ? 'selected' : ''}`,
                                style: editedEntry.moodId === mood.id ? { backgroundColor: mood.colorTheme.border, borderColor: mood.colorTheme.border } : {}
                            }, 
                            React.createElement("span", { className: "emoji" }, mood.emoji), mood.name
                            )
                        )
                    )
                ),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Intensity: ",
                        React.createElement("span", { className: "intensity-display", style: { color: selectedMood?.intensityColor } }, editedEntry.intensity, "/10")
                    ),
                    React.createElement("input", {
                        type: "range", min: "1", max: "10",
                        value: editedEntry.intensity,
                        onChange: (e) => setEditedEntry({ ...editedEntry, intensity: parseInt(e.target.value, 10) }),
                        style: { '--accent-primary': selectedMood?.intensityColor }
                    })
                ),
                settings.enableStructuredContext && React.createElement(ContextSelector, {
                    context: editedEntry.context || {},
                    setContext: (newContext) => setEditedEntry({ ...editedEntry, context: newContext })
                }),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Public Notes:"),
                    React.createElement("textarea", {
                        className: "form-textarea",
                        value: editedEntry.notes || '',
                        onChange: (e) => setEditedEntry({ ...editedEntry, notes: e.target.value }),
                        rows: "3"
                    })
                ),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Private Notes:"),
                    React.createElement("textarea", {
                        className: "form-textarea",
                        value: editedEntry.privateNotes || '',
                        onChange: (e) => setEditedEntry({ ...editedEntry, privateNotes: e.target.value }),
                        rows: "3"
                    })
                ),
                React.createElement(TagInput, { 
                    tags: editedEntry.tags || [], 
                    setTags: (newTags) => setEditedEntry({ ...editedEntry, tags: newTags }), 
                    allTags: allTags
                }),
                React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' } },
                    React.createElement("button", { type: "button", className: "btn btn-secondary", onClick: onClose }, "Cancel"),
                    React.createElement("button", { type: "submit", className: "btn btn-primary" }, "Save Changes")
                )
            )
        )
    );
}


function MoodHistory({ entries, onDeleteEntry, onEditEntry, settings, isLoading, onImageView }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMoodId, setFilterMoodId] = useState('');
    const [filterTag, setFilterTag] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;
    const moodPalette = settings.moodPalette || DEFAULT_MOOD_PALETTE;

    const moodMap = moodPalette.reduce((acc, mood) => {
        acc[mood.id] = mood;
        return acc;
    }, {});
    
    const allTags = [...new Set(entries.flatMap(entry => entry.tags || []))].sort();

    const filteredEntries = entries
        .filter(entry => {
            const moodConfig = moodMap[entry.moodId];
            const moodName = moodConfig ? moodConfig.name.toLowerCase() : '';
            const notes = entry.notes ? entry.notes.toLowerCase() : '';
            const privateNotes = entry.privateNotes ? entry.privateNotes.toLowerCase() : '';
            const entryTags = entry.tags ? entry.tags.join(' ').toLowerCase() : '';
            const term = searchTerm.toLowerCase();
            
            return (moodName.includes(term) || notes.includes(term) || privateNotes.includes(term) || entryTags.includes(term)) &&
                   (!filterMoodId || entry.moodId === filterMoodId) &&
                   (!filterTag || (entry.tags && entry.tags.includes(filterTag)));
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
    const paginatedEntries = filteredEntries.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (isLoading) {
        return React.createElement("div", { className: "card" },
            React.createElement(MoodItemSkeleton, null),
            React.createElement(MoodItemSkeleton, null)
        );
    }

    if (entries.length === 0) {
        return React.createElement("div", { className: "card text-center" },
            React.createElement("p", null, "No moods logged yet. Start tracking to see your history!")
        );
    }

    return (
        React.createElement("div", { className: "mood-history-wrapper" },
            settings.enableMemoryLane && settings.memoryLaneLocation === 'history' &&
                React.createElement("div", { className: "mb-4" },
                    React.createElement(MemoryLaneCard, { entries: entries, moodPalette: moodPalette })
                ),

            React.createElement("div", { className: "mood-history card" },
                React.createElement("h2", null,
                    React.createElement("span", { className: "section-icon" }, "📜"),
                    settings.interfaceStyle !== 'minimal' && React.createElement("span", { className: "section-title-text" }, "Your Mood Log")
                ),
                React.createElement("div", { className: "filters mb-4", style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-3)'} },
                     React.createElement("div", {className: "form-group"},
                        React.createElement("label", {htmlFor: "search-history", className: "form-label"}, "Search entries:"),
                        React.createElement("input", {
                            type: "text",
                            id: "search-history",
                            className: "form-input",
                            placeholder: "Search by mood, notes, or tags...",
                            value: searchTerm,
                            onChange: (e) => { setSearchTerm(e.target.value); setCurrentPage(1); }
                        })
                    ),
                    React.createElement("div", {className: "form-group"},
                        React.createElement("label", {htmlFor: "filter-mood", className: "form-label"}, "Filter by Mood:"),
                        React.createElement("select", {
                            id: "filter-mood",
                            className: "form-select",
                            value: filterMoodId,
                            onChange: (e) => { setFilterMoodId(e.target.value); setCurrentPage(1); }
                        },
                            React.createElement("option", { value: "" }, "All Moods"),
                            moodPalette.map(mood => React.createElement("option", { key: mood.id, value: mood.id }, mood.emoji, " ", mood.name))
                        )
                    ),
                    allTags.length > 0 && React.createElement("div", {className: "form-group"},
                        React.createElement("label", {htmlFor: "filter-tag", className: "form-label"}, "Filter by Tag:"),
                        React.createElement("select", {
                            id: "filter-tag",
                            className: "form-select",
                            value: filterTag,
                            onChange: (e) => { setFilterTag(e.target.value); setCurrentPage(1); }
                        },
                            React.createElement("option", { value: "" }, "All Tags"),
                            allTags.map(tag => React.createElement("option", { key: tag, value: tag }, "#", tag))
                        )
                    )
                ),
                paginatedEntries.length > 0 ?
                    paginatedEntries.map(entry => React.createElement(MoodItem, {
                        key: entry.id,
                        entry: entry,
                        moodConfig: moodMap[entry.moodId],
                        onDeleteEntry: onDeleteEntry,
                        onEditEntry: onEditEntry,
                        settings: settings,
                        onImageView: onImageView
                    })) :
                    React.createElement("p", { className: "text-center text-tertiary" }, "No entries match your current filters."),
                
                totalPages > 1 && React.createElement("div", { className: "pagination-controls" },
                    React.createElement("button", { 
                        className: "btn btn-secondary btn-sm", 
                        onClick: () => handlePageChange(currentPage - 1), 
                        disabled: currentPage === 1 
                    }, "‹ Previous"),
                    React.createElement("span", { className: "pagination-info" }, `Page ${currentPage} of ${totalPages}`),
                    React.createElement("button", { 
                        className: "btn btn-secondary btn-sm", 
                        onClick: () => handlePageChange(currentPage + 1), 
                        disabled: currentPage === totalPages 
                    }, "Next ›")
                )
            )
        )
    );
}

// --- 3.4 Trends & Visualization Components (Chart.js) ---

function MoodTrendChart({ entries, settings, chartTitle }) {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const moodPalette = settings.moodPalette || DEFAULT_MOOD_PALETTE;
    
    const dataToUse = entries;

    const dailyDataForCheck = dataToUse.reduce((acc, entry) => {
        const date = DateTimeUtils.getStartOfDay(entry.timestamp).toISOString().split('T')[0];
        acc[date] = true;
        return acc;
    }, {});
    const uniqueDaysWithData = Object.keys(dailyDataForCheck).length;

    useEffect(() => {
        if (!dataToUse || !chartRef.current) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }

        if (uniqueDaysWithData < 2) { 
            return;
        }

        const moodMap = moodPalette.reduce((acc, mood) => {
            acc[mood.id] = mood;
            return acc;
        }, {});

        const dailyData = dataToUse.reduce((acc, entry) => {
            const date = DateTimeUtils._parseDate(entry.timestamp);
            if (!date) return acc;
            const dateKey = DateTimeUtils.getStartOfDayISO(date);
            if (!acc[dateKey]) {
                acc[dateKey] = { sumIntensity: 0, count: 0, moods: {} };
            }
            acc[dateKey].sumIntensity += entry.intensity;
            acc[dateKey].count += 1;

            const moodId = entry.moodId;
            if (!acc[dateKey].moods[moodId]) {
                acc[dateKey].moods[moodId] = 0;
            }
            acc[dateKey].moods[moodId]++;
            return acc;
        }, {});

        const sortedDates = Object.keys(dailyData).sort((a, b) => new Date(a) - new Date(b));
        const labels = sortedDates.map(date => DateTimeUtils.formatTimestamp(date, { month: 'short', day: 'numeric' }));
        const dataPoints = sortedDates.map(date => dailyData[date].sumIntensity / dailyData[date].count);

        const pointBackgroundColors = sortedDates.map(date => {
            let dominantMoodId = null;
            let maxCount = 0;
            for (const moodId in dailyData[date].moods) {
                if (dailyData[date].moods[moodId] > maxCount) {
                    maxCount = dailyData[date].moods[moodId];
                    dominantMoodId = moodId;
                }
            }
            return moodMap[dominantMoodId] ? moodMap[dominantMoodId].colorTheme.border : 'var(--accent-primary)';
        });

        const data = {
            labels: labels,
            datasets: [{
                label: `Average Mood Intensity`,
                data: dataPoints,
                fill: false,
                borderColor: 'var(--accent-primary)',
                tension: 0.1,
                pointBackgroundColor: pointBackgroundColors,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { min: 1, max: 10, ticks: { stepSize: 1, color: 'var(--text-secondary)' }, grid: { color: 'var(--border-primary)' } },
                    x: { ticks: { color: 'var(--text-secondary)' }, grid: { display: false } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Avg. Intensity: ${context.parsed.y.toFixed(1)}`,
                            afterBody: function (context) {
                                const dateKey = sortedDates[context[0].dataIndex];
                                const dayMoods = dailyData[dateKey].moods;
                                let moodStrings = [];
                                for (const moodId in dayMoods) {
                                    if (moodMap[moodId]) {
                                        moodStrings.push(`${moodMap[moodId].emoji} ${moodMap[moodId].name}: ${dayMoods[moodId]}`);
                                    }
                                }
                                return moodStrings.length > 0 ? moodStrings : null;
                            }
                        }
                    }
                }
            }
        };

        chartInstanceRef.current = new Chart(chartRef.current, config);

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [dataToUse, uniqueDaysWithData, moodPalette]);

    const renderContent = () => {
        if (dataToUse.length === 0) {
            return React.createElement("p", { className: "text-center text-tertiary" }, "No mood data to display for this period.");
        }
        if (uniqueDaysWithData < 2) {
            return React.createElement("p", { className: "text-center text-tertiary" }, "Not enough data (need logs on at least 2 different days) to show intensity trend.");
        }
        return React.createElement("div", { style: { height: '300px', position: 'relative' } },
            React.createElement("canvas", { ref: chartRef })
        );
    };

    return React.createElement("div", { className: "chart-wrapper" },
        React.createElement("h3", null, chartTitle || "Mood Intensity Trend"),
        renderContent()
    );
}

function MoodDistributionChart({ entries, settings, chartTitle }) {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const moodColors = settings.moodColors || DEFAULT_MOOD_COLORS;
    const moodPalette = settings.moodPalette || DEFAULT_MOOD_PALETTE;


    useEffect(() => {
        if (!entries || !chartRef.current) return;
        
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }

        if (entries.length === 0) {
            return;
        }

        const moodMap = moodPalette.reduce((acc, mood) => {
            acc[mood.id] = mood;
            return acc;
        }, {});

        const moodCounts = entries.reduce((acc, entry) => {
            acc[entry.moodId] = (acc[entry.moodId] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(moodCounts).map(moodId => moodMap[moodId] ? `${moodMap[moodId].emoji} ${moodMap[moodId].name}` : 'Unknown');
        const dataPoints = Object.values(moodCounts);
        
        const backgroundColors = Object.keys(moodCounts).map(moodId => {
            return moodColors[moodId] || DEFAULT_MOOD_COLORS[moodId] || '#cccccc';
        });
        
        const borderColors = backgroundColors;


        const data = {
            labels: labels,
            datasets: [{
                label: 'Mood Distribution',
                data: dataPoints,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2,
                hoverOffset: 15
            }]
        };

        const config = {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'top',
                        labels: { color: 'var(--text-primary)', font: { size: 12 }, padding: 15 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                let value = context.raw;
                                let total = context.chart.getDatasetMeta(0).total;
                                let percentage = ((value / total) * 100).toFixed(1) + '%';
                                return `${label}: ${value} (${percentage})`;
                            }
                        }
                    }
                },
            }
        };

        chartInstanceRef.current = new Chart(chartRef.current, config);
            
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };

    }, [entries, moodColors, moodPalette]);

    const renderContent = () => {
        if (entries.length === 0) {
            return React.createElement("p", {className: "text-center text-tertiary"}, "No moods logged in this period to show distribution.");
        }
        return React.createElement("div", { style: { height: '300px', position: 'relative' } },
            React.createElement("canvas", { ref: chartRef })
        );
    };

    return (
        React.createElement("div", { className: "chart-wrapper" },
            React.createElement("h3", null, chartTitle || "Mood Distribution"),
            renderContent()
        )
    );
}

// --- AI Components for Trends Page ---

function AITrendsSummary({ entries, settings }) {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const moodPalette = settings.moodPalette || DEFAULT_MOOD_PALETTE;
    const moodMap = moodPalette.reduce((acc, mood) => { acc[mood.id] = mood; return acc; }, {});

    const handleGenerateSummary = async () => {
        if (isLoading) return;

        setIsLoading(true);
        setError('');
        setSummary('');

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentEntries = entries
            .filter(entry => new Date(entry.timestamp) >= thirtyDaysAgo)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        if (recentEntries.length < 3) {
            setError("Not enough data in the last 30 days to generate a meaningful summary. Need at least 3 entries.");
            setIsLoading(false);
            return;
        }

        const dataSummary = recentEntries.map(entry => {
            const moodName = moodMap[entry.moodId]?.name || 'Unknown';
            let entryString = `${DateTimeUtils.formatTimestamp(entry.timestamp, {month: 'short', day: 'numeric'})}: Felt ${moodName} (Intensity: ${entry.intensity}/10).`;
            if (entry.notes) entryString += ` Notes: "${entry.notes.substring(0, 50)}${entry.notes.length > 50 ? '...' : ''}"`;
            if (entry.tags?.length) entryString += ` Tags: ${entry.tags.join(', ')}.`;
            return entryString;
        }).join('\n');

        try {
            const messages = [
                { role: "system", content: "You are a thoughtful mood analysis assistant. Based on the provided mood log data, identify 2-3 high-level patterns or trends. For example, mention common moods, connections between tags and feelings, or trends on certain days. Keep the summary concise, positive, and insightful. Do not give medical advice. Frame it as observations. Start directly with the analysis." },
                { role: "user", content: `Here is my mood log data for the last 30 days. Please provide a brief analysis of the trends:\n\n${dataSummary}` }
            ];
            const result = await callDeepSeekAPI(messages, settings.aiApiKey, "openrouter/auto", 200);
            setSummary(result);
        } catch (err) {
            setError("Failed to generate summary: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const ApiKeyPrompt = () => (
        React.createElement("div", { className: "api-key-prompt" },
            React.createElement("p", null, 
                "To use the AI Summary, please set your API key in Settings. Get a key from ",
                React.createElement("a", { href: "https://openrouter.ai/keys", target: "_blank", rel: "noopener noreferrer" }, "OpenRouter.ai"),
                "."
            )
        )
    );

    return React.createElement("div", { className: "card mt-6" },
        React.createElement("h3", { className: "mb-2" }, "AI Trends Analysis"),
        React.createElement("p", { className: "text-tertiary" }, "Get an AI-powered summary of your mood patterns over the last 30 days."),
        !settings.aiApiKey ? React.createElement(ApiKeyPrompt, null) : 
        (
            !summary && !isLoading && !error &&
                React.createElement("button", { onClick: handleGenerateSummary, className: "btn btn-secondary mt-2" }, "Generate AI Summary 🧠")
        ),
        isLoading && React.createElement("div", { className: "loader" }),
        error && React.createElement("p", { className: "error-message mt-2" }, error),
        summary && React.createElement("div", { className: "mood-item-private-notes mt-4" },
            React.createElement("p", { style: { whiteSpace: 'pre-wrap'}}, summary),
            React.createElement("button", { onClick: () => setSummary(''), className: "btn btn-secondary btn-sm mt-2" }, "Clear Summary")
        )
    );
}

function MoodTherapistChatbot({ settings, events, goals, measurables, measurableLogs, onSaveConversation }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm Mood-Therapist, your supportive AI companion. How are you feeling today? Feel free to share what's on your mind." }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSharingContext, setIsSharingContext] = useState(false);
    const [isSharingEvents, setIsSharingEvents] = useState(false);
    const [isSharingGoals, setIsSharingGoals] = useState(false);
    const [isSharingMeasurables, setIsSharingMeasurables] = useState(false);

    const messagesEndRef = useRef(null);
    const isInitialMount = useRef(true);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            scrollToBottom();
        }
    }, [messages]);

    const handleShareContext = () => {
        const aboutMeNotes = settings.aboutMeNotes || [];
        if (aboutMeNotes.length === 0) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Your 'About Me' section is empty. Please add some notes in your Profile, then you can share them with me." }]);
            return;
        }
        setIsSharingContext(true);
        setMessages(prev => [...prev, { role: 'assistant', content: "Great! I'll consider your 'About Me' notes in my next response. What's on your mind?" }]);
    };
    
    const handleShareEvents = () => {
        const today = new Date();
        const upcomingEvents = events.filter(event => {
            const startDate = new Date(event.startDate);
            return (event.recurrence === 'one-time' && startDate >= today) || 
                   (event.recurrence !== 'one-time' && (!event.endDate || new Date(event.endDate) >= today));
        });

        if (upcomingEvents.length === 0) {
            setMessages(prev => [...prev, { role: 'assistant', content: "You don't have any upcoming events saved. You can add them in the Calendar view." }]);
            return;
        }

        setIsSharingEvents(true);
        setMessages(prev => [...prev, { role: 'assistant', content: "Okay, I'll keep your upcoming events in mind during our chat. What would you like to talk about?" }]);
    };
    
    const handleShareGoals = () => {
        if (goals.length === 0) {
            setMessages(prev => [...prev, { role: 'assistant', content: "You don't have any goals set up. You can add them in the Goals view." }]);
            return;
        }
        setIsSharingGoals(true);
        setMessages(prev => [...prev, { role: 'assistant', content: "Okay, I'll consider your goals in my next response. How can I help?" }]);
    };

    const handleShareMeasurables = () => {
        if (measurableLogs.length === 0) {
            setMessages(prev => [...prev, { role: 'assistant', content: "You haven't logged any data for your measurables yet. Once you do, you can share the context with me." }]);
            return;
        }
        setIsSharingMeasurables(true);
        setMessages(prev => [...prev, { role: 'assistant', content: "Great! I'll take your recent measurable data into account. What's on your mind?" }]);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !settings.aiApiKey) return;

        const newUserMessage = { role: 'user', content: userInput.trim() };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const systemPrompt = {
                role: 'system',
                content: "You are Mood-Therapist, an empathetic and supportive AI companion. Your goal is to listen, validate feelings, and offer general, positive encouragement. You must not give medical advice or act as a real therapist. Keep your responses caring but concise. If the user mentions anything about self-harm or severe crisis, you must gently and immediately guide them to seek professional help by providing a message like: 'It sounds like you are going through a very difficult time. For immediate support, please contact a crisis hotline or a mental health professional. You are not alone, and help is available.'"
            };
            const apiMessages = [systemPrompt, ...updatedMessages.slice(-10)];
            
            if (isSharingContext) {
                const aboutMeNotes = settings.aboutMeNotes || [];
                const contextString = aboutMeNotes.map(note => `[${note.title}]\n${note.content}`).join('\n\n');
                const contextMessage = { 
                    role: "user", 
                    content: `For context, here is some information I've written about myself. Use this to better understand me, but do not state that you're using it unless I ask:\n\n---\n${contextString}\n---`
                };
                apiMessages.splice(1, 0, contextMessage); 
                setIsSharingContext(false);
            }

            if (isSharingEvents) {
                const today = new Date();
                const upcomingEvents = events.filter(event => {
                    const startDate = new Date(event.startDate);
                    return (event.recurrence === 'one-time' && startDate >= today) || 
                           (event.recurrence !== 'one-time' && (!event.endDate || new Date(event.endDate) >= today));
                });
                const eventsString = upcomingEvents.map(e => `- ${e.title} (Starts: ${DateTimeUtils.formatTimestamp(e.startDate, {dateStyle: 'medium'})}, Recurrence: ${e.recurrence})`).join('\n');
                const contextMessage = { 
                    role: "user", 
                    content: `For context, here are some of my upcoming events. Please consider these in our conversation:\n\n---\n${eventsString}\n---`
                };
                apiMessages.splice(1, 0, contextMessage);
                setIsSharingEvents(false);
            }

            if (isSharingGoals) {
                const goalSummary = goals.map(g => `- Goal: ${g.title} (Status: ${g.status}). Description: ${g.description}`).join('\n');
                const contextMessage = { 
                    role: "user", 
                    content: `Here is a summary of my current wellness goals for context:\n\n---\n${goalSummary}\n---`
                };
                apiMessages.splice(1, 0, contextMessage);
                setIsSharingGoals(false);
            }

            if (isSharingMeasurables) {
                const measurableMap = measurables.reduce((acc, m) => ({ ...acc, [m.id]: m }), {});
                const recentLogs = measurableLogs.slice(-20);
                const logsSummary = recentLogs.map(log => {
                    const m = measurableMap[log.measurableId];
                    if (!m) return null;
                    const valueStr = m.type === 'duration' ? DateTimeUtils.formatDuration(log.value) : `${log.value} ${m.unit}`;
                    return `- Logged ${valueStr} of ${m.name} on ${DateTimeUtils.formatTimestamp(log.endTimestamp, {dateStyle: 'short'})}.`;
                }).filter(Boolean).join('\n');

                if (logsSummary) {
                    const contextMessage = { 
                        role: "user", 
                        content: `Here is a summary of my recent measurable logs for context:\n\n---\n${logsSummary}\n---`
                    };
                    apiMessages.splice(1, 0, contextMessage);
                }
                setIsSharingMeasurables(false);
            }

            const aiResponse = await callDeepSeekAPI(apiMessages, settings.aiApiKey, "openrouter/auto", 150);
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a little trouble connecting right now. Please try again in a moment." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const ApiKeyPrompt = () => (
        React.createElement("div", { className: "api-key-prompt" },
             React.createElement("p", null, 
                "To use the Chatbot, please set your API key in Settings. Get a key from ",
                React.createElement("a", { href: "https://openrouter.ai/keys", target: "_blank", rel: "noopener noreferrer" }, "OpenRouter.ai"),
                "."
            )
        )
    );
    
    return React.createElement("div", { className: "card mt-6" },
        React.createElement("h3", { className: "mb-0" }, "Chat with Mood-Therapist"),
        React.createElement("p", { className: "setting-description", style: { color: '#EF4444', fontWeight: 'bold' } }, 
            "Disclaimer: This is an AI and not a real therapist. It is for supportive listening only. For crisis support, please contact a professional."
        ),
        React.createElement("div", { className: "chatbot-layout-container mt-4" },
            React.createElement("div", { className: "chatbot-sidebar-buttons" },
                React.createElement("button", {
                    type: "button",
                    onClick: () => onSaveConversation(messages),
                    className: "btn btn-secondary btn-sm",
                    title: "Save this conversation to your history",
                    disabled: isLoading || messages.length <= 1
                }, "💾"),
                React.createElement("button", {
                    type: "button",
                    onClick: handleShareContext,
                    className: "btn btn-secondary btn-sm",
                    title: "Share 'About Me' notes with AI for this conversation",
                    disabled: isLoading
                }, "🧠"),
                React.createElement("button", {
                    type: "button",
                    onClick: handleShareEvents,
                    className: "btn btn-secondary btn-sm",
                    title: "Share upcoming events with AI",
                    disabled: isLoading
                }, "📅"),
                React.createElement("button", {
                    type: "button",
                    onClick: handleShareGoals,
                    className: "btn btn-secondary btn-sm",
                    title: "Share Goals data with AI",
                    disabled: isLoading
                }, "🎯"),
                React.createElement("button", {
                    type: "button",
                    onClick: handleShareMeasurables,
                    className: "btn btn-secondary btn-sm",
                    title: "Share Measurables data with AI",
                    disabled: isLoading
                }, "📏")
            ),
            React.createElement("div", { className: "chatbot-main-content" },
                React.createElement("div", { className: "chatbot-messages" },
                    messages.map((msg, index) => React.createElement("div", {
                        key: index,
                        className: `chat-message ${msg.role}`
                    }, msg.content)),
                    isLoading && React.createElement("div", { className: "chat-message assistant" }, 
                        React.createElement("div", { className: "loader", style: {margin: '0 auto'} })
                    ),
                    React.createElement("div", { ref: messagesEndRef })
                ),
                !settings.aiApiKey ? React.createElement(ApiKeyPrompt, null) :
                React.createElement("form", { onSubmit: handleSendMessage, className: "chatbot-input-form" },
                    React.createElement("input", {
                        type: "text",
                        className: "form-input",
                        value: userInput,
                        onChange: e => setUserInput(e.target.value),
                        placeholder: "Type your message...",
                        disabled: isLoading || !settings.aiApiKey
                    }),
                    React.createElement("button", { type: "submit", className: "btn btn-primary", disabled: isLoading || !userInput.trim() }, "Send")
                )
            )
        )
    );
}

function TagCorrelations({ entries, settings }) {
    const moodPalette = settings.moodPalette || DEFAULT_MOOD_PALETTE;
    const moodMap = moodPalette.reduce((acc, m) => ({...acc, [m.id]: m}), {});

    const correlations = useMemo(() => {
        const tagMoodCounts = {};
        entries.forEach(entry => {
            if (entry.tags && entry.tags.length > 0) {
                entry.tags.forEach(tag => {
                    if (!tagMoodCounts[tag]) {
                        tagMoodCounts[tag] = {};
                    }
                    tagMoodCounts[tag][entry.moodId] = (tagMoodCounts[tag][entry.moodId] || 0) + 1;
                });
            }
        });

        const results = [];
        for (const tag in tagMoodCounts) {
            let mostFrequentMoodId = null;
            let maxCount = 0;
            for (const moodId in tagMoodCounts[tag]) {
                if (tagMoodCounts[tag][moodId] > maxCount) {
                    maxCount = tagMoodCounts[tag][moodId];
                    mostFrequentMoodId = moodId;
                }
            }
            if (mostFrequentMoodId && moodMap[mostFrequentMoodId]) {
                results.push({
                    tag: tag,
                    mood: moodMap[mostFrequentMoodId],
                    count: maxCount,
                });
            }
        }
        return results.sort((a,b) => b.count - a.count).slice(0, 5);
    }, [entries, moodPalette]);

    if (correlations.length === 0) return null;

    return React.createElement("div", { className: "tag-correlations-card" },
        React.createElement("h3", null, "Tag & Mood Correlations"),
        React.createElement("p", { className: "text-tertiary" }, "See which feelings are most often linked to your tags."),
        correlations.map(corr => 
            React.createElement("div", { key: corr.tag, className: "correlation-item" },
                `The tag `,
                React.createElement("span", { className: "tag-name" }, `#${corr.tag}`),
                ` is most frequently associated with feeling `,
                React.createElement("span", { className: "mood-name", style: { color: corr.mood.colorTheme.text } }, `${corr.mood.emoji} ${corr.mood.name}`),
                ` (${corr.count} times).`
            )
        )
    );
}

function CorrelationChart({ entries, measurables, measurableLogs, settings }) {
    const [selectedMeasurableId, setSelectedMeasurableId] = useState(measurables.length > 0 ? measurables[0].id : '');
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const moodPalette = settings.moodPalette || DEFAULT_MOOD_PALETTE;

    const data = useMemo(() => {
        if (!selectedMeasurableId) return [];

        const moodMap = moodPalette.reduce((acc, mood) => ({ ...acc, [mood.id]: mood }), {});
        const dailyMoods = entries.reduce((acc, entry) => {
            const date = DateTimeUtils._parseDate(entry.timestamp);
            if (!date) return acc;
            const dateKey = DateTimeUtils.getStartOfDayISO(date);
            if (!acc[dateKey]) acc[dateKey] = { sum: 0, count: 0 };
            acc[dateKey].sum += entry.intensity;
            acc[dateKey].count++;
            return acc;
        }, {});

        const dailyMeasurables = measurableLogs
            .filter(log => log.measurableId === selectedMeasurableId)
            .reduce((acc, log) => {
                const date = DateTimeUtils._parseDate(log.endTimestamp);
                if (!date) return acc;
                const dateKey = DateTimeUtils.getStartOfDayISO(date);
                const value = measurables.find(m => m.id === selectedMeasurableId)?.type === 'duration'
                    ? DateTimeUtils.durationToHours(log.value)
                    : log.value;
                if (!acc[dateKey]) acc[dateKey] = { sum: 0, count: 0 };
                acc[dateKey].sum += value;
                acc[dateKey].count++;
                return acc;
            }, {});

        const correlationData = [];
        for (const date in dailyMoods) {
            if (dailyMeasurables[date]) {
                correlationData.push({
                    x: dailyMeasurables[date].sum / dailyMeasurables[date].count,
                    y: dailyMoods[date].sum / dailyMoods[date].count,
                });
            }
        }
        return correlationData;
    }, [selectedMeasurableId, entries, measurableLogs, measurables, moodPalette]);

    useEffect(() => {
        if (!chartRef.current) return;
        if (chartInstance.current) chartInstance.current.destroy();

        if (data.length < 2) return;

        const selectedMeasurable = measurables.find(m => m.id === selectedMeasurableId);

        chartInstance.current = new Chart(chartRef.current, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Daily Correlation',
                    data: data,
                    backgroundColor: 'rgba(var(--accent-primary-rgb), 0.7)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: `${selectedMeasurable?.name} (${selectedMeasurable?.type === 'duration' ? 'hours' : selectedMeasurable?.unit})` }
                    },
                    y: {
                        title: { display: true, text: 'Average Mood Intensity' },
                        min: 1,
                        max: 10
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `Mood: ${ctx.raw.y.toFixed(1)}, ${selectedMeasurable?.name}: ${ctx.raw.x.toFixed(1)}`
                        }
                    }
                }
            }
        });
    }, [data, selectedMeasurableId, measurables]);

    if (measurables.length === 0) return null;

    return React.createElement("div", { className: "chart-wrapper" },
        React.createElement("h3", null, "Mood vs. Activity Correlation"),
        React.createElement("div", { className: "form-group" },
            React.createElement("label", { className: "form-label" }, "Correlate mood with:"),
            React.createElement("select", {
                className: "form-select",
                value: selectedMeasurableId,
                onChange: e => setSelectedMeasurableId(e.target.value)
            }, measurables.map(m => React.createElement("option", { key: m.id, value: m.id }, `${m.icon} ${m.name}`)))
        ),
        React.createElement("div", { style: { height: '300px', position: 'relative' } },
            data.length < 2
                ? React.createElement("p", { className: "text-center text-tertiary" }, "Need at least 2 days with both mood and activity logs to show correlation.")
                : React.createElement("canvas", { ref: chartRef })
        )
    );
}

function TrendsView({ entries, settings, events, goals, measurables, measurableLogs, onSaveConversation }) {
    const [timeRange, setTimeRange] = useState('1m');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    useEffect(() => {
        if (timeRange !== 'custom') {
            setCustomStart('');
            setCustomEnd('');
        }
    }, [timeRange]);

    const filteredData = useMemo(() => {
        const now = new Date();
        let startDate = new Date();
        let title = "Trends";

        switch (timeRange) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                title = "Last 7 Days";
                break;
            case '1m':
                startDate.setMonth(now.getMonth() - 1);
                title = "Last Month";
                break;
            case '6m':
                startDate.setMonth(now.getMonth() - 6);
                title = "Last 6 Months";
                break;
            case 'custom':
                if (customStart && customEnd) {
                    const start = new Date(customStart + "T00:00:00");
                    const end = new Date(customEnd + "T23:59:59");
                     title = `From ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;
                    const filtered = entries.filter(e => {
                        const entryDate = new Date(e.timestamp);
                        return entryDate >= start && entryDate <= end;
                    });
                    return { entries: filtered, title: title };
                }
                return { entries: entries, title: "All Time" };
            case 'all':
            default:
                return { entries: entries, title: "All Time" };
        }
        
        const filteredEntries = entries.filter(e => new Date(e.timestamp) >= startDate);
        return { entries: filteredEntries, title: title };

    }, [entries, timeRange, customStart, customEnd]);
    
    if (entries.length === 0 ) {
         return React.createElement("div", { className: "card text-center" },
            React.createElement("h2", null,
                React.createElement("span", { className: "section-icon" }, "📊"),
                settings.interfaceStyle !== 'minimal' && React.createElement("span", { className: "section-title-text" }, "Mood Trends")
            ),
            React.createElement("p", null, "Log some moods to see your trends and patterns.")
        );
    }
    
    const AiFeaturesNotice = () => (
        React.createElement("div", { 
            className: "card", 
            style: { 
                marginTop: 'var(--spacing-6)', 
                backgroundColor: 'var(--mood-anxious-bg)', 
                border: '2px solid var(--mood-anxious-border)' 
            } 
        },
            React.createElement("h3", { 
                style: { 
                    color: 'var(--mood-anxious-text)', 
                } 
            }, 
                React.createElement("span", { className: "section-icon", role: "img", "aria-label": "brain" }, "🧠"),
                React.createElement("span", { className: "section-title-text" }, "AI Features & Your Privacy")
            ),
            React.createElement("p", { style: { color: 'var(--mood-anxious-text)', margin: 0 } },
                "Using the AI Summary and Chatbot features sends your notes and chat messages to a third-party AI service (via OpenRouter.ai) for processing. ",
                React.createElement("strong", null, "Please avoid sharing highly sensitive personal information."),
                " Your API key is stored locally in your browser and is never shared with us."
            )
        )
    );
    
    return (
        React.createElement("div", { className: "trends-view" },
            React.createElement("div", { className: "card" },
                React.createElement("h2", { className: "mb-4 text-center", style: { display: 'block' } },
                    React.createElement("span", { className: "section-icon" }, "📊"),
                    settings.interfaceStyle !== 'minimal' && React.createElement("span", { className: "section-title-text" }, " Your Mood Visualizations")
                ),
                React.createElement("div", { className: "trends-filter-controls" },
                    ['7d', '1m', '6m', 'all', 'custom'].map(range => 
                        React.createElement("button", {
                            key: range,
                            className: `btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-secondary'}`,
                            onClick: () => setTimeRange(range)
                        }, 
                        range === '7d' ? '1 Week' : 
                        range === '1m' ? '1 Month' :
                        range === '6m' ? '6 Months' :
                        range === 'all' ? 'All Time' : 'Custom'
                        )
                    )
                ),
                timeRange === 'custom' && React.createElement("div", { className: "trends-filter-controls" },
                    React.createElement("label", { className: "form-label mb-0" }, "From:"),
                    React.createElement("input", { type: "date", className: "form-input", value: customStart, onChange: e => setCustomStart(e.target.value) }),
                    React.createElement("label", { className: "form-label mb-0" }, "To:"),
                    React.createElement("input", { type: "date", className: "form-input", value: customEnd, onChange: e => setCustomEnd(e.target.value), min: customStart })
                ),
                React.createElement("div", { className: "charts-container" },
                    React.createElement(MoodTrendChart, { entries: filteredData.entries, settings: settings, chartTitle: `Mood Intensity Trend (${filteredData.title})` }),
                    React.createElement(MoodDistributionChart, { entries: filteredData.entries, settings: settings, chartTitle: `Mood Distribution (${filteredData.title})` }),
                    React.createElement(TagCorrelations, { entries: filteredData.entries, settings: settings }),
                    React.createElement(CorrelationChart, { entries: entries, measurables: measurables, measurableLogs: measurableLogs, settings: settings })
                )
            ),
            React.createElement(AiFeaturesNotice, null),
            React.createElement(AITrendsSummary, { entries: entries, settings: settings }),
            React.createElement(MoodTherapistChatbot, { settings, events, goals, measurables, measurableLogs, onSaveConversation })
        )
    );
}

// --- 3.5 Calendar View ---
const EmojiSuggestions = ({ onSelect }) => {
    const suggestions = ['📝', '💼', '🎂', '🎉', '✈️', '🩺', '❤️', '🎓', '💰', '💪', '🧘'];
    return React.createElement("div", { className: "emoji-suggestions" },
        suggestions.map(emoji => 
            React.createElement("span", {
                key: emoji,
                className: "emoji-suggestion",
                onClick: () => onSelect(emoji)
            }, emoji)
        )
    );
};

function EventModal({ isOpen, onClose, onSave, eventToEdit, dateForNewEvent, allEventTags }) {
    const [event, setEvent] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const initialDateString = dateForNewEvent ? DateTimeUtils._parseDate(dateForNewEvent) : '';
            const initialEvent = eventToEdit ? 
                { ...eventToEdit } : 
                {
                    title: '',
                    notes: '',
                    startDate: initialDateString,
                    endDate: '',
                    recurrence: 'one-time',
                    reminder: 'none',
                    imageUrl: null,
                    tags: [],
                };
            setEvent(initialEvent);
        }
    }, [isOpen, eventToEdit, dateForNewEvent]);

    if (!isOpen || !event) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEvent({ ...event, [name]: value });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 500 * 1024) { 
            alert("Image is too large. Please choose a file smaller than 500KB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (loadEvent) => setEvent({ ...event, imageUrl: loadEvent.target.result });
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (!event.title.trim()) {
            alert("Please enter an event title.");
            return;
        }
        onSave(event);
    };
    
    return React.createElement("div", { className: "modal-overlay", onClick: onClose },
        React.createElement("div", { className: "modal-content-wrapper", onClick: e => e.stopPropagation() },
            React.createElement("h2", null, event.id ? "Edit Event" : "Add Event"),
            React.createElement("div", { className: "form-group" },
                React.createElement("label", { className: "form-label" }, "Title"),
                React.createElement("input", { type: "text", name: "title", className: "form-input", value: event.title, onChange: handleInputChange, autoFocus: true })
            ),
            React.createElement("div", { className: "form-group" },
                React.createElement("label", { className: "form-label" }, "Notes"),
                React.createElement("textarea", { name: "notes", className: "form-textarea", value: event.notes, onChange: handleInputChange })
            ),
            React.createElement(TagInput, {
                tags: event.tags || [],
                setTags: (newTags) => setEvent({ ...event, tags: newTags }),
                allTags: allEventTags,
                placeholderText: "e.g., birthday, test, meeting"
            }),
            React.createElement("div", { className: "form-group" },
                React.createElement("label", { className: "form-label" }, "Image/GIF (max 500KB)"),
                React.createElement("input", { type: "file", className: "form-input", accept: "image/*", ref: fileInputRef, onChange: handleImageUpload }),
                event.imageUrl && React.createElement("div", {className: "mt-2", style: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'} },
                    React.createElement("img", { src: event.imageUrl, style: { maxWidth: '100px', maxHeight: '100px', borderRadius: 'var(--border-radius-sm)' } }),
                    React.createElement("button", { onClick: () => { setEvent({...event, imageUrl: null }); if(fileInputRef.current) fileInputRef.current.value = ""; }, className: "btn btn-danger btn-sm" }, "Remove")
                 )
            ),
            React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' } },
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Start Date"),
                    React.createElement("input", { type: "date", name: "startDate", className: "form-input", value: event.startDate, onChange: handleInputChange })
                ),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Recurrence"),
                    React.createElement("select", { name: "recurrence", className: "form-select", value: event.recurrence, onChange: handleInputChange },
                        React.createElement("option", { value: "one-time" }, "One-time"),
                        React.createElement("option", { value: "daily" }, "Daily"),
                        React.createElement("option", { value: "alternate" }, "Alternate Days"),
                        React.createElement("option", { value: "weekly" }, "Weekly"),
                        React.createElement("option", { value: "monthly" }, "Monthly"),
                        React.createElement("option", { value: "yearly" }, "Yearly")
                    )
                )
            ),
            event.recurrence !== 'one-time' && React.createElement("div", { className: "form-group" },
                React.createElement("label", { className: "form-label" }, "End Date (optional)"),
                React.createElement("input", { type: "date", name: "endDate", className: "form-input", value: event.endDate || '', onChange: handleInputChange, min: event.startDate })
            ),
            React.createElement("div", { className: "form-group" },
                React.createElement("label", { className: "form-label" }, "Reminder"),
                React.createElement("select", { name: "reminder", className: "form-select", value: event.reminder || 'none', onChange: handleInputChange },
                    React.createElement("option", { value: "none" }, "No Reminder"),
                    React.createElement("option", { value: "on-day" }, "On the day of the event (at 9am)"),
                    React.createElement("option", { value: "1-day-before" }, "1 day before")
                )
            ),
            React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' } },
                React.createElement("button", { className: "btn btn-secondary", onClick: onClose }, "Cancel"),
                React.createElement("button", { className: "btn btn-primary", onClick: handleSave }, "Save Event")
            )
        )
    );
}

function CalendarView({ entries, events, goals, settings, onAddOrUpdateEvent, onDeleteEvent, allEventTags, onImageView, onUpdateGoals }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const moodPalette = settings.moodPalette || DEFAULT_MOOD_PALETTE;

    const moodMap = moodPalette.reduce((acc, mood) => {
        acc[mood.id] = mood;
        return acc;
    }, {});

    const openEventModalForNew = (date) => {
        setSelectedDate(date);
        setSelectedEvent(null);
        setIsEventModalOpen(true);
    };

    const openEventModalForEdit = (event) => {
        setSelectedDate(null);
        setSelectedEvent(event);
        setIsEventModalOpen(true);
    };
    
    const closeEventModal = () => {
        setIsEventModalOpen(false);
        setSelectedDate(null);
        setSelectedEvent(null);
    };
    
    const handleSaveEvent = (eventData) => {
        onAddOrUpdateEvent(eventData);
        closeEventModal();
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = DateTimeUtils.getDaysInMonth(year, month);
    const firstDayOffset = DateTimeUtils.getFirstDayOfMonth(year, month);

    const calendarDays = [];
    for (let i = 0; i < firstDayOffset; i++) {
        calendarDays.push({ key: `empty-${i}`, isEmpty: true });
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const dayISO = DateTimeUtils.getStartOfDayISO(dayDate);
        const dayEntries = entries.filter(entry => DateTimeUtils.isSameDay(entry.timestamp, dayDate));
        const dayEvents = EventUtils.getEventsForDay(dayDate, events);
        
        let goalStatus = null;
        if (settings.showGoals) {
            const activeGoalsForDay = goals.filter(g => g.status === 'active' && dayISO >= g.startDate && (!g.endDate || dayISO <= g.endDate));
            if (activeGoalsForDay.length > 0) {
                const checkedInGoals = activeGoalsForDay.filter(g => g.progress && g.progress.hasOwnProperty(dayISO));
                if (checkedInGoals.length > 0) {
                    goalStatus = checkedInGoals.every(g => g.progress[dayISO] === true) ? 'met' : 'missed';
                }
            }
        }

        calendarDays.push({
            key: `day-${day}`,
            dayNumber: day,
            date: dayDate,
            isCurrentDay: DateTimeUtils.isSameDay(dayDate, new Date()),
            moods: dayEntries.map(e => moodMap[e.moodId]).filter(Boolean),
            hasEvents: dayEvents.length > 0,
            goalStatus: goalStatus,
        });
    }

    const changeMonth = (offset) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const eventsThisMonth = useMemo(() => {
        const uniqueEvents = new Map();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(year, month, day);
            const dayEvents = EventUtils.getEventsForDay(dayDate, events);
            dayEvents.forEach(event => {
                if (!uniqueEvents.has(event.id)) {
                    uniqueEvents.set(event.id, event);
                }
            });
        }
        return Array.from(uniqueEvents.values()).sort((a,b) => new Date(a.startDate) - new Date(b.startDate));
    }, [year, month, daysInMonth, events]);

    return (
        React.createElement(React.Fragment, null,
            React.createElement("div", { className: "calendar-container card" },
                React.createElement("div", { className: "calendar-header" },
                    React.createElement("button", { onClick: () => changeMonth(-1), className: "btn btn-secondary btn-sm" }, "‹ Prev"),
                    React.createElement("h3", { style: { flexGrow: 1, textAlign: 'center' }}, currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })),
                    React.createElement("button", { onClick: () => changeMonth(1), className: "btn btn-secondary btn-sm" }, "Next ›")
                ),
                React.createElement("div", { className: "calendar-grid" },
                    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName =>
                        React.createElement("div", { key: dayName, className: "calendar-day-name" }, dayName.substring(0,3))
                    ),
                    calendarDays.map(dayInfo =>
                        dayInfo.isEmpty ?
                            React.createElement("div", { key: dayInfo.key, className: "calendar-day other-month" }) :
                            React.createElement("div", {
                                key: dayInfo.key,
                                className: `calendar-day ${dayInfo.isCurrentDay ? 'current-day' : ''}`,
                                onClick: () => openEventModalForNew(dayInfo.date),
                                title: `Add event for ${dayInfo.date.toLocaleDateString()}`
                            },
                                React.createElement("span", { className: "day-number" }, dayInfo.dayNumber),
                                React.createElement("div", { className: "day-icons-container" },
                                    dayInfo.goalStatus === 'met' && React.createElement("span", {className: "day-goal-icon", title:"Goals Met"}, "✅"),
                                    dayInfo.goalStatus === 'missed' && React.createElement("span", {className: "day-goal-icon", title:"Goal Missed"}, "❌"),
                                    React.createElement("div", { style: {flexGrow: 1}}), 
                                    dayInfo.hasEvents && React.createElement("span", { title: "Event marked" }, "📌"),
                                ),
                                dayInfo.moods.length > 0 &&
                                    React.createElement("div", { className: "mood-dots-container" },
                                        dayInfo.moods.slice(0, 4).map((mood, index) =>
                                            React.createElement("div", {
                                                key: `${dayInfo.key}-mood-${index}`,
                                                className: "mood-dot",
                                                style: { backgroundColor: mood.colorTheme.border },
                                                title: mood.name
                                            })
                                        )
                                    )
                            )
                    )
                )
            ),
            React.createElement("div", { className: "card mt-6" },
                React.createElement("h3", null,
                    React.createElement("span", { className: "section-icon" }, "📌"),
                    settings.interfaceStyle !== 'minimal' && React.createElement("span", { className: "section-title-text" }, `Marked Events for ${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`)
                ),
                eventsThisMonth.length > 0 ?
                React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)'} }, 
                    eventsThisMonth.map(event =>
                        React.createElement("div", { key: event.id, className: "mood-item", style: { padding: 'var(--spacing-3)', borderLeft: '5px solid var(--accent-secondary)' } },
                            React.createElement("div", { className: "mood-item-header" },
                                React.createElement("h4", { className: "mood-item-title" }, event.title),
                                React.createElement("div", { style: {display: 'flex', gap: 'var(--spacing-2)'} },
                                    React.createElement("button", { onClick: () => openEventModalForEdit(event), className: "btn btn-secondary btn-sm" }, "Edit"),
                                    React.createElement("button", { onClick: () => {
                                        SoundUtils.playSound('audio-delete', settings);
                                        onDeleteEvent(event.id);
                                    }, className: "btn btn-danger btn-sm" }, "Delete")
                                )
                            ),
                            React.createElement("p", { className: "timestamp" }, 
                                `Starts: ${DateTimeUtils.formatTimestamp(event.startDate, {dateStyle: 'long'})}. Recurrence: ${event.recurrence}.`
                            ),
                            event.notes && React.createElement("p", { className: "notes", style: { margin: 'var(--spacing-2) 0' } }, event.notes),
                            event.tags && event.tags.length > 0 &&
                                React.createElement("div", { className: "tags-container", style: {marginBottom: 'var(--spacing-2)'} },
                                    event.tags.map(tag => React.createElement("span", { key: tag, className: "mood-tag" }, `#${tag}`))
                                ),
                            event.imageUrl && React.createElement("img", { src: event.imageUrl, style: { maxWidth: '200px', maxHeight: '150px', borderRadius: 'var(--border-radius-md)', marginTop: 'var(--spacing-2)', cursor: 'pointer' }, onClick: () => onImageView(event.imageUrl) })
                        )
                    )
                ) : React.createElement("p", { className: "text-tertiary" }, "No events marked for this month. Click on a day in the calendar to add one.")
            ),
            settings.mergeCalendarAndGoals && React.createElement("div", { className: "mt-6" },
                React.createElement(GoalsView, { goals, onUpdateGoals, entries, settings })
            ),
            React.createElement(EventModal, {
                isOpen: isEventModalOpen,
                onClose: closeEventModal,
                onSave: handleSaveEvent,
                eventToEdit: selectedEvent,
                dateForNewEvent: selectedDate,
                allEventTags: allEventTags
            })
        )
    );
}

// --- --- Reports & Review --- ---
function ReportsView({ entries, goals, settings, measurables, measurableLogs }) {
    const [period, setPeriod] = useState('this-week'); 

    const { filteredEntries, title } = useMemo(() => {
        const now = new Date();
        let startDate, endDate;
        let reportTitle = '';

        switch(period) {
            case 'last-week':
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 6);
                reportTitle = "Last Week's Summary";
                break;
            case 'this-month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                reportTitle = "This Month's Summary";
                break;
            case 'last-month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                reportTitle = "Last Month's Summary";
                break;
            case 'this-week':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - now.getDay()));
                reportTitle = "This Week's Summary";
                break;
        }
        
        startDate.setHours(0,0,0,0);
        endDate.setHours(23,59,59,999);

        const filtered = entries.filter(e => {
            const entryDate = DateTimeUtils._parseDate(e.timestamp);
            return entryDate >= startDate && entryDate <= endDate;
        });

        return { filteredEntries: filtered, title: reportTitle };
    }, [period, entries]);

    const topTags = useMemo(() => {
        if (filteredEntries.length === 0) return [];
        const tagCounts = filteredEntries
            .flatMap(e => e.tags || [])
            .reduce((acc, tag) => ({ ...acc, [tag]: (acc[tag] || 0) + 1 }), {});
        return Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
    }, [filteredEntries]);
    
    return React.createElement("div", { className: "card" },
        React.createElement("h2", null, "📈 In-App Reports"),
        React.createElement("div", { className: "app-nav", style: { justifyContent: 'flex-start', padding: '0', boxShadow: 'none', marginBottom: 'var(--spacing-4)' } },
            ['this-week', 'last-week', 'this-month', 'last-month'].map(p =>
                React.createElement("button", {
                    key: p,
                    className: `nav-link ${period === p ? 'active' : ''}`,
                    onClick: () => setPeriod(p)
                }, p.replace('-', ' '))
            )
        ),
        React.createElement("div", { className: "report-content" },
            filteredEntries.length > 0 ? (
                React.createElement("div", { style: {display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-6)'} },
                    React.createElement(MoodDistributionChart, { entries: filteredEntries, settings: settings, chartTitle: title }),
                    React.createElement("div", { className: "chart-wrapper" },
                        React.createElement("h3", null, "Top Tags This Period"),
                        topTags.length > 0 ? 
                        React.createElement("ul", { style: { listStyle: 'none', padding: 0 } },
                            topTags.map(([tag, count]) => 
                                React.createElement("li", { key: tag, style: { padding: 'var(--spacing-2) 0', borderBottom: '1px solid var(--border-primary)' } }, 
                                    React.createElement("span", { className: "mood-tag" }, `#${tag}`),
                                    ` was used ${count} time(s).`
                                )
                            )
                        ) : React.createElement("p", { className: "text-tertiary" }, "No tags were used in this period.")
                    )
                )
            ) : (
                React.createElement("p", { className: "text-center text-tertiary p-4" }, "No data available for this period to generate a report.")
            )
        )
    );
}

// --- NEW: Weekly Review Modal ---
function WeeklyReviewModal({ isOpen, onClose, onSave, entries, settings }) {
    if (!isOpen) return null;

    const [highlight, setHighlight] = useState('');
    const [challenge, setChallenge] = useState('');

    const reviewPeriod = useMemo(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);
        return {
            start: startDate,
            end: endDate,
            title: `Review for ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
        };
    }, []);

    const periodEntries = useMemo(() => {
        return entries.filter(e => {
            const entryDate = DateTimeUtils._parseDate(e.timestamp);
            return entryDate >= reviewPeriod.start && entryDate <= reviewPeriod.end;
        });
    }, [entries, reviewPeriod]);
    
    const topTags = useMemo(() => {
        if (periodEntries.length === 0) return [];
        const tagCounts = periodEntries.flatMap(e => e.tags || []).reduce((acc, tag) => ({ ...acc, [tag]: (acc[tag] || 0) + 1 }), {});
        return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(t => t[0]);
    }, [periodEntries]);

    const handleSaveReview = () => {
        const reviewData = {
            id: generateId(),
            date: new Date().toISOString(),
            period: { start: reviewPeriod.start.toISOString(), end: reviewPeriod.end.toISOString() },
            reflections: { highlight, challenge },
            topTags: topTags,
            moodCount: periodEntries.length,
        };
        onSave(reviewData);
    };

    return React.createElement("div", { className: "modal-overlay", onClick: onClose },
        React.createElement("div", { className: "modal-content-wrapper", onClick: e => e.stopPropagation() },
            React.createElement("h2", null, "Weekly Review"),
            React.createElement("p", { className: "text-tertiary" }, reviewPeriod.title),
            
            periodEntries.length > 0 ? React.createElement(React.Fragment, null,
                React.createElement("div", { className: "review-summary-grid" },
                    React.createElement("div", { className: "review-summary-item" },
                        React.createElement("div", { className: "stat-value" }, periodEntries.length),
                        React.createElement("div", { className: "stat-label" }, "Moods Logged")
                    ),
                    React.createElement("div", { className: "review-summary-item" },
                        React.createElement("div", { className: "stat-value", style: {fontSize: '1em', display: 'flex', gap: '4px', flexWrap: 'wrap'}}, topTags.length > 0 ? topTags.map(t => React.createElement("span", {key:t, className: "mood-tag"}, `#${t}`)) : '-'),
                        React.createElement("div", { className: "stat-label" }, "Top Tags")
                    )
                ),
                React.createElement(MoodDistributionChart, { entries: periodEntries, settings: settings, chartTitle: "Your Week's Moods" }),
            ) : React.createElement("p", { className: "text-tertiary text-center p-4" }, "No moods were logged during this period."),

            React.createElement("div", { className: "form-group mt-4" },
                React.createElement("label", { className: "form-label" }, "What was a highlight from this week?"),
                React.createElement("textarea", { className: "form-textarea", value: highlight, onChange: e => setHighlight(e.target.value), rows: 2 })
            ),
            React.createElement("div", { className: "form-group" },
                React.createElement("label", { className: "form-label" }, "What was a challenge you faced?"),
                React.createElement("textarea", { className: "form-textarea", value: challenge, onChange: e => setChallenge(e.target.value), rows: 2 })
            ),

            React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' } },
                React.createElement("button", { className: "btn btn-secondary", onClick: onClose }, "Later"),
                React.createElement("button", { className: "btn btn-primary", onClick: handleSaveReview }, "Save Review")
            )
        )
    );
}


// --- GOAL COMPONENTS ---
const getGoalColor = (goalId) => {
    let hash = 0;
    if (!goalId || goalId.length === 0) return 'var(--bg-tertiary)';
    for (let i = 0; i < goalId.length; i++) {
        hash = goalId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 80%)`;
};

function GoalProgressChart({ goal }) {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;

        const start = DateTimeUtils._parseDate(goal.startDate);
        const end = DateTimeUtils._parseDate(goal.endDate || new Date());
        const totalDays = DateTimeUtils.daysBetween(start, end) + 1;
        const today = new Date();
        
        let metCount = 0;
        let missedCount = 0;
        let pastPendingCount = 0;

        for (let i = 0; i < totalDays; i++) {
            const dayDate = new Date(start);
            dayDate.setDate(start.getDate() + i);
            if (dayDate > today) break; 

            const dayISO = DateTimeUtils.getStartOfDayISO(dayDate);
            if (goal.progress && goal.progress[dayISO] === true) {
                metCount++;
            } else if (goal.progress && goal.progress[dayISO] === false) {
                missedCount++;
            } else {
                pastPendingCount++;
            }
        }
        const futureDays = totalDays > (metCount + missedCount + pastPendingCount) ? totalDays - (metCount + missedCount + pastPendingCount) : 0;
        
        if (metCount + missedCount + pastPendingCount + futureDays === 0) return;
        
        const pendingColor = getGoalColor(goal.id);

        const data = {
            labels: ['Met', 'Missed', 'Pending'],
            datasets: [{
                data: [metCount, missedCount, pastPendingCount + futureDays],
                backgroundColor: ['var(--goal-met-color)', 'var(--goal-missed-color)', pendingColor],
                borderColor: 'var(--bg-secondary)',
                borderWidth: 2,
                hoverOffset: 4
            }]
        };

        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                         callbacks: {
                            label: (context) => `${context.label}: ${context.raw} day(s)`
                         }
                    }
                }
            }
        };

        if (chartInstanceRef.current) chartInstanceRef.current.destroy();
        chartInstanceRef.current = new Chart(chartRef.current, config);

        return () => chartInstanceRef.current?.destroy();

    }, [goal]);
    
    return React.createElement("div", { style: { position: 'relative', width: '100px', height: '100px' } },
        React.createElement("canvas", { ref: chartRef })
    );
}

function GoalProgressTracker({ goal }) {
    const { startDate, endDate, progress } = goal;
    const todayISO = DateTimeUtils.getStartOfDayISO(new Date());

    const start = DateTimeUtils._parseDate(startDate + 'T00:00:00');
    const end = DateTimeUtils._parseDate((endDate || new Date().toISOString().split('T')[0]) + 'T00:00:00');
    const totalDays = Math.min(DateTimeUtils.daysBetween(start, end) + 1, 30);
    
    let dayDots = [];
    for (let i = 0; i < totalDays; i++) {
        const dayDate = new Date(start);
        dayDate.setDate(start.getDate() + i);
        const dayISO = DateTimeUtils.getStartOfDayISO(dayDate);
        
        let statusClass = '';
        if (progress && progress[dayISO] === true) statusClass = 'met';
        else if (progress && progress[dayISO] === false) statusClass = 'missed';
        
        if (dayISO === todayISO) statusClass += ' today';
        
        dayDots.push(React.createElement("div", {
            key: i,
            className: `progress-day-dot ${statusClass}`,
            title: dayDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
        }));
    }

    return React.createElement("div", { className: "goal-progress-tracker" }, dayDots);
}


function GoalItem({ goal, onUpdateGoal, onDeleteGoal, settings }) {
    const todayISO = DateTimeUtils.getStartOfDayISO(new Date());
    const isToday = todayISO >= DateTimeUtils.getStartOfDayISO(DateTimeUtils._parseDate(goal.startDate)) &&
                    (!goal.endDate || todayISO <= DateTimeUtils.getStartOfDayISO(DateTimeUtils._parseDate(goal.endDate)));

    const handleCheckin = (metGoal) => {
        SoundUtils.playSound('audio-click', settings);
        const updatedProgress = { ...goal.progress, [todayISO]: metGoal };
        onUpdateGoal({ ...goal, progress: updatedProgress });
    };

    const handleArchive = () => {
        if(confirm("Are you sure you want to mark this goal as complete?")) {
            onUpdateGoal({ ...goal, status: 'completed' });
        }
    };

    return React.createElement("div", { className: `goal-item ${goal.status}` },
        React.createElement("div", { className: "goal-header" },
            React.createElement("div", { style: { flex: 1 }},
                React.createElement("h4", { className: "goal-title" }, goal.title)
            ),
            React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' } },
                goal.status === 'active' && React.createElement("button", { onClick: handleArchive, className: "btn btn-secondary btn-sm" }, "Complete"),
                React.createElement("button", { onClick: () => onDeleteGoal(goal.id), className: "btn btn-danger btn-sm" }, "Delete")
            )
        ),
        React.createElement("div", { className: "goal-details-container" },
            React.createElement("div", { style: { flex: 2 }},
                React.createElement("p", { className: "goal-description" }, goal.description),
                React.createElement(GoalProgressTracker, { goal: goal })
            ),
            React.createElement("div", { style: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }},
                React.createElement(GoalProgressChart, { goal: goal })
            )
        ),
        isToday && goal.status === 'active' && React.createElement("div", null,
            React.createElement("p", { className: "form-label" }, "Did you achieve this today?"),
            React.createElement("div", { style: { display: 'flex', gap: 'var(--spacing-2)' } },
                React.createElement("button", { onClick: () => handleCheckin(true), className: `btn ${goal.progress && goal.progress[todayISO] === true ? 'btn-primary' : 'btn-secondary'} btn-sm` }, "✅ Yes"),
                React.createElement("button", { onClick: () => handleCheckin(false), className: `btn ${goal.progress && goal.progress[todayISO] === false ? 'btn-danger' : 'btn-secondary'} btn-sm` }, "❌ No")
            )
        )
    );
}

function GoalCreationWizard({ isOpen, onClose, onSave, settings, entries, prefillData }) {
    if (!isOpen) return null;

    const [step, setStep] = useState(prefillData ? 3 : 1);
    const [intention, setIntention] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [newGoal, setNewGoal] = useState(null);
    const moodPalette = settings.moodPalette || DEFAULT_MOOD_PALETTE;
    const moodMap = moodPalette.reduce((acc, mood) => { acc[mood.id] = mood; return acc; }, {});
    
    useEffect(() => {
        if (prefillData) {
            handleSelectSuggestion(prefillData, 14); // Prefill a 14-day goal
        }
    }, [prefillData]);

    const handleGenerateSuggestions = async () => {
        if (!intention.trim() || !settings.aiApiKey) {
            setError("Please enter your intention and ensure your AI API key is set in Settings.");
            return;
        }
        setIsLoading(true);
        setError("");
        
        const recentEntries = entries.slice(-15);
        const dataSummary = recentEntries.map(entry => {
            const moodName = moodMap[entry.moodId]?.name || 'Unknown';
            let entryString = `${DateTimeUtils.formatTimestamp(entry.timestamp, {month: 'short', day: 'numeric'})}: Felt ${moodName} (Intensity: ${entry.intensity}/10).`;
            if (entry.notes) entryString += ` Notes: "${entry.notes.substring(0, 50)}..."`;
            if (entry.tags?.length) entryString += ` Tags: ${entry.tags.join(', ')}.`;
            return entryString;
        }).join('\n');
        
        try {
            const messages = [
                { role: "system", content: `You are a wellness coach. The user will state an intention. Based on their intention and their recent mood data, suggest 3 specific, actionable, and time-bound goals. Format the output as a numbered list, with each item containing a "Title:" and a "Description:". The description should be a concrete action. Example:\n1. Title: Wind-Down Routine\nDescription: Avoid screens for 30 minutes before bed each night for the next 7 days.` },
                { role: "user", content: `My intention is: "${intention}".\n\nHere is my recent mood data for context:\n${dataSummary}` }
            ];
            const result = await callDeepSeekAPI(messages, settings.aiApiKey, "openrouter/auto", 200);
            
            const parsedSuggestions = result.split(/\d+\./).slice(1).map(s => {
                const titleMatch = s.match(/Title:(.*)/);
                const descMatch = s.match(/Description:(.*)/);
                return {
                    title: titleMatch ? titleMatch[1].trim() : "Untitled Goal",
                    description: descMatch ? descMatch[1].trim() : "No description."
                };
            });

            setSuggestions(parsedSuggestions);
            setStep(2);
        } catch (err) {
            setError("Failed to generate suggestions: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectSuggestion = (suggestion, defaultDuration = 7) => {
        setSelectedSuggestion(suggestion);
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + defaultDuration - 1);
        setNewGoal({
            ...suggestion,
            startDate: DateTimeUtils.getStartOfDayISO(startDate),
            endDate: DateTimeUtils.getStartOfDayISO(endDate),
            duration: defaultDuration,
        });
        setStep(3);
    };
    
    const handleManualGoal = () => {
        handleSelectSuggestion({title: "", description: ""});
    };

    const handleSaveGoal = () => {
        if (!newGoal.title.trim() || !newGoal.description.trim()) {
            setError("Title and Description cannot be empty.");
            return;
        }
        onSave(newGoal);
        handleClose();
    };
    
    const handleClose = () => {
        setStep(1);
        setIntention('');
        setSuggestions([]);
        setSelectedSuggestion(null);
        setError('');
        onClose();
    };

    return React.createElement("div", { className: "modal-overlay" },
        React.createElement("div", { className: "modal-content-wrapper", onClick: e => e.stopPropagation() },
            React.createElement("h2", null, "New Wellness Goal"),
            
            step === 1 && React.createElement("div", null,
                React.createElement("p", { className: "text-tertiary" }, "Let's turn your intention into action. What would you like to work on?"),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "My Intention is..."),
                    React.createElement("textarea", { className: "form-textarea", value: intention, onChange: e => setIntention(e.target.value), placeholder: "e.g., I want to feel less tired in the afternoon." })
                ),
                isLoading ? React.createElement("div", { className: "loader" }) :
                React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)' } },
                    React.createElement("button", { onClick: handleGenerateSuggestions, className: "btn btn-primary", disabled: !settings.aiApiKey }, "Get AI Suggestions 🤖"),
                    React.createElement("button", { onClick: handleManualGoal, className: "btn btn-secondary" }, "Create a Manual Goal ✍️")
                ),
                !settings.aiApiKey && React.createElement("p", { className: "setting-description mt-2" }, "Set your AI API Key in Settings to enable AI suggestions."),
                error && React.createElement("p", { className: "error-message mt-2" }, error)
            ),

            step === 2 && React.createElement("div", null,
                React.createElement("p", { className: "text-tertiary" }, "Here are a few ideas based on your intention and recent logs. Choose one or create your own."),
                React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' } },
                    suggestions.map((s, i) =>
                        React.createElement("div", { key: i, className: "goal-suggestion-card", onClick: () => handleSelectSuggestion(s) },
                            React.createElement("h4", { className: "mb-1" }, s.title),
                            React.createElement("p", { className: "text-secondary", style: { margin: 0 } }, s.description)
                        )
                    )
                ),
                 React.createElement("button", { onClick: handleManualGoal, className: "btn btn-secondary mt-4" }, "Create a Manual Goal Instead")
            ),

            step === 3 && newGoal && React.createElement("div", null,
                React.createElement("p", { className: "text-tertiary" }, "Confirm your new goal details."),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Goal Title"),
                    React.createElement("input", { type: "text", className: "form-input", value: newGoal.title, onChange: e => setNewGoal({ ...newGoal, title: e.target.value }) })
                ),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Specific Action"),
                    React.createElement("input", { type: "text", className: "form-input", value: newGoal.description, onChange: e => setNewGoal({ ...newGoal, description: e.target.value }) })
                ),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, `Duration (in days)`),
                    React.createElement("input", { type: "number", min: "1", max: "90", className: "form-input", value: newGoal.duration, onChange: e => {
                        const duration = parseInt(e.target.value, 10);
                        const endDate = DateTimeUtils._parseDate(newGoal.startDate);
                        endDate.setDate(endDate.getDate() + duration - 1);
                        setNewGoal({ ...newGoal, duration: duration, endDate: DateTimeUtils.getStartOfDayISO(endDate) });
                    }})
                ),
                React.createElement("p", {className: "text-tertiary"}, `This goal will run from ${DateTimeUtils.formatTimestamp(newGoal.startDate, {dateStyle: 'medium'})} to ${DateTimeUtils.formatTimestamp(newGoal.endDate, {dateStyle: 'medium'})}.`),
                error && React.createElement("p", { className: "error-message mt-2" }, error)
            ),

            React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)', borderTop: '1px solid var(--border-primary)', paddingTop: 'var(--spacing-4)' } },
                step > 1 && !prefillData && React.createElement("button", { className: "btn btn-secondary", onClick: () => setStep(step - 1) }, "Back"),
                React.createElement("button", { className: "btn btn-secondary", onClick: handleClose }, "Cancel"),
                step === 3 && React.createElement("button", { className: "btn btn-primary", onClick: handleSaveGoal }, "Save Goal")
            )
        )
    );
}

function GoalsView({ goals, onUpdateGoals, entries, settings, onSetWizardPrefill }) {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [filter, setFilter] = useState('active');

    if (!settings.showGoals) {
        return React.createElement("div", { className: "card text-center" },
            React.createElement("h2", null,
                React.createElement("span", { className: "section-icon" }, "🎯"),
                settings.interfaceStyle !== 'minimal' && React.createElement("span", { className: "section-title-text" }, "Goals Disabled")
            ),
            React.createElement("p", null, "The Wellness Goals feature is currently disabled."),
            React.createElement("p", { className: "text-tertiary" }, "You can enable it in the main App Settings.")
        );
    }
    
    useEffect(() => {
        if(onSetWizardPrefill) {
            setIsWizardOpen(true);
        }
    }, [onSetWizardPrefill]);

    const handleAddGoal = (newGoalData) => {
        const goal = {
            id: generateId(),
            status: 'active',
            progress: {},
            ...newGoalData,
        };
        onUpdateGoals([...goals, goal]);
    };

    const handleUpdateGoal = (updatedGoal) => {
        onUpdateGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    };

    const handleDeleteGoal = (id) => {
        if(confirm("Are you sure you want to permanently delete this goal and its progress?")) {
            SoundUtils.playSound('audio-delete', settings);
            onUpdateGoals(goals.filter(g => g.id !== id));
        }
    };
    
    const filteredGoals = goals
        .filter(goal => goal.status === filter)
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    return React.createElement("div", { className: "goals-view" },
        React.createElement(GoalCreationWizard, { 
            isOpen: isWizardOpen, 
            onClose: () => {
                setIsWizardOpen(false);
                if(onSetWizardPrefill) onSetWizardPrefill(null); // Clear prefill data
            }, 
            onSave: handleAddGoal,
            settings: settings,
            entries: entries,
            prefillData: onSetWizardPrefill // Use the prop directly
        }),
        React.createElement("div", { className: "card" },
            React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' } },
                React.createElement("h2", { className: "mb-0" },
                    React.createElement("span", { className: "section-icon" }, "🎯"),
                    settings.interfaceStyle !== 'minimal' && React.createElement("span", { className: "section-title-text" }, "Your Wellness Goals")
                ),
                React.createElement("button", { onClick: () => setIsWizardOpen(true), className: "btn btn-primary" }, "+ New Goal")
            ),
            React.createElement("p", { className: "text-tertiary" }, "Set and track small, achievable goals to improve your well-being."),
            React.createElement("div", { className: "app-nav", style: { justifyContent: 'flex-start', padding: '0', boxShadow: 'none', marginBottom: 'var(--spacing-4)' } },
                React.createElement("button", { className: `nav-link ${filter === 'active' ? 'active' : ''}`, onClick: () => setFilter('active') }, "Active"),
                React.createElement("button", { className: `nav-link ${filter === 'completed' ? 'active' : ''}`, onClick: () => setFilter('completed') }, "Completed")
            ),
            
            filteredGoals.length > 0 ? (
                filteredGoals.map(goal => React.createElement(GoalItem, {
                    key: goal.id,
                    goal: goal,
                    onUpdateGoal: handleUpdateGoal,
                    onDeleteGoal: handleDeleteGoal,
                    settings: settings
                }))
            ) : (
                React.createElement("div", { className: "text-center p-4" },
                    React.createElement("p", { className: "text-tertiary" }, 
                        filter === 'active' 
                        ? "You have no active goals. Click '+ New Goal' to get started!"
                        : "You haven't completed any goals yet. Keep up the great work!"
                    )
                )
            )
        )
    );
}

// --- 3.6 Settings & Data Management ---

function ExportModal({ isOpen, onClose, onGenerateCSV, onGeneratePDF, onGenerateDailySummaryCSV }) {
    if (!isOpen) return null;
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(() => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return oneMonthAgo.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(today);
    const [includeMeasurables, setIncludeMeasurables] = useState(true);
    const [error, setError] = useState('');

    const handleGenerate = (type) => {
        setError('');
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
            setError('End date cannot be before start date.');
            return;
        }
        if (type === 'pdf') {
            onGeneratePDF(start, end, includeMeasurables);
        } else if (type === 'csv') {
            onGenerateCSV(start, end, includeMeasurables);
        } else if (type === 'daily_csv') {
            onGenerateDailySummaryCSV(start, end);
        }
        onClose();
    };

    return React.createElement("div", { className: "modal-overlay", onClick: onClose },
        React.createElement("div", { className: "modal-content-wrapper", onClick: e => e.stopPropagation() },
            React.createElement("h3", null, "Create Data Export"),
            React.createElement("p", { className: "text-tertiary" }, "Select a date range and options for your export."),
            React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' } },
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Start Date"),
                    React.createElement("input", { type: "date", className: "form-input", value: startDate, onChange: e => setStartDate(e.target.value) })
                ),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "End Date"),
                    React.createElement("input", { type: "date", className: "form-input", value: endDate, onChange: e => setEndDate(e.target.value), min: startDate })
                )
            ),
            React.createElement("div", { className: "form-group", style: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' } },
                React.createElement("input", { type: "checkbox", id: "include-measurables", checked: includeMeasurables, onChange: (e) => setIncludeMeasurables(e.target.checked), style:{width:'auto'} }),
                React.createElement("label", { htmlFor: "include-measurables", className: "form-label", style:{marginBottom:0, cursor:'pointer'} }, "Include Measurables Data (for Entry-level CSV)")
            ),
            error && React.createElement("p", { className: "error-message" }, error),
            React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' } },
                React.createElement("button", { className: "btn btn-secondary", onClick: onClose }, "Cancel"),
                React.createElement("button", { className: "btn btn-secondary", onClick: () => handleGenerate('csv') }, "Entry CSV"),
                React.createElement("button", { className: "btn btn-secondary", onClick: () => handleGenerate('daily_csv') }, "Daily Summary CSV"),
                React.createElement("button", { className: "btn btn-primary", onClick: () => handleGenerate('pdf') }, "PDF Report")
            )
        )
    );
}

function ImportValidationModal({ isOpen, onClose, onConfirm, fileData }) {
    if (!isOpen) return null;

    const summary = {
        moods: fileData.entries?.length || 0,
        events: fileData.events?.length || 0,
        goals: fileData.goals?.length || 0,
        measurables: fileData.measurables?.length || 0,
        logs: fileData.measurableLogs?.length || 0,
        settings: fileData.settings ? 'Yes' : 'No'
    };

    return React.createElement("div", { className: "modal-overlay" },
        React.createElement("div", { className: "modal-content-wrapper" },
            React.createElement("h2", null, "Confirm Data Import"),
            React.createElement("p", { className: "text-tertiary" }, "Your backup file contains the following data. How would you like to import it?"),
            React.createElement("ul", { style: { listStyle: 'none', padding: 'var(--spacing-3)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)' } },
                React.createElement("li", null, `Mood Entries: ${summary.moods}`),
                React.createElement("li", null, `Events: ${summary.events}`),
                React.createElement("li", null, `Goals: ${summary.goals}`),
                React.createElement("li", null, `Measurables: ${summary.measurables}`),
                React.createElement("li", null, `Measurable Logs: ${summary.logs}`),
                React.createElement("li", null, `Settings Included: ${summary.settings}`)
            ),
            React.createElement("p", { className: "setting-description mt-4" }, 
                React.createElement("strong", null, "Merge:"), " Adds new data from the file without removing existing data. (Recommended)\n",
                React.createElement("strong", null, "Replace:"), " Deletes ALL current data and replaces it with the data from the file."
            ),
            React.createElement("div", { className: "mt-6", style: { display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)' } },
                React.createElement("button", { onClick: onClose, className: "btn btn-secondary" }, "Cancel"),
                React.createElement("button", { onClick: () => onConfirm('replace'), className: "btn btn-danger" }, "Replace"),
                React.createElement("button", { onClick: () => onConfirm('merge'), className: "btn btn-primary" }, "Merge")
            )
        )
    );
}

function AboutModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const features = [
        { name: "Proactive AI Suggestions", text: "Get actionable insights from your data.", isNew: true },
        { name: "Structured Context Logging", text: "Quickly tag entries with who, where, and what.", isNew: true },
        { name: "Weekly Reviews & Memories", text: "Reflect on your past with guided reviews.", isNew: true },
        { name: "Advanced Achievements", text: "Unlock new badges for your progress.", isNew: true },
        { name: "Customizable Moods", text: "Add, edit, or delete moods to fit your vocabulary." },
        { name: "Photo Journaling", text: "Attach photos to mood entries for richer memories." },
        { name: "Goals & Measurables", text: "Track wellness goals and activities like sleep or exercise." },
        { name: "Calendar & Events", text: "Mark important recurring or one-time events." },
        { name: "Data Visualization", text: "See your trends with charts for moods, tags, and activities." },
        { name: "AI-Powered Insights", text: "Use AI to get summaries and chat about your feelings." },
    ];

    return React.createElement("div", { className: "modal-overlay", onClick: onClose },
        React.createElement("div", { className: "modal-content-wrapper about-modal-content", onClick: e => e.stopPropagation() },
            React.createElement("h2", null, "About MoodVibe"),
            React.createElement("p", { className: "text-tertiary" }, `Version ${APP_VERSION}`),
            React.createElement("h3", { className: "mt-4" }, "Features"),
            React.createElement("ul", null,
                features.map(f => React.createElement("li", { key: f.name },
                    f.name,
                    f.isNew && React.createElement("span", { className: "new-badge" }, "NEW")
                ))
            ),
            React.createElement("button", { onClick: onClose, className: "btn btn-primary mt-4" }, "Close")
        )
    );
}

function SettingsView({ settings, onUpdateSettings, onPurgeData, onLockApp, onGenerateCSV, onGeneratePDF, onGenerateDailySummaryCSV, onFetchAiQuotes }) {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [newReminder, setNewReminder] = useState("12:00");
    
    const handleThemeChange = (e) => {
        onUpdateSettings({ ...settings, theme: e.target.value });
    };
    
    const handleAddReminder = () => {
        if (newReminder && !settings.reminders.includes(newReminder)) {
            const updatedReminders = [...settings.reminders, newReminder].sort();
            onUpdateSettings({ ...settings, reminders: updatedReminders });
        }
    };

    const handleRemoveReminder = (timeToRemove) => {
        const updatedReminders = settings.reminders.filter(r => r !== timeToRemove);
        onUpdateSettings({ ...settings, reminders: updatedReminders });
    };

    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [currentPasswordInput, setCurrentPasswordInput] = useState('');
    const [newPasswordInput, setNewPasswordInput] = useState(settings.notesPassword || '');
    const [currentPasswordError, setCurrentPasswordError] = useState('');

    useEffect(() => {
        if (settings.notesPassword !== newPasswordInput) {
            setNewPasswordInput(settings.notesPassword);
        }
    }, [settings.notesPassword]);
    
    const [showAppPasswordModal, setShowAppPasswordModal] = useState(false);
    const [currentAppPasswordInput, setCurrentAppPasswordInput] = useState('');
    const [newAppPasswordInput, setNewAppPasswordInput] = useState('');
    const [appPasswordError, setAppPasswordError] = useState('');
    
    const handleSetOrChangeAppPassword = () => {
        setAppPasswordError('');
        if (settings.appPassword && currentAppPasswordInput !== settings.appPassword) {
            setAppPasswordError('Incorrect current password.');
            return;
        }
        if (!newAppPasswordInput) {
            setAppPasswordError('New password cannot be empty.');
            return;
        }
        onUpdateSettings({ ...settings, appPassword: newAppPasswordInput });
        setShowAppPasswordModal(false);
        setCurrentAppPasswordInput('');
        setNewAppPasswordInput('');
        alert('App password updated successfully. The app will be locked on your next visit or if you click "Lock Now".');
    };

    const handleClearAppPassword = () => {
        setAppPasswordError('');
        if (currentAppPasswordInput !== settings.appPassword) {
            setAppPasswordError('Incorrect current password.');
            return;
        }
        onUpdateSettings({ ...settings, appPassword: '' });
        setShowAppPasswordModal(false);
        setCurrentAppPasswordInput('');
        setNewAppPasswordInput('');
        alert('App password removed.');
    };

    const handleChangePassword = () => {
        setCurrentPasswordError('');
        if (currentPasswordInput !== settings.notesPassword) {
            setCurrentPasswordError('Incorrect current password.');
            return;
        }
        onUpdateSettings({ ...settings, notesPassword: newPasswordInput });
        setShowChangePasswordModal(false);
        setCurrentPasswordInput('');
        setCurrentPasswordError('');
    };

    const handleClearPassword = () => {
        setCurrentPasswordError('');
        if (currentPasswordInput !== settings.notesPassword) {
            setCurrentPasswordError('Incorrect current password.');
            return;
        }
        onUpdateSettings({ ...settings, notesPassword: '' });
        setShowChangePasswordModal(false);
        setCurrentPasswordInput('');
        setCurrentPasswordError('');
    };
    
    const handleDashboardOrderChange = (index, direction) => {
        const currentOrder = settings.dashboardOrder || [];
        const newOrder = [...currentOrder];
        const item = newOrder.splice(index, 1)[0];
        if (direction === 'up') {
            newOrder.splice(index - 1, 0, item);
        } else {
            newOrder.splice(index + 1, 0, item);
        }
        onUpdateSettings({ ...settings, dashboardOrder: newOrder });
    };

    const handleUpdateMoodPalette = (newPalette) => {
        onUpdateSettings({ ...settings, moodPalette: newPalette });
    };

    const handleAddMood = () => {
        const newMood = {
            id: `custom_${generateId()}`,
            name: 'New Mood',
            emoji: '❓',
            colorTheme: { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' },
            intensityColor: '#E5E7EB'
        };
        handleUpdateMoodPalette([...settings.moodPalette, newMood]);
    };
    
    const handleEditMood = (id, field, value) => {
        const newPalette = settings.moodPalette.map(mood => {
            if (mood.id === id) {
                const updatedMood = { ...mood };
                if (field.startsWith('colorTheme.')) {
                    const key = field.split('.')[1];
                    updatedMood.colorTheme = { ...updatedMood.colorTheme, [key]: value };
                    if (key === 'border') updatedMood.intensityColor = value;
                } else {
                    updatedMood[field] = value;
                }
                return updatedMood;
            }
            return mood;
        });
        handleUpdateMoodPalette(newPalette);
    };

    const handleDeleteMood = (id) => {
        if (settings.moodPalette.length <= 1) {
            alert("You must have at least one mood in your palette.");
            return;
        }
        if (confirm("Are you sure you want to delete this mood? This cannot be undone.")) {
            handleUpdateMoodPalette(settings.moodPalette.filter(mood => mood.id !== id));
        }
    };

    function getContrastYIQ(hexcolor) {
        hexcolor = hexcolor.replace('#', '');
        if (hexcolor.length === 3) hexcolor = hexcolor.split('').map(x => x + x).join('');
        const r = parseInt(hexcolor.substr(0,2),16);
        const g = parseInt(hexcolor.substr(2,2),16);
        const b = parseInt(hexcolor.substr(4,2),16);
        const yiq = ((r*299)+(g*587)+(b*114))/1000;
        return (yiq >= 128) ? '#222' : '#fff';
    }

    return (
        React.createElement("div", { className: "settings-view card" },
            React.createElement(ExportModal, {
                isOpen: isExportModalOpen,
                onClose: () => setIsExportModalOpen(false),
                onGenerateCSV: onGenerateCSV,
                onGeneratePDF: onGeneratePDF,
                onGenerateDailySummaryCSV: onGenerateDailySummaryCSV
            }),
            React.createElement(AboutModal, {
                isOpen: isAboutModalOpen,
                onClose: () => setIsAboutModalOpen(false)
            }),
            React.createElement("h2", null,
                React.createElement("span", { className: "section-icon" }, "⚙️"),
                settings.interfaceStyle !== 'minimal' && React.createElement("span", { className: "section-title-text" }, "App Settings")
            ),
            
            React.createElement("div", { className: "settings-section" },
                React.createElement("h3", null, "General"),
                 React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "About MoodVibe"),
                        React.createElement("p", { className: "setting-description" }, `Version ${APP_VERSION}. Click to see features.`)
                    ),
                    React.createElement("button", { onClick: () => setIsAboutModalOpen(true), className: "btn btn-secondary btn-sm" }, "View Features")
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("span", { className: "setting-label" }, "Theme"),
                    React.createElement("select", { className: "form-select", value: settings.theme, onChange: handleThemeChange, style: { width: 'auto', minWidth: '150px' } },
                        React.createElement("option", { value: "light" }, "Light ☀️"),
                        React.createElement("option", { value: "dark" }, "Dark 🌙"),
                        React.createElement("option", { value: "solarized" }, "Solarized 🌅"),
                        React.createElement("option", { value: "forest" }, "Forest 🌲"),
                        React.createElement("option", { value: "ocean" }, "Ocean 🌊"),
                        React.createElement("option", { value: "sunset" }, "Sunset 🌇")
                    )
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("span", { className: "setting-label" }, "Interface Style"),
                    React.createElement("select", { className: "form-select", value: settings.interfaceStyle, onChange: e => onUpdateSettings({ ...settings, interfaceStyle: e.target.value }), style: { width: 'auto', minWidth: '150px' } },
                        React.createElement("option", { value: "full" }, "Full (Titles & Icons)"),
                        React.createElement("option", { value: "minimal" }, "Minimal (Icons Only)")
                    )
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, `UI Scale: ${settings.uiScale || 100}%`),
                        React.createElement("p", { className: "setting-description" }, "Adjust the size of the entire app interface.")
                    ),
                    React.createElement("input", { 
                        type: "range",
                        min: "80", max: "130", step: "5",
                        value: settings.uiScale || 100,
                        onChange: e => onUpdateSettings({ ...settings, uiScale: parseInt(e.target.value, 10) })
                    })
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Optimize for Landscape"),
                        React.createElement("p", { className: "setting-description" }, "Improves layout on mobile devices held sideways.")
                    ),
                    React.createElement("input", { type: "checkbox", checked: !!settings.optimizeForLandscape, onChange: (e) => onUpdateSettings({ ...settings, optimizeForLandscape: e.target.checked }), style: { transform: 'scale(1.5)', cursor: 'pointer' } })
                )
            ),

            React.createElement("div", { className: "settings-section" },
                React.createElement("h3", null, "Navigation & Features"),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Enable Universal Search"),
                        React.createElement("p", { className: "setting-description" }, "Show the 'Search' tab in the main navigation.")
                    ),
                    React.createElement("input", { type: "checkbox", checked: !!settings.enableGlobalSearch, onChange: (e) => onUpdateSettings({ ...settings, enableGlobalSearch: e.target.checked }), style: { transform: 'scale(1.5)', cursor: 'pointer' } })
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Enable In-App Reports"),
                        React.createElement("p", { className: "setting-description" }, "Show the 'Reports' tab for weekly/monthly summaries.")
                    ),
                    React.createElement("input", { type: "checkbox", checked: !!settings.showReports, onChange: (e) => onUpdateSettings({ ...settings, showReports: e.target.checked }), style: { transform: 'scale(1.5)', cursor: 'pointer' } })
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Enable Wellness Goals"),
                        React.createElement("p", { className: "setting-description" }, "Turn the entire Goals feature on or off.")
                    ),
                    React.createElement("input", { type: "checkbox", checked: !!settings.showGoals, onChange: (e) => onUpdateSettings({ ...settings, showGoals: e.target.checked }), style: { transform: 'scale(1.5)', cursor: 'pointer' } })
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Enable Measurables"),
                        React.createElement("p", { className: "setting-description" }, "Turn the entire Measurables feature on or off.")
                    ),
                    React.createElement("input", { type: "checkbox", checked: !!settings.showMeasurables, onChange: (e) => onUpdateSettings({ ...settings, showMeasurables: e.target.checked }), style: { transform: 'scale(1.5)', cursor: 'pointer' } })
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Merge Features into Dashboard"),
                        React.createElement("p", { className: "setting-description" }, "Combine Calendar, Goals, and Measurables into a single 'Dashboard' tab.")
                    ),
                    React.createElement("input", { 
                        type: "checkbox", 
                        checked: !!settings.mergeFeaturesToDashboard, 
                        onChange: (e) => onUpdateSettings({ ...settings, mergeFeaturesToDashboard: e.target.checked }), 
                        disabled: !settings.showGoals && !settings.showMeasurables,
                        style: { transform: 'scale(1.5)', cursor: 'pointer' } 
                    })
                ),
                 React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Enable Structured Context Logging"),
                        React.createElement("p", { className: "setting-description" }, "Show People/Place/Activity buttons when logging a mood.")
                    ),
                    React.createElement("input", { type: "checkbox", checked: !!settings.enableStructuredContext, onChange: (e) => onUpdateSettings({ ...settings, enableStructuredContext: e.target.checked }), style: { transform: 'scale(1.5)', cursor: 'pointer' } })
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Enable Weekly Review"),
                        React.createElement("p", { className: "setting-description" }, "Get a prompt to review your week and reflect on progress.")
                    ),
                    React.createElement("input", { type: "checkbox", checked: !!settings.enableWeeklyReview, onChange: (e) => onUpdateSettings({ ...settings, enableWeeklyReview: e.target.checked }), style: { transform: 'scale(1.5)', cursor: 'pointer' } })
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Enable Calendar Event Reminders"),
                        React.createElement("p", { className: "setting-description" }, "Get notifications for upcoming events.")
                    ),
                    React.createElement("input", { 
                        type: "checkbox", 
                        checked: !!settings.calendarEventReminders, 
                        onChange: async (e) => {
                            if (e.target.checked) await NotificationService.requestPermission();
                            onUpdateSettings({ ...settings, calendarEventReminders: e.target.checked });
                        }, 
                        style: { transform: 'scale(1.5)', cursor: 'pointer' } 
                    })
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Enable Memory Lane"),
                        React.createElement("p", { className: "setting-description" }, "Show a card with a random positive memory.")
                    ),
                    React.createElement("input", { type: "checkbox", checked: !!settings.enableMemoryLane, onChange: (e) => onUpdateSettings({ ...settings, enableMemoryLane: e.target.checked }), style: { transform: 'scale(1.5)', cursor: 'pointer' } })
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Memory Lane Location"),
                        React.createElement("p", { className: "setting-description" }, "Choose where the Memory Lane card appears.")
                    ),
                    React.createElement("select", {
                        className: "form-select",
                        value: settings.memoryLaneLocation || 'dashboard',
                        onChange: e => onUpdateSettings({ ...settings, memoryLaneLocation: e.target.value }),
                        style: { width: 'auto', minWidth: '150px' },
                        disabled: !settings.enableMemoryLane
                    },
                        React.createElement("option", { value: "dashboard" }, "Dashboard (Log Tab)"),
                        React.createElement("option", { value: "history" }, "History Tab")
                    )
                )
            ),

            React.createElement("div", { className: "settings-section" },
                React.createElement("h3", null, "Customization"),
                 React.createElement("div", { className: "setting-item", style: { flexDirection: 'column', alignItems: 'flex-start' } },
                    React.createElement("div", { style: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        React.createElement("span", { className: "setting-label" }, "Customize Mood Palette"),
                        React.createElement("button", { onClick: handleAddMood, className: "btn btn-secondary btn-sm" }, "+ Add")
                    ),
                    (settings.moodPalette || []).map(mood => 
                        React.createElement("div", { key: mood.id, style: { display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center', width: '100%', marginTop: 'var(--spacing-2)' } },
                            // Color swatch
                            React.createElement("span", {
                                style: {
                                    display: 'inline-block',
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    background: mood.colorTheme.border,
                                    border: '2px solid #ccc',
                                    marginRight: 4,
                                },
                                title: 'Mood Color'
                            }),
                            // Emoji
                            React.createElement("input", { type: 'text', className: 'form-input', value: mood.emoji, onChange: e => handleEditMood(mood.id, 'emoji', e.target.value), style: { flex: '0 0 40px', textAlign: 'center' } }),
                            // Name
                            React.createElement("input", { type: 'text', className: 'form-input', value: mood.name, onChange: e => handleEditMood(mood.id, 'name', e.target.value), style: { flex: 1 } }),
                            // Border color (only one color picker now)
                            React.createElement("input", { type: 'color', value: mood.colorTheme.border, onChange: e => handleEditMood(mood.id, 'colorTheme.border', e.target.value), title: 'Mood Color', style: { padding: 0, border: 'none', background: 'none', width: '32px', height: '32px' } }),
                            // Delete
                            React.createElement("button", { onClick: () => handleDeleteMood(mood.id), className: "btn btn-danger btn-sm" }, "−")
                        )
                    )
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Enable Rich Text Formatting"),
                        React.createElement("p", { className: "setting-description" }, "Use a text editor with formatting options (bold, headings, etc.) for your notes. Plain text notes will not be affected.")
                    ),
                    React.createElement("input", { type: "checkbox", checked: !!settings.enableRichTextFormatting, onChange: (e) => onUpdateSettings({ ...settings, enableRichTextFormatting: e.target.checked }), style: { transform: 'scale(1.5)', cursor: 'pointer' } })
                )
            ),
            
            React.createElement("div", { className: "settings-section" },
                React.createElement("h3", null, "AI & Security"),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Enable Proactive AI Suggestions"),
                        React.createElement("p", { className: "setting-description" }, "Allow AI to analyze patterns and suggest goals on your dashboard.")
                    ),
                    React.createElement("input", { type: "checkbox", checked: !!settings.enableAiSuggestions, onChange: (e) => onUpdateSettings({ ...settings, enableAiSuggestions: e.target.checked }), style: { transform: 'scale(1.5)', cursor: 'pointer' } })
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "OpenRouter.ai API Key:"),
                        React.createElement("p", { className: "setting-description" }, "Enter your API key to enable AI summaries and the chatbot. Get your key from ", React.createElement("a", {href: "https://openrouter.ai/keys", target: "_blank", rel: "noopener noreferrer"}, "OpenRouter.ai"), ".")
                    ),
                    React.createElement("input", {
                        type: "password",
                        className: "form-input",
                        style: { width: 'auto', minWidth: '200px' },
                        value: settings.aiApiKey || '',
                        onChange: (e) => onUpdateSettings({ ...settings, aiApiKey: e.target.value }),
                        placeholder: "sk-or-v1-..."
                    })
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Enable AI Quotes"),
                        React.createElement("p", { className: "setting-description" }, "Show AI-generated inspirational quotes (uses tokens from your API key).")
                    ),
                    React.createElement("input", {
                        type: "checkbox",
                        checked: !!settings.enableAiQuotes,
                        onChange: (e) => onUpdateSettings({ ...settings, enableAiQuotes: e.target.checked }),
                        style: { transform: 'scale(1.5)', cursor: 'pointer' }
                    })
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Enable Location Logging"),
                        React.createElement("p", { className: "setting-description" }, "Allow attaching GPS coordinates to mood entries. Requires browser permission.")
                    ),
                    React.createElement("input", { type: "checkbox", checked: !!settings.enableLocationLogging, onChange: (e) => onUpdateSettings({ ...settings, enableLocationLogging: e.target.checked }), style: { transform: 'scale(1.5)', cursor: 'pointer' } })
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Enable Weather Logging"),
                        React.createElement("p", { className: "setting-description" }, "Automatically log weather when you post a new entry. Requires a WeatherAPI.com key.")
                    ),
                    React.createElement("input", { type: "checkbox", checked: !!settings.enableWeatherLogging, onChange: (e) => onUpdateSettings({ ...settings, enableWeatherLogging: e.target.checked }), style: { transform: 'scale(1.5)', cursor: 'pointer' } })
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "WeatherAPI.com Key:"),
                        React.createElement("p", { className: "setting-description" }, "Required for weather logging. Get a free key from ", React.createElement("a", {href: "https://www.weatherapi.com/", target: "_blank", rel: "noopener noreferrer"}, "WeatherAPI.com"), ".")
                    ),
                    React.createElement("input", {
                        type: "password",
                        className: "form-input",
                        style: { width: 'auto', minWidth: '200px' },
                        value: settings.weatherApiKey || '',
                        onChange: (e) => onUpdateSettings({ ...settings, weatherApiKey: e.target.value }),
                        placeholder: "Enter your weather API key"
                    })
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "App Lock Password:"),
                        React.createElement("p", { className: "setting-description" }, "Set a password to lock the entire app on startup.")
                    ),
                    React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' } },
                        settings.appPassword && React.createElement("button", { onClick: onLockApp, className: "btn btn-secondary btn-sm" }, "Lock Now 🔒"),
                        React.createElement("button", { onClick: () => { setShowAppPasswordModal(true); setAppPasswordError(''); setCurrentAppPasswordInput(''); setNewAppPasswordInput(''); }, className: "btn btn-secondary btn-sm" }, settings.appPassword ? "Change/Remove" : "Set Password")
                    )
                ),
                showAppPasswordModal && React.createElement("div", { className: "private-notes-prompt-form mt-4", style: { border: '1px solid var(--accent-primary)' } },
                    React.createElement("h4", { style: { marginBottom: 'var(--spacing-3)' } }, settings.appPassword ? 'Change App Password' : 'Set App Password'),
                    settings.appPassword && React.createElement("input", { type: "password", className: "form-input mb-2", value: currentAppPasswordInput, onChange: (e) => setCurrentAppPasswordInput(e.target.value), placeholder: "Current password", autoFocus: true }),
                    React.createElement("input", { type: "password", className: "form-input", value: newAppPasswordInput, onChange: (e) => setNewAppPasswordInput(e.target.value), placeholder: "New password", autoFocus: !settings.appPassword }),
                    appPasswordError && React.createElement("p", { className: "error-message mt-2" }, appPasswordError),
                    React.createElement("div", { style: { display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-3)' } },
                        React.createElement("button", { onClick: handleSetOrChangeAppPassword, className: "btn btn-primary btn-sm" }, "Save"),
                        settings.appPassword && React.createElement("button", { onClick: handleClearAppPassword, className: "btn btn-danger btn-sm" }, "Remove"),
                        React.createElement("button", { onClick: () => setShowAppPasswordModal(false), className: "btn btn-secondary btn-sm" }, "Cancel")
                    )
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Private Notes Password:"),
                        React.createElement("p", { className: "setting-description" }, "Set a password to protect your private notes.")
                    ),
                    React.createElement("div", {style: {display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', flexBasis: 'auto', flexGrow: 0}},
                        settings.notesPassword ? (
                            React.createElement("button", { onClick: () => setShowChangePasswordModal(true), className: "btn btn-secondary btn-sm" }, "Change/Clear")
                        ) : (
                            React.createElement("input", { type: "password", className: "form-input", style: { width: 'auto', minWidth: '150px', flexGrow: 1 }, value: newPasswordInput, onChange: (e) => setNewPasswordInput(e.target.value), onBlur: () => { if (newPasswordInput !== settings.notesPassword) { onUpdateSettings({ ...settings, notesPassword: newPasswordInput }); } }, placeholder: "Set a new password" })
                        ),
                        showChangePasswordModal && (
                            React.createElement("div", { className: "private-notes-prompt-form", style: { border: '1px solid var(--accent-primary)' }},
                                React.createElement("input", { type: "password", className: "form-input", value: currentPasswordInput, onChange: (e) => setCurrentPasswordInput(e.target.value), placeholder: "Enter current password", autoFocus: true }),
                                currentPasswordError && React.createElement("p", { className: "error-message" }, currentPasswordError),
                                React.createElement("input", { type: "password", className: "form-input", value: newPasswordInput, onChange: (e) => setNewPasswordInput(e.target.value), placeholder: "New password (leave blank to clear)" }),
                                React.createElement("div", {style: {display: 'flex', gap: 'var(--spacing-2)'}},
                                    React.createElement("button", { onClick: handleChangePassword, className: "btn btn-primary btn-sm" }, "Save New"),
                                    React.createElement("button", { onClick: handleClearPassword, className: "btn btn-danger btn-sm" }, "Clear"),
                                    React.createElement("button", { onClick: () => setShowChangePasswordModal(false), className: "btn btn-secondary btn-sm" }, "Cancel")
                                )
                            )
                        )
                    )
                )
            ),
            
            React.createElement("div", { className: "settings-section" },
                React.createElement("h3", null, "Data & Sync"),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Cloud Sync (Future Feature)"),
                        React.createElement("p", {className: "setting-description"}, "Link your cloud storage to sync data across devices (privacy-first).")
                    ),
                    React.createElement("div", {style: {display: 'flex', gap: 'var(--spacing-2)'}},
                         React.createElement("button", { onClick: () => alert("User-owned cloud sync via Google Drive is a planned future feature."), className: "btn btn-secondary btn-sm" }, "Link Google Drive"),
                         React.createElement("button", { onClick: () => alert("User-owned cloud sync via Dropbox is a planned future feature."), className: "btn btn-secondary btn-sm" }, "Link Dropbox")
                    )
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Advanced Export"),
                        React.createElement("p", {className: "setting-description"}, "Generate a printable PDF report or a CSV file for a specific date range.")
                    ),
                    React.createElement("button", { onClick: () => setIsExportModalOpen(true), className: "btn btn-secondary btn-sm" }, "Export PDF / CSV")
                ),
                 React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Export Backup (JSON)"),
                        React.createElement("p", {className: "setting-description"}, "Download all your app data as a single JSON file for safekeeping.")
                    ),
                    React.createElement("button", { onClick: () => onUpdateSettings(settings, true), className: "btn btn-secondary btn-sm" }, "Export All Data")
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Import Backup (JSON)"),
                        React.createElement("p", {className: "setting-description"}, "Import data from a JSON backup. You can merge with or replace current data.")
                    ),
                    React.createElement("input", { type: "file", id: "import-file", accept: ".json", onChange: (e) => onUpdateSettings(e, false, true), style: { display: 'none' } }),
                    React.createElement("label", { htmlFor: "import-file", className: "btn btn-secondary btn-sm", style: {cursor: 'pointer'} }, "Import Data")
                ),
                 React.createElement("div", { className: "setting-item", style: { borderColor: '#EF4444' } },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label", style: {color: '#EF4444'} }, "Purge All Data"),
                        React.createElement("p", {className: "setting-description", style: {color: '#F87171'}}, "A backup file will be downloaded first. This permanently deletes all data from the app.")
                    ),
                    React.createElement("button", { onClick: onPurgeData, className: "btn btn-danger btn-sm" }, "Download Backup & Delete")
                )
            ),
            React.createElement("div", { className: "settings-section" },
                React.createElement("h3", null, "Resources & Links"),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "TinTools Homepage"),
                        React.createElement("p", { className: "setting-description" }, "Visit our homepage for more tools and info.")
                    ),
                    React.createElement("a", { href: "https://tintools.netlify.app/", target: "_blank", rel: "noopener noreferrer", className: "btn btn-secondary btn-sm" }, "Visit Website")
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "MoodChat by TinTools"),
                        React.createElement("p", { className: "setting-description" }, "Begin a conversational screening with our friendly AI.")
                    ),
                    React.createElement("a", { href: "https://tintools.netlify.app/moodchat", target: "_blank", rel: "noopener noreferrer", className: "btn btn-secondary btn-sm" }, "Open MoodChat")
                ),
                React.createElement("div", { className: "setting-item" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "setting-label" }, "Download Android App"),
                        React.createElement("p", { className: "setting-description" }, "Get the native Android version for a better mobile experience.")
                    ),
                    React.createElement("a", { href: "https://tintools.netlify.app/andriod.html", target: "_blank", rel: "noopener noreferrer", className: "btn btn-secondary btn-sm" }, "Get the App on Andriod")
                )
            )
        )
    );
}

// --- 3.7 Gamification: Streaks & Achievements ---
function calculateStreak(entries) {
    if (entries.length === 0) return 0;
    
    const sortedEntries = [...entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const today = DateTimeUtils.getStartOfDay(new Date());
    
    const uniqueLogDays = new Set();
    sortedEntries.forEach(entry => {
        uniqueLogDays.add(DateTimeUtils.getStartOfDay(entry.timestamp).getTime());
    });

    if (!uniqueLogDays.has(today.getTime())) {
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        if (!uniqueLogDays.has(yesterday.getTime())) {
            return 0;
        }
    }
    
    let streak = 0;
    let currentDateToCheck = today;
    
    if (!uniqueLogDays.has(currentDateToCheck.getTime())) {
        currentDateToCheck = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    }
    
    while(uniqueLogDays.has(currentDateToCheck.getTime())) {
        streak++;
        currentDateToCheck = new Date(currentDateToCheck.getTime() - 24 * 60 * 60 * 1000);
    }
    
    return streak;
}


function StreakTracker({ entries }) {
    const streak = calculateStreak(entries);

    if (streak === 0 && entries.length > 0) {
        return React.createElement("div", { className: "streak-tracker", style:{backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)'} },
            React.createElement("p", null, "Log today to start a new streak! 🔥")
        );
    }
    
    if (streak > 0) {
        return (
            React.createElement("div", { className: "streak-tracker" },
                React.createElement("p", null, 
                    React.createElement("span", { role: "img", "aria-label": "fire emoji", className: "emoji" }, "🔥"),
                    `You're on a ${streak}-day logging streak! Keep it up!`
                )
            )
        );
    }
    return null;
}

// ... (rest of the code remains unchanged)

    const handleMouseUp = () => { setIsDragging(false); };
    
    const handleSaveClick = () => {
        onSave({ pfp: imageSrc, pfpStyle: { zoom, top: position.top, left: position.left } });
    };

    const dragWrapperEvents = { onMouseDown: handleMouseDown, onMouseMove: handleMouseMove, onMouseUp: handleMouseUp, onMouseLeave: handleMouseUp };
    
    const cropperStyle = {
        width: '250px', height: '250px', borderRadius: '50%', overflow: 'hidden',
        position: 'relative', margin: '0 auto var(--spacing-4) auto',
        backgroundColor: 'var(--bg-tertiary)', border: '2px solid var(--border-primary)',
        cursor: isDragging ? 'grabbing' : 'grab'
    };

    const imageStyle = {
        position: 'absolute', width: `${100 * zoom}%`, height: 'auto',
        top: `${position.top}px`, left: `${position.left}px`,
        pointerEvents: 'none'
    };

    return React.createElement("div", { className: "modal-overlay" },
        React.createElement("div", { className: "modal-content-wrapper", style: { maxWidth: '400px', textAlign: 'center' }, onClick: e => e.stopPropagation() },
            React.createElement("h3", null, "Edit Profile Picture"),
            React.createElement("p", { className: "text-tertiary" }, "Drag to position and use the slider to zoom."),
            React.createElement("div", { style: cropperStyle, ...dragWrapperEvents },
                imageSrc && React.createElement("img", { ref: imageRef, src: imageSrc, style: imageStyle, alt: "Profile picture preview" })
            ),
            React.createElement("div", { className: "form-group" },
                React.createElement("label", { className: "form-label" }, "Zoom"),
                React.createElement("input", { type: "range", min: "1", max: "3", step: "0.05", value: zoom, onChange: e => setZoom(parseFloat(e.target.value)) })
            ),
            React.createElement("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, accept: "image/png, image/jpeg, image/gif", style: { display: 'none' } }),
            React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' } },
                imageSrc && React.createElement("button", { onClick: onRemove, className: "btn btn-danger" }, "Remove"),
                React.createElement("button", { onClick: () => fileInputRef.current.click(), className: "btn btn-secondary" }, imageSrc ? "Change Image" : "Upload Image"),
                imageSrc && React.createElement("button", { onClick: handleSaveClick, className: "btn btn-primary" }, "Save"),
                React.createElement("button", { onClick: onClose, className: "btn btn-secondary" }, "Cancel")
            )
        )
    );


function ProfileView({ settings, onUpdateSettings, ...data }) {
    const [isPfpEditorOpen, setIsPfpEditorOpen] = useState(false);
    
    const { entries } = data;
    const unlockedAchievements = AchievementUtils.calculateUnlockedAchievements({ ...data, settings });

    const currentStreakValue = calculateStreak(entries);

    const calculateStats = () => {
        const firstEntry = entries.length > 0 ? [...entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0] : null;
        const joinDate = firstEntry ? new Date(firstEntry.timestamp) : new Date();
        const totalMinutes = entries.length * 2;
        const hoursSpent = Math.round(totalMinutes / 60 * 10) / 10; 

        return {
            joinDate,
            totalEntries: entries.length,
            hoursSpent,
            daysActive: firstEntry ? Math.ceil((new Date() - joinDate) / (1000 * 60 * 60 * 24)) : 0
        };
    };

    const stats = calculateStats();

    const handleSavePfp = (pfpData) => {
        onUpdateSettings({ ...settings, ...pfpData });
        setIsPfpEditorOpen(false);
    };

    const handleRemovePfp = () => {
        if (confirm("Are you sure you want to remove your profile picture?")) {
            onUpdateSettings({ 
                ...settings, 
                pfp: null, 
                pfpStyle: DEFAULT_SETTINGS.pfpStyle 
            });
            setIsPfpEditorOpen(false);
        }
    };

    const Avatar = () => {
        const wrapperStyle = {
            width: '100px', height: '100px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-primary)',
            color: 'white', fontSize: '2.5em',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            position: 'relative',
            border: '3px solid var(--bg-tertiary)'
        };

        if (settings.pfp) {
            const { zoom, top, left } = settings.pfpStyle || DEFAULT_SETTINGS.pfpStyle;
            const imageStyle = {
                position: 'absolute',
                width: `${100 * zoom}%`,
                height: 'auto',
                top: `${top}px`,
                left: `${left}px`,
            };
            return React.createElement("div", { style: wrapperStyle },
                React.createElement("img", { src: settings.pfp, style: imageStyle, alt: "User profile picture" })
            );
        }

        return React.createElement("div", { style: wrapperStyle }, settings.userName ? settings.userName[0].toUpperCase() : '?');
    };

    return React.createElement("div", { className: "profile-view" },
        React.createElement(PfpEditorModal, {
            isOpen: isPfpEditorOpen,
            onClose: () => setIsPfpEditorOpen(false),
            onSave: handleSavePfp,
            onRemove: handleRemovePfp,
            existingPfp: settings.pfp,
            existingPfpStyle: settings.pfpStyle
        }),
        React.createElement("div", { className: "card", style: { marginBottom: 'var(--spacing-6)' } },
            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-4)' }},
                React.createElement("div", { className: "profile-avatar-container", style: { position: 'relative' }},
                    React.createElement(Avatar, null),
                    React.createElement("button", {
                        onClick: () => setIsPfpEditorOpen(true),
                        title: "Edit Profile Picture",
                        style: {
                            position: 'absolute', bottom: 0, right: 0,
                            backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                            borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'var(--shadow-sm)'
                        }
                    }, "✏️")
                ),
                React.createElement("div", null,
                    React.createElement("h2", { style: { margin: 0, marginBottom: 'var(--spacing-2)', color: 'var(--text-primary)', fontSize: '2em' }}, settings.userName || 'Anonymous User'),
                    React.createElement("p", { style: { margin: 0, color: 'var(--text-tertiary)', fontSize: '1.1em' }}, `Joined ${stats.joinDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`)
                )
            ),
            React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-4)' }},
                [
                    { icon: '📝', label: 'Total Logs', value: stats.totalEntries },
                    { icon: '⏱️', label: 'Hours Spent (Est.)', value: stats.hoursSpent },
                    { icon: '📅', label: 'Days Active', value: stats.daysActive },
                    { icon: '🔥', label: 'Current Streak', value: currentStreakValue }
                ].map(stat => 
                    React.createElement("div", { key: stat.label, style: { backgroundColor: 'var(--bg-tertiary)', padding: 'var(--spacing-3)', borderRadius: 'var(--border-radius-md)', textAlign: 'center' }},
                        React.createElement("div", { style: { fontSize: '1.5em', marginBottom: 'var(--spacing-1)' } }, stat.icon),
                        React.createElement("div", { style: { fontSize: '1.5em', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 'var(--spacing-1)' }}, stat.value),
                        React.createElement("div", { style: { fontSize: '0.9em', color: 'var(--text-tertiary)' }}, stat.label)
                    )
                )
            )
        ),
        React.createElement("div", { className: "card" },
            React.createElement("h3", { style: { marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }},
                React.createElement("span", { role: "img", "aria-label": "trophy" }, "🏆"),
                "Achievements",
                React.createElement("span", { style: { fontSize: '0.8em', color: 'var(--text-tertiary)', fontWeight: 'normal', marginLeft: 'auto' }}, `${unlockedAchievements.length}/${ACHIEVEMENTS_LIBRARY.length} Unlocked`)
            ),
            React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-3)' }},
                ACHIEVEMENTS_LIBRARY.map(achievement => {
                    const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
                    return React.createElement("div", { key: achievement.id, className: "achievement-item", "data-unlocked": isUnlocked },
                        React.createElement("div", { className: "achievement-icon" }, achievement.emoji),
                        React.createElement("div", { className: "achievement-details"},
                            React.createElement("h4", { className: "achievement-name"}, achievement.name),
                            React.createElement("p", { className: "achievement-desc"}, achievement.description)
                        )
                    );
                })
            )
        ),
        React.createElement(AboutMeEditor, {
            aboutMeNotes: settings.aboutMeNotes || [],
            onUpdateNotes: (newNotes) => onUpdateSettings({ ...settings, aboutMeNotes: newNotes })
        })
    );
}

function LockScreen({ onUnlock, userName }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [bg, setBg] = useState('');
    const [animateOut, setAnimateOut] = useState(false);

    useEffect(() => {
        const bgNum = Math.random() < 0.5 ? 1 : 2;
        setBg(`back${bgNum}.webp`);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setAnimateOut(true);
        setTimeout(() => {
            onUnlock(password);
        }, 700); // Match animation duration
    };

    return React.createElement("div", {
        className: `modal-overlay lockscreen-overlay${animateOut ? ' lockscreen-fade-up' : ''}`,
        style: {
            zIndex: 2000,
            backgroundColor: 'var(--bg-primary)',
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }
    },
        React.createElement("div", {
            className: `card lockscreen-card${animateOut ? ' lockscreen-card-fade-up' : ''}`,
            style: { width: '90%', maxWidth: '350px', padding: 'var(--spacing-8)', textAlign: 'center' }
        },
            React.createElement('img', {
                src: 'mvtlogo.webp',
                alt: 'Mood Vibe',
                style: { width: 80, height: 80, marginBottom: 24, objectFit: 'contain', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.12))' }
            }),
            React.createElement("span", { role: "img", "aria-label": "lock", style: { fontSize: '3em', marginBottom: 'var(--spacing-4)', display: 'block' } }, ""),
            React.createElement("h2", { className: "mb-2" }, "🔒 App Locked"),
            React.createElement("p", { className: "text-tertiary mb-4" }, `Welcome back, ${userName || 'User'}. Please enter your password.`),
            React.createElement("form", { onSubmit: handleSubmit },
                React.createElement("div", { className: "form-group" },
                    React.createElement("input", { type: "password", className: "form-input", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Password", autoFocus: true })
                ),
                error && React.createElement("p", { className: "error-message", style: { marginBottom: 'var(--spacing-3)' } }, error),
                React.createElement("button", { type: "submit", className: "btn btn-primary", style: { width: '100%' } }, "Unlock")
            )
        )
    );
}

// ===================================================================================
// ========================= MEASURABLES FEATURE COMPONENTS =====================
// ===================================================================================

function MeasurableManagerModal({ isOpen, onClose, onSave, measurableToEdit }) {
    const [measurable, setMeasurable] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setMeasurable(measurableToEdit || {
                id: null, name: '', unit: '', icon: '🎯', type: 'value',
                target: null, targetType: 'min', maxRating: 5
            });
        }
    }, [isOpen, measurableToEdit]);

    if (!isOpen || !measurable) return null;

    const handleSave = () => {
        if (!measurable.name.trim() || !measurable.unit.trim()) {
            alert("Please provide a name and unit for the measurable.");
            return;
        }
        onSave(measurable);
        onClose();
    };

    return React.createElement("div", { className: "modal-overlay", onClick: onClose },
        React.createElement("div", { className: "modal-content-wrapper", onClick: e => e.stopPropagation() },
            React.createElement("h2", null, measurable.id ? "Edit Measurable" : "Add New Measurable"),
            React.createElement("div", { className: "form-group" },
                React.createElement("label", { className: "form-label" }, "Activity Name"),
                React.createElement("input", { type: "text", className: "form-input", value: measurable.name, onChange: e => setMeasurable({...measurable, name: e.target.value}), placeholder: "e.g., Cycling, Meditation" })
            ),
            React.createElement("div", { style: {display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)'}},
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Unit"),
                    React.createElement("input", { type: "text", className: "form-input", value: measurable.unit, onChange: e => setMeasurable({...measurable, unit: e.target.value}), placeholder: "e.g., km, minutes, glasses" })
                ),
                 React.createElement("div", { className: "form-group" },
                    React.createElement("label", { className: "form-label" }, "Icon"),
                    React.createElement("input", { type: "text", className: "form-input", value: measurable.icon, onChange: e => setMeasurable({...measurable, icon: e.target.value}), placeholder: "e.g., 🚲" }),
                    React.createElement(EmojiSuggestions, { onSelect: (emoji) => setMeasurable({...measurable, icon: emoji}) })
                )
            ),
            React.createElement("div", { className: "form-group" },
                React.createElement("label", { className: "form-label" }, "Tracking Type"),
                React.createElement("select", { className: "form-select", value: measurable.type, onChange: e => setMeasurable({...measurable, type: e.target.value, target: null, maxRating: 5 }) },
                    React.createElement("option", { value: "value" }, "Value (e.g., 10 km, 8 glasses)"),
                    React.createElement("option", { value: "duration" }, "Duration / Sleep (Start/Stop timer)"),
                    React.createElement("option", { value: "rating" }, "Rating (e.g., 1-5 scale for pain, energy)"),
                    React.createElement("option", { value: "boolean" }, "Check-in (e.g., Yes/No for medication)")
                ),
                measurable.type === 'duration' && React.createElement("p", {className: "setting-description mt-2"}, "Duration tracking is ideal for activities like sleep where you time the start and end.")
            ),
            measurable.type === 'rating' && React.createElement("div", { className: "form-group" },
                React.createElement("label", { className: "form-label" }, "Rating Scale (1 to X)"),
                React.createElement("input", { 
                    type: "number", 
                    className: "form-input", 
                    value: measurable.maxRating || 5, 
                    onChange: e => setMeasurable({...measurable, maxRating: parseInt(e.target.value, 10) || 5}),
                    min: "2",
                    max: "10"
                }),
                React.createElement("p", { className: "setting-description mt-2" }, "Set the maximum value for your rating scale (e.g., 5 for a 1-5 scale).")
            ),
            measurable.type === 'value' && React.createElement("div", { className: "form-group" },
                React.createElement("label", { className: "form-label" }, "Daily Target (optional)"),
                React.createElement("div", { style: {display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-3)'}},
                    React.createElement("select", { className: "form-select", value: measurable.targetType, onChange: e => setMeasurable({...measurable, targetType: e.target.value}) },
                        React.createElement("option", {value: "min"}, "Minimum"),
                        React.createElement("option", {value: "max"}, "Maximum")
                    ),
                    React.createElement("input", { type: "number", className: "form-input", value: measurable.target || '', onChange: e => setMeasurable({...measurable, target: e.target.value === '' ? null : parseFloat(e.target.value)}), placeholder: `e.g., 8 ${measurable.unit}` })
                )
            ),
            React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' } },
                React.createElement("button", { className: "btn btn-secondary", onClick: onClose }, "Cancel"),
                React.createElement("button", { className: "btn btn-primary", onClick: handleSave }, "Save")
            )
        )
    );
}

function MeasurableChart({ logs, measurable, timeRange }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const filteredLogs = useMemo(() => {
        const now = new Date();
        let startDate = new Date();
        switch(timeRange) {
            case '7d': startDate.setDate(now.getDate() - 7); break;
            case '30d': startDate.setDate(now.getDate() - 30); break;
            case 'all': return logs.sort((a,b) => new Date(a.endTimestamp) - new Date(b.endTimestamp));
            default: startDate.setDate(now.getDate() - 30);
        }
        
        return logs
            .filter(log => new Date(log.endTimestamp) >= startDate)
            .sort((a,b) => new Date(a.endTimestamp) - new Date(b.endTimestamp));

    }, [logs, timeRange]);

    useEffect(() => {
        if (!chartRef.current || filteredLogs.length < 1) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
            return;
        }

        const ctx = chartRef.current.getContext('2d');
        const labels = filteredLogs.map(log => DateTimeUtils.formatTimestamp(log.endTimestamp, { month: 'short', day: 'numeric' }));
        const dataPoints = filteredLogs.map(log => 
            measurable.type === 'duration' ? 
            parseFloat(DateTimeUtils.durationToHours(log.value).toFixed(2)) : 
            log.value
        );

        const data = {
            labels: labels,
            datasets: [{
                label: measurable.unit,
                data: dataPoints,
                backgroundColor: 'rgba(var(--accent-primary-rgb), 0.2)',
                borderColor: 'var(--accent-primary)',
                borderWidth: 2,
                tension: 0.1,
                fill: true,
            }]
        };

        if (chartInstance.current) {
            chartInstance.current.data = data;
            chartInstance.current.update();
        } else {
            chartInstance.current = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, title: { display: true, text: measurable.unit, color: 'var(--text-secondary)' }, ticks: { color: 'var(--text-secondary)' }, grid: { color: 'var(--border-primary)' } } ,
                              x: { ticks: { color: 'var(--text-secondary)' }, grid: { display: false } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }
        
        return () => {
             if(chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
             }
        }
    }, [filteredLogs, measurable]);
    
    return React.createElement("div", { className: "chart-wrapper", style: { padding: 'var(--spacing-2)', height: '250px' } },
        filteredLogs.length > 0 ?
            React.createElement("canvas", { ref: chartRef }) :
            React.createElement("div", { className: "text-center p-4", style: {height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}, React.createElement("p", {className: "text-tertiary"}, "Not enough data for this time period to display a chart."))
    );
}

function MeasurableStats({ logs, measurable, timeRange }) {
    const filteredLogs = useMemo(() => {
        const now = new Date();
        let startDate = new Date();
        switch(timeRange) {
            case '7d': startDate.setDate(now.getDate() - 7); break;
            case '30d': startDate.setDate(now.getDate() - 30); break;
            case 'all': return logs;
            default: startDate.setDate(now.getDate() - 30);
        }
        return logs.filter(log => new Date(log.endTimestamp) >= startDate);
    }, [logs, timeRange]);

    const stats = useMemo(() => {
        if (filteredLogs.length === 0) return null;
        
        const values = filteredLogs.map(log => log.value);
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const best = Math.max(...values);
        const worst = Math.min(...values);

        if (measurable.type === 'duration') {
            return [
                { label: 'Avg Sleep', value: DateTimeUtils.formatDuration(avg) },
                { label: 'Longest', value: DateTimeUtils.formatDuration(best) },
                { label: 'Shortest', value: DateTimeUtils.formatDuration(worst) },
                { label: 'Total Logs', value: values.length },
            ];
        } else if (measurable.type === 'rating') {
            const yesCount = values.filter(v => v > 0).length;
            const noCount = values.filter(v => v === 0).length;
            return [
                { label: 'Average Rating', value: avg.toFixed(1) },
                { label: 'Best Rating', value: best },
                { label: 'Worst Rating', value: worst },
                { label: 'Total Logs', value: values.length },
            ];
        } else if (measurable.type === 'boolean') {
            const yesCount = values.filter(v => v === 1).length;
            const noCount = values.filter(v => v === 0).length;
            const yesPercentage = values.length > 0 ? ((yesCount / values.length) * 100).toFixed(1) : 0;
            return [
                { label: 'Yes Count', value: yesCount },
                { label: 'No Count', value: noCount },
                { label: 'Success Rate', value: `${yesPercentage}%` },
                { label: 'Total Logs', value: values.length },
            ];
        } else {
             return [
                { label: `Avg ${measurable.unit}`, value: avg.toFixed(1) },
                { label: `Total ${measurable.unit}`, value: sum.toFixed(1) },
                { label: 'Best', value: best },
                { label: 'Worst', value: worst },
            ];
        }
    }, [filteredLogs, measurable]);

    if (!stats) return React.createElement("p", { className: "text-tertiary text-center mt-4" }, "No logs in this period.");

    return React.createElement("div", { className: "measurable-stats-grid" },
        stats.map(stat => 
            React.createElement("div", { key: stat.label, className: "stat-card" },
                React.createElement("div", { className: "stat-value" }, stat.value),
                React.createElement("div", { className: "stat-label" }, stat.label)
            )
        )
    );
}

// Log history for a single measurable
function MeasurableLogHistory({ logs, measurable, onDeleteLog }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const ITEMS_PER_PAGE = 5;

    const filteredAndSortedLogs = useMemo(() => {
        return logs
            .filter(log => {
                if (!searchTerm) return true;
                const term = searchTerm.toLowerCase();
                const value = String(log.value).toLowerCase();
                const notes = log.notes ? log.notes.toLowerCase() : '';
                return value.includes(term) || notes.includes(term);
            })
            .sort((a,b) => new Date(b.endTimestamp) - new Date(a.endTimestamp));
    }, [logs, searchTerm]);

    const totalPages = Math.ceil(filteredAndSortedLogs.length / ITEMS_PER_PAGE);
    const paginatedLogs = filteredAndSortedLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (logs.length === 0) {
        return React.createElement("p", { className: "text-tertiary text-center" }, "No log entries yet.");
    }
    
    return React.createElement("div", { className: "measurable-log-history" },
        React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' } },
            React.createElement("h4", { style: { margin: 0 } }, "Log History"),
            logs.length > 10 && React.createElement("input", {
                type: 'search',
                className: 'form-input',
                style: { width: 'auto', maxWidth: '200px' },
                placeholder: 'Search logs...',
                value: searchTerm,
                onChange: e => setSearchTerm(e.target.value)
            })
        ),
        paginatedLogs.length > 0 ? paginatedLogs.map(log => 
            React.createElement("div", { key: log.id, className: "measurable-log-item" },
                React.createElement("div", { className: "log-details" },
                    React.createElement("span", { className: "log-value" },
                        measurable.type === 'duration' 
                        ? DateTimeUtils.formatDuration(log.value)
                        : measurable.type === 'boolean'
                        ? (log.value === 1 ? '✅ Yes' : '❌ No')
                        : measurable.type === 'rating'
                        ? `Rated: ${log.value} / ${measurable.maxRating || 5}`
                        : `${log.value} ${measurable.unit}`
                    ),
                    React.createElement("span", { className: "log-timestamp ms-2" }, ` on ${DateTimeUtils.formatTimestamp(log.endTimestamp, {dateStyle: 'medium'})}`),
                    log.notes && React.createElement("p", { className: "log-notes" }, log.notes)
                ),
                React.createElement("button", { onClick: () => onDeleteLog(log.id), className: "delete-btn" }, "🗑️")
            )
        ) : React.createElement("p", { className: "text-tertiary text-center" }, "No logs match your search."),
        totalPages > 1 && React.createElement("div", { className: "pagination-controls" },
            React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => handlePageChange(currentPage - 1), disabled: currentPage === 1 }, "‹"),
            React.createElement("span", { className: "pagination-info" }, `Page ${currentPage} of ${totalPages}`),
            React.createElement("button", { className: "btn btn-secondary btn-sm", onClick: () => handlePageChange(currentPage + 1), disabled: currentPage === totalPages }, "›")
        )
    );
}


// Main dashboard for a single measurable activity
function MeasurableDashboard({ measurable, logs, onAddLog, onDeleteLog, onUpdateMeasurable, onDeleteMeasurable, activeSleepSession, onStartSleep, onEndSleep, settings }) {
    const [logValue, setLogValue] = useState('');
    const [logNotes, setLogNotes] = useState('');
    const [logDate, setLogDate] = useState(DateTimeUtils.getStartOfDayISO(new Date()));
    const [isEditing, setIsEditing] = useState(false);
    const [timeRange, setTimeRange] = useState('30d');
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [ratingValue, setRatingValue] = useState(0);

    const handleLogSubmit = (e) => {
        e.preventDefault();
        const value = parseFloat(logValue);
        if (isNaN(value)) {
            alert('Please enter a valid number.');
            return;
        }

        // FIX: Create a proper Date object from the logDate state
        // We set it to near the end of the day to ensure it's logged for the correct date regardless of timezone.
        const logTimestamp = new Date(logDate);
        logTimestamp.setHours(23, 59, 59, 999);

        onAddLog({
            id: generateId(),
            measurableId: measurable.id,
            value: value,
            notes: logNotes,
            startTimestamp: null,
            endTimestamp: logTimestamp.toISOString() // This now works correctly
        });
    
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2500);

        setLogValue('');
        setLogNotes('');
    };

    const handleSimpleLog = (value, notes = '') => {
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Log at end of today

        onAddLog({
            id: generateId(),
            measurableId: measurable.id,
            value: value,
            notes: notes,
            startTimestamp: null,
            endTimestamp: today.toISOString(),
        });
        
        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            setRatingValue(0); // Reset rating
        }, 2500);
    };

    const handleGenerateAiAnalysis = async () => {
        if (!settings.aiApiKey) {
            alert("Please set your AI API key in Settings to use this feature.");
            return;
        }
        setIsAiLoading(true);
        setAiAnalysis('');
        
        const recentLogs = logs
            .filter(l => l.measurableId === measurable.id)
            .sort((a, b) => new Date(b.endTimestamp) - new Date(a.endTimestamp))
            .slice(0, 15);
        
        if (recentLogs.length < 3) {
            setAiAnalysis("Not enough data to generate a meaningful analysis. Please log at least 3 entries.");
            setIsAiLoading(false);
            return;
        }

        const dataSummary = recentLogs.map(log => {
            const date = DateTimeUtils.formatTimestamp(log.endTimestamp, {month: 'short', day: 'numeric'});
            let valueText = '';
            if (measurable.type === 'duration') {
                const bedtime = DateTimeUtils.formatTimestamp(log.startTimestamp, {timeStyle: 'short'});
                const waketime = DateTimeUtils.formatTimestamp(log.endTimestamp, {timeStyle: 'short'});
                valueText = `${DateTimeUtils.formatDuration(log.value)} (from ${bedtime} to ${waketime})`;
            } else if (measurable.type === 'boolean') {
                valueText = log.value === 1 ? 'Yes' : 'No';
            } else if (measurable.type === 'rating') {
                valueText = `Rated ${log.value}/${measurable.maxRating || 5}`;
            } else {
                valueText = `${log.value} ${measurable.unit}`;
            }
            return `- ${date}: ${valueText}`;
        }).join('\n');

        try {
            const messages = [
                { role: "system", content: "You are a helpful wellness analysis assistant. Based on the user's data for a specific activity, provide brief, actionable insights about their consistency, totals, or timing. Frame it as gentle observations. Do not give medical advice. Keep it concise." },
                { role: "user", content: `Here is my recent data for "${measurable.name}". Please provide a brief analysis:\n\n${dataSummary}` }
            ];
            const result = await callDeepSeekAPI(messages, settings.aiApiKey);
            setAiAnalysis(result);
        } catch (err) {
            setAiAnalysis("Error generating analysis: " + err.message);
        } finally {
            setIsAiLoading(false);
        }
    };

    const isSleepActiveForThis = activeSleepSession && activeSleepSession.measurableId === measurable.id;
    const relevantLogs = useMemo(() => logs.filter(l => l.measurableId === measurable.id), [logs, measurable.id]);

    const TargetDisplay = () => {
        if (measurable.type !== 'value' || !measurable.target) return null;
        return React.createElement("p", { className: "text-tertiary", style: { margin: 0, paddingBottom: 'var(--spacing-3)' } },
            `🎯 Target: ${measurable.targetType === 'min' ? 'At least' : 'At most'} ${measurable.target} ${measurable.unit} per day.`
        );
    };

return React.createElement("div", { className: "measurable-dashboard" },
    React.createElement(MeasurableManagerModal, { isOpen: isEditing, onClose: () => setIsEditing(false), onSave: onUpdateMeasurable, measurableToEdit: measurable }),
    React.createElement("div", { className: "measurable-header" },
        React.createElement("h3", { className: "measurable-title" }, 
            React.createElement("span", {className: "emoji"}, measurable.icon),
            measurable.name
        ),
        React.createElement("div", null,
            React.createElement("button", { onClick: () => setIsEditing(true), className: "btn btn-secondary btn-sm" }, "Edit"),
            React.createElement("button", { onClick: () => onDeleteMeasurable(measurable.id), className: "btn btn-danger btn-sm", style:{marginLeft: '8px'}}, "Delete")
        )
    ),
    React.createElement("div", { className: "measurable-content" },
        React.createElement("div", { className: "measurable-logging-area" },
            measurable.type === 'duration' ?
                ( // Sleep Tracker UI
                    isSleepActiveForThis ? 
                    React.createElement("div", { className: "sleep-tracker-active" },
                        React.createElement("h4", null, "Sleep Session Active..."),
                        React.createElement("p", { className: "mb-4" }, `Started at: ${DateTimeUtils.formatTimestamp(activeSleepSession.startTimestamp)}`),
                        React.createElement("button", { onClick: () => onEndSleep(), className: "btn btn-success" }, "I'm Awake!")
                    ) :
                    React.createElement(React.Fragment, null,
                        React.createElement("h4", null, "Ready for Bed?"),
                        React.createElement("button", { onClick: () => onStartSleep(measurable.id), className: "btn btn-primary", disabled: !!activeSleepSession }, "Start Sleep Session")
                    )
                ) :
            measurable.type === 'rating' ? (
                // NEW RATING UI
                React.createElement("div", { className: "rating-logger" },
                    React.createElement("h4", null, `How would you rate your "${measurable.name}" today?`),
                    React.createElement("div", { className: "rating-input-group" },
                        Array.from({ length: measurable.maxRating || 5 }, (_, i) => i + 1).map(num => (
                            React.createElement("button", { 
                                key: num,
                                className: `btn rating-btn ${ratingValue === num ? 'selected' : ''}`,
                                onClick: () => setRatingValue(num)
                            }, num)
                        ))
                    ),
                    React.createElement("button", {
                        onClick: () => handleSimpleLog(ratingValue),
                        className: `btn ${isSuccess ? 'btn-success' : 'btn-primary'} mt-3`,
                        disabled: isSuccess || ratingValue === 0
                    }, isSuccess ? 'Logged ✓' : 'Log Rating')
                )
            ) :
            measurable.type === 'boolean' ? (
                // NEW BOOLEAN UI
                React.createElement("div", { className: "boolean-logger" },
                    React.createElement("h4", null, `Did you do "${measurable.name}" today?`),
                    React.createElement("div", { className: "boolean-input-group" },
                        React.createElement("button", {
                            onClick: () => handleSimpleLog(1, "Yes"),
                            className: "btn btn-primary",
                            disabled: isSuccess
                        }, "✅ Yes"),
                        React.createElement("button", {
                            onClick: () => handleSimpleLog(0, "No"),
                            className: "btn btn-secondary",
                            disabled: isSuccess
                        }, "❌ No")
                    ),
                    isSuccess && React.createElement("p", { className: "success-message mt-2" }, "Logged! ✓")
                )
            ) :
            ( // Value Tracker UI
                React.createElement("form", { onSubmit: handleLogSubmit },
                    React.createElement("h4", null, "Log a new entry"),
                    React.createElement(TargetDisplay, null),
                    React.createElement("div", { style: {display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-3)'}},
                        React.createElement("div", { className: "form-group" },
                            React.createElement("label", { className: "form-label" }, `Value (${measurable.unit})`),
                            React.createElement("input", { type: "number", step: "any", className: "form-input", value: logValue, onChange: e => setLogValue(e.target.value), required: true })
                        ),
                        React.createElement("div", { className: "form-group" },
                            React.createElement("label", { className: "form-label" }, "Date"),
                            React.createElement("input", { type: "date", className: "form-input", value: logDate, onChange: e => setLogDate(e.target.value) })
                        )
                    ),
                     React.createElement("div", { className: "form-group" },
                        React.createElement("label", { className: "form-label" }, "Notes (optional)"),
                        React.createElement("input", { type: "text", className: "form-input", value: logNotes, onChange: e => setLogNotes(e.target.value) })
                    ),
                    React.createElement("button", { 
                        type: "submit", 
                        className: `btn ${isSuccess ? 'btn-success' : 'btn-primary'}`,
                        disabled: isSuccess
                    }, isSuccess ? "Logged ✓" : "Log Entry")
                )
            )
        ),
        React.createElement("div", { className: "measurable-analytics-area" },
            React.createElement("div", { style: {display: 'flex', justifyContent: 'space-between', alignItems: 'center'}},
                React.createElement("h4", { className: "mb-0" }, "Analytics"),
                React.createElement("select", { className: "form-select", value: timeRange, onChange: e => setTimeRange(e.target.value), style: {width: 'auto'}},
                    React.createElement("option", {value: "7d"}, "Last 7 Days"),
                    React.createElement("option", {value: "30d"}, "Last 30 Days"),
                    React.createElement("option", {value: "all"}, "All Time")
                )
            ),
            React.createElement(MeasurableChart, { logs: relevantLogs, measurable: measurable, timeRange: timeRange }),
            React.createElement(MeasurableStats, { logs: relevantLogs, measurable: measurable, timeRange: timeRange }),
            React.createElement("div", { className: "mt-4 text-center", style:{display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'center'} },
                isAiLoading ? React.createElement("div", {className: "loader"}) :
                aiAnalysis ? React.createElement("div", {className: "mood-item-private-notes", style:{textAlign:'left'}}, React.createElement("p", {style:{margin:0}}, aiAnalysis)) :
                React.createElement("button", { onClick: handleGenerateAiAnalysis, className: "btn btn-secondary btn-sm"}, "Get AI Analysis 🤖"),
                React.createElement("button", { onClick: () => setShowHistory(!showHistory), className: "btn btn-secondary btn-sm"}, showHistory ? "Hide History" : "View Log History")
            )
        )
    ),
    showHistory && React.createElement(MeasurableLogHistory, { 
        logs: relevantLogs, 
        measurable: measurable, 
        onDeleteLog: onDeleteLog
    })
);
}

// Main View for the Measurables Feature
function MeasurablesView({ measurables, onUpdateMeasurables, measurableLogs, onAddLog, onDeleteLog, activeSleepSession, onStartSleep, onEndSleep, settings }) {
const [isManagerOpen, setIsManagerOpen] = useState(false);

const handleSaveMeasurable = (measurableData) => {
    if (measurableData.id) { // Editing existing
        onUpdateMeasurables(measurables.map(m => m.id === measurableData.id ? measurableData : m));
    } else { // Adding new
        onUpdateMeasurables([...measurables, { ...measurableData, id: generateId() }]);
    }
};

const handleDeleteMeasurable = (idToDelete) => {
    if (confirm("Are you sure you want to delete this measurable and ALL its logged data? This cannot be undone.")) {
        SoundUtils.playSound('audio-delete', settings);
        onDeleteMeasurable(idToDelete);
    }
};

if (!settings.showMeasurables) {
    return React.createElement("div", { className: "card text-center" },
        React.createElement("h2", null,
            React.createElement("span", { className: "section-icon" }, "📏"),
            settings.interfaceStyle !== 'minimal' && React.createElement("span", { className: "section-title-text" }, "Measurables Disabled")
        ),
        React.createElement("p", null, "The Measurables feature is currently disabled."),
        React.createElement("p", { className: "text-tertiary" }, "You can enable it in the main App Settings.")
    );
}

return React.createElement("div", { className: "measurables-view" },
    React.createElement(MeasurableManagerModal, { isOpen: isManagerOpen, onClose: () => setIsManagerOpen(false), onSave: handleSaveMeasurable }),
    React.createElement("div", { className: "card" },
        React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' } },
            React.createElement("h2", { className: "mb-0" },
                React.createElement("span", { className: "section-icon" }, "📏"),
                settings.interfaceStyle !== 'minimal' && React.createElement("span", { className: "section-title-text" }, "Your Measurables")
            ),
            React.createElement("button", { onClick: () => setIsManagerOpen(true), className: "btn btn-primary" }, "+ New Measurable")
        ),
        React.createElement("p", { className: "text-tertiary" }, "Track custom activities like sleep, exercise, or water intake to see how they connect with your mood.")
    ),
    measurables.length > 0 ?
        React.createElement("div", { className: "measurables-grid" },
            measurables.map(m => React.createElement(MeasurableDashboard, {
                key: m.id,
                measurable: m,
                logs: measurableLogs,
                onAddLog: onAddLog,
                onDeleteLog: onDeleteLog,
                onUpdateMeasurable: handleSaveMeasurable,
                onDeleteMeasurable: handleDeleteMeasurable,
                activeSleepSession: activeSleepSession,
                onStartSleep: onStartSleep,
                onEndSleep: onEndSleep,
                settings: settings
            }))
        )
        :
        React.createElement("div", { className: "card text-center" },
            React.createElement("p", null, "You haven't added any measurables yet."),
            React.createElement("button", { onClick: () => setIsManagerOpen(true), className: "btn btn-secondary" }, "Add your first one!")
        )
);
}

// Modal for when user opens app during a sleep session
function MidnightWakeModal({ onConfirmAwake, onDismiss, sleepStartTime }) {
return React.createElement("div", { className: "modal-overlay" },
    React.createElement("div", { className: "modal-content-wrapper", style:{textAlign: 'center'}},
        React.createElement("h2", null, "Still Up?"),
        React.createElement("p", { className: "text-tertiary" }, `Your sleep session started at ${DateTimeUtils.formatTimestamp(sleepStartTime, {timeStyle: 'short'})}.`),
        React.createElement("p", null, "Are you waking up for the day or just checking your phone?"),
        React.createElement("div", { className: "mt-6", style: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' } },
            React.createElement("button", { onClick: onConfirmAwake, className: "btn btn-primary" }, "I'm Awake (End Session)"),
            React.createElement("button", { onClick: onDismiss, className: "btn btn-secondary" }, "Just Checking (Continue Session)")
        )
    )
);
}

// Global Search View
function GlobalSearchView({ entries, events, goals, settings, onImageView }) {
const [searchTerm, setSearchTerm] = useState('');
const moodPalette = settings.moodPalette || DEFAULT_MOOD_PALETTE;

const results = useMemo(() => {
    if (!searchTerm.trim()) {
        return { moods: [], events: [], goals: [] };
    }
    const term = searchTerm.toLowerCase();

    const moodResults = entries.filter(e => 
        e.notes?.toLowerCase().includes(term) || 
        e.privateNotes?.toLowerCase().includes(term) ||
        e.tags?.some(t => t.toLowerCase().includes(term))
    ).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

    const eventResults = events.filter(e => 
        e.title?.toLowerCase().includes(term) || 
        e.notes?.toLowerCase().includes(term) ||
        e.tags?.some(t => t.toLowerCase().includes(term))
    ).sort((a,b) => new Date(b.startDate) - new Date(a.startDate));

    const goalResults = goals.filter(g => 
        g.title?.toLowerCase().includes(term) || 
        g.description?.toLowerCase().includes(term)
    ).sort((a,b) => new Date(b.startDate) - new Date(a.startDate));

    return { moods: moodResults, events: eventResults, goals: goalResults };
}, [searchTerm, entries, events, goals]);

const highlight = (text) => {
    if (!searchTerm.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return React.createElement("span", null, 
        parts.map((part, i) => 
            part.toLowerCase() === searchTerm.toLowerCase()
                ? React.createElement("span", { key: i, className: "highlight" }, part)
                : part
        )
    );
};

return React.createElement("div", { className: "card" },
    React.createElement("h2", null, "Global Search 🔍"),
    React.createElement("p", { className: "text-tertiary" }, "Find anything across your mood entries, events, and goals."),
    React.createElement("div", { className: "form-group" },
        React.createElement("input", {
            type: "search",
            className: "form-input",
            placeholder: "Search everything...",
            value: searchTerm,
            onChange: e => setSearchTerm(e.target.value),
            autoFocus: true
        })
    ),
    searchTerm.trim() && React.createElement("div", { className: "search-results-container" },
        results.moods.length > 0 && React.createElement("div", { className: "search-result-group" },
            React.createElement("h3", null, `Moods (${results.moods.length})`),
            results.moods.map(entry => {
                const mood = moodPalette.find(m => m.id === entry.moodId);
                return React.createElement("div", { key: entry.id, className: "search-result-item" },
                    entry.imageUrl && React.createElement("img", { src: entry.imageUrl, className: "search-result-image-sm", onClick: () => onImageView(entry.imageUrl) }),
                    React.createElement("div", { style: { flex: 1 }},
                        React.createElement("p", { className: "font-bold" }, `${mood?.emoji || '❓'} ${mood?.name || 'Unknown'}`),
                        React.createElement("p", { className: "text-tertiary", style: { fontSize: '0.8em' } }, DateTimeUtils.formatTimestamp(entry.timestamp)),
                        entry.notes && React.createElement("p", { className: "text-secondary mt-1" }, highlight(entry.notes)),
                        entry.tags?.length > 0 && React.createElement("p", { className: "text-tertiary mt-1" }, highlight(entry.tags.join(', ')))
                    )
                );
            })
        ),
        results.events.length > 0 && React.createElement("div", { className: "search-result-group" },
            React.createElement("h3", null, `Events (${results.events.length})`),
            results.events.map(event =>
                React.createElement("div", { key: event.id, className: "search-result-item" },
                    React.createElement("div", { style: { flex: 1 }},
                        React.createElement("p", { className: "font-bold" }, highlight(event.title)),
                         React.createElement("p", { className: "text-tertiary", style: { fontSize: '0.8em' } }, `Starts: ${DateTimeUtils.formatTimestamp(event.startDate, {dateStyle: 'short'})}`),
                        React.createElement("p", { className: "text-secondary mt-1" }, highlight(event.notes)),
                    )
                )
            )
        ),
         results.goals.length > 0 && React.createElement("div", { className: "search-result-group" },
            React.createElement("h3", null, `Goals (${results.goals.length})`),
            results.goals.map(goal =>
                React.createElement("div", { key: goal.id, className: "search-result-item" },
                     React.createElement("div", { style: { flex: 1 }},
                        React.createElement("p", { className: "font-bold" }, highlight(goal.title)),
                        React.createElement("p", { className: "text-secondary mt-1" }, highlight(goal.description)),
                     )
                )
            )
        ),
        (results.moods.length + results.events.length + results.goals.length === 0) && React.createElement("p", {className: "text-center text-tertiary"}, "No results found.")
    )
);
}

// ----- 4. MAIN APP COMPONENT -----

function App() {
const [moodEntries, setMoodEntries] = useState([]);
const [events, setEvents] = useState([]);
const [goals, setGoals] = useState([]);
const [settings, setSettings] = useState(DEFAULT_SETTINGS);
const [measurables, setMeasurables] = useState([]);
const [measurableLogs, setMeasurableLogs] = useState([]);
const [activeSleepSession, setActiveSleepSession] = useState(null);
const [showMidnightWakeModal, setShowMidnightWakeModal] = useState(false);
const [reviews, setReviews] = useState([]); // --- NEW ---
const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); // --- NEW ---
const [aiSuggestion, setAiSuggestion] = useState(null); // --- NEW ---
const [goalWizardPrefill, setGoalWizardPrefill] = useState(null); // --- NEW ---

const [currentView, setCurrentView] = useState(VIEWS.LOG);
const [isLoading, setIsLoading] = useState(true);
const [isLocked, setIsLocked] = useState(true);
const [importModalData, setImportModalData] = useState(null);
const [imageViewerSrc, setImageViewerSrc] = useState(null);

const [entryToEdit, setEntryToEdit] = useState(null);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);

const [loading, setLoading] = React.useState(true);
const [showPostLoginLogo, setShowPostLoginLogo] = React.useState(false);
const [postLoginLogoSlide, setPostLoginLogoSlide] = React.useState(false);

const [showTutorial, setShowTutorial] = React.useState(false);
const [tutorialStep, setTutorialStep] = React.useState(0);
const [tutorialHighlight, setTutorialHighlight] = React.useState(null);

const [aiQuotes, setAiQuotes] = useState(() => LocalStorageService.getItem('moodVibeAiQuotes') || []);
const [aiQuoteIndex, setAiQuoteIndex] = useState(() => parseInt(localStorage.getItem('moodVibeAiQuoteIndex') || '0', 10));

// Helper to fetch 20 quotes from AI
async function fetchAiQuotes(apiKey) {
    const prompt = `Generate 20 short, original, positive, and inspiring quotes for mental wellness. Each quote should be a single sentence, not more than 120 characters. Return as a numbered list.`;
    const messages = [
        { role: 'system', content: 'You are a helpful assistant that writes original, positive, inspiring quotes for mental wellness.' },
        { role: 'user', content: prompt }
    ];
    const response = await callDeepSeekAPI(messages, apiKey, 'openrouter/auto', 600);
    // Parse numbered list
    const lines = response.split(/\n|\r/).map(l => l.trim()).filter(Boolean);
    const quotes = lines.map(l => l.replace(/^\d+\.?\s*/, ''));
    return quotes.filter(q => q.length > 0 && q.length < 200);
}

// Effect: When API key is set and AI quotes enabled, fetch if needed
useEffect(() => {
    if (settings.aiApiKey && settings.enableAiQuotes) {
        if (aiQuotes.length < 2) {
            fetchAiQuotes(settings.aiApiKey).then(newQuotes => {
                setAiQuotes(newQuotes);
                setAiQuoteIndex(0);
                LocalStorageService.setItem('moodVibeAiQuotes', newQuotes);
                localStorage.setItem('moodVibeAiQuoteIndex', '0');
            }).catch(() => {});
        }
    }
}, [settings.aiApiKey, settings.enableAiQuotes]);

// Effect: When 19/20 quotes shown, fetch more
useEffect(() => {
    if (settings.aiApiKey && settings.enableAiQuotes && aiQuotes.length > 0 && aiQuoteIndex >= aiQuotes.length - 1) {
        fetchAiQuotes(settings.aiApiKey).then(newQuotes => {
            setAiQuotes(newQuotes);
            setAiQuoteIndex(0);
            LocalStorageService.setItem('moodVibeAiQuotes', newQuotes);
            localStorage.setItem('moodVibeAiQuoteIndex', '0');
        }).catch(() => {});
    }
}, [aiQuoteIndex, aiQuotes, settings.aiApiKey, settings.enableAiQuotes]);

// Effect: Persist aiQuotes and aiQuoteIndex
useEffect(() => { LocalStorageService.setItem('moodVibeAiQuotes', aiQuotes); }, [aiQuotes]);
useEffect(() => { localStorage.setItem('moodVibeAiQuoteIndex', String(aiQuoteIndex)); }, [aiQuoteIndex]);

// Handler to show next quote
const showNextQuote = () => setAiQuoteIndex(i => (i + 1) % (aiQuotes.length || 1));

// --- Data Loading Effect ---
useEffect(() => {
    MigrationService.run();

    const loadedEntries = LocalStorageService.getItem(STORAGE_KEYS.MOOD_ENTRIES) || [];
    const loadedEvents = LocalStorageService.getItem(STORAGE_KEYS.EVENTS) || [];
    const loadedGoals = LocalStorageService.getItem(STORAGE_KEYS.GOALS) || [];
    const loadedReviews = LocalStorageService.getItem(STORAGE_KEYS.REVIEWS) || [];
    const loadedSettings = LocalStorageService.getItem(STORAGE_KEYS.SETTINGS);
    const loadedMeasurables = LocalStorageService.getItem(STORAGE_KEYS.MEASURABLES) || DEFAULT_MEASURABLES;
    const loadedMeasurableLogs = LocalStorageService.getItem(STORAGE_KEYS.MEASURABLE_LOGS) || [];
    const loadedSleepSession = LocalStorageService.getItem(STORAGE_KEYS.ACTIVE_SLEEP_SESSION);
    
    setMoodEntries(loadedEntries);
    setEvents(loadedEvents);
    setGoals(loadedGoals);
    setReviews(loadedReviews);
    setMeasurables(loadedMeasurables);
    setMeasurableLogs(loadedMeasurableLogs);
    
    const finalSettings = { ...DEFAULT_SETTINGS, ...(loadedSettings || {}) };
    if (!finalSettings.moodPalette) {
        finalSettings.moodPalette = DEFAULT_MOOD_PALETTE;
    }
    setSettings(finalSettings);
    setIsLocked(!!finalSettings.appPassword && finalSettings.hasCompletedOnboarding);
    
    NotificationService.startMoodReminders(finalSettings);
    NotificationService.checkEventNotifications(loadedEvents, finalSettings);


    if (loadedSleepSession) {
        setActiveSleepSession(loadedSleepSession);
        setShowMidnightWakeModal(true);
    }

    setIsLoading(false);
}, []);

const handleWelcomeComplete = (name) => {
    const newSettings = { ...settings, userName: name, hasCompletedOnboarding: true };
    setSettings(newSettings);
    setMeasurables(DEFAULT_MEASURABLES);
};

// --- Data Saving Effects ---
useEffect(() => { if (!isLoading) LocalStorageService.setItem(STORAGE_KEYS.MOOD_ENTRIES, moodEntries); }, [moodEntries, isLoading]);
useEffect(() => { if (!isLoading) LocalStorageService.setItem(STORAGE_KEYS.EVENTS, events); }, [events, isLoading]);
useEffect(() => { if (!isLoading) LocalStorageService.setItem(STORAGE_KEYS.GOALS, goals); }, [goals, isLoading]);
useEffect(() => { if (!isLoading) LocalStorageService.setItem(STORAGE_KEYS.MEASURABLES, measurables); }, [measurables, isLoading]);
useEffect(() => { if (!isLoading) LocalStorageService.setItem(STORAGE_KEYS.MEASURABLE_LOGS, measurableLogs); }, [measurableLogs, isLoading]);
useEffect(() => { if (!isLoading) LocalStorageService.setItem(STORAGE_KEYS.ACTIVE_SLEEP_SESSION, activeSleepSession); }, [activeSleepSession, isLoading]);
useEffect(() => { if (!isLoading) LocalStorageService.setItem(STORAGE_KEYS.REVIEWS, reviews); }, [reviews, isLoading]);

useEffect(() => {
    if (!isLoading) {
        LocalStorageService.setItem(STORAGE_KEYS.SETTINGS, settings);
        document.documentElement.className = settings.theme;
        document.documentElement.style.fontSize = `${(settings.uiScale || 100) / 100}em`;
        document.body.classList.toggle('landscape-optimized', !!settings.optimizeForLandscape);
        
        NotificationService.stop();
        NotificationService.startMoodReminders(settings);
        NotificationService.checkEventNotifications(events, settings);
    }
}, [settings, events, isLoading]);

// --- Proactive AI Suggestion Effect ---
useEffect(() => {
    const runAnalysis = async () => {
        if (isLoading || !settings.enableAiSuggestions || !settings.aiApiKey || moodEntries.length < 10) {
            return;
        }

        const cache = LocalStorageService.getItem(STORAGE_KEYS.ANALYSIS_CACHE) || {};
        const lastRun = cache.lastRun ? new Date(cache.lastRun) : null;
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        if (lastRun && lastRun > threeDaysAgo) {
            // Already ran recently
            if (cache.suggestion) setAiSuggestion(cache.suggestion);
            return;
        }

        console.log("Running proactive AI analysis...");

        // Analysis Logic: Find correlation between an activity and a positive mood
        const positiveMoods = new Set(['happy', 'excited', 'calm']);
        let bestCorrelation = null;
        
        measurables.forEach(m => {
            const logsForMeasurable = measurableLogs.filter(l => l.measurableId === m.id);
            if (logsForMeasurable.length < 3) return;

            const daysWithLog = new Set(logsForMeasurable.map(l => DateTimeUtils.getStartOfDayISO(l.endTimestamp)));
            const entriesOnThoseDays = moodEntries.filter(e => daysWithLog.has(DateTimeUtils.getStartOfDayISO(e.timestamp)));
            const positiveEntriesOnThoseDays = entriesOnThoseDays.filter(e => positiveMoods.has(e.moodId));

            if (entriesOnThoseDays.length > 2 && positiveEntriesOnThoseDays.length / entriesOnThoseDays.length > 0.5) {
                // Simple heuristic: if >50% of moods are positive on days with this activity
                const correlation = positiveEntriesOnThoseDays.length / entriesOnThoseDays.length;
                if (!bestCorrelation || correlation > bestCorrelation.score) {
                    bestCorrelation = {
                        score: correlation,
                        measurableName: m.name,
                        moodName: 'positive',
                    };
                }
            }
        });

        if (bestCorrelation) {
            const newSuggestion = {
                id: `sugg_${generateId()}`,
                observation: `It looks like you tend to have more positive moods on days you log "${bestCorrelation.measurableName}". Great job!`,
                goal: {
                    title: `Continue ${bestCorrelation.measurableName}`,
                    description: `Log "${bestCorrelation.measurableName}" at least twice a week to keep the positive momentum going.`
                }
            };
            setAiSuggestion(newSuggestion);
            LocalStorageService.setItem(STORAGE_KEYS.ANALYSIS_CACHE, { lastRun: new Date().toISOString(), suggestion: newSuggestion });
        } else {
            // If no good correlation found, just update the run time
            LocalStorageService.setItem(STORAGE_KEYS.ANALYSIS_CACHE, { lastRun: new Date().toISOString(), suggestion: null });
        }
    };

    runAnalysis();
}, [isLoading, moodEntries, measurableLogs, measurables, settings.enableAiSuggestions, settings.aiApiKey]);


// --- Memoized Values ---
const allMoodTags = useMemo(() => {
    return [...new Set(moodEntries.flatMap(entry => entry.tags || []))].sort();
}, [moodEntries]);

const allEventTags = useMemo(() => {
    return [...new Set(events.flatMap(event => event.tags || []))].sort();
}, [events]);

// --- Handler Functions ---
const addMoodEntry = (newEntry) => {
    setMoodEntries(prevEntries => [...prevEntries, newEntry]);
};

const handleUpdateMoodEntry = (updatedEntry) => {
    setMoodEntries(prevEntries => prevEntries.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
    ));
};

const handleOpenEditModal = (entry) => {
    setEntryToEdit(entry);
    setIsEditModalOpen(true);
};

const handleCloseEditModal = () => {
    setEntryToEdit(null);
    setIsEditModalOpen(false);
};

const deleteMoodEntry = (idToDelete) => {
    if (confirm("Are you sure you want to delete this mood entry?")) {
        SoundUtils.playSound('audio-delete', settings);
        setMoodEntries(prevEntries => prevEntries.filter(entry => entry.id !== idToDelete));
    }
};

const addOrUpdateEvent = (event) => {
    setEvents(prevEvents => {
        const eventWithId = { ...event, id: event.id || generateId() };
        const existingIndex = prevEvents.findIndex(e => e.id === eventWithId.id);
        if (existingIndex > -1) {
            const newEvents = [...prevEvents];
            newEvents[existingIndex] = eventWithId;
            return newEvents;
        } else {
            return [...prevEvents, eventWithId];
        }
    });
};

const deleteEvent = (eventId) => {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
        setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
    }
};

const handleUpdateGoals = (newGoals) => {
    setGoals(newGoals);
};

const handleUpdateSingleGoal = (updatedGoal) => {
    setGoals(prevGoals => prevGoals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
};

const handleUpdateSettings = (newSettings, exportData = false, importData = false) => {
    if (exportData) {
        const allData = { entries: moodEntries, settings, events, goals, measurables, measurableLogs, reviews };
        const dataStr = JSON.stringify(allData, null, 2);
        ExportUtils.downloadFile(dataStr, `moodvibe_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        return;
    }
    if (importData) {
        const file = newSettings.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (imported.entries && imported.settings) {
                    setImportModalData(imported);
                } else {
                    alert('Invalid backup file format.');
                }
            } catch (error) {
                alert('Error parsing backup file.');
            }
        };
        reader.readAsText(file);
        newSettings.target.value = null;
        return;
    }
    setSettings(newSettings);
};

const handleDataImport = (mode) => {
     const importedData = importModalData;
     if (!importedData) return;
     
     const incomingEntries = importedData.entries || [];
     const incomingEvents = importedData.events || [];
     const incomingGoals = importedData.goals || [];
     const incomingReviews = importedData.reviews || [];
     const incomingMeasurables = importedData.measurables || [];
     const incomingMeasurableLogs = importedData.measurableLogs || [];
     const incomingSettings = importedData.settings || {};

     if (mode === 'replace') {
         setMoodEntries(incomingEntries);
         setEvents(incomingEvents);
         setGoals(incomingGoals);
         setReviews(incomingReviews);
         setMeasurables(incomingMeasurables);
         setMeasurableLogs(incomingMeasurableLogs);
         setSettings({ ...DEFAULT_SETTINGS, ...incomingSettings });
         if (incomingSettings.theme) {
             document.documentElement.className = incomingSettings.theme;
         }
         alert('Data replaced successfully!');
     } else {
         const mergeById = (existing, incoming) => {
             const merged = [...existing];
             const existingIds = new Set(existing.map(e => e.id));
             incoming.forEach(item => {
                 if (item.id && !existingIds.has(item.id)) merged.push(item);
             });
             return merged;
         }
         setMoodEntries(mergeById(moodEntries, incomingEntries));
         setEvents(mergeById(events, incomingEvents));
         setGoals(mergeById(goals, incomingGoals));
         setReviews(mergeById(reviews, incomingReviews));
         setMeasurables(mergeById(measurables, incomingMeasurables));
         setMeasurableLogs(mergeById(measurableLogs, incomingMeasurableLogs));
         setSettings(s => {
             const merged = { ...DEFAULT_SETTINGS, ...s, ...incomingSettings };
             if (merged.theme) {
                 document.documentElement.className = merged.theme;
             }
             return merged;
         });
         alert('Data merged successfully!');
     }
     setImportModalData(null);
};

const handlePurgeData = () => {
    if (confirm("A backup JSON file of your current data will be downloaded first. Are you sure you want to proceed? This cannot be undone.")) {
        handleUpdateSettings(settings, true);
        setTimeout(() => {
            if (confirm("FINAL CONFIRMATION: Permanently delete all data from this device?")) {
                Object.values(STORAGE_KEYS).forEach(key => LocalStorageService.removeItem(key));
                window.location.reload();
            }
        }, 500);
    }
};

const handleUnlock = (passwordAttempt) => {
    if (passwordAttempt === settings.appPassword) {
        setIsLocked(false);
        setShowPostLoginLogo(true);
        setPostLoginLogoSlide(false);
        setTimeout(() => setPostLoginLogoSlide(true), 2000); // Start slide after 2s
        setTimeout(() => setShowPostLoginLogo(false), 2700); // Hide after 2.7s
        return true;
    }
    return false;
};

const handleLockApp = () => {
    if (settings.appPassword) {
        setIsLocked(true);
    } else {
        alert("Please set an app password in Settings before trying to lock the app.");
    }
};

const handleUpdateMeasurables = (newMeasurables) => {
    setMeasurables(newMeasurables);
};

const handleAddMeasurableLog = (newLog) => {
    setMeasurableLogs(prev => [...prev, newLog]);
};

const handleDeleteMeasurableLog = (idToDelete) => {
    if(confirm("Are you sure you want to delete this specific log entry?")){
        setMeasurableLogs(prev => prev.filter(l => l.id !== idToDelete));
    }
};

const handleStartSleep = (measurableId) => {
    if (activeSleepSession) {
        alert("Another sleep session is already active!");
        return;
    }
    setActiveSleepSession({
        measurableId: measurableId,
        startTimestamp: new Date().toISOString()
    });
    alert("Sleep session started. Sweet dreams!");
};

const handleEndSleep = (isConfirmedAwake) => {
    if (!activeSleepSession) return;
    
    if (isConfirmedAwake) {
        const endTimestamp = new Date();
        const startTimestamp = DateTimeUtils._parseDate(activeSleepSession.startTimestamp);
        if (!startTimestamp) return;
        const durationMs = endTimestamp.getTime() - startTimestamp.getTime();

        const newLog = {
            id: generateId(),
            measurableId: activeSleepSession.measurableId,
            value: durationMs,
            notes: `Slept from ${startTimestamp.toLocaleTimeString([], {timeStyle: 'short'})} to ${endTimestamp.toLocaleTimeString([], {timeStyle: 'short'})}`,
            startTimestamp: activeSleepSession.startTimestamp,
            endTimestamp: endTimestamp.toISOString(),
        };
        
        handleAddMeasurableLog(newLog);
        alert(`Sleep session ended. Total sleep: ${DateTimeUtils.formatDuration(durationMs)}.`);
        setActiveSleepSession(null);
    }
    
    setShowMidnightWakeModal(false);
};

const handleStartReview = () => setIsReviewModalOpen(true);
const handleSaveReview = (reviewData) => {
    setReviews(prev => [...prev, reviewData]);
    onUpdateSettings({ ...settings, lastReviewDate: new Date().toISOString() });
    setIsReviewModalOpen(false);
    alert("Weekly review saved! Great job on reflecting.");
};

const handleDismissSuggestion = () => {
    setAiSuggestion(null);
    LocalStorageService.setItem(STORAGE_KEYS.ANALYSIS_CACHE, { ...LocalStorageService.getItem(STORAGE_KEYS.ANALYSIS_CACHE), suggestion: null });
};

const handleSetGoalFromSuggestion = (goalData) => {
    setGoalWizardPrefill(goalData);
    setCurrentView(VIEWS.GOALS);
    handleDismissSuggestion();
};

const handleSaveConversation = (messagesToSave) => {
    if (!messagesToSave || messagesToSave.length <= 1) {
        alert("There's nothing to save yet.");
        return;
    }
    if (!confirm("Save this conversation as a new entry in your history?")) {
        return;
    }

    const conversationHtml = messagesToSave.map(msg => 
        `<div class="chat-log-message ${msg.role}"><strong>${msg.role === 'assistant' ? 'AI' : 'You'}:</strong> ${msg.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`
    ).join('');
    
    const newEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        moodId: 'conversation', // Special ID
        intensity: 5, // Neutral intensity
        notes: `<div class="chat-log-container">${conversationHtml}</div>`,
        privateNotes: '',
        tags: ['chat-log'],
        context: {},
        imageUrl: null,
        weather: null,
    };

    addMoodEntry(newEntry);
    alert("Conversation saved to your history.");
};

if (isLoading) {
    return React.createElement("div", { className: "loader-container", style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh'} }, 
        React.createElement("div", { className: "loader" })
    );
}

// Show drop-down logo animation for all users on initial load (not just after unlock)
if (showPostLoginLogo) {
    return React.createElement('div', {
        className: `post-login-logo${postLoginLogoSlide ? ' slide-down' : ''}`,
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'var(--bg-primary, #fff)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.7s',
            opacity: postLoginLogoSlide ? 0 : 1,
            pointerEvents: 'none',
        }
    },
        React.createElement('img', {
            src: 'mvlogo.png',
            alt: 'Mood Vibe',
            style: {
                width: 160,
                height: 160,
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.18))',
                transition: 'transform 0.8s cubic-bezier(.77,0,.18,1)',
                transform: postLoginLogoSlide ? 'translateY(120vh)' : 'translateY(0)',
            }
        })
    );
}

if (isLocked && settings.appPassword && settings.hasCompletedOnboarding) {
    return React.createElement(LockScreen, { onUnlock: handleUnlock, userName: settings.userName });
}

const renderCurrentView = () => {
    const allData = {
        entries: moodEntries,
        events: events,
        goals: goals,
        reviews: reviews,
        measurables: measurables,
        measurableLogs: measurableLogs,
        settings: settings
    };

    const viewProps = {
        ...allData,
        allTags: allMoodTags,
        allEventTags: allEventTags,
        onImageView: setImageViewerSrc,
        onUpdateSettings: handleUpdateSettings,
        onAddMood: addMoodEntry,
        onUpdateMoodEntry: handleUpdateMoodEntry,
        onDeleteEntry: deleteMoodEntry,
        onEditEntry: handleOpenEditModal,
        onAddOrUpdateEvent: addOrUpdateEvent,
        onDeleteEvent: deleteEvent,
        onUpdateGoals: handleUpdateGoals,
        onUpdateGoal: handleUpdateSingleGoal,
        onUpdateMeasurables: handleUpdateMeasurables,
        onAddLog: handleAddMeasurableLog,
        onDeleteLog: handleDeleteMeasurableLog,
        onDeleteMeasurable: handleDeleteMeasurable,
        activeSleepSession: activeSleepSession,
        onStartSleep: handleStartSleep,
        onEndSleep: () => handleEndSleep(true),
    };

    switch (currentView) {
        case VIEWS.LOG:
            return React.createElement('div', {
                className: `mood-logger-container${tutorialHighlight==='mood-logger' ? ' tutorial-feature-highlight tutorial-highlight-mood-logger' : ''}`,
                ...(tutorialHighlight==='mood-logger' ? { 'data-tutorial-comment': "This is where you log your mood. Click the + button or mood icons to get started!" } : {})
            },
                React.createElement(MoodLogger, { ...viewProps, onStartReview: handleStartReview, aiSuggestion: aiSuggestion, onDismissSuggestion: handleDismissSuggestion, onSetGoal: handleSetGoalFromSuggestion })
            );
        case VIEWS.HISTORY:
            return React.createElement(MoodHistory, { ...viewProps });
        case VIEWS.DASHBOARD:
            return React.createElement('div', {
                className: `goals-view-container${tutorialHighlight==='goals-view' ? ' tutorial-feature-highlight tutorial-highlight-goals-view' : ''}`,
                ...(tutorialHighlight==='goals-view' ? { 'data-tutorial-comment': "Here you can set personal goals and track your progress. Stay motivated! 🎯" } : {})
            },
                React.createElement(DashboardView, { ...viewProps })
            );
        case VIEWS.CALENDAR:
            return React.createElement(CalendarView, { ...viewProps });
        case VIEWS.TRENDS:
            return React.createElement('div', {
                className: `trends-view-container${tutorialHighlight==='trends-view' ? ' tutorial-feature-highlight tutorial-highlight-trends-view' : ''}`,
                ...(tutorialHighlight==='trends-view' ? { 'data-tutorial-comment': "Check out the Trends tab to see patterns in your moods and activities over time. 📈" } : {})
            },
                React.createElement(TrendsView, { ...viewProps, onSaveConversation: handleSaveConversation })
            );
        case VIEWS.GOALS:
            return React.createElement(GoalsView, { ...viewProps, onSetWizardPrefill: goalWizardPrefill, onSetGoalWizardPrefill: setGoalWizardPrefill });
        case VIEWS.REPORTS:
            return React.createElement(ReportsView, { ...viewProps });
        case VIEWS.MEASURABLES:
             return React.createElement(MeasurablesView, { ...viewProps });
        case VIEWS.SEARCH:
            return React.createElement(GlobalSearchView, { ...viewProps });
        case VIEWS.SETTINGS:
            return React.createElement(SettingsView, { 
                settings: settings, onUpdateSettings: handleUpdateSettings,
                onPurgeData: handlePurgeData, onLockApp: handleLockApp,
                onGenerateCSV: (start, end, include) => ExportUtils.generateCSV(moodEntries, measurables, measurableLogs, start, end, include, settings),
                onGeneratePDF: (start, end, include) => ExportUtils.generatePDF(allData, start, end, include),
                onGenerateDailySummaryCSV: (start, end) => ExportUtils.generateDailySummaryCSV(allData, start, end)
            });
        case VIEWS.PROFILE:
            return React.createElement(ProfileView, { ...viewProps });
        case VIEWS.PRODUCTIVITY:
            return React.createElement(ProductivityView, {
                pomodoroSettings,
                weeklyTimetable,
                dailySchedule,
                onUpdatePomodoro: handleUpdatePomodoro,
                onUpdateTimetable: handleUpdateTimetable,
                onUpdateDailySchedule: handleUpdateDailySchedule,
                settings, // Pass main app settings for sound effects
            });
        default:
            if (!Object.values(VIEWS).includes(currentView)) {
                setCurrentView(VIEWS.LOG);
            }
            return React.createElement('div', {
                className: `mood-logger-container${tutorialHighlight==='mood-logger' ? ' tutorial-feature-highlight tutorial-highlight-mood-logger' : ''}`,
                ...(tutorialHighlight==='mood-logger' ? { 'data-tutorial-comment': "This is where you log your mood. Click the + button or mood icons to get started!" } : {})
            },
                React.createElement(MoodLogger, { ...viewProps, onStartReview: handleStartReview, aiSuggestion: aiSuggestion, onDismissSuggestion: handleDismissSuggestion, onSetGoal: handleSetGoalFromSuggestion })
            );
    }
};

return React.createElement(React.Fragment, null,
    !settings.hasCompletedOnboarding && !showTutorial && React.createElement(WelcomeModal, {
        onComplete: handleWelcomeComplete,
        onStartTutorial: () => { setShowTutorial(true); setTutorialStep(0); }
    }),
    showTutorial && React.createElement(TutorialOverlay, {
        step: tutorialStep,
        onNext: () => {
            if (tutorialStep < 3) setTutorialStep(tutorialStep + 1);
            else {
                setShowTutorial(false);
                setTutorialHighlight(null);
                setSettings({ ...settings, hasCompletedOnboarding: true });
            }
        },
        onSkip: () => {
            setShowTutorial(false);
            setTutorialHighlight(null);
            setSettings({ ...settings, hasCompletedOnboarding: true });
        },
        setHighlight: setTutorialHighlight
    }),
    showMidnightWakeModal && React.createElement(MidnightWakeModal, {
        onConfirmAwake: () => handleEndSleep(true),
        onDismiss: () => handleEndSleep(false),
        sleepStartTime: activeSleepSession?.startTimestamp
    }),
    isReviewModalOpen && React.createElement(WeeklyReviewModal, {
        isOpen: isReviewModalOpen,
        onClose: () => setIsReviewModalOpen(false),
        onSave: handleSaveReview,
        entries: moodEntries,
        settings: settings
    }),
    importModalData && React.createElement(ImportValidationModal, {
        isOpen: !!importModalData,
        onClose: () => setImportModalData(null),
        onConfirm: handleDataImport,
        fileData: importModalData
    }),
    imageViewerSrc && React.createElement(ImageViewerModal, {
        src: imageViewerSrc,
        onClose: () => setImageViewerSrc(null)
    }),
    isEditModalOpen && React.createElement(MoodEditModal, {
        isOpen: isEditModalOpen,
        onClose: handleCloseEditModal,
        onSave: handleUpdateMoodEntry,
        entryToEdit: entryToEdit,
        allTags: allMoodTags,
        settings: settings
    }),
    showPostLoginLogo && React.createElement('div', {
        className: `post-login-logo${postLoginLogoSlide ? ' slide-down' : ''}`,
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'var(--bg-primary, #fff)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.7s',
            opacity: postLoginLogoSlide ? 0 : 1,
            pointerEvents: 'none',
        }
    },
        React.createElement('img', {
            src: 'mvlogo.png',
            alt: 'Mood Vibe',
            style: {
                width: 160,
                height: 160,
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.18))',
                transition: 'transform 0.8s cubic-bezier(.77,0,.18,1)',
                transform: postLoginLogoSlide ? 'translateY(120vh)' : 'translateY(0)',
            }
        })
    ),
    React.createElement("div", { className: "app-container" },
        React.createElement(AppHeader, { 
            appName: APP_NAME, 
            settings: settings,
            streak: calculateStreak(moodEntries),
            setCurrentView: setCurrentView
        }),
        React.createElement(AppNavigation, { currentView, setCurrentView, settings }),
        settings.showStreaks && currentView === VIEWS.LOG && React.createElement(StreakTracker, { entries: moodEntries }),
        React.createElement("main", { className: "app-main-content" },
            renderCurrentView()
        ),
        React.createElement("footer", { className: "text-center text-tertiary mt-8 p-4" },
            React.createElement("p", null, `© ${new Date().getFullYear()} MoodVibe. All data stored locally in your browser.`),
            React.createElement("p", { style: {fontSize: '0.8em'} }, "Privacy First. No data leaves your device unless you use AI or Weather features."),
            React.createElement("p", { style: {fontSize: '0.9em', marginTop: '8px'} },
                React.createElement("strong", null, "@Itzpanth Solutions"), " & ", React.createElement("strong", null, "@TinWood Solutions")
            )
        )
    )
);
}

// ----- 5. RENDER APP -----
const rootElement = document.getElementById('root');
if (rootElement) {
const reactRoot = ReactDOM.createRoot(rootElement);
reactRoot.render(React.createElement(App));
} else {
console.error("Root element #root not found in the DOM.");
}

function DashboardView({ settings, ...props }) {
return React.createElement("div", { className: "dashboard-view" },
    React.createElement(CalendarView, { settings, ...props }),
    settings.showMeasurables && React.createElement("div", { className: "mt-6" },
        React.createElement(MeasurablesView, { settings, ...props })
    ),
    settings.showGoals && React.createElement("div", { className: "mt-6" },
        React.createElement(GoalsView, { settings, ...props })
    )
);
}


