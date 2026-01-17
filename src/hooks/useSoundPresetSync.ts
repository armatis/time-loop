import { useEffect } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { AudioEngine } from '@/lib/audio';

/**
 * Syncs the sound preset setting to the AudioEngine.
 */
export function useSoundPresetSync() {
    const soundPreset = useTimerStore((state) => state.soundPreset);

    useEffect(() => {
        AudioEngine.setPreset(soundPreset);
    }, [soundPreset]);
}
