// Theme Management - Light/Dark Mode Toggle
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.body = null;
        // Don't initialize immediately - wait for DOM
    }

    // Initialize theme on page load (call this after DOM is ready)
    init() {
        this.body = document.body;
        if (this.body) {
            this.applyTheme(this.currentTheme);
            this.setupToggle();
        }
    }

    // Get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Set theme
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.currentTheme = theme;
            localStorage.setItem('theme', theme);
            this.applyTheme(theme);
            return true;
        }
        return false;
    }

    // Toggle between light and dark
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    }

    // Apply theme to the page
    applyTheme(theme) {
        if (this.body) {
            const isDark = theme === 'dark';
            this.body.classList.toggle('dark-theme', isDark);
            this.updateThemeIcon(isDark);
        }
    }

    // Update theme toggle icon
    updateThemeIcon(isDark) {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                if (isDark) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                }
            }
        }
    }

    // Setup theme toggle button
    setupToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    // Subscribe to state changes (if appState is available)
    subscribeToState(appState) {
        if (appState && typeof appState.subscribe === 'function') {
            appState.subscribe((state) => {
                if (state && state.currentTheme) {
                    const isDark = state.currentTheme === 'dark';
                    if (!this.body) {
                        this.body = document.body;
                    }
                    if (this.body) {
                        this.body.classList.toggle('dark-theme', isDark);
                        this.updateThemeIcon(isDark);
                    }
                }
            });
        }
    }
}

// Create global theme manager instance (will be initialized after DOM loads)
const themeManager = new ThemeManager();

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            themeManager.init();
        });
    } else {
        // DOM already loaded
        themeManager.init();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThemeManager, themeManager };
}

