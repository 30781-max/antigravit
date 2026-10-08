/**
 * Gerador e Validador das 10 Fases do Cyber Pulse
 * Cria uma progressão perfeitamente balanceada e matematicamente justa:
 * - Fase 1: Fácil / Tutorial dos controles / Poucos obstáculos
 * - Fase 2: Mais plataformas / Obstáculos mais frequentes / Desafios de precisão
 * - Fase 3: Maior velocidade / Combinação de obstáculos (serras, orbes, gravidade)
 * - Fase 4: Desafio avançado / Sequências rítmicas / Pouco tempo para reagir
 * - Fases 5-10: Desafios progressivos calibrados até o clímax final.
 */

const fs = require('fs');
const path = require('path');

const GROUND_Y = 570;
const CEILING_Y = 150;
const PLAYER_SIZE = 38;
const GRAVITY = 2150;
const JUMP_FORCE = 690;
const AIR_TIME = (2 * JUMP_FORCE) / GRAVITY; // ~0.642s
const MAX_JUMP_RISE = (JUMP_FORCE * JUMP_FORCE) / (2 * GRAVITY); // ~110.7px

const LEVELS = [
  // =========================================================================
  // FASE 1: NEON DAWN — FÁCIL / ENSINAR CONTROLES / POUCOS OBSTÁCULOS
  // =========================================================================
  {
    id: 1,
    name: "Neon Dawn",
    difficultyName: "Fácil",
    difficultyClass: "diff-facil",
    speed: 380,
    finishX: 4800,
    colors: {
      primary: "#00f0ff",
      accent: "#0077ff",
      bgGrad1: "#050a1a",
      bgGrad2: "#0c1b3a",
      floorTop: "#00f0ff",
      floorBody: "#060b20"
    },
    hints: [
      { x: 400, y: 460, text: "BEM-VINDO! [ESPAÇO] OU [CLIQUE] PARA PULAR" },
      { x: 1200, y: 460, text: "PULO SIMPLES: SALTE SOBRE O ESPINHO" },
      { x: 2150, y: 450, text: "SUBA NA PLATAFORMA PARA AVANÇAR" },
      { x: 3100, y: 450, text: "COLETE A MOEDA SECRETA ★" },
      { x: 4100, y: 460, text: "RETA FINAL — QUASE LÁ!" }
    ],
    secretCoins: [
      { id: 0, x: 1700, y: 460 },
      { id: 1, x: 3260, y: 430 },
      { id: 2, x: 4250, y: 460 }
    ],
    jumpOrbs: [],
    jumpPads: [],
    speedPortals: [],
    gravityPortals: [],
    spikes: [
      { x: 950, w: 36, h: 38 },
      { x: 1450, w: 36, h: 38 },
      { x: 2000, w: 36, h: 38 },
      { x: 2850, w: 36, h: 38 },
      { x: 3750, w: 36, h: 38 },
      { x: 4450, w: 36, h: 38 }
    ],
    platforms: [
      // Plataforma baixa e ampla, muito fácil de subir (55px do chão)
      { x: 2280, y: 515, w: 260, h: 22, isBlock: false },
      // Segunda plataforma com moeda
      { x: 3150, y: 490, w: 280, h: 22, isBlock: false }
    ],
    pits: [],
    sawblades: [],
    movingHazards: []
  },

  // =========================================================================
  // FASE 2: CYBER CHASM — MAIS PLATAFORMAS / FREQUÊNCIA / PEQUENOS DESAFIOS
  // =========================================================================
  {
    id: 2,
    name: "Cyber Chasm",
    difficultyName: "Iniciante",
    difficultyClass: "diff-iniciante",
    speed: 440,
    finishX: 6200,
    colors: {
      primary: "#00ff88",
      accent: "#00aa55",
      bgGrad1: "#03140a",
      bgGrad2: "#072416",
      floorTop: "#00ff88",
      floorBody: "#03180c"
    },
    hints: [
      { x: 400, y: 460, text: "FASE 2: PARKOUR DE PLATAFORMAS" },
      { x: 1600, y: 460, text: "ESPINHOS DUPLOS: SALTO NO MOMENTO CERTO" },
      { x: 2800, y: 460, text: "TRAMPOLIM AMARELO: SALTO GIGANTE!" },
      { x: 4200, y: 450, text: "DEGRAUS DE PLATAFORMAS" }
    ],
    secretCoins: [
      { id: 0, x: 2350, y: 430 },
      { id: 1, x: 3300, y: 340 },
      { id: 2, x: 5500, y: 460 }
    ],
    jumpOrbs: [],
    jumpPads: [
      // Trampolim que arremessa por cima de espinhos para pegar a moeda 1
      { x: 2950, y: 558, w: 48, h: 12, bounceForce: 880 }
    ],
    speedPortals: [],
    gravityPortals: [],
    spikes: [
      { x: 800, w: 36, h: 38 },
      { x: 1250, w: 36, h: 38 },
      // Espinho duplo
      { x: 1750, w: 36, h: 38 },
      { x: 1786, w: 36, h: 38 },
      { x: 2600, w: 36, h: 38 },
      // Espinhos sob a área do trampolim
      { x: 3200, w: 36, h: 38 },
      { x: 3236, w: 36, h: 38 },
      { x: 4000, w: 36, h: 38 },
      { x: 4650, w: 36, h: 38 },
      { x: 5300, w: 36, h: 38 },
      { x: 5336, w: 36, h: 38 },
      { x: 5850, w: 36, h: 38 }
    ],
    platforms: [
      // Plataforma 1
      { x: 2200, y: 515, w: 220, h: 22, isBlock: false },
      // Plataforma de travessia sobre abismo
      { x: 3550, y: 505, w: 280, h: 22, isBlock: false },
      // Degraus suaves de plataformas
      { x: 4350, y: 515, w: 200, h: 22, isBlock: false },
      { x: 4600, y: 470, w: 220, h: 22, isBlock: false },
      // Bloco final
      { x: 5650, y: 528, w: 42, h: 42, isBlock: true }
    ],
    pits: [
      // Abismo com plataforma segura no centro
      { startX: 3500, endX: 3900 }
    ],
    sawblades: [],
    movingHazards: []
  },

  // =========================================================================
  // FASE 3: KINETIC WAVE — MAIOR VELOCIDADE / COMBINAÇÕES / SERRAS & GRAVIDADE
  // =========================================================================
  {
    id: 3,
    name: "Kinetic Wave",
    difficultyName: "Intermediária",
    difficultyClass: "diff-intermediaria",
    speed: 500,
    finishX: 7600,
    colors: {
      primary: "#ff0077",
      accent: "#ff00bb",
      bgGrad1: "#14030d",
      bgGrad2: "#26061a",
      floorTop: "#ff0077",
      floorBody: "#1a0311"
    },
    hints: [
      { x: 400, y: 460, text: "FASE 3: VELOCIDADE ACELERADA E SERRAS NEON" },
      { x: 1900, y: 460, text: "NOVO: SERRA GIRATÓRIA — CALCULE O TEMPO!" },
      { x: 3100, y: 440, text: "JUMP ORB: CLIQUE NO AR!" },
      { x: 4700, y: 450, text: "PORTAL VERTICAL: GRAVIDADE INVERTIDA (TETO)!" },
      { x: 6200, y: 240, text: "PORTAL DE RETORNO: VOLTE AO CHÃO!" }
    ],
    secretCoins: [
      { id: 0, x: 2500, y: 420 },
      { id: 1, x: 3600, y: 360 },
      { id: 2, x: 6750, y: 460 }
    ],
    jumpOrbs: [
      // Jump orb aéreo sobre abismo e espinhos
      { x: 3500, y: 440, radius: 22, jumpForce: 750, color: "#ffea00" }
    ],
    jumpPads: [],
    speedPortals: [],
    gravityPortals: [
      // Portal para o teto
      { x: 4950, w: 52, targetGravity: -1 },
      // Portal de volta para o chão
      { x: 6400, w: 52, targetGravity: 1 }
    ],
    spikes: [
      { x: 900, w: 36, h: 38 },
      { x: 1400, w: 36, h: 38 },
      { x: 1436, w: 36, h: 38 },
      { x: 2300, w: 36, h: 38 },
      { x: 2850, w: 36, h: 38 },
      // Espinhos antes e depois do abismo com orb
      { x: 3250, w: 36, h: 38 },
      { x: 3850, w: 36, h: 38 },
      { x: 4200, w: 36, h: 38 },
      { x: 4600, w: 36, h: 38 },
      // Espinhos no teto durante gravidade invertida
      { x: 5350, w: 36, h: 38, inverted: true },
      { x: 5850, w: 36, h: 38, inverted: true },
      // Espinhos no retorno ao chão
      { x: 6900, w: 36, h: 38 },
      { x: 7200, w: 36, h: 38 }
    ],
    platforms: [
      { x: 2400, y: 510, w: 220, h: 22, isBlock: false },
      { x: 4100, y: 505, w: 240, h: 22, isBlock: false },
      // Plataforma no teto (gravidade invertida)
      { x: 5500, y: 150, w: 240, h: 35, isBlock: true },
      { x: 6650, y: 515, w: 200, h: 22, isBlock: false }
    ],
    pits: [
      { startX: 3400, endX: 3700 }
    ],
    sawblades: [
      // Serras giratórias com dentes neon
      { x: 2050, y: 520, radius: 24, spinSpeed: 6 },
      { x: 4450, y: 515, radius: 24, spinSpeed: -6 },
      { x: 6050, y: 200, radius: 24, spinSpeed: 6 }
    ],
    movingHazards: []
  },

  // =========================================================================
  // FASE 4: GRAVITY NEXUS — DESAFIO AVANÇADO / SEQUÊNCIAS RÍTMICAS
  // =========================================================================
  {
    id: 4,
    name: "Gravity Nexus",
    difficultyName: "Avançado",
    difficultyClass: "diff-dificil",
    speed: 560,
    finishX: 9200,
    colors: {
      primary: "#9d00ff",
      accent: "#bf00ff",
      bgGrad1: "#0f021f",
      bgGrad2: "#210444",
      floorTop: "#9d00ff",
      floorBody: "#130326"
    },
    hints: [
      { x: 400, y: 460, text: "FASE 4: DESAFIO AVANÇADO — FOCO TOTAL!" },
      { x: 2000, y: 460, text: "CADÊNCIA RÍTMICA: ESPINHOS E SERRAS" },
      { x: 3800, y: 440, text: "SPEED BOOST ATIVADO: 1.15x!" },
      { x: 5600, y: 450, text: "INVERSÃO RÁPIDA: CHÃO E TETO" },
      { x: 7700, y: 460, text: "SEQUÊNCIA FINAL — MANTENHA O RITMO!" }
    ],
    secretCoins: [
      { id: 0, x: 2600, y: 420 },
      { id: 1, x: 5000, y: 350 },
      { id: 2, x: 8200, y: 430 }
    ],
    jumpOrbs: [
      { x: 4900, y: 430, radius: 22, jumpForce: 750, color: "#ffea00" },
      { x: 7300, y: 430, radius: 22, jumpForce: 750, color: "#ffea00" }
    ],
    jumpPads: [
      { x: 6850, y: 558, w: 48, h: 12, bounceForce: 920 }
    ],
    speedPortals: [
      { x: 4000, w: 52, speedMultiplier: 1.15 }
    ],
    gravityPortals: [
      { x: 5800, w: 52, targetGravity: -1 },
      { x: 7000, w: 52, targetGravity: 1 }
    ],
    spikes: [
      { x: 850, w: 36, h: 38 },
      { x: 1300, w: 36, h: 38 },
      { x: 1336, w: 36, h: 38 },
      { x: 1850, w: 36, h: 38 },
      { x: 2350, w: 36, h: 38 },
      { x: 2386, w: 36, h: 38 },
      { x: 3100, w: 36, h: 38 },
      { x: 3550, w: 36, h: 38 },
      { x: 3586, w: 36, h: 38 },
      { x: 4400, w: 36, h: 38 },
      { x: 4650, w: 36, h: 38 },
      // Espinhos de teto na gravidade invertida
      { x: 6200, w: 36, h: 38, inverted: true },
      { x: 6236, w: 36, h: 38, inverted: true },
      { x: 6650, w: 36, h: 38, inverted: true },
      // Espinhos finais no chão
      { x: 7550, w: 36, h: 38 },
      { x: 8000, w: 36, h: 38 },
      { x: 8036, w: 36, h: 38 },
      { x: 8650, w: 36, h: 38 }
    ],
    platforms: [
      { x: 2500, y: 510, w: 200, h: 22, isBlock: false },
      { x: 3200, y: 475, w: 220, h: 22, isBlock: false },
      { x: 5200, y: 505, w: 240, h: 22, isBlock: false },
      // Plataforma no teto
      { x: 6350, y: 150, w: 240, h: 35, isBlock: true },
      { x: 8100, y: 510, w: 200, h: 22, isBlock: false }
    ],
    pits: [
      { startX: 4750, endX: 5100 }
    ],
    sawblades: [
      { x: 1650, y: 520, radius: 24, spinSpeed: 7 },
      { x: 2850, y: 515, radius: 24, spinSpeed: -7 },
      { x: 5500, y: 515, radius: 24, spinSpeed: 7 },
      { x: 6500, y: 210, radius: 24, spinSpeed: -7 },
      { x: 7800, y: 515, radius: 24, spinSpeed: 7 }
    ],
    movingHazards: [
      { x: 3750, baseY: 420, amplitude: 50, speed: 4, w: 36, h: 36, color: "#bf00ff" }
    ]
  },

  // =========================================================================
  // FASE 5: OVERCLOCK SPRINT — VELOCIDADE 620 / PARKOUR INTENSO
  // =========================================================================
  {
    id: 5,
    name: "Overclock Sprint",
    difficultyName: "Expert",
    difficultyClass: "diff-avancada",
    speed: 620,
    finishX: 10500,
    colors: {
      primary: "#ffaa00",
      accent: "#ff5500",
      bgGrad1: "#180a02",
      bgGrad2: "#301404",
      floorTop: "#ffaa00",
      floorBody: "#1a0b02"
    },
    hints: [
      { x: 400, y: 460, text: "FASE 5: SOBRECARGA DE VELOCIDADE (620 PX/S)" },
      { x: 4500, y: 450, text: "CHAIN DE SALTOS EM SERRAS E ORBES" }
    ],
    secretCoins: [
      { id: 0, x: 2800, y: 420 },
      { id: 1, x: 6100, y: 360 },
      { id: 2, x: 9200, y: 430 }
    ],
    jumpOrbs: [
      { x: 4200, y: 440, radius: 22, jumpForce: 760, color: "#ffea00" },
      { x: 7200, y: 440, radius: 22, jumpForce: 760, color: "#ffea00" }
    ],
    jumpPads: [
      { x: 5750, y: 558, w: 48, h: 12, bounceForce: 940 }
    ],
    speedPortals: [
      { x: 3500, w: 52, speedMultiplier: 1.15 }
    ],
    gravityPortals: [],
    spikes: [
      { x: 900, w: 36, h: 38 },
      { x: 1400, w: 36, h: 38 },
      { x: 1436, w: 36, h: 38 },
      { x: 2000, w: 36, h: 38 },
      { x: 2500, w: 36, h: 38 },
      { x: 2536, w: 36, h: 38 },
      { x: 3200, w: 36, h: 38 },
      { x: 3800, w: 36, h: 38 },
      { x: 4800, w: 36, h: 38 },
      { x: 5300, w: 36, h: 38 },
      { x: 5336, w: 36, h: 38 },
      { x: 6400, w: 36, h: 38 },
      { x: 6900, w: 36, h: 38 },
      { x: 7700, w: 36, h: 38 },
      { x: 8300, w: 36, h: 38 },
      { x: 8800, w: 36, h: 38 },
      { x: 9700, w: 36, h: 38 }
    ],
    platforms: [
      { x: 2700, y: 510, w: 220, h: 22, isBlock: false },
      { x: 4500, y: 505, w: 240, h: 22, isBlock: false },
      { x: 6000, y: 510, w: 220, h: 22, isBlock: false },
      { x: 7400, y: 500, w: 260, h: 22, isBlock: false },
      { x: 9100, y: 510, w: 220, h: 22, isBlock: false }
    ],
    pits: [
      { startX: 4100, endX: 4450 }
    ],
    sawblades: [
      { x: 1750, y: 520, radius: 24, spinSpeed: 8 },
      { x: 3600, y: 515, radius: 24, spinSpeed: -8 },
      { x: 6650, y: 520, radius: 24, spinSpeed: 8 },
      { x: 8550, y: 515, radius: 24, spinSpeed: -8 }
    ],
    movingHazards: [
      { x: 5050, baseY: 430, amplitude: 55, speed: 4.5, w: 36, h: 36, color: "#ffaa00" }
    ]
  },

  // =========================================================================
  // FASE 6: DUAL FLUX — VELOCIDADE 680 / TRANSIÇÕES GRAVITACIONAIS
  // =========================================================================
  {
    id: 6,
    name: "Dual Flux",
    difficultyName: "Mestre",
    difficultyClass: "diff-mestre",
    speed: 680,
    finishX: 11500,
    colors: {
      primary: "#00f0ff",
      accent: "#ff0077",
      bgGrad1: "#040c1c",
      bgGrad2: "#190520",
      floorTop: "#00f0ff",
      floorBody: "#040f22"
    },
    hints: [
      { x: 400, y: 460, text: "FASE 6: FLUXO DUPLO — DOMINE AS DUAS GRAVIDADES" }
    ],
    secretCoins: [
      { id: 0, x: 2900, y: 420 },
      { id: 1, x: 6300, y: 220 },
      { id: 2, x: 10200, y: 430 }
    ],
    jumpOrbs: [
      { x: 4500, y: 440, radius: 22, jumpForce: 760, color: "#ffea00" },
      { x: 8800, y: 440, radius: 22, jumpForce: 760, color: "#ffea00" }
    ],
    jumpPads: [
      { x: 7800, y: 558, w: 48, h: 12, bounceForce: 950 }
    ],
    speedPortals: [
      { x: 3200, w: 52, speedMultiplier: 1.12 }
    ],
    gravityPortals: [
      { x: 5200, w: 52, targetGravity: -1 },
      { x: 7200, w: 52, targetGravity: 1 }
    ],
    spikes: [
      { x: 950, w: 36, h: 38 },
      { x: 1500, w: 36, h: 38 },
      { x: 1536, w: 36, h: 38 },
      { x: 2200, w: 36, h: 38 },
      { x: 2700, w: 36, h: 38 },
      { x: 2736, w: 36, h: 38 },
      { x: 3600, w: 36, h: 38 },
      { x: 4100, w: 36, h: 38 },
      // Teto
      { x: 5700, w: 36, h: 38, inverted: true },
      { x: 5736, w: 36, h: 38, inverted: true },
      { x: 6600, w: 36, h: 38, inverted: true },
      // Retorno
      { x: 7500, w: 36, h: 38 },
      { x: 8300, w: 36, h: 38 },
      { x: 8336, w: 36, h: 38 },
      { x: 9300, w: 36, h: 38 },
      { x: 9800, w: 36, h: 38 },
      { x: 10600, w: 36, h: 38 }
    ],
    platforms: [
      { x: 2800, y: 510, w: 220, h: 22, isBlock: false },
      { x: 4700, y: 505, w: 240, h: 22, isBlock: false },
      { x: 5900, y: 150, w: 260, h: 35, isBlock: true },
      { x: 9000, y: 505, w: 240, h: 22, isBlock: false },
      { x: 10100, y: 510, w: 220, h: 22, isBlock: false }
    ],
    pits: [
      { startX: 4400, endX: 4700 }
    ],
    sawblades: [
      { x: 1850, y: 520, radius: 24, spinSpeed: 8 },
      { x: 3850, y: 515, radius: 24, spinSpeed: -8 },
      { x: 6250, y: 200, radius: 24, spinSpeed: 8 },
      { x: 8550, y: 520, radius: 24, spinSpeed: -8 }
    ],
    movingHazards: []
  },

  // =========================================================================
  // FASE 7: SKYLINE CORRIDOR — VELOCIDADE 740 / PARKOUR AÉREO
  // =========================================================================
  {
    id: 7,
    name: "Skyline Corridor",
    difficultyName: "Hard Demon",
    difficultyClass: "diff-mestre",
    speed: 740,
    finishX: 12500,
    colors: {
      primary: "#00ffff",
      accent: "#ffff00",
      bgGrad1: "#021218",
      bgGrad2: "#072430",
      floorTop: "#00ffff",
      floorBody: "#031520"
    },
    hints: [
      { x: 400, y: 460, text: "FASE 7: CORREDOR AÉREO — PRECISÃO EM CADA TOQUE" }
    ],
    secretCoins: [
      { id: 0, x: 3100, y: 420 },
      { id: 1, x: 7200, y: 350 },
      { id: 2, x: 11000, y: 430 }
    ],
    jumpOrbs: [
      { x: 5100, y: 440, radius: 22, jumpForce: 770, color: "#ffea00" },
      { x: 9200, y: 440, radius: 22, jumpForce: 770, color: "#ffea00" }
    ],
    jumpPads: [
      { x: 6800, y: 558, w: 48, h: 12, bounceForce: 960 }
    ],
    speedPortals: [
      { x: 3800, w: 52, speedMultiplier: 1.12 }
    ],
    gravityPortals: [],
    spikes: [
      { x: 1000, w: 36, h: 38 },
      { x: 1600, w: 36, h: 38 },
      { x: 1636, w: 36, h: 38 },
      { x: 2300, w: 36, h: 38 },
      { x: 2800, w: 36, h: 38 },
      { x: 2836, w: 36, h: 38 },
      { x: 3500, w: 36, h: 38 },
      { x: 4300, w: 36, h: 38 },
      { x: 4700, w: 36, h: 38 },
      { x: 5700, w: 36, h: 38 },
      { x: 6200, w: 36, h: 38 },
      { x: 6236, w: 36, h: 38 },
      { x: 7500, w: 36, h: 38 },
      { x: 8200, w: 36, h: 38 },
      { x: 8800, w: 36, h: 38 },
      { x: 9900, w: 36, h: 38 },
      { x: 10500, w: 36, h: 38 },
      { x: 11600, w: 36, h: 38 }
    ],
    platforms: [
      { x: 3000, y: 510, w: 240, h: 22, isBlock: false },
      { x: 5300, y: 500, w: 260, h: 22, isBlock: false },
      { x: 7000, y: 480, w: 260, h: 22, isBlock: false },
      { x: 9400, y: 505, w: 260, h: 22, isBlock: false },
      { x: 10900, y: 510, w: 240, h: 22, isBlock: false }
    ],
    pits: [
      { startX: 5000, endX: 5300 }
    ],
    sawblades: [
      { x: 1950, y: 520, radius: 24, spinSpeed: 8 },
      { x: 4050, y: 515, radius: 24, spinSpeed: -8 },
      { x: 7900, y: 520, radius: 24, spinSpeed: 8 },
      { x: 10200, y: 515, radius: 24, spinSpeed: -8 }
    ],
    movingHazards: [
      { x: 8500, baseY: 420, amplitude: 50, speed: 5, w: 36, h: 36, color: "#00ffff" }
    ]
  },

  // =========================================================================
  // FASE 8: PLASMA GAUNTLET — VELOCIDADE 800 / DESAFIO DEMON
  // =========================================================================
  {
    id: 8,
    name: "Plasma Gauntlet",
    difficultyName: "Insane Demon",
    difficultyClass: "diff-extrema",
    speed: 800,
    finishX: 13500,
    colors: {
      primary: "#ff0055",
      accent: "#ff5500",
      bgGrad1: "#1a0208",
      bgGrad2: "#350512",
      floorTop: "#ff0055",
      floorBody: "#1c0309"
    },
    hints: [
      { x: 400, y: 460, text: "FASE 8: MANOPLA DE PLASMA — VELOCIDADE 800" }
    ],
    secretCoins: [
      { id: 0, x: 3300, y: 420 },
      { id: 1, x: 7800, y: 220 },
      { id: 2, x: 12000, y: 430 }
    ],
    jumpOrbs: [
      { x: 5500, y: 440, radius: 22, jumpForce: 780, color: "#ffea00" },
      { x: 10200, y: 440, radius: 22, jumpForce: 780, color: "#ffea00" }
    ],
    jumpPads: [
      { x: 8800, y: 558, w: 48, h: 12, bounceForce: 970 }
    ],
    speedPortals: [
      { x: 4200, w: 52, speedMultiplier: 1.1 }
    ],
    gravityPortals: [
      { x: 6700, w: 52, targetGravity: -1 },
      { x: 8300, w: 52, targetGravity: 1 }
    ],
    spikes: [
      { x: 1100, w: 36, h: 38 },
      { x: 1700, w: 36, h: 38 },
      { x: 1736, w: 36, h: 38 },
      { x: 2500, w: 36, h: 38 },
      { x: 3000, w: 36, h: 38 },
      { x: 3036, w: 36, h: 38 },
      { x: 3800, w: 36, h: 38 },
      { x: 4700, w: 36, h: 38 },
      { x: 5100, w: 36, h: 38 },
      // Teto
      { x: 7200, w: 36, h: 38, inverted: true },
      { x: 7236, w: 36, h: 38, inverted: true },
      { x: 8000, w: 36, h: 38, inverted: true },
      // Chão
      { x: 8600, w: 36, h: 38 },
      { x: 9500, w: 36, h: 38 },
      { x: 10800, w: 36, h: 38 },
      { x: 11500, w: 36, h: 38 },
      { x: 12600, w: 36, h: 38 }
    ],
    platforms: [
      { x: 3200, y: 510, w: 240, h: 22, isBlock: false },
      { x: 5700, y: 505, w: 260, h: 22, isBlock: false },
      { x: 7400, y: 150, w: 260, h: 35, isBlock: true },
      { x: 10400, y: 505, w: 260, h: 22, isBlock: false },
      { x: 11900, y: 510, w: 240, h: 22, isBlock: false }
    ],
    pits: [
      { startX: 5400, endX: 5700 }
    ],
    sawblades: [
      { x: 2100, y: 520, radius: 24, spinSpeed: 9 },
      { x: 4400, y: 515, radius: 24, spinSpeed: -9 },
      { x: 7650, y: 200, radius: 24, spinSpeed: 9 },
      { x: 9900, y: 520, radius: 24, spinSpeed: -9 }
    ],
    movingHazards: []
  },

  // =========================================================================
  // FASE 9: CHRONO VORTEX — VELOCIDADE 860 / EXTREME DEMON
  // =========================================================================
  {
    id: 9,
    name: "Chrono Vortex",
    difficultyName: "Extreme Demon",
    difficultyClass: "diff-extrema",
    speed: 860,
    finishX: 14500,
    colors: {
      primary: "#b800ff",
      accent: "#00e1ff",
      bgGrad1: "#12021c",
      bgGrad2: "#260438",
      floorTop: "#b800ff",
      floorBody: "#150322"
    },
    hints: [
      { x: 400, y: 460, text: "FASE 9: VÓRTICE TEMPORAL — REFLEXOS RELÂMPAGO" }
    ],
    secretCoins: [
      { id: 0, x: 3500, y: 420 },
      { id: 1, x: 8500, y: 350 },
      { id: 2, x: 13000, y: 430 }
    ],
    jumpOrbs: [
      { x: 6000, y: 440, radius: 22, jumpForce: 780, color: "#ffea00" },
      { x: 11000, y: 440, radius: 22, jumpForce: 780, color: "#ffea00" }
    ],
    jumpPads: [
      { x: 9600, y: 558, w: 48, h: 12, bounceForce: 980 }
    ],
    speedPortals: [
      { x: 4500, w: 52, speedMultiplier: 1.1 }
    ],
    gravityPortals: [
      { x: 7200, w: 52, targetGravity: -1 },
      { x: 9000, w: 52, targetGravity: 1 }
    ],
    spikes: [
      { x: 1200, w: 36, h: 38 },
      { x: 1900, w: 36, h: 38 },
      { x: 1936, w: 36, h: 38 },
      { x: 2700, w: 36, h: 38 },
      { x: 3200, w: 36, h: 38 },
      { x: 3236, w: 36, h: 38 },
      { x: 4100, w: 36, h: 38 },
      { x: 5100, w: 36, h: 38 },
      { x: 5600, w: 36, h: 38 },
      // Teto
      { x: 7700, w: 36, h: 38, inverted: true },
      { x: 7736, w: 36, h: 38, inverted: true },
      { x: 8600, w: 36, h: 38, inverted: true },
      // Chão
      { x: 9300, w: 36, h: 38 },
      { x: 10300, w: 36, h: 38 },
      { x: 11700, w: 36, h: 38 },
      { x: 12400, w: 36, h: 38 },
      { x: 13600, w: 36, h: 38 }
    ],
    platforms: [
      { x: 3400, y: 510, w: 260, h: 22, isBlock: false },
      { x: 6200, y: 505, w: 260, h: 22, isBlock: false },
      { x: 7900, y: 150, w: 280, h: 35, isBlock: true },
      { x: 11200, y: 505, w: 260, h: 22, isBlock: false },
      { x: 12900, y: 510, w: 260, h: 22, isBlock: false }
    ],
    pits: [
      { startX: 5900, endX: 6200 }
    ],
    sawblades: [
      { x: 2300, y: 520, radius: 24, spinSpeed: 9 },
      { x: 4700, y: 515, radius: 24, spinSpeed: -9 },
      { x: 8200, y: 200, radius: 24, spinSpeed: 9 },
      { x: 10600, y: 520, radius: 24, spinSpeed: -9 }
    ],
    movingHazards: [
      { x: 9900, baseY: 420, amplitude: 50, speed: 5.5, w: 36, h: 36, color: "#b800ff" }
    ]
  },

  // =========================================================================
  // FASE 10: SINGULARITY OVERDRIVE — VELOCIDADE 920 / GRANDMASTER FINAL
  // =========================================================================
  {
    id: 10,
    name: "Singularity Overdrive",
    difficultyName: "Grandmaster",
    difficultyClass: "diff-suprema",
    speed: 920,
    finishX: 16000,
    colors: {
      primary: "#ff003c",
      accent: "#00f0ff",
      bgGrad1: "#1a0007",
      bgGrad2: "#330010",
      floorTop: "#ff003c",
      floorBody: "#1a0008"
    },
    hints: [
      { x: 400, y: 460, text: "FASE FINAL: SOBRECARGA DA SINGULARIDADE" },
      { x: 15200, y: 460, text: "O CLÍMAX SUPREMO! VOCÊ É UMA LENDA!" }
    ],
    secretCoins: [
      { id: 0, x: 3800, y: 420 },
      { id: 1, x: 9200, y: 220 },
      { id: 2, x: 14500, y: 430 }
    ],
    jumpOrbs: [
      { x: 6500, y: 440, radius: 22, jumpForce: 780, color: "#ffea00" },
      { x: 12200, y: 440, radius: 22, jumpForce: 780, color: "#ffea00" }
    ],
    jumpPads: [
      { x: 10500, y: 558, w: 48, h: 12, bounceForce: 990 }
    ],
    speedPortals: [
      { x: 4800, w: 52, speedMultiplier: 1.1 }
    ],
    gravityPortals: [
      { x: 8000, w: 52, targetGravity: -1 },
      { x: 10000, w: 52, targetGravity: 1 }
    ],
    spikes: [
      { x: 1300, w: 36, h: 38 },
      { x: 2000, w: 36, h: 38 },
      { x: 2036, w: 36, h: 38 },
      { x: 2900, w: 36, h: 38 },
      { x: 3500, w: 36, h: 38 },
      { x: 3536, w: 36, h: 38 },
      { x: 4400, w: 36, h: 38 },
      { x: 5500, w: 36, h: 38 },
      { x: 6100, w: 36, h: 38 },
      // Teto
      { x: 8600, w: 36, h: 38, inverted: true },
      { x: 8636, w: 36, h: 38, inverted: true },
      { x: 9600, w: 36, h: 38, inverted: true },
      // Chão
      { x: 10300, w: 36, h: 38 },
      { x: 11400, w: 36, h: 38 },
      { x: 12900, w: 36, h: 38 },
      { x: 13800, w: 36, h: 38 },
      { x: 15000, w: 36, h: 38 }
    ],
    platforms: [
      { x: 3700, y: 510, w: 260, h: 22, isBlock: false },
      { x: 6700, y: 505, w: 260, h: 22, isBlock: false },
      { x: 8800, y: 150, w: 300, h: 35, isBlock: true },
      { x: 12400, y: 505, w: 260, h: 22, isBlock: false },
      { x: 14400, y: 510, w: 260, h: 22, isBlock: false }
    ],
    pits: [
      { startX: 6400, endX: 6700 }
    ],
    sawblades: [
      { x: 2500, y: 520, radius: 24, spinSpeed: 10 },
      { x: 5100, y: 515, radius: 24, spinSpeed: -10 },
      { x: 9200, y: 200, radius: 24, spinSpeed: 10 },
      { x: 11800, y: 520, radius: 24, spinSpeed: -10 }
    ],
    movingHazards: [
      { x: 10900, baseY: 420, amplitude: 50, speed: 6, w: 36, h: 36, color: "#ff003c" }
    ]
  }
];

// Validação matemática de cada fase
console.log("Validação das 10 Fases:");
let hasErrors = false;
LEVELS.forEach(lvl => {
  const jumpDist = lvl.speed * AIR_TIME;
  console.log(`Fase ${lvl.id}: ${lvl.name} (Velocidade: ${lvl.speed} px/s, Salto: ${jumpDist.toFixed(1)}px, Extensão: ${lvl.finishX}px)`);

  // Checar abismos
  lvl.pits.forEach(pit => {
    const w = pit.endX - pit.startX;
    const plats = lvl.platforms.filter(p => (p.x + p.w >= pit.startX && p.x <= pit.endX));
    if (w > jumpDist && plats.length === 0) {
      console.error(`  ERRO: Abismo em x:${pit.startX} (largura ${w}px) excede alcance de salto (${jumpDist.toFixed(1)}px)!`);
      hasErrors = true;
    }
  });

  // Checar plataformas do chão
  lvl.platforms.forEach(p => {
    const diff = GROUND_Y - p.y;
    if (diff > MAX_JUMP_RISE + 10 && !p.isBlock && p.y > CEILING_Y + 50) {
      console.error(`  AVISO: Plataforma em x:${p.x} tem altura ${diff}px do chão (max salto: ${MAX_JUMP_RISE.toFixed(1)}px)`);
    }
  });
});

if (!hasErrors) {
  const targetPath = path.join(__dirname, '../js/levels.js');
  const code = `/**\n * ==============================================================================\n * CYBER PULSE — js/levels.js\n * Design Balanceado das 10 Fases Neon (Progressão Suave e Justa)\n * ==============================================================================\n */\n\n'use strict';\n\nconst LEVELS = ${JSON.stringify(LEVELS, null, 2)};\n`;
  fs.writeFileSync(targetPath, code, 'utf8');
  console.log("SUCESSO: js/levels.js atualizado com sucesso!");
} else {
  console.error("FALHA: Erros de validação encontrados.");
}
