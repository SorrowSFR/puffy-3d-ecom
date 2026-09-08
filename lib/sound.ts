// Web Audio API procedural sound engine for Plushy
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playChime(freq = 587.33) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    } catch {
      // AudioContext blocked or uninitialized
    }
  }

  public playChromaClick(freq = 880) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Pure crystalline bell tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);

      // Shimmering glass overtone
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.5, now);
      gain2.gain.setValueAtTime(0.05, now);
      gain2.gain.exponentialRampToValueAtTime(0.0005, now + 0.22);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.22);
    } catch {
      // AudioContext blocked
    }
  }

  public playOrbChime(freq = 880) {
    this.playChromaClick(freq);
  }

  public playRevolverClick() {
    this.playChromaClick(960);
  }

  public playSquish() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(280, this.ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }

  private zipperBuffer: AudioBuffer | null = null;
  private isZipperLoading: boolean = false;

  public async loadZipperSound() {
    if (this.zipperBuffer || this.isZipperLoading || typeof window === 'undefined') return;
    try {
      this.isZipperLoading = true;
      this.init();
      if (!this.ctx) return;
      const res = await fetch('/assets/transitions/zipper-sound.mp3');
      const arrayBuffer = await res.arrayBuffer();
      this.zipperBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    } catch {
      // Fetch or decode failed
    } finally {
      this.isZipperLoading = false;
    }
  }

  public playZipper() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      if (this.zipperBuffer) {
        const source = this.ctx.createBufferSource();
        source.buffer = this.zipperBuffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.9, this.ctx.currentTime);
        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(0);
        return;
      }

      // Direct audio element fallback
      const audio = new Audio('/assets/transitions/zipper-sound.mp3');
      audio.volume = 0.85;
      audio.play().catch(() => {
        // Procedural synthesis fallback
        this.playProceduralZipper();
      });
      this.loadZipperSound();
    } catch {
      this.playProceduralZipper();
    }
  }

  public playProceduralZipper() {
    try {
      this.init();
      if (!this.ctx) return;
      const bufferSize = Math.floor(this.ctx.sampleRate * 2.5);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / this.ctx.sampleRate;
        const click = Math.sin(2 * Math.PI * (80 + 40 * Math.sin(t * 3)) * t) > 0.96 ? 0.7 : 0;
        data[i] = (Math.random() * 0.3 - 0.15 + click) * Math.sin((i / bufferSize) * Math.PI);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2600, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 2.5);
    } catch {}
  }

  public playChord() {
    if (!this.enabled) return;
    const chords = [523.25, 659.25, 783.99, 1046.5]; // C Major 7th dreamy chord
    chords.forEach((note, i) => {
      setTimeout(() => this.playChime(note), i * 65);
    });
  }
}

export const sound = new SoundManager();
