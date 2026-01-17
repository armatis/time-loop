import { useEffect } from 'react';
import { useTimerStore } from '@/store/useTimerStore';

/**
 * Syncs the theme mode setting to the document root class.
 * Handles 'light', 'dark', and 'system' (auto) modes.
 */
export function useThemeSync() {
    const themeMode = useTimerStore((state) => state.themeMode);

    useEffect(() => {
        const root = document.documentElement;

        if (themeMode === 'dark') {
            root.classList.add('dark');
        } else if (themeMode === 'light') {
            root.classList.remove('dark');
        } else {
            // Auto: follow system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }

        // Listen for system theme changes when in 'system' mode
        if (themeMode === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => {
                if (mediaQuery.matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            };
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [themeMode]);
}
