// Firebase configuration placeholder. Replace with your project's keys.
// Keeping compat SDK for simplicity in a static site.

(function() {
    if (window.firebaseConfigInitialized) return;

    // Fill these with your values from Firebase Console -> Project Settings
    const firebaseConfig = {
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: ""
    };

    // Initialize only if all required keys exist
    const hasConfig = Object.values(firebaseConfig).some(Boolean);
    if (!hasConfig) {
        console.warn('[E-Collect] Firebase config not set. Falling back to localStorage.');
        window.firebaseApp = null;
        window.firebaseDB = null;
        window.firebaseConfigInitialized = true;
        return;
    }

    try {
        const app = firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore(app);
        window.firebaseApp = app;
        window.firebaseDB = db;
        window.firebaseConfigInitialized = true;
        console.log('[E-Collect] Firebase initialized.');
    } catch (e) {
        console.warn('[E-Collect] Firebase init failed. Using localStorage.', e);
        window.firebaseApp = null;
        window.firebaseDB = null;
        window.firebaseConfigInitialized = true;
    }
})();


