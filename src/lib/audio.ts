// Web Audio API Context (Lazily initialized)
let audioCtx: AudioContext | null = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
}

type ToneType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export class AudioEngine {
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
        // High pitch short beep (Metronome style)
        // 880Hz (A5), 0.1s
        this.playTone(880, 0.1, 'sine', 0.15);
    }

    static playSwitch() {
        // Distinct sound for switching exercises
        // 440Hz (A4) -> 660Hz (E5) slide or just a distinct tone
        // Let's do a double tone for switch
        this.playTone(440, 0.4, 'triangle', 0.2);
    }

    static playComplete() {
        // Fanfare-ish
        const now = getAudioContext().currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'square', 0.1), i * 150);
        });
    }
}
