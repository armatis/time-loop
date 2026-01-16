// Web Audio API Context (Lazily initialized)
let audioCtx: AudioContext | null = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
}

type ToneType = 'sine' | 'square' | 'sawtooth' | 'triangle';
type SoundPreset = 'default' | 'soft' | 'retro' | 'minimal';

interface PresetConfig {
    tickFreq: number;
    tickDuration: number;
    tickType: ToneType;
    tickVolume: number;
    switchFreq: number;
    switchDuration: number;
    switchType: ToneType;
    switchVolume: number;
}

const PRESET_CONFIGS: Record<SoundPreset, PresetConfig> = {
    default: {
        tickFreq: 880,
        tickDuration: 0.1,
        tickType: 'sine',
        tickVolume: 0.15,
        switchFreq: 440,
        switchDuration: 0.4,
        switchType: 'triangle',
        switchVolume: 0.2,
    },
    soft: {
        tickFreq: 660,
        tickDuration: 0.08,
        tickType: 'sine',
        tickVolume: 0.08,
        switchFreq: 330,
        switchDuration: 0.3,
        switchType: 'sine',
        switchVolume: 0.12,
    },
    retro: {
        tickFreq: 1000,
        tickDuration: 0.05,
        tickType: 'square',
        tickVolume: 0.1,
        switchFreq: 500,
        switchDuration: 0.2,
        switchType: 'square',
        switchVolume: 0.15,
    },
    minimal: {
        tickFreq: 600,
        tickDuration: 0.03,
        tickType: 'sine',
        tickVolume: 0.05,
        switchFreq: 400,
        switchDuration: 0.15,
        switchType: 'sine',
        switchVolume: 0.08,
    },
};

let currentPreset: SoundPreset = 'default';

export class AudioEngine {
    static setPreset(preset: SoundPreset) {
        currentPreset = preset;
    }

    static async init() {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }
    }

    static playTone(freq: number, duration: number, type: ToneType = 'sine', volume: number = 0.1) {
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gainNode.gain.setValueAtTime(volume, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.error("Audio playback error:", e);
        }
    }

    static playTick() {
        const config = PRESET_CONFIGS[currentPreset];
        this.playTone(config.tickFreq, config.tickDuration, config.tickType, config.tickVolume);
    }

    static playSwitch() {
        const config = PRESET_CONFIGS[currentPreset];
        this.playTone(config.switchFreq, config.switchDuration, config.switchType, config.switchVolume);
    }

    static playCountdown() {
        // Special sound for "Get Ready" countdown - slightly different from regular tick
        const config = PRESET_CONFIGS[currentPreset];
        this.playTone(config.tickFreq * 0.75, config.tickDuration * 1.5, config.tickType, config.tickVolume * 0.8);
    }

    static playGo() {
        // "GO!" sound when countdown finishes
        const config = PRESET_CONFIGS[currentPreset];
        this.playTone(config.tickFreq * 1.5, 0.3, config.tickType, config.tickVolume * 1.2);
    }

    static playComplete() {
        // Fanfare-ish
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'square', 0.1), i * 150);
        });
    }
}
