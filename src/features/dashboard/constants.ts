import { Sun, Moon, Monitor } from 'lucide-react';
import type { SoundPreset, ThemeMode } from '@/store/useTimerStore';

export const SOUND_PRESETS: { id: SoundPreset; label: string; description: string }[] = [
    { id: 'default', label: 'Default', description: 'Clear, balanced tones' },
    { id: 'soft', label: 'Soft', description: 'Gentle, quieter sounds' },
    { id: 'retro', label: 'Retro', description: 'Classic 8-bit style' },
    { id: 'minimal', label: 'Minimal', description: 'Subtle, brief beeps' },
];

export const THEME_MODES: { id: ThemeMode; label: string; icon: typeof Sun; description: string }[] = [
    { id: 'light', label: 'Light', icon: Sun, description: 'Always light mode' },
    { id: 'dark', label: 'Dark', icon: Moon, description: 'Always dark mode' },
    { id: 'system', label: 'Auto', icon: Monitor, description: 'Match your device settings' },
];
