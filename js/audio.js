/**
 * ==============================================================================
 * CYBER PULSE — js/audio.js
 * Controlador de Áudio e Música Sintetizada (Web Audio API Pura)
 * ==============================================================================
 * Não usa arquivos MP3 ou WAV pesados. Todos os efeitos e a trilha sonora
 * chiptune neon são sintetizados em tempo real pelo navegador usando osciladores.
 */

'use strict';

class AudioController {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicInterval = null;
    this.currentStep = 0;

    // Carrega a preferência de mudo salva pelo usuário no navegador
    const savedMute = localStorage.getItem('cyberpulse_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  /**
   * Inicializa o AudioContext após o primeiro clique do usuário
   * (Regra obrigatória de segurança de todos os navegadores modernos)
   */
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Alterna entre som ligado e mudo
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('cyberpulse_muted', this.isMuted);
    if (this.isMuted) {
      this.stopMusic();
    }
    return this.isMuted;
  }

  /**
   * Som de Pulo do Cubo (Frequência ascendente rápida em onda triangular)
   */
  playJump() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(540, t + 0.12);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }

  /**
   * Som de Aterrissagem (Sub-grave rápido e suave)
   */
  playLand() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.08);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  /**
   * Som de Impacto / Morte (Onda dente de serra descendente + ruído de explosão)
   */
  playDeath() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Oscilador agressivo descendente
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.35);

      oscGain.gain.setValueAtTime(0.35, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.4);

      // 2. Ruído branco para dar sensação de estilhaçamento
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(900, t);
      noiseFilter.frequency.linearRampToValueAtTime(100, t + 0.25);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.28, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(t);
      whiteNoise.stop(t + 0.26);
    } catch (e) {}
  }

  /**
   * Som do Trampolim Neon (Jump Pad)
   */
  playJumpPad() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.22);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.26);
    } catch (e) {}
  }

  /**
   * Som de Transição do Portal de Gravidade (Efeito de distorção dimensional)
   */
  playPortal() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.linearRampToValueAtTime(220, t + 0.15);
      osc.frequency.linearRampToValueAtTime(750, t + 0.3);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.33);
    } catch (e) {}
  }

  /**
   * Som de Clique na Interface
   */
  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.07);
    } catch (e) {}
  }

  /**
   * Som de Vitória / Conclusão da Fase (Arpeggio triunfante)
   */
  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // Dó, Mi, Sol, Dó alto, etc.
      notes.forEach((freq, index) => {
        const t = this.ctx.currentTime + index * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch (e) {}
  }

  /**
   * Trilha Sonora Neon em Tempo Real (Música Sintetizada Procedural)
   */
  startMusic(speedFactor = 1.0) {
    if (this.isMuted) return;
    this.stopMusic();
    this.init();
    if (!this.ctx) return;

    // Escala menor eletrônica futurista (Frequências em Hz)
    const bassline = [110, 110, 130.81, 110, 146.83, 110, 164.81, 146.83];
    const leadNotes = [440, 523.25, 587.33, 659.25, 587.33, 523.25, 493.88, 440];

    // Ritmo acelerado conforme a velocidade da fase
    const tempoMs = Math.max(90, Math.floor(135 / speedFactor));

    this.musicInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;

      try {
        const t = this.ctx.currentTime;
        const step = this.currentStep % bassline.length;

        // 1. Linha de Baixo Sintetizada
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassline[step], t);

        bassGain.gain.setValueAtTime(0.08, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassOsc.start(t);
        bassOsc.stop(t + 0.11);

        // 2. Melodia de Sintetizador Arpeggiada a cada 2 passos
        if (step % 2 === 0) {
          const leadOsc = this.ctx.createOscillator();
          const leadGain = this.ctx.createGain();
          leadOsc.type = 'square';
          leadOsc.frequency.setValueAtTime(leadNotes[step], t);

          leadGain.gain.setValueAtTime(0.04, t);
          leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

          leadOsc.connect(leadGain);
          leadGain.connect(this.ctx.destination);

          leadOsc.start(t);
          leadOsc.stop(t + 0.15);
        }

        // 3. Batida de Bumbo Eletro (Kick sintetizado) nos tempos 0 e 4
        if (step === 0 || step === 4) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(140, t);
          kickOsc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

          kickGain.gain.setValueAtTime(0.24, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

          kickOsc.connect(kickGain);
          kickGain.connect(this.ctx.destination);

          kickOsc.start(t);
          kickOsc.stop(t + 0.1);
        }

        this.currentStep++;
      } catch (e) {}
    }, tempoMs);
  }

  /**
   * Pausa a música
   */
  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}
