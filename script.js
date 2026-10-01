/**
 * ==============================================================================
 * CYBER PULSE — Mini Jogo 2D Neon de Plataforma e Corrida Automática
 * Desenvolvido em HTML5, CSS3 e JavaScript Puro (Vanilla)
 * ==============================================================================
 */

'use strict';

// Polyfill de segurança para suporte universal a canvas roundRect em navegadores mais antigos
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
    let r = typeof radii === 'number' ? radii : 4;
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}


/* ==========================================================================
   1. CONSTANTES E CONFIGURAÇÕES GERAIS
   ========================================================================== */
const CONFIG = {
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  GROUND_Y: 570,          // Altura padrão do chão
  CEILING_Y: 150,         // Altura do teto para gravidade invertida
  PLAYER_SIZE: 38,        // Tamanho do quadrado do jogador
  GRAVITY: 2150,          // Aceleração da gravidade (pixels/s²)
  JUMP_FORCE: 690,        // Força inicial do pulo
  MAX_FALL_SPEED: 1100,   // Velocidade terminal de queda
  COYOTE_TIME: 0.09,      // Tempo de tolerância após sair de uma plataforma (segundos)
  JUMP_BUFFER: 0.12,      // Memória de pulo antes de aterrissar (segundos)
  ROTATION_SPEED: 460     // Velocidade de rotação no ar (graus/segundo)
};

/* ==========================================================================
   2. SISTEMA DE ÁUDIO VIA WEB AUDIO API (Sintetizador Puro, Sem Arquivos Externos)
   ========================================================================== */
class AudioController {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicInterval = null;
    this.currentStep = 0;

    // Carregar preferência salva
    const savedMute = localStorage.getItem('cyberpulse_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  // Inicializa o AudioContext após a primeira interação do usuário (exigência dos navegadores)
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

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('cyberpulse_muted', this.isMuted);
    if (this.isMuted) {
      this.stopMusic();
    }
    return this.isMuted;
  }

  // Som de Pulo (Grave para agudo com onda quadrada)
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
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.12);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {
      // Ignorar erros caso áudio não esteja disponível
    }
  }

  // Som de Aterrissagem (Sub-grave rápido)
  playLand() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.08);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  // Som de Colisão / Morte (Ruído + impacto descendente)
  playDeath() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;

      // Oscilador descendente agressivo
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);

      oscGain.gain.setValueAtTime(0.3, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.37);

      // Ruído branco sintetizado
      const bufferSize = this.ctx.sampleRate * 0.15;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(1000, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 0.2);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(t);
    } catch (e) {}
  }

  // Som de Inversão de Gravidade / Portal
  playPortal() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.linearRampToValueAtTime(740, t + 0.1);
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.22);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    } catch (e) {}
  }

  // Som de Fase Concluída (Arpejo triunfal em escala maior)
  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const startTime = t + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.38);
    });
  }

  // Som de Clique de Interface
  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.04);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.06);
    } catch (e) {}
  }

  // Trilha Sintetizada Rítmica Neon de Fundo
  startMusic(speedMultiplier = 1.0) {
    if (this.isMuted) return;
    this.stopMusic();
    this.init();

    const bpm = 126 * (speedMultiplier || 1.0);
    const stepDuration = (60 / bpm) / 2; // Colcheias

    // Linha de baixo sintetizada cyberpunk
    const bassline = [
      110, 0, 110, 130.81, 110, 0, 146.83, 130.81,
      98,  0, 98,  110,    98,  0, 130.81, 110
    ];

    this.currentStep = 0;
    this.musicInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const note = bassline[this.currentStep % bassline.length];

        // Beat do bumbo nos tempos pares
        if (this.currentStep % 4 === 0) {
          const kick = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kick.frequency.setValueAtTime(120, t);
          kick.frequency.exponentialRampToValueAtTime(30, t + 0.08);

          kickGain.gain.setValueAtTime(0.2, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

          kick.connect(kickGain);
          kickGain.connect(this.ctx.destination);

          kick.start(t);
          kick.stop(t + 0.1);
        }

        // Sintetizador do baixo
        if (note > 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(note, t);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, t);

          gain.gain.setValueAtTime(0.09, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t);
          osc.stop(t + 0.14);
        }

        this.currentStep++;
      } catch (e) {}
    }, stepDuration * 1000);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

/* ==========================================================================
   3. SISTEMA DE PARTÍCULAS
   ========================================================================== */
class ParticleManager {
  constructor() {
    this.particles = [];
  }

  // Partículas de rastro do jogador
  emitTrail(x, y, color) {
    if (Math.random() < 0.4) return;
    this.particles.push({
      x: x + (Math.random() * 6 - 3),
      y: y + (Math.random() * 6 - 3),
      vx: -(Math.random() * 40 + 20),
      vy: (Math.random() * 30 - 15),
      size: Math.random() * 5 + 3,
      alpha: 0.8,
      color: color,
      life: 0.28,
      maxLife: 0.28,
      type: 'square'
    });
  }

  // Poeira/Faíscas ao pular ou aterrissar
  emitJumpDust(x, y, color, isCeiling = false) {
    const dirY = isCeiling ? -1 : 1;
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: x + Math.random() * CONFIG.PLAYER_SIZE,
        y: y + (isCeiling ? 0 : CONFIG.PLAYER_SIZE),
        vx: (Math.random() - 0.5) * 160,
        vy: dirY * (Math.random() * 80 + 30),
        size: Math.random() * 4 + 2,
        alpha: 0.9,
        color: color,
        life: 0.35,
        maxLife: 0.35,
        type: 'spark'
      });
    }
  }

  // Explosão dramática ao morrer
  emitDeathExplosion(x, y, color1, color2) {
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 420 + 80;
      this.particles.push({
        x: x + CONFIG.PLAYER_SIZE / 2,
        y: y + CONFIG.PLAYER_SIZE / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 4,
        alpha: 1,
        color: Math.random() > 0.5 ? color1 : color2,
        life: Math.random() * 0.4 + 0.5,
        maxLife: 0.8,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 15,
        type: 'fragment'
      });
    }
  }

  // Confetes e faíscas ao concluir a fase
  emitCelebration(cameraX) {
    for (let i = 0; i < 60; i++) {
      const colors = ['#00f0ff', '#00ff88', '#ff0077', '#ffb700', '#ffffff'];
      this.particles.push({
        x: cameraX + Math.random() * CONFIG.CANVAS_WIDTH,
        y: Math.random() * 300,
        vx: (Math.random() - 0.5) * 200,
        vy: Math.random() * 200 + 100,
        size: Math.random() * 7 + 4,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.8,
        maxLife: 1.8,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 8,
        type: 'confetti'
      });
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.rotation !== undefined && p.vRot) {
        p.rotation += p.vRot * dt;
      }
    }
  }

  draw(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;

      if (p.type === 'fragment' || p.type === 'confetti') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
  }
}

/* ==========================================================================
   4. SISTEMA DE DADOS DAS 10 FASES (Espaçamento Amplo, Ritmo Fluido e Sem Conflitos)
   ========================================================================== */
const LEVELS = [
  // FASE 1 — Tutorial: Baixa velocidade, obstáculos com 800px+ de distância, tempo de sobra para reagir
  {
    id: 1,
    name: "Neon Dawn",
    difficultyName: "Fácil",
    difficultyClass: "diff-facil",
    speed: 380,
    finishX: 6000,
    colors: {
      primary: '#00f0ff',
      accent: '#0088ff',
      bgGrad1: '#070919',
      bgGrad2: '#0d163a',
      floorTop: '#00f0ff',
      floorBody: '#070b1e'
    },
    hints: [
      { x: 500, y: 460, text: "ESPAÇO OU TOQUE PARA PULAR" },
      { x: 2300, y: 430, text: "SUBA NA PLATAFORMA TRANQUILAMENTE" },
      { x: 4200, y: 460, text: "ESPINHO DUPLO! SEGURE O PULO!" },
      { x: 5100, y: 460, text: "RETA FINAL!" }
    ],
    spikes: [
      { x: 1000, w: 36, h: 42 },
      { x: 1800, w: 36, h: 42 },
      { x: 3700, w: 36, h: 42 },
      { x: 4500, w: 36, h: 42 },
      { x: 4536, w: 36, h: 42 }, // Espinho duplo isolado
      { x: 5300, w: 36, h: 42 }
    ],
    platforms: [
      { x: 2500, y: 505, w: 500, h: 65 }  // Plataforma muito ampla e segura
    ],
    pits: [],
    movingHazards: [],
    gravityPortals: []
  },

  // FASE 2 — Iniciante: Pontes largas sobre os buracos, espinhos bem afastados
  {
    id: 2,
    name: "Cyber Flow",
    difficultyName: "Iniciante",
    difficultyClass: "diff-iniciante",
    speed: 420,
    finishX: 7500,
    colors: {
      primary: '#00ff88',
      accent: '#00b862',
      bgGrad1: '#041412',
      bgGrad2: '#082823',
      floorTop: '#00ff88',
      floorBody: '#051814'
    },
    hints: [
      { x: 500, y: 460, text: "PONTES SEGURAS SOBRE OS BURACOS!" }
    ],
    spikes: [
      { x: 1100, w: 36, h: 42 },
      { x: 1950, w: 36, h: 42 },
      { x: 4100, w: 36, h: 42 },
      { x: 4136, w: 36, h: 42 }, // Duplo
      { x: 6250, w: 36, h: 42 },
      { x: 7000, w: 36, h: 42 },
      { x: 7036, w: 36, h: 42 }  // Duplo
    ],
    pits: [
      { startX: 2700, endX: 3300 },
      { startX: 4900, endX: 5500 }
    ],
    platforms: [
      { x: 2800, y: 505, w: 400, h: 65 },  // Ponte ampla sobre buraco 1
      { x: 5000, y: 490, w: 400, h: 30 }   // Ponte ampla sobre buraco 2
    ],
    movingHazards: [],
    gravityPortals: []
  },

  // FASE 3 — Intermediária: Perigos móveis isolados, escadaria sem espinhos colados
  {
    id: 3,
    name: "Pulse Hazard",
    difficultyName: "Intermediária",
    difficultyClass: "diff-intermediaria",
    speed: 460,
    finishX: 8500,
    colors: {
      primary: '#ffb700',
      accent: '#ff8800',
      bgGrad1: '#140c02',
      bgGrad2: '#281704',
      floorTop: '#ffb700',
      floorBody: '#160d03'
    },
    hints: [
      { x: 500, y: 460, text: "PERIGOS MÓVEIS! OBSERVE O MOVIMENTO!" }
    ],
    spikes: [
      { x: 1100, w: 36, h: 42 },
      { x: 2800, w: 36, h: 42 },
      { x: 2836, w: 36, h: 42 }, // Duplo
      { x: 5200, w: 36, h: 42 },
      { x: 6900, w: 36, h: 42 },
      { x: 6936, w: 36, h: 42 },
      { x: 6972, w: 36, h: 42 }, // Triplo bem isolado
      { x: 7800, w: 36, h: 42 }
    ],
    pits: [],
    platforms: [
      // Escadaria de degraus amplos (200px+ cada)
      { x: 3600, y: 505, w: 200, h: 25 },
      { x: 3880, y: 445, w: 200, h: 25 },
      { x: 4160, y: 385, w: 220, h: 25 }
    ],
    movingHazards: [
      { x: 1950, baseY: 490, w: 32, h: 65, amplitude: 55, speed: 2.0, color: '#ff8800' },
      { x: 6050, baseY: 490, w: 32, h: 65, amplitude: 60, speed: 2.2, color: '#ff8800' }
    ],
    gravityPortals: []
  },

  // FASE 4 — Intermediária +: Inversão no Teto com pistas limpas e espaçamento de 1000px
  {
    id: 4,
    name: "Gravity Shift",
    difficultyName: "Intermediária",
    difficultyClass: "diff-intermediaria",
    speed: 500,
    finishX: 9500,
    colors: {
      primary: '#ff0077',
      accent: '#c000bb',
      bgGrad1: '#160413',
      bgGrad2: '#2a0725',
      floorTop: '#ff0077',
      floorBody: '#160514'
    },
    hints: [
      { x: 500, y: 460, text: "PORTAL DE GRAVIDADE À FRENTE!" },
      { x: 3200, y: 240, text: "NO TETO! PULE PARA BAIXO!" }
    ],
    spikes: [
      // Ato 1: Chão Normal
      { x: 1100, w: 36, h: 42 },
      { x: 2000, w: 36, h: 42 },
      { x: 2036, w: 36, h: 42 }, // Duplo
      // Ato 2: No Teto (Invertido, espaçamento de 1000px!)
      { x: 4000, w: 36, h: 42, inverted: true },
      { x: 5000, w: 36, h: 42, inverted: true },
      { x: 5036, w: 36, h: 42, inverted: true }, // Duplo teto
      { x: 5900, w: 36, h: 42, inverted: true }
    ],
    pits: [
      { startX: 7400, endX: 8000 }
    ],
    platforms: [
      { x: 7500, y: 490, w: 400, h: 30 } // Ponte segura no retorno
    ],
    movingHazards: [
      { x: 8650, baseY: 490, w: 32, h: 65, amplitude: 60, speed: 2.5, color: '#ff00aa' }
    ],
    gravityPortals: [
      { x: 3000, y: 300, w: 45, h: 180, targetGravity: -1 }, // Inverte para o teto
      { x: 6500, y: 240, w: 45, h: 180, targetGravity: 1 }   // Restaura para o chão
    ]
  },

  // FASE 5 — Difícil: Alta velocidade, mas com 900px+ entre cada obstáculo
  {
    id: 5,
    name: "Quantum Surge",
    difficultyName: "Difícil",
    difficultyClass: "diff-dificil",
    speed: 540,
    finishX: 10500,
    colors: {
      primary: '#ff3344',
      accent: '#ff8800',
      bgGrad1: '#1c0216',
      bgGrad2: '#2c0422',
      floorTop: '#ff3344',
      floorBody: '#160212'
    },
    hints: [
      { x: 500, y: 460, text: "RITMO VELOZ E ESPAÇADO!" }
    ],
    spikes: [
      { x: 1200, w: 36, h: 42 },
      { x: 2150, w: 36, h: 42 },
      { x: 2186, w: 36, h: 42 }, // Duplo
      { x: 5400, w: 36, h: 42 },
      { x: 5436, w: 36, h: 42 },
      { x: 5472, w: 36, h: 42 }, // Triplo
      { x: 8650, w: 36, h: 42 },
      { x: 8686, w: 36, h: 42 }, // Duplo
      { x: 9600, w: 36, h: 42 },
      { x: 9636, w: 36, h: 42 },
      { x: 9672, w: 36, h: 42 }  // Triplo
    ],
    pits: [
      { startX: 3950, endX: 4600 },
      { startX: 7200, endX: 7850 }
    ],
    platforms: [
      { x: 4080, y: 480, w: 400, h: 25 },
      { x: 7320, y: 480, w: 400, h: 25 }
    ],
    movingHazards: [
      { x: 3100, baseY: 485, w: 32, h: 65, amplitude: 65, speed: 2.8, color: '#ff3344' },
      { x: 6350, baseY: 485, w: 32, h: 70, amplitude: 70, speed: 3.0, color: '#ff3344' }
    ],
    gravityPortals: []
  },

  // FASE 6 — Avançada: Dupla inversão com pistas de teto limpas e folgas de 1100px
  {
    id: 6,
    name: "Hyper Neon",
    difficultyName: "Avançada",
    difficultyClass: "diff-avancada",
    speed: 580,
    finishX: 11500,
    colors: {
      primary: '#ffee00',
      accent: '#00f0ff',
      bgGrad1: '#0f1202',
      bgGrad2: '#1e2405',
      floorTop: '#ffee00',
      floorBody: '#101402'
    },
    hints: [
      { x: 500, y: 460, text: "FLUXO CONTÍNUO E TRANQUILO!" }
    ],
    spikes: [
      // Ato 1: Chão Normal
      { x: 1200, w: 36, h: 42 },
      { x: 2200, w: 36, h: 42 },
      { x: 2236, w: 36, h: 42 },
      // Ato 2: No Teto
      { x: 4400, w: 36, h: 42, inverted: true },
      { x: 6500, w: 36, h: 42, inverted: true },
      { x: 6536, w: 36, h: 42, inverted: true },
      // Ato 3: Retorno
      { x: 8500, w: 36, h: 42 },
      { x: 8536, w: 36, h: 42 },
      { x: 10750, w: 36, h: 42 },
      { x: 10786, w: 36, h: 42 },
      { x: 10822, w: 36, h: 42 }
    ],
    pits: [
      { startX: 9400, endX: 10000 }
    ],
    platforms: [
      { x: 9520, y: 480, w: 380, h: 25 }
    ],
    movingHazards: [
      { x: 5450, baseY: 220, w: 32, h: 60, amplitude: 40, speed: 2.8, color: '#ffee00' }
    ],
    gravityPortals: [
      { x: 3300, y: 300, w: 45, h: 180, targetGravity: -1 },
      { x: 7400, y: 240, w: 45, h: 180, targetGravity: 1 }
    ]
  },

  // FASE 7 — Avançada +: Synth Matrix (Espaçamento de 1000px a 1200px)
  {
    id: 7,
    name: "Synth Matrix",
    difficultyName: "Avançada",
    difficultyClass: "diff-avancada",
    speed: 610,
    finishX: 12500,
    colors: {
      primary: '#b500ff',
      accent: '#ff00bb',
      bgGrad1: '#12021a',
      bgGrad2: '#240434',
      floorTop: '#b500ff',
      floorBody: '#110218'
    },
    hints: [
      { x: 500, y: 460, text: "SINCRONIZE NO RITMO DA MÚSICA!" }
    ],
    spikes: [
      { x: 1250, w: 36, h: 42 },
      { x: 3450, w: 36, h: 42 },
      { x: 3486, w: 36, h: 42 },
      { x: 6000, w: 36, h: 42 },
      { x: 6036, w: 36, h: 42 },
      { x: 6072, w: 36, h: 42 },
      { x: 9650, w: 36, h: 42 },
      { x: 9686, w: 36, h: 42 },
      { x: 11700, w: 36, h: 42 },
      { x: 11736, w: 36, h: 42 },
      { x: 11772, w: 36, h: 42 }
    ],
    pits: [
      { startX: 4400, endX: 5100 },
      { startX: 8050, endX: 8750 }
    ],
    platforms: [
      { x: 4550, y: 480, w: 400, h: 25 },
      { x: 8200, y: 480, w: 400, h: 25 }
    ],
    movingHazards: [
      { x: 2350, baseY: 480, w: 32, h: 70, amplitude: 65, speed: 3.0, color: '#ff00bb' },
      { x: 7100, baseY: 480, w: 32, h: 75, amplitude: 70, speed: 3.2, color: '#ff00bb' },
      { x: 10700, baseY: 480, w: 32, h: 75, amplitude: 70, speed: 3.4, color: '#ff00bb' }
    ],
    gravityPortals: []
  },

  // FASE 8 — Mestre: Plasma Drift (Inversão ampla com 1100px+ de folga)
  {
    id: 8,
    name: "Plasma Drift",
    difficultyName: "Mestre",
    difficultyClass: "diff-mestre",
    speed: 640,
    finishX: 13500,
    colors: {
      primary: '#00f0ff',
      accent: '#ff0055',
      bgGrad1: '#04101a',
      bgGrad2: '#180816',
      floorTop: '#00f0ff',
      floorBody: '#05121c'
    },
    hints: [
      { x: 500, y: 460, text: "PLASMA ZONE: PRECISÃO E CALMA!" }
    ],
    spikes: [
      // Chão 1
      { x: 1300, w: 36, h: 42 },
      { x: 2450, w: 36, h: 42 },
      { x: 2486, w: 36, h: 42 },
      // Teto Invertido
      { x: 4800, w: 36, h: 42, inverted: true },
      { x: 7100, w: 36, h: 42, inverted: true },
      { x: 7136, w: 36, h: 42, inverted: true },
      // Chão Retorno
      { x: 9400, w: 36, h: 42 },
      { x: 9436, w: 36, h: 42 },
      { x: 12850, w: 36, h: 42 },
      { x: 12886, w: 36, h: 42 },
      { x: 12922, w: 36, h: 42 }
    ],
    pits: [
      { startX: 10400, endX: 11100 }
    ],
    platforms: [
      { x: 10550, y: 480, w: 400, h: 25 }
    ],
    movingHazards: [
      { x: 5950, baseY: 220, w: 32, h: 60, amplitude: 40, speed: 2.8, color: '#00f0ff' },
      { x: 11950, baseY: 480, w: 32, h: 75, amplitude: 70, speed: 3.5, color: '#ff0055' }
    ],
    gravityPortals: [
      { x: 3600, y: 300, w: 45, h: 180, targetGravity: -1 },
      { x: 8200, y: 240, w: 45, h: 180, targetGravity: 1 }
    ]
  },

  // FASE 9 — Extrema: Chrono Vortex (Transições amplas e visíveis)
  {
    id: 9,
    name: "Chrono Vortex",
    difficultyName: "Extrema",
    difficultyClass: "diff-extrema",
    speed: 670,
    finishX: 14500,
    colors: {
      primary: '#ffffff',
      accent: '#9d00ff',
      bgGrad1: '#090414',
      bgGrad2: '#1b0732',
      floorTop: '#ffffff',
      floorBody: '#0e041c'
    },
    hints: [
      { x: 500, y: 460, text: "VÓRTICE TEMPORAL: FOCO TOTAL!" }
    ],
    spikes: [
      // Ato 1
      { x: 1350, w: 36, h: 42 },
      { x: 2550, w: 36, h: 42 },
      { x: 2586, w: 36, h: 42 },
      // Ato 2 (Teto 1)
      { x: 4950, w: 36, h: 42, inverted: true },
      { x: 6150, w: 36, h: 42, inverted: true },
      { x: 6186, w: 36, h: 42, inverted: true },
      // Ato 3 (Teto 2)
      { x: 12250, w: 36, h: 42, inverted: true },
      // Ato 4 (Sprint)
      { x: 14000, w: 36, h: 42 },
      { x: 14036, w: 36, h: 42 },
      { x: 14072, w: 36, h: 42 }
    ],
    pits: [
      { startX: 8400, endX: 9100 }
    ],
    platforms: [
      { x: 8550, y: 470, w: 400, h: 25 }
    ],
    movingHazards: [
      { x: 10000, baseY: 480, w: 32, h: 70, amplitude: 70, speed: 3.5, color: '#9d00ff' }
    ],
    gravityPortals: [
      { x: 3700, y: 300, w: 45, h: 180, targetGravity: -1 },
      { x: 7300, y: 240, w: 45, h: 180, targetGravity: 1 },
      { x: 11100, y: 300, w: 45, h: 180, targetGravity: -1 },
      { x: 13150, y: 240, w: 45, h: 180, targetGravity: 1 }
    ]
  },

  // FASE 10 — Desafio Supremo Final: Singularity Overdrive (Espaçamentos de 1200px+, fluido e épico)
  {
    id: 10,
    name: "Singularity Overdrive",
    difficultyName: "Suprema",
    difficultyClass: "diff-suprema",
    speed: 700,
    finishX: 16000,
    colors: {
      primary: '#ffcc00',
      accent: '#ff1744',
      bgGrad1: '#180205',
      bgGrad2: '#34050d',
      floorTop: '#ffcc00',
      floorBody: '#1a0307'
    },
    hints: [
      { x: 500, y: 460, text: "DESAFIO SUPREMO FINAL: DOMINE A SINGULARIDADE!" }
    ],
    spikes: [
      // Ato 1 (Chão, 0 a 4800)
      { x: 1400, w: 36, h: 42 },
      { x: 3800, w: 36, h: 42 },
      { x: 3836, w: 36, h: 42 }, // Duplo
      // Ato 2 (Teto, 4800 a 9400)
      { x: 6000, w: 36, h: 42, inverted: true },
      { x: 8400, w: 36, h: 42, inverted: true },
      { x: 8436, w: 36, h: 42, inverted: true }, // Duplo teto
      // Ato 3 (Chão, 9400 a 16000)
      { x: 13200, w: 36, h: 42 },
      { x: 13236, w: 36, h: 42 }, // Duplo
      { x: 15350, w: 36, h: 42 },
      { x: 15386, w: 36, h: 42 },
      { x: 15422, w: 36, h: 42 }  // Triplo final
    ],
    pits: [
      { startX: 10500, endX: 11200 },
      { startX: 14100, endX: 14750 }
    ],
    platforms: [
      { x: 10650, y: 480, w: 400, h: 25 },
      { x: 14220, y: 480, w: 400, h: 25 }
    ],
    movingHazards: [
      { x: 2600, baseY: 480, w: 32, h: 70, amplitude: 70, speed: 3.2, color: '#ff1744' },
      { x: 7200, baseY: 220, w: 32, h: 60, amplitude: 40, speed: 3.0, color: '#ffcc00' },
      { x: 12050, baseY: 480, w: 32, h: 70, amplitude: 70, speed: 3.6, color: '#ff1744' }
    ],
    gravityPortals: [
      { x: 4800, y: 300, w: 45, h: 180, targetGravity: -1 }, // Portal para o Teto
      { x: 9400, y: 240, w: 45, h: 180, targetGravity: 1 }   // Retorno ao Chão
    ]
  }
];

/* ==========================================================================
   5. CLASSE DO JOGADOR (Física Precisa, Rotação e Rastro)
   ========================================================================== */
class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 100;
    this.y = CONFIG.GROUND_Y - CONFIG.PLAYER_SIZE;
    this.w = CONFIG.PLAYER_SIZE;
    this.h = CONFIG.PLAYER_SIZE;
    this.vx = 0;
    this.vy = 0;
    this.grounded = true;
    this.gravityDir = 1;       // 1 = normal (chão), -1 = invertido (teto)
    this.rotation = 0;         // Ângulo em graus
    this.targetRotation = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.isDead = false;
  }

  // Define se o jogador está em gravidade normal ou invertida
  setGravity(dir) {
    if (this.gravityDir !== dir) {
      this.gravityDir = dir;
      this.vy = 0;
      this.grounded = false;
    }
  }

  update(dt, speed, audioCtrl, particleMgr, level) {
    if (this.isDead) return;

    // Velocidade horizontal automática
    this.vx = speed;
    this.x += this.vx * dt;

    // Temporizadores de tolerância (Coyote e Buffer)
    if (this.grounded) {
      this.coyoteTimer = CONFIG.COYOTE_TIME;
    } else {
      this.coyoteTimer -= dt;
    }

    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }

    // Tentar executar pulo guardado no buffer
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.performJump(audioCtrl, particleMgr);
    }

    // Aplicação da Gravidade
    const effectiveGravity = CONFIG.GRAVITY * this.gravityDir;
    this.vy += effectiveGravity * dt;

    // Limitar velocidade terminal
    if (Math.abs(this.vy) > CONFIG.MAX_FALL_SPEED) {
      this.vy = Math.sign(this.vy) * CONFIG.MAX_FALL_SPEED;
    }

    this.y += this.vy * dt;

    // Rotação suave no ar
    if (!this.grounded) {
      this.rotation += CONFIG.ROTATION_SPEED * this.gravityDir * dt;
    } else {
      // Quando toca o chão, ajusta para o múltiplo mais próximo de 90°
      const snapAngle = Math.round(this.rotation / 90) * 90;
      this.rotation += (snapAngle - this.rotation) * 0.35;
    }

    // Emissão de rastro visual de partículas
    if (Math.random() < 0.6) {
      particleMgr.emitTrail(this.x, this.y + this.h / 2, level.colors.primary);
    }
  }

  queueJump() {
    this.jumpBufferTimer = CONFIG.JUMP_BUFFER;
  }

  performJump(audioCtrl, particleMgr) {
    this.vy = -CONFIG.JUMP_FORCE * this.gravityDir;
    this.grounded = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;

    audioCtrl.playJump();
    particleMgr.emitJumpDust(this.x, this.y, '#ffffff', this.gravityDir === -1);
  }

  land(groundY, audioCtrl, particleMgr, color) {
    if (!this.grounded && Math.abs(this.vy) > 120) {
      audioCtrl.playLand();
      particleMgr.emitJumpDust(this.x, this.y, color, this.gravityDir === -1);
    }

    this.grounded = true;
    this.vy = 0;

    if (this.gravityDir === 1) {
      this.y = groundY - this.h;
    } else {
      this.y = groundY;
    }
  }

  draw(ctx, primaryColor, accentColor) {
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate((this.rotation * Math.PI) / 180);

    // Efeito de brilho neon externo
    ctx.shadowBlur = 18;
    ctx.shadowColor = primaryColor;

    // Corpo do cubo principal com gradiente
    const grad = ctx.createLinearGradient(-this.w / 2, -this.h / 2, this.w / 2, this.h / 2);
    grad.addColorStop(0, primaryColor);
    grad.addColorStop(1, accentColor);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(-this.w / 2, -this.h / 2, this.w, this.h, 6);
    ctx.fill();

    // Borda neon brilhante
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Olho / Núcleo tecnológico central
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#060a1e';
    ctx.beginPath();
    ctx.roundRect(-this.w / 4, -this.h / 4, this.w / 2, this.h / 2, 3);
    ctx.fill();

    // Pupila digital azul/ciano
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, -3, 6, 6);

    ctx.restore();
  }
}

/* ==========================================================================
   6. MOTOR DE COLISÕES
   ========================================================================== */
class CollisionEngine {
  // Colisão de caixa contra espinho triangular (com margem de segurança justa)
  static checkPlayerSpike(player, spike) {
    // Margem interna para evitar mortes frustrantes em pixels soltos
    const margin = 5;
    const px = player.x + margin;
    const py = player.y + margin;
    const pw = player.w - margin * 2;
    const ph = player.h - margin * 2;

    const sx = spike.x;
    const sw = spike.w;
    const sh = spike.h;
    const sy = spike.inverted ? CONFIG.CEILING_Y : CONFIG.GROUND_Y - sh;

    // Teste AABB rápido primeiro
    if (px + pw < sx || px > sx + sw || py + ph < sy || py > sy + sh) {
      return false;
    }

    // Se houve sobreposição de caixas, checa intersecção precisa com o triângulo
    // Ponto médio da base e vértice do espinho
    const apexX = sx + sw / 2;
    const apexY = spike.inverted ? sy + sh : sy;
    const baseY = spike.inverted ? sy : sy + sh;

    // Teste dos cantos do jogador contra os lados inclinados do triângulo
    const corners = [
      { x: px, y: py },
      { x: px + pw, y: py },
      { x: px, y: py + ph },
      { x: px + pw, y: py + ph },
      { x: px + pw / 2, y: py + (spike.inverted ? 0 : ph) }
    ];

    for (const c of corners) {
      if (spike.inverted) {
        // Espinho para baixo no teto
        if (c.y >= baseY && c.y <= apexY) {
          const halfWidthAtY = (sw / 2) * (1 - (c.y - baseY) / sh);
          if (c.x >= apexX - halfWidthAtY && c.x <= apexX + halfWidthAtY) {
            return true;
          }
        }
      } else {
        // Espinho para cima no chão normal
        if (c.y >= apexY && c.y <= baseY) {
          const halfWidthAtY = (sw / 2) * ((c.y - apexY) / sh);
          if (c.x >= apexX - halfWidthAtY && c.x <= apexX + halfWidthAtY) {
            return true;
          }
        }
      }
    }

    return true;
  }

  // Colisão do jogador com plataformas retangulares (Aterrissagem vs Bater de Frente)
  static handlePlayerPlatform(player, plat, dt) {
    const px = player.x;
    const py = player.y;
    const pw = player.w;
    const ph = player.h;

    // Checagem de sobreposição AABB
    if (px + pw > plat.x && px < plat.x + plat.w && py + ph > plat.y && py < plat.y + plat.h) {
      const isNormal = player.gravityDir === 1;

      if (isNormal) {
        // Gravidade normal: Checa se estava caindo em cima do topo
        const prevY = py - player.vy * dt;
        if (prevY + ph <= plat.y + 12 && player.vy >= 0) {
          return { type: 'land', surfaceY: plat.y };
        }
      } else {
        // Gravidade invertida: Checa se estava subindo até a base da plataforma
        const prevY = py - player.vy * dt;
        if (prevY >= plat.y + plat.h - 12 && player.vy <= 0) {
          return { type: 'land', surfaceY: plat.y + plat.h };
        }
      }

      // Se bateu na quina frontal ou lateral, é colisão fatal!
      return { type: 'crash' };
    }

    return null;
  }

  // Verifica se o jogador caiu em um buraco do chão
  static isPlayerInPit(player, pits) {
    const midX = player.x + player.w / 2;
    for (const pit of pits) {
      if (midX >= pit.startX && midX <= pit.endX) {
        return true;
      }
    }
    return false;
  }
}

/* ==========================================================================
   7. GERENCIADOR DO JOGO (Fluxo, Estado, Renderização e HUD)
   ========================================================================== */
class GameManager {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.audio = new AudioController();
    this.particles = new ParticleManager();
    this.player = new Player();

    this.currentLevelIndex = 0;
    this.level = LEVELS[this.currentLevelIndex];
    this.attempts = 1;
    this.totalAttempts = 0;
    this.gameState = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'LEVEL_COMPLETE', 'VICTORY'

    this.cameraX = 0;
    this.screenShakeTime = 0;
    this.respawnTimer = 0;
    this.lastTime = performance.now();

    // Carregar progresso salvo no localStorage
    this.unlockedLevel = parseInt(localStorage.getItem('cyberpulse_unlocked') || '1', 10);
    this.completedLevels = JSON.parse(localStorage.getItem('cyberpulse_completed') || '[]');
    this.attemptsHistory = JSON.parse(localStorage.getItem('cyberpulse_attempts') || '{}');

    this.bindDomElements();
    this.bindInputs();
    this.setupResize();
    this.renderLevelSelectGrid();
    this.updateAudioButtonState();

    // Iniciar loop principal
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  // Vincula botões da interface DOM
  bindDomElements() {
    // Telas/Modais
    this.dom = {
      hud: document.getElementById('gameHud'),
      mainMenu: document.getElementById('mainMenu'),
      levelSelectMenu: document.getElementById('levelSelectMenu'),
      howToPlayModal: document.getElementById('howToPlayModal'),
      pauseModal: document.getElementById('pauseModal'),
      levelCompleteModal: document.getElementById('levelCompleteModal'),
      gameVictoryModal: document.getElementById('gameVictoryModal'),
      deathFlash: document.getElementById('deathFlash'),

      // HUD
      progressBarFill: document.getElementById('progressBarFill'),
      progressPercent: document.getElementById('progressPercent'),
      hudLevelBadge: document.getElementById('hudLevelBadge'),
      hudLevelName: document.getElementById('hudLevelName'),
      hudAttempts: document.getElementById('hudAttempts'),
      soundIcon: document.getElementById('soundIcon'),
      btnSoundToggle: document.getElementById('btnSoundToggle'),
      btnQuickRestart: document.getElementById('btnQuickRestart'),
      btnPause: document.getElementById('btnPause'),

      // Menus
      btnPlay: document.getElementById('btnPlay'),
      btnLevelSelect: document.getElementById('btnLevelSelect'),
      btnHowToPlay: document.getElementById('btnHowToPlay'),
      btnBackFromLevels: document.getElementById('btnBackFromLevels'),
      btnBackToMain: document.getElementById('btnBackToMain'),
      btnCloseHowToPlay: document.getElementById('btnCloseHowToPlay'),
      btnStartFromHelp: document.getElementById('btnStartFromHelp'),

      // Pausa
      btnResume: document.getElementById('btnResume'),
      btnRestartFromPause: document.getElementById('btnRestartFromPause'),
      btnLevelsFromPause: document.getElementById('btnLevelsFromPause'),
      btnMenuFromPause: document.getElementById('btnMenuFromPause'),

      // Conclusão
      completeLevelTitle: document.getElementById('completeLevelTitle'),
      completeAttempts: document.getElementById('completeAttempts'),
      btnNextLevel: document.getElementById('btnNextLevel'),
      btnReplayLevel: document.getElementById('btnReplayLevel'),
      btnLevelsFromWin: document.getElementById('btnLevelsFromWin'),

      // Vitória Total
      totalAttemptsValue: document.getElementById('totalAttemptsValue'),
      btnPlayAgainAll: document.getElementById('btnPlayAgainAll'),
      btnLevelsFromAllWin: document.getElementById('btnLevelsFromAllWin')
    };

    // Eventos dos botões do Menu Principal
    this.dom.btnPlay.addEventListener('click', () => {
      this.audio.playClick();
      this.startLevel(this.currentLevelIndex);
    });

    this.dom.btnLevelSelect.addEventListener('click', () => {
      this.audio.playClick();
      this.openLevelSelect();
    });

    this.dom.btnHowToPlay.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.howToPlayModal.classList.add('active');
    });

    this.dom.btnCloseHowToPlay.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.howToPlayModal.classList.remove('active');
    });

    this.dom.btnStartFromHelp.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.howToPlayModal.classList.remove('active');
      this.startLevel(this.currentLevelIndex);
    });

    this.dom.btnBackFromLevels.addEventListener('click', () => {
      this.audio.playClick();
      this.closeLevelSelect();
    });

    this.dom.btnBackToMain.addEventListener('click', () => {
      this.audio.playClick();
      this.closeLevelSelect();
    });

    // HUD
    this.dom.btnSoundToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const muted = this.audio.toggleMute();
      this.updateAudioButtonState();
      if (!muted && this.gameState === 'PLAYING') {
        this.audio.startMusic(this.level.speed / 400);
      }
    });

    this.dom.btnQuickRestart.addEventListener('click', (e) => {
      e.stopPropagation();
      this.restartLevel();
    });

    this.dom.btnPause.addEventListener('click', (e) => {
      e.stopPropagation();
      this.pauseGame();
    });

    // Modal de Pausa
    this.dom.btnResume.addEventListener('click', () => {
      this.audio.playClick();
      this.resumeGame();
    });

    this.dom.btnRestartFromPause.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.pauseModal.classList.remove('active');
      this.restartLevel();
    });

    this.dom.btnLevelsFromPause.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.pauseModal.classList.remove('active');
      this.openLevelSelect();
    });

    this.dom.btnMenuFromPause.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.pauseModal.classList.remove('active');
      this.returnToMenu();
    });

    // Modal de Fase Concluída
    this.dom.btnNextLevel.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.levelCompleteModal.classList.remove('active');
      if (this.currentLevelIndex < LEVELS.length - 1) {
        this.startLevel(this.currentLevelIndex + 1);
      } else {
        this.showGrandVictory();
      }
    });

    this.dom.btnReplayLevel.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.levelCompleteModal.classList.remove('active');
      this.startLevel(this.currentLevelIndex);
    });

    this.dom.btnLevelsFromWin.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.levelCompleteModal.classList.remove('active');
      this.openLevelSelect();
    });

    // Modal de Vitória Total
    this.dom.btnPlayAgainAll.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.gameVictoryModal.classList.remove('active');
      this.startLevel(0);
    });

    this.dom.btnLevelsFromAllWin.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.gameVictoryModal.classList.remove('active');
      this.openLevelSelect();
    });
  }

  // Controles do Jogador (Teclado, Mouse e Toque em Celular)
  bindInputs() {
    const handleJumpAction = () => {
      if (this.gameState === 'PLAYING') {
        this.player.queueJump();
      }
    };

    // Teclado
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleJumpAction();
      } else if (e.code === 'KeyR') {
        if (this.gameState === 'PLAYING' || this.gameState === 'PAUSED') {
          this.restartLevel();
        }
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (this.gameState === 'PLAYING') {
          this.pauseGame();
        } else if (this.gameState === 'PAUSED') {
          this.resumeGame();
        }
      }
    });

    // Clique com o Mouse no Canvas
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        handleJumpAction();
      }
    });

    // Toque na Tela para Celulares e Tablets
    window.addEventListener('touchstart', (e) => {
      // Ignora toques em botões da interface HUD
      if (e.target.closest('.hud-btn') || e.target.closest('.cyber-btn') || e.target.closest('.close-btn')) {
        return;
      }
      e.preventDefault();
      handleJumpAction();
    }, { passive: false });
  }

  // Ajusta a resolução mantendo a proporção 16:9 nítida em qualquer dispositivo
  setupResize() {
    const resize = () => {
      const container = document.getElementById('gameContainer');
      const w = container.clientWidth;
      const h = container.clientHeight;

      const scale = Math.min(w / CONFIG.CANVAS_WIDTH, h / CONFIG.CANVAS_HEIGHT);
      this.canvas.style.width = `${Math.floor(CONFIG.CANVAS_WIDTH * scale)}px`;
      this.canvas.style.height = `${Math.floor(CONFIG.CANVAS_HEIGHT * scale)}px`;
    };

    window.addEventListener('resize', resize);
    resize();
  }

  updateAudioButtonState() {
    this.dom.soundIcon.textContent = this.audio.isMuted ? '🔇' : '🔊';
  }

  // Renderiza a grade de seleção de fases com status e progresso
  renderLevelSelectGrid() {
    const grid = document.getElementById('levelsGrid');
    grid.innerHTML = '';

    LEVELS.forEach((lvl, idx) => {
      const isUnlocked = lvl.id <= this.unlockedLevel;
      const isCompleted = this.completedLevels.includes(lvl.id);
      const attemptsCount = this.attemptsHistory[lvl.id] || 0;

      const card = document.createElement('div');
      card.className = `level-card ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`;

      card.innerHTML = `
        <div class="card-top">
          <span class="card-badge">FASE ${lvl.id}</span>
          <span class="card-difficulty ${lvl.difficultyClass}">${lvl.difficultyName}</span>
        </div>
        <div class="card-title">${lvl.name}</div>
        <div class="card-stats">
          <span>${isCompleted ? '⭐ Concluída' : (isUnlocked ? '🔓 Desbloqueada' : '🔒 Bloqueada')}</span>
          <span>${attemptsCount > 0 ? `#${attemptsCount} tentativas` : ''}</span>
        </div>
        <div class="card-progress-bar">
          <div class="card-progress-fill" style="width: ${isCompleted ? '100%' : '0%'}"></div>
        </div>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          this.audio.playClick();
          this.closeLevelSelect();
          this.startLevel(idx);
        });
      }

      grid.appendChild(card);
    });
  }

  openLevelSelect() {
    this.renderLevelSelectGrid();
    this.dom.mainMenu.classList.remove('active');
    this.dom.levelSelectMenu.classList.add('active');
  }

  closeLevelSelect() {
    this.dom.levelSelectMenu.classList.remove('active');
    if (this.gameState === 'MENU') {
      this.dom.mainMenu.classList.add('active');
    }
  }

  returnToMenu() {
    this.gameState = 'MENU';
    this.audio.stopMusic();
    this.dom.hud.classList.remove('active');
    this.dom.hud.classList.add('hud-hidden');
    this.dom.mainMenu.classList.add('active');
  }

  // Inicia uma fase específica
  startLevel(index) {
    this.currentLevelIndex = index;
    this.level = LEVELS[this.currentLevelIndex];
    this.attempts = 1;

    this.dom.mainMenu.classList.remove('active');
    this.dom.levelSelectMenu.classList.remove('active');
    this.dom.hud.classList.remove('hud-hidden');
    this.dom.hud.classList.add('active');

    this.updateHudInfo();
    this.resetPlayerToStart();
    this.gameState = 'PLAYING';
    this.audio.startMusic(this.level.speed / 400);
  }

  restartLevel() {
    this.attempts++;
    this.attemptsHistory[this.level.id] = (this.attemptsHistory[this.level.id] || 0) + 1;
    localStorage.setItem('cyberpulse_attempts', JSON.stringify(this.attemptsHistory));

    this.updateHudInfo();
    this.resetPlayerToStart();
    this.gameState = 'PLAYING';
    this.audio.startMusic(this.level.speed / 400);
  }

  resetPlayerToStart() {
    this.player.reset();
    this.cameraX = 0;
    this.particles.clear();
    this.respawnTimer = 0;
  }

  pauseGame() {
    if (this.gameState !== 'PLAYING') return;
    this.gameState = 'PAUSED';
    this.audio.stopMusic();
    this.dom.pauseModal.classList.add('active');
  }

  resumeGame() {
    if (this.gameState !== 'PAUSED') return;
    this.gameState = 'PLAYING';
    this.dom.pauseModal.classList.remove('active');
    this.audio.startMusic(this.level.speed / 400);
  }

  // Tratamento da morte do jogador
  killPlayer() {
    if (this.player.isDead) return;
    this.player.isDead = true;
    this.screenShakeTime = 0.25;

    this.audio.playDeath();
    this.particles.emitDeathExplosion(
      this.player.x,
      this.player.y,
      this.level.colors.primary,
      '#ff0077'
    );

    // Efeito visual de flash na tela
    this.dom.deathFlash.classList.add('trigger');
    setTimeout(() => {
      this.dom.deathFlash.classList.remove('trigger');
    }, 120);

    // Reinicia automaticamente após breve pausa de impacto
    this.respawnTimer = 0.38;
  }

  // Conclusão da fase
  completeLevel() {
    this.gameState = 'LEVEL_COMPLETE';
    this.audio.stopMusic();
    this.audio.playVictory();
    this.particles.emitCelebration(this.cameraX);

    // Salvar progresso
    if (!this.completedLevels.includes(this.level.id)) {
      this.completedLevels.push(this.level.id);
      localStorage.setItem('cyberpulse_completed', JSON.stringify(this.completedLevels));
    }

    if (this.level.id >= this.unlockedLevel && this.unlockedLevel < LEVELS.length) {
      this.unlockedLevel = this.level.id + 1;
      localStorage.setItem('cyberpulse_unlocked', this.unlockedLevel);
    }

    // Atualizar e exibir modal de conclusão
    this.dom.completeLevelTitle.textContent = `Fase ${this.level.id}: ${this.level.name}`;
    this.dom.completeAttempts.textContent = `#${this.attempts}`;

    const isLastLevel = this.currentLevelIndex === LEVELS.length - 1;
    this.dom.btnNextLevel.querySelector('.btn-text').textContent = isLastLevel ? 'VER VITÓRIA TOTAL 👑' : 'PRÓXIMA FASE ➔';

    this.dom.levelCompleteModal.classList.add('active');
  }

  // Tela de Vitória Total (Concluiu todas as 10 fases)
  showGrandVictory() {
    this.gameState = 'VICTORY';
    this.audio.stopMusic();
    this.audio.playVictory();

    // Calcular soma de tentativas
    let total = 0;
    for (const id in this.attemptsHistory) {
      total += this.attemptsHistory[id];
    }
    this.dom.totalAttemptsValue.textContent = Math.max(total, 10);
    this.dom.gameVictoryModal.classList.add('active');
  }

  updateHudInfo() {
    this.dom.hudLevelBadge.textContent = `FASE ${this.level.id}`;
    this.dom.hudLevelName.textContent = this.level.name;
    this.dom.hudAttempts.textContent = `#${this.attempts}`;
  }

  /* ==========================================================================
     8. FÍSICA, LÓGICA E ATUALIZAÇÃO DO MUNDO
     ========================================================================== */
  update(dt) {
    this.particles.update(dt);

    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= dt;
    }

    // Se está aguardando respawn após morte
    if (this.respawnTimer > 0) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.restartLevel();
      }
      return;
    }

    if (this.gameState !== 'PLAYING') return;

    // 1. Atualizar Jogador
    this.player.update(dt, this.level.speed, this.audio, this.particles, this.level);

    // 2. Câmera segue o jogador suavemente
    const targetCamX = this.player.x - 220;
    this.cameraX += (targetCamX - this.cameraX) * 0.15;

    // 3. Atualizar Barra de Progresso
    const progress = Math.min(100, Math.max(0, Math.floor((this.player.x / this.level.finishX) * 100)));
    this.dom.progressBarFill.style.width = `${progress}%`;
    this.dom.progressPercent.textContent = `${progress}%`;

    // 4. Checar Linha de Chegada
    if (this.player.x >= this.level.finishX) {
      this.completeLevel();
      return;
    }

    // 5. Portais de Gravidade
    for (const portal of this.level.gravityPortals) {
      if (
        this.player.x + this.player.w > portal.x &&
        this.player.x < portal.x + portal.w &&
        this.player.y + this.player.h > portal.y &&
        this.player.y < portal.y + portal.h
      ) {
        if (this.player.gravityDir !== portal.targetGravity) {
          this.player.setGravity(portal.targetGravity);
          this.audio.playPortal();
          this.particles.emitJumpDust(portal.x, portal.y + 60, '#ffffff');
        }
      }
    }

    // 6. Colisão com Plataformas
    let isCurrentlyOnPlatform = false;

    for (const plat of this.level.platforms) {
      // Ignora plataformas fora da tela
      if (plat.x + plat.w < this.cameraX || plat.x > this.cameraX + CONFIG.CANVAS_WIDTH) continue;

      const col = CollisionEngine.handlePlayerPlatform(this.player, plat, dt);
      if (col) {
        if (col.type === 'crash') {
          this.killPlayer();
          return;
        } else if (col.type === 'land') {
          this.player.land(col.surfaceY, this.audio, this.particles, this.level.colors.primary);
          isCurrentlyOnPlatform = true;
        }
      }
    }

    // 7. Colisão com o Chão Padrão ou Teto Padrão
    if (!isCurrentlyOnPlatform) {
      const inPit = CollisionEngine.isPlayerInPit(this.player, this.level.pits);

      if (this.player.gravityDir === 1) {
        // Gravidade Normal
        if (!inPit) {
          if (this.player.y + this.player.h >= CONFIG.GROUND_Y) {
            this.player.land(CONFIG.GROUND_Y, this.audio, this.particles, this.level.colors.primary);
          } else {
            this.player.grounded = false;
          }
        } else {
          // Dentro do buraco: jogador cai livremente
          this.player.grounded = false;
          if (this.player.y > CONFIG.CANVAS_HEIGHT + 50) {
            this.killPlayer();
            return;
          }
        }
      } else {
        // Gravidade Invertida (Teto)
        if (this.player.y <= CONFIG.CEILING_Y) {
          this.player.land(CONFIG.CEILING_Y, this.audio, this.particles, this.level.colors.primary);
        } else {
          this.player.grounded = false;
        }
      }
    }

    // 8. Colisão com Espinhos
    for (const spike of this.level.spikes) {
      if (spike.x + spike.w < this.cameraX || spike.x > this.cameraX + CONFIG.CANVAS_WIDTH) continue;

      if (CollisionEngine.checkPlayerSpike(this.player, spike)) {
        this.killPlayer();
        return;
      }
    }

    // 9. Obstáculos Móveis (Oscilam com seno do tempo)
    const timeSec = performance.now() / 1000;
    for (const hzd of this.level.movingHazards) {
      const curY = hzd.baseY + Math.sin(timeSec * hzd.speed) * hzd.amplitude;

      // Colisão de caixa com o obstáculo móvel
      if (
        this.player.x + this.player.w - 4 > hzd.x &&
        this.player.x + 4 < hzd.x + hzd.w &&
        this.player.y + this.player.h - 4 > curY &&
        this.player.y + 4 < curY + hzd.h
      ) {
        this.killPlayer();
        return;
      }
    }
  }

  /* ==========================================================================
     9. RENDERIZAÇÃO NO HTML5 CANVAS
     ========================================================================== */
  draw() {
    const ctx = this.ctx;
    const colors = this.level.colors;

    ctx.save();

    // Efeito de tremor de câmera (Screen Shake) ao morrer
    if (this.screenShakeTime > 0) {
      const shakeAmt = 8 * (this.screenShakeTime / 0.25);
      const shakeX = (Math.random() - 0.5) * shakeAmt;
      const shakeY = (Math.random() - 0.5) * shakeAmt;
      ctx.translate(shakeX, shakeY);
    }

    // Fundo Escuro com Gradiente Neon da Fase
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
    bgGrad.addColorStop(0, colors.bgGrad1);
    bgGrad.addColorStop(1, colors.bgGrad2);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Grade Futurista no Fundo com Efeito Parallax
    this.drawParallaxGrid(ctx, colors);

    ctx.save();
    // Deslocar o mundo 2D de acordo com a posição da câmera
    ctx.translate(-Math.floor(this.cameraX), 0);

    // Desenhar Dicas Visuais no Mundo
    this.drawWorldHints(ctx);

    // Desenhar Portais Gravitacionais
    this.drawPortals(ctx);

    // Desenhar Plataformas Sólidas
    this.drawPlatforms(ctx, colors);

    // Desenhar Chão e Teto
    this.drawFloorAndCeiling(ctx, colors);

    // Desenhar Espinhos
    this.drawSpikes(ctx, colors);

    // Desenhar Obstáculos Móveis
    this.drawMovingHazards(ctx);

    // Desenhar Linha de Chegada
    this.drawFinishLine(ctx, colors);

    // Desenhar Jogador
    if (!this.player.isDead) {
      this.player.draw(ctx, colors.primary, colors.accent);
    }

    // Desenhar Partículas
    this.particles.draw(ctx);

    ctx.restore();
    ctx.restore();
  }

  // Grade cibernética com linhas de fuga
  drawParallaxGrid(ctx, colors) {
    ctx.save();
    ctx.strokeStyle = colors.primary;
    ctx.globalAlpha = 0.08;
    ctx.lineWidth = 1;

    const gridSize = 60;
    const offsetX = -(this.cameraX * 0.3) % gridSize;

    for (let x = offsetX; x < CONFIG.CANVAS_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CONFIG.CANVAS_HEIGHT);
      ctx.stroke();
    }

    for (let y = 0; y < CONFIG.CANVAS_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CONFIG.CANVAS_WIDTH, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawWorldHints(ctx) {
    if (!this.level.hints) return;
    ctx.save();
    ctx.font = '700 15px Orbitron, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.textAlign = 'center';

    for (const h of this.level.hints) {
      if (h.x + 300 < this.cameraX || h.x - 300 > this.cameraX + CONFIG.CANVAS_WIDTH) continue;
      ctx.fillText(h.text, h.x, h.y);
    }
    ctx.restore();
  }

  drawFloorAndCeiling(ctx, colors) {
    ctx.save();

    // 1. Chão Principal
    const floorY = CONFIG.GROUND_Y;
    const floorH = CONFIG.CANVAS_HEIGHT - floorY;

    // Segmentos contínuos de chão exceto onde há buracos (pits)
    let curX = Math.max(0, this.cameraX - 100);
    const endX = this.cameraX + CONFIG.CANVAS_WIDTH + 100;

    // Lista ordenada de buracos visíveis
    const sortedPits = [...this.level.pits].sort((a, b) => a.startX - b.startX);

    while (curX < endX) {
      let nextPit = null;
      for (const p of sortedPits) {
        if (p.endX > curX) {
          nextPit = p;
          break;
        }
      }

      if (!nextPit || nextPit.startX >= endX) {
        // Sem mais buracos, desenha chão até o final da tela
        this.renderFloorSegment(ctx, curX, endX - curX, floorY, floorH, colors);
        break;
      } else {
        if (nextPit.startX > curX) {
          // Desenha chão antes do buraco
          this.renderFloorSegment(ctx, curX, nextPit.startX - curX, floorY, floorH, colors);
        }
        // Pula o buraco
        curX = nextPit.endX;
      }
    }

    // 2. Teto para Gravidade Invertida (se a fase tiver portais gravitacionais)
    if (this.level.gravityPortals.length > 0) {
      ctx.fillStyle = colors.floorBody;
      ctx.fillRect(this.cameraX - 50, 0, CONFIG.CANVAS_WIDTH + 100, CONFIG.CEILING_Y);

      ctx.strokeStyle = colors.floorTop;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 14;
      ctx.shadowColor = colors.floorTop;

      ctx.beginPath();
      ctx.moveTo(this.cameraX - 50, CONFIG.CEILING_Y);
      ctx.lineTo(this.cameraX + CONFIG.CANVAS_WIDTH + 50, CONFIG.CEILING_Y);
      ctx.stroke();
    }

    ctx.restore();
  }

  renderFloorSegment(ctx, x, w, y, h, colors) {
    if (w <= 0) return;

    // Corpo do chão
    ctx.fillStyle = colors.floorBody;
    ctx.fillRect(x, y, w, h);

    // Linha de borda superior brilhante
    ctx.strokeStyle = colors.floorTop;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 16;
    ctx.shadowColor = colors.floorTop;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();
  }

  drawPlatforms(ctx, colors) {
    ctx.save();
    for (const plat of this.level.platforms) {
      if (plat.x + plat.w < this.cameraX || plat.x > this.cameraX + CONFIG.CANVAS_WIDTH) continue;

      // Corpo da plataforma
      ctx.fillStyle = 'rgba(12, 17, 44, 0.95)';
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

      // Borda neon brilhante
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 14;
      ctx.shadowColor = colors.primary;
      ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

      // Linha de topo mais destacada
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(plat.x, plat.y);
      ctx.lineTo(plat.x + plat.w, plat.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawSpikes(ctx, colors) {
    ctx.save();
    for (const spike of this.level.spikes) {
      if (spike.x + spike.w < this.cameraX || spike.x > this.cameraX + CONFIG.CANVAS_WIDTH) continue;

      const sx = spike.x;
      const sw = spike.w;
      const sh = spike.h;
      const sy = spike.inverted ? CONFIG.CEILING_Y : CONFIG.GROUND_Y - sh;

      ctx.beginPath();
      if (spike.inverted) {
        // Apontando para baixo no teto
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + sw, sy);
        ctx.lineTo(sx + sw / 2, sy + sh);
      } else {
        // Apontando para cima no chão
        ctx.moveTo(sx, sy + sh);
        ctx.lineTo(sx + sw, sy + sh);
        ctx.lineTo(sx + sw / 2, sy);
      }
      ctx.closePath();

      // Preenchimento com gradiente de alerta neon
      const spikeGrad = ctx.createLinearGradient(sx, sy, sx, sy + sh);
      spikeGrad.addColorStop(0, '#ff0055');
      spikeGrad.addColorStop(1, '#ffaa00');

      ctx.fillStyle = spikeGrad;
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#ff0055';
      ctx.fill();

      // Borda clara
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
    ctx.restore();
  }

  drawMovingHazards(ctx) {
    const timeSec = performance.now() / 1000;
    ctx.save();

    for (const hzd of this.level.movingHazards) {
      const curY = hzd.baseY + Math.sin(timeSec * hzd.speed) * hzd.amplitude;
      if (hzd.x + hzd.w < this.cameraX || hzd.x > this.cameraX + CONFIG.CANVAS_WIDTH) continue;

      // Haste de conexão
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hzd.x + hzd.w / 2, hzd.baseY - hzd.amplitude);
      ctx.lineTo(hzd.x + hzd.w / 2, hzd.baseY + hzd.amplitude + hzd.h);
      ctx.stroke();

      // Bloco do perigo móvel
      ctx.fillStyle = hzd.color || '#ff0055';
      ctx.shadowBlur = 18;
      ctx.shadowColor = hzd.color || '#ff0055';
      ctx.fillRect(hzd.x, curY, hzd.w, hzd.h);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(hzd.x, curY, hzd.w, hzd.h);
    }
    ctx.restore();
  }

  drawPortals(ctx) {
    const timeSec = performance.now() / 1000;
    ctx.save();

    for (const portal of this.level.gravityPortals) {
      if (portal.x + portal.w < this.cameraX || portal.x > this.cameraX + CONFIG.CANVAS_WIDTH) continue;

      const portalColor = portal.targetGravity === -1 ? '#ff0077' : '#00f0ff';
      const pulse = Math.sin(timeSec * 6) * 4;

      ctx.shadowBlur = 24 + pulse;
      ctx.shadowColor = portalColor;
      ctx.fillStyle = portalColor;

      // Elipse / Portal estilizado
      ctx.beginPath();
      ctx.ellipse(
        portal.x + portal.w / 2,
        portal.y + portal.h / 2,
        (portal.w / 2) + pulse,
        portal.h / 2,
        0, 0, Math.PI * 2
      );
      ctx.fill();

      // Borda brilhante
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Ícone direcional no centro do portal (seta indicando gravidade)
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        portal.targetGravity === -1 ? '▲' : '▼',
        portal.x + portal.w / 2,
        portal.y + portal.h / 2
      );
    }
    ctx.restore();
  }

  drawFinishLine(ctx, colors) {
    const fx = this.level.finishX;
    if (fx + 40 < this.cameraX || fx > this.cameraX + CONFIG.CANVAS_WIDTH) return;

    ctx.save();
    // Portal/Mastro brilhante de chegada
    const finishGrad = ctx.createLinearGradient(fx, 0, fx + 30, 0);
    finishGrad.addColorStop(0, 'rgba(0, 255, 136, 0.2)');
    finishGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
    finishGrad.addColorStop(1, 'rgba(0, 255, 136, 0.2)');

    ctx.fillStyle = finishGrad;
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#00ff88';
    ctx.fillRect(fx, 0, 36, CONFIG.CANVAS_HEIGHT);

    // Texto vertical de FIM
    ctx.font = '900 28px Orbitron, sans-serif';
    ctx.fillStyle = '#060a1e';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', fx + 18, CONFIG.CANVAS_HEIGHT / 2);

    ctx.restore();
  }

  /* ==========================================================================
     10. GAME LOOP PRINCIPAL (Delta-Time Suave e Robusto)
     ========================================================================== */
  gameLoop(currentTime) {
    // Cálculo do delta-time em segundos
    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Limita delta-time máximo para evitar teletransporte caso usuário mude de aba
    if (dt > 0.05) dt = 0.05;

    this.update(dt);
    this.draw();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Inicializar o jogo após o carregamento completo do DOM
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameManager();
});
