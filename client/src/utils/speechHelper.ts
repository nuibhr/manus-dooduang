// Web Speech API Thai Female Voice & Mystical Cat Audio Synthesizer

let cachedVoices: SpeechSynthesisVoice[] = [];

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  if (cachedVoices.length > 0) return cachedVoices;
  cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Finds the best natural female Thai voice available on the device
 */
export function getBestThaiFemaleVoice(): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  // 1. First priority: Thai voices explicitly named female or popular female engines
  const thaiVoices = voices.filter(v => v.lang.toLowerCase().startsWith('th') || v.lang.includes('th_TH') || v.lang.includes('th-TH'));

  if (thaiVoices.length > 0) {
    // Prefer Google, Siri, Narisa, Kanya, Premwadee, Microsoft Premwadee, or female markers
    const bestFemale = thaiVoices.find(v =>
      /female|kanya|narisa|siri|premwadee|google|woman/i.test(v.name)
    );
    if (bestFemale) return bestFemale;
    return thaiVoices[0]; // fallback to any Thai voice
  }

  // 2. Fallback: Any voice with 'th' in name
  const nameMatch = voices.find(v => /thai|thailand/i.test(v.name));
  if (nameMatch) return nameMatch;

  return null;
}

/**
 * Clean up text for clearer, smoother Thai speech reading
 */
export function cleanThaiTextForSpeech(text: string): string {
  return text
    .replace(/[*_#`~[\]()]/g, ' ') // Remove markdown formatting
    .replace(/[✨🔮🎴💅🐾💖💼💰🧘🌟⚡💡🎨🔢⏰🧲💬]/g, '') // Remove emojis
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Speak text in a crystal-clear Thai female tone with speed and pitch controls
 */
export function speakThaiText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void,
  options?: { rate?: number; pitch?: number }
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.('Speech synthesis not supported');
    return null;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const cleanText = cleanThaiTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.lang = 'th-TH';

    // Assign best Thai voice if found
    const voice = getBestThaiFemaleVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Tune tone specifically for warm, polite, and articulate Thai female diction
    utterance.pitch = options?.pitch ?? 1.15; // Slightly higher pitch for clear female timbre
    utterance.rate = options?.rate ?? 0.96;  // Gentle, calm pacing for clear Thai syllables
    utterance.volume = 1.0;

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    console.error('Speech error:', err);
    onError?.(err);
    return null;
  }
}

export function pauseSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.resume();
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// ----------------------------------------------------
// Web Audio API Synthesizer: Cat Purr & Mystical Gilded Chimes
// ----------------------------------------------------
let audioCtx: AudioContext | null = null;

// User gesture unlock listener for iOS Safari and mobile browsers
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('touchend', unlockAudio, { passive: true });
  window.addEventListener('click', unlockAudio, { passive: true });
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a soothing, mystical cat purr with warm sub-bass pulse
 */
export function playCatPurrSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Low frequency purr pulse (25-30Hz vibration modulation)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(65, now);
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.8);

  lfo.frequency.setValueAtTime(26, now); // 26Hz purr rate
  lfoGain.gain.setValueAtTime(15, now);
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

  osc.connect(gain);
  gain.connect(ctx.destination);

  lfo.start(now);
  osc.start(now);
  lfo.stop(now + 0.9);
  osc.stop(now + 0.9);

  // 2. High soft chime (Cat magical bell)
  const bell = ctx.createOscillator();
  const bellGain = ctx.createGain();
  bell.type = 'sine';
  bell.frequency.setValueAtTime(1174.66, now); // D6
  bell.frequency.exponentialRampToValueAtTime(1760, now + 0.3); // A6

  bellGain.gain.setValueAtTime(0.04, now);
  bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

  bell.connect(bellGain);
  bellGain.connect(ctx.destination);

  bell.start(now + 0.05);
  bell.stop(now + 0.7);
}

export type ChimeSoundType = 'chime' | 'card' | 'coin' | 'purr' | 'soft' | 'gold' | 'iching' | 'oracle' | 'rune';

/**
 * Play Mystic Gilded Chime
 */
export function playMysticChimeSound(type: ChimeSoundType = 'chime'): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (type === 'purr') {
    playCatPurrSound();
    return;
  }

  const now = ctx.currentTime;

  if (type === 'card' || type === 'oracle') {
    // Soft tarot card glide
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
    return;
  }

  if (type === 'coin' || type === 'gold') {
    // Golden coin drop
    [987.77, 1318.51, 1975.53].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.06, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.4);
    });
    return;
  }

  if (type === 'rune' || type === 'iching') {
    // Ancient chime with crystal overtone
    [523.25, 783.99, 1046.50, 1567.98].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.05, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.65);
    });
    return;
  }

  if (type === 'soft') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
    return;
  }

  // Default: Velvet Temple Gilded Chime (E5, B5, G#6 harmony)
  [659.25, 987.77, 1661.22].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.04);
    gain.gain.setValueAtTime(0.07, now + idx * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.04);
    osc.stop(now + idx * 0.04 + 0.95);
  });
}

/**
 * Play quick wooden tick sound for Wheel of Destiny spinning
 */
export function playWheelTickSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.045);
}

/**
 * Play authentic bamboo shaker clack for Esiimsi
 */
export function playBambooShakeSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  [180, 320, 480].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq + Math.random() * 60, now + i * 0.03);
    gain.gain.setValueAtTime(0.03, now + i * 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.03 + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.03);
    osc.stop(now + i * 0.03 + 0.08);
  });
}

/**
 * Play celebratory temple bell & jackpot fanfare
 */
export function playJackpotSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Major Arpeggio chord (C5, E5, G5, C6) + Gilded bell overtone
  [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
    gain.gain.setValueAtTime(0.1, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 1.25);
  });
}

// ----------------------------------------------------
// Cosmic Soundscape Generator (Continuous Ambient Drone & Singing Bowl)
// ----------------------------------------------------
class CosmicSoundscapeController {
  private activeNodes: { stop: () => void }[] = [];
  private masterGain: GainNode | null = null;
  private currentMode: string = 'off';
  private currentVolume: number = 0.5;

  public setVolume(vol: number): void {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && audioCtx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume * 0.15, audioCtx.currentTime);
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public getMode(): string {
    return this.currentMode;
  }

  public isPlaying(): boolean {
    return this.currentMode !== 'off' && this.activeNodes.length > 0;
  }

  public stop(): void {
    this.activeNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
    });
    this.activeNodes = [];
    this.currentMode = 'off';
  }

  public play(mode: '432hz-drone' | 'singing-bowl' | 'cat-purr' | 'temple-bell'): void {
    const ctx = getAudioContext();
    if (!ctx) return;

    this.stop();
    this.currentMode = mode;

    const master = ctx.createGain();
    master.gain.setValueAtTime(this.currentVolume * 0.15, ctx.currentTime);
    master.connect(ctx.destination);
    this.masterGain = master;

    if (mode === '432hz-drone') {
      // Harmonic 432Hz Solfeggio Cosmic Drone (432Hz, 216Hz, 108Hz, 864Hz)
      const freqs = [108, 216, 432, 648];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Gentle detuning for shimmer
        osc.detune.setValueAtTime((idx - 1.5) * 4, ctx.currentTime);

        gain.gain.setValueAtTime(0.04 / (idx + 1), ctx.currentTime);
        osc.connect(gain);
        gain.connect(master);
        osc.start();

        this.activeNodes.push({
          stop: () => {
            try {
              gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
              osc.stop(ctx.currentTime + 0.5);
            } catch (e) {}
          }
        });
      });
    } else if (mode === 'cat-purr') {
      // Continuous 26Hz Purr Drone with LFO
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(58, ctx.currentTime);

      lfo.frequency.setValueAtTime(24, ctx.currentTime);
      lfoGain.gain.setValueAtTime(16, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      oscGain.gain.setValueAtTime(0.12, ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(master);

      lfo.start();
      osc.start();

      this.activeNodes.push({
        stop: () => {
          try {
            oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
            osc.stop(ctx.currentTime + 0.35);
            lfo.stop(ctx.currentTime + 0.35);
          } catch (e) {}
        }
      });
    } else if (mode === 'singing-bowl' || mode === 'temple-bell') {
      // Repeating singing bowl harmonic interval
      const baseFreq = mode === 'singing-bowl' ? 349.23 : 523.25; // F4 or C5
      let isTimerActive = true;

      const triggerChime = () => {
        if (!isTimerActive || !audioCtx) return;
        const now = audioCtx.currentTime;

        [baseFreq, baseFreq * 1.5, baseFreq * 2.76, baseFreq * 4.2].forEach((freq, idx) => {
          const osc = audioCtx!.createOscillator();
          const gain = audioCtx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          const initialVol = 0.08 / (idx + 1);
          gain.gain.setValueAtTime(initialVol, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

          osc.connect(gain);
          gain.connect(master);
          osc.start(now);
          osc.stop(now + 6.0);
        });
      };

      triggerChime();
      const intervalId = setInterval(triggerChime, 6500);

      this.activeNodes.push({
        stop: () => {
          isTimerActive = false;
          clearInterval(intervalId);
        }
      });
    }
  }
}

export const cosmicSoundscape = new CosmicSoundscapeController();
