# Script para construir e atualizar js/levels.js com 3 partes, Jump Orbs, Moedas Secretas e Speed Portals
$levelsCode = @'
/**
 * ==============================================================================
 * CYBER PULSE — js/levels.js
 * Design Completo das 10 Fases Neon — 3 Partes, Jump Orbs, Moedas & Speed Portals
 * ==============================================================================
 * 
 * DIRETRIZES DE DESIGN RIGOROSAMENTE APLICADAS:
 * 1. ESTRUTURA EM 3 PARTES:
 *    - Parte 1 (0% a 35%): Tutorial e padrões básicos com espaçamento generoso.
 *    - Parte 2 (35% a 70%): Dificuldade média, introdução ao Jump Orb e parkour de plataformas.
 *    - Parte 3 (70% a 100%): Rápida e desafiadora (Speed Portal, Jump Pad e sequências rítmicas).
 * 2. NOVOS OBSTÁCULOS & MECÂNICAS GEOMETRY DASH:
 *    - Jump Orbs amarelos flutuantes (salto no ar com shockwave ao apertar pular perto).
 *    - Jump Pads amarelos (trampolins de salto alto).
 *    - 3 Moedas Secretas colecionáveis por fase em rotas desafiadoras opcionais.
 *    - Speed Portals de aceleração no clímax.
 *    - Portais de Inversão Gravitacional com pista de estabilização.
 * 3. TODAS AS PLATAFORMAS 100% ACESSÍVEIS:
 *    - Degraus a partir do chão em y: 485 (altura 85px, transponível pelo salto de 110px).
 *    - Degraus secundários acessíveis a partir do primeiro degrau ou via Jump Orb.
 */

'use strict';

const LEVELS = [
  // ============================================================================
  // FASE 1 — Neon Dawn (Tutorial Amigável & Introdução aos Desafios)
  // Velocidade: 430 px/s | Comprimento: 12.500px | 3 Moedas | Jump Orb | Jump Pad
  // ============================================================================
  {
    id: 1,
    name: "Neon Dawn",
    difficultyName: "Fácil",
    difficultyClass: "diff-facil",
    speed: 430,
    finishX: 12500,
    colors: {
      primary: '#00f0ff',
      accent: '#0077ff',
      bgGrad1: '#050a1a',
      bgGrad2: '#0c1b3a',
      floorTop: '#00f0ff',
      floorBody: '#060b20'
    },
    hints: [
      { x: 600, y: 460, text: "PARTE 1: ESPAÇO, W OU TOQUE PARA PULAR" },
      { x: 2600, y: 460, text: "PULANDO O PRIMEIRO BLOCO!" },
      { x: 4200, y: 460, text: "PARTE 2: SALTO LIMPO SOBRE O ABISMO!" },
      { x: 5400, y: 440, text: "SUBA NA PLATAFORMA SUSPENSA!" },
      { x: 6800, y: 440, text: "JUMP ORB AMARELO: APERTE PULAR NO AR!" },
      { x: 8600, y: 460, text: "PARTE 3: TRAMPOLIM NEON! DEIXE-SE LANÇAR!" },
      { x: 10400, y: 460, text: "DESAFIO FINAL: ESPINHO DUPLO!" }
    ],
    secretCoins: [
      // Moeda 1: Sobre o primeiro bloco sólido
      { id: 0, x: 3122, y: 420 },
      // Moeda 2: Rota aérea usando o Jump Orb em 6850
      { id: 1, x: 7400, y: 380 },
      // Moeda 3: No alto do salto sobre o espinho duplo final
      { id: 2, x: 10920, y: 430 }
    ],
    jumpOrbs: [
      // Orbe amarelo flutuante que arremessa sobre o espinho duplo
      { x: 6850, y: 460, radius: 22, jumpForce: 740, color: '#ffea00' }
    ],
    speedPortals: [
      // Portal de aceleração no início da Parte 3 (clímax)
      { x: 8900, w: 52, speedMultiplier: 1.15 }
    ],
    spikes: [
      // Parte 1 (0-35%): Espinhos solos e blocos
      { x: 1700, w: 36, h: 42 },

      // Parte 2 (35-70%): Espinhos pós-plataforma e sob o Jump Orb
      { x: 6850, w: 36, h: 42 }, // Espinho no chão que exige usar o Jump Orb no ar
      { x: 7800, w: 36, h: 42 },

      // Parte 3 (70-100%): Fileira dupla sobrevoada pelo trampolim em 9150
      { x: 9400, w: 36, h: 42 },
      { x: 9436, w: 36, h: 42 },

      // Espinho duplo de desafio final
      { x: 10900, w: 36, h: 42 },
      { x: 10936, w: 36, h: 42 },

      // Salto comemorativo
      { x: 11800, w: 36, h: 42 }
    ],
    pits: [
      { startX: 4400, endX: 4620 },
      { startX: 5500, endX: 6100 }
    ],
    platforms: [
      // Bloco sólido no chão (altura 42px: acessível com sobra)
      { x: 3100, y: 528, w: 45, h: 42, isBlock: true },

      // Plataforma suspensa sobre o abismo 2 (y: 485 = altura 85px do chão, pouso seguro)
      { x: 5550, y: 485, w: 340, h: 25 },

      // Plataforma de recompensa após o Jump Orb
      { x: 7300, y: 460, w: 220, h: 25 },

      // Bloco intermediário
      { x: 10100, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [
      { x: 9150, y: 558, w: 48, h: 12, bounceForce: 960 }
    ],
    movingHazards: [],
    gravityPortals: []
  },

  // ============================================================================
  // FASE 2 — Cyber Chasm (Parkour de Degraus & Jump Orbs Aéreos)
  // Velocidade: 470 px/s | Comprimento: 14.500px | 3 Moedas | 2 Jump Orbs
  // ============================================================================
  {
    id: 2,
    name: "Cyber Chasm",
    difficultyName: "Iniciante",
    difficultyClass: "diff-iniciante",
    speed: 470,
    finishX: 14500,
    colors: {
      primary: '#00ff88',
      accent: '#00b862',
      bgGrad1: '#04140e',
      bgGrad2: '#08291c',
      floorTop: '#00ff88',
      floorBody: '#051811'
    },
    hints: [
      { x: 600, y: 460, text: "PARTE 1: DEGRAUS ESCALONADOS!" },
      { x: 4200, y: 440, text: "PARTE 2: PARKOUR DE PLATAFORMAS!" },
      { x: 7400, y: 440, text: "JUMP ORB DUPLO NO AR!" },
      { x: 9800, y: 460, text: "PARTE 3: SUPER PULO E RETA FINAL!" }
    ],
    secretCoins: [
      { id: 0, x: 3020, y: 420 },
      { id: 1, x: 7600, y: 360 },
      { id: 2, x: 12250, y: 420 }
    ],
    jumpOrbs: [
      { x: 7500, y: 440, radius: 22, jumpForce: 740, color: '#ffea00' },
      { x: 7850, y: 410, radius: 22, jumpForce: 740, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 10200, w: 52, speedMultiplier: 1.15 }
    ],
    spikes: [
      { x: 1800, w: 36, h: 42 },

      // Espinho no degrau 2 (com corrida livre antes)
      { x: 5350, w: 36, h: 42, y: 430 - 42 },

      { x: 6700, w: 36, h: 42 },
      { x: 7500, w: 36, h: 42 }, // Espinho no chão sob o orb 1

      // Fileira tripla sobrevoada pelo trampolim em 10400
      { x: 10650, w: 36, h: 42 },
      { x: 10686, w: 36, h: 42 },
      { x: 10722, w: 36, h: 42 },

      // Fileira dupla na reta final
      { x: 12200, w: 36, h: 42 },
      { x: 12236, w: 36, h: 42 },

      { x: 13500, w: 36, h: 42 }
    ],
    pits: [
      { startX: 4300, endX: 5650 },
      { startX: 8850, endX: 9200 }
    ],
    platforms: [
      { x: 3000, y: 528, w: 45, h: 42, isBlock: true },

      // Degraus perfeitamente calibrados:
      // Degrau 1: y = 485 (85px do chão - 100% atingível pelo pulo)
      { x: 4400, y: 485, w: 360, h: 25 },
      // Degrau 2: y = 430 (55px acima do degrau 1 - transição suave e confortável)
      { x: 4950, y: 430, w: 480, h: 25 },

      // Obstáculo suspenso
      { x: 6300, y: 410, w: 60, h: 40, isBlock: true },

      // Plataforma sobre o abismo 2
      { x: 8900, y: 485, w: 260, h: 25 },

      { x: 11400, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [
      { x: 10400, y: 558, w: 48, h: 12, bounceForce: 960 }
    ],
    movingHazards: [],
    gravityPortals: []
  },

  // ============================================================================
  // FASE 3 — Kinetic Wave (Speed Portal & Inversão Gravitacional)
  // Velocidade: 510 px/s | Comprimento: 16.000px | 3 Moedas | Speed Portal | Portais
  // ============================================================================
  {
    id: 3,
    name: "Kinetic Wave",
    difficultyName: "Intermediária",
    difficultyClass: "diff-intermediaria",
    speed: 510,
    finishX: 16000,
    colors: {
      primary: '#ffaa00',
      accent: '#ff5500',
      bgGrad1: '#1a0c02',
      bgGrad2: '#2a1506',
      floorTop: '#ffaa00',
      floorBody: '#1f0f04'
    },
    hints: [
      { x: 600, y: 460, text: "PARTE 1: RITMO DINÂMICO!" },
      { x: 4800, y: 460, text: "PARTE 2: PLATAFORMA COM DEGRAU DE ACESSO!" },
      { x: 9200, y: 440, text: "JUMP ORB NO VÔO!" },
      { x: 11000, y: 460, text: "PARTE 3: SPEED PORTAL & GRAVIDADE INVERTIDA!" }
    ],
    secretCoins: [
      { id: 0, x: 3220, y: 420 },
      { id: 1, x: 9420, y: 380 },
      { id: 2, x: 13300, y: 220 }
    ],
    jumpOrbs: [
      { x: 9400, y: 450, radius: 22, jumpForce: 750, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 11200, w: 52, speedMultiplier: 1.2 }
    ],
    spikes: [
      { x: 2000, w: 36, h: 42 },
      { x: 4500, w: 36, h: 42 },

      // Espinho na plataforma longa
      { x: 7450, w: 36, h: 42, y: 440 - 42 },

      // Espinho no chão sob o Jump Orb
      { x: 9400, w: 36, h: 42 },

      // Espinho invertido no teto durante a gravidade invertida
      { x: 13200, w: 36, h: 42, inverted: true },

      // Fileira de retorno ao chão
      { x: 14700, w: 36, h: 42 },
      { x: 14736, w: 36, h: 42 },
      { x: 15400, w: 36, h: 42 }
    ],
    pits: [
      { startX: 5200, endX: 5440 },
      { startX: 6800, endX: 7850 }
    ],
    platforms: [
      { x: 3200, y: 528, w: 45, h: 42, isBlock: true },

      // Degrau inicial de acesso à plataforma (y: 485, altura 85px)
      { x: 6700, y: 485, w: 180, h: 25 },
      // Plataforma longa sobre o abismo (y: 440, transição suave de 45px do degrau)
      { x: 6900, y: 440, w: 750, h: 25 },

      { x: 8600, y: 528, w: 45, h: 42, isBlock: true },
      { x: 10400, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [],
    movingHazards: [
      { x: 6100, baseY: 380, w: 40, h: 40, speed: 2.0, amplitude: 50, color: '#ff5500' }
    ],
    gravityPortals: [
      // Inversão na Parte 3
      { x: 12200, w: 52, targetGravity: -1 },
      { x: 14000, w: 52, targetGravity: 1 }
    ]
  },

  // ============================================================================
  // FASE 4 — Gravity Nexus (Introdução ao Portal & Espinhos no Teto)
  // Velocidade: 550 px/s | Comprimento: 17.500px | 3 Moedas | Jump Orbs
  // ============================================================================
  {
    id: 4,
    name: "Gravity Nexus",
    difficultyName: "Intermediária",
    difficultyClass: "diff-intermediaria",
    speed: 550,
    finishX: 17500,
    colors: {
      primary: '#ff0077',
      accent: '#c000bb',
      bgGrad1: '#180210',
      bgGrad2: '#2b0520',
      floorTop: '#ff0077',
      floorBody: '#1e0415'
    },
    hints: [
      { x: 700, y: 460, text: "PARTE 1: O PORTAL INVERTE A GRAVIDADE!" },
      { x: 4100, y: 350, text: "PARTE 2: ▲ CORRIDA NO TETO!" },
      { x: 6000, y: 240, text: "ESPINHO NO TETO! SALTE PARA BAIXO!" },
      { x: 9300, y: 350, text: "PARTE 3: ▼ RETORNO E FINAL RÍTMICO!" }
    ],
    secretCoins: [
      { id: 0, x: 2620, y: 420 },
      { id: 1, x: 8000, y: 240 },
      { id: 2, x: 14600, y: 410 }
    ],
    jumpOrbs: [
      { x: 12400, y: 450, radius: 22, jumpForce: 750, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 10400, w: 52, speedMultiplier: 1.15 }
    ],
    spikes: [
      { x: 2000, w: 36, h: 42 },
      { x: 3200, w: 36, h: 42 },

      // TETO:
      { x: 6200, w: 36, h: 42, inverted: true },
      { x: 7500, w: 36, h: 42, inverted: true },
      { x: 8700, w: 36, h: 42, inverted: true },

      // CHÃO:
      { x: 11200, w: 36, h: 42 },
      { x: 12400, w: 36, h: 42 }, // Sob o orb
      { x: 14750, w: 36, h: 42 },
      { x: 14786, w: 36, h: 42 },
      { x: 16200, w: 36, h: 42 }
    ],
    pits: [
      { startX: 13300, endX: 13700 }
    ],
    platforms: [
      { x: 2600, y: 528, w: 45, h: 42, isBlock: true },
      { x: 8000, y: 150, w: 50, h: 40, isBlock: true },
      { x: 13350, y: 485, w: 280, h: 25 },
      { x: 15400, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [
      { x: 14500, y: 558, w: 48, h: 12, bounceForce: 970 }
    ],
    movingHazards: [],
    gravityPortals: [
      { x: 4400, w: 52, targetGravity: -1 },
      { x: 9600, w: 52, targetGravity: 1 }
    ]
  },

  // ============================================================================
  // FASE 5 — Overclock Sprint (Ritmo Intenso & Saltos Rítmicos Espaçados)
  // Velocidade: 590 px/s | Comprimento: 19.000px | 3 Moedas | Speed Portal
  // ============================================================================
  {
    id: 5,
    name: "Overclock Sprint",
    difficultyName: "Difícil",
    difficultyClass: "diff-dificil",
    speed: 590,
    finishX: 19000,
    colors: {
      primary: '#ff2233',
      accent: '#ff7700',
      bgGrad1: '#1c0307',
      bgGrad2: '#30080d',
      floorTop: '#ff2233',
      floorBody: '#220409'
    },
    hints: [
      { x: 700, y: 460, text: "PARTE 1: ALTA VELOCIDADE!" },
      { x: 4700, y: 440, text: "PARTE 2: DEGRAUS EM SPRINT!" },
      { x: 9300, y: 460, text: "PERIGO OSCILANTE! CUIDADO!" },
      { x: 13200, y: 460, text: "PARTE 3: SPRINT FINAL HIPERSÔNICO!" }
    ],
    secretCoins: [
      { id: 0, x: 2920, y: 420 },
      { id: 1, x: 5750, y: 350 },
      { id: 2, x: 13500, y: 400 }
    ],
    jumpOrbs: [
      { x: 8500, y: 450, radius: 22, jumpForce: 750, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 13000, w: 52, speedMultiplier: 1.2 }
    ],
    spikes: [
      { x: 2200, w: 36, h: 42 },
      { x: 3600, w: 36, h: 42 },
      { x: 7200, w: 36, h: 42 },
      { x: 8500, w: 36, h: 42 },
      { x: 11200, w: 36, h: 42 },

      // Triplo
      { x: 13650, w: 36, h: 42 },
      { x: 13686, w: 36, h: 42 },
      { x: 13722, w: 36, h: 42 },

      { x: 15200, w: 36, h: 42 },
      { x: 15236, w: 36, h: 42 },
      { x: 16800, w: 36, h: 42 },
      { x: 17900, w: 36, h: 42 }
    ],
    pits: [
      { startX: 4900, endX: 6200 },
      { startX: 11800, endX: 12200 }
    ],
    platforms: [
      { x: 2900, y: 528, w: 45, h: 42, isBlock: true },

      // Degraus calibrados: 485 -> 430
      { x: 5000, y: 485, w: 360, h: 25 },
      { x: 5550, y: 430, w: 420, h: 25 },

      { x: 9600, y: 410, w: 60, h: 40, isBlock: true },
      { x: 11850, y: 480, w: 280, h: 25 },
      { x: 16000, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [
      { x: 13350, y: 558, w: 48, h: 12, bounceForce: 980 }
    ],
    movingHazards: [
      { x: 10400, baseY: 385, w: 40, h: 40, speed: 2.3, amplitude: 50, color: '#ff2233' }
    ],
    gravityPortals: []
  },

  // ============================================================================
  // FASE 6 — Dual Flux (Dupla Inversão Gravitacional)
  // Velocidade: 620 px/s | Comprimento: 21.000px | 3 Moedas | Orbs | Portais
  // ============================================================================
  {
    id: 6,
    name: "Dual Flux",
    difficultyName: "Avançada",
    difficultyClass: "diff-avancada",
    speed: 620,
    finishX: 21000,
    colors: {
      primary: '#ffee00',
      accent: '#00f0ff',
      bgGrad1: '#141400',
      bgGrad2: '#242205',
      floorTop: '#ffee00',
      floorBody: '#1a1902'
    },
    hints: [
      { x: 700, y: 460, text: "PARTE 1: DUPLA INVERSÃO!" },
      { x: 3800, y: 350, text: "PARTE 2: ▲ FOCO NO TETO!" },
      { x: 8600, y: 350, text: "▼ RETORNO AO CHÃO!" },
      { x: 13200, y: 350, text: "PARTE 3: ▲ SEGUNDA INVERSÃO E CLÍMAX!" }
    ],
    secretCoins: [
      { id: 0, x: 2820, y: 420 },
      { id: 1, x: 6500, y: 230 },
      { id: 2, x: 16000, y: 230 }
    ],
    jumpOrbs: [
      { x: 12200, y: 450, radius: 22, jumpForce: 760, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 17500, w: 52, speedMultiplier: 1.15 }
    ],
    spikes: [
      { x: 2300, w: 36, h: 42 },
      { x: 3400, w: 36, h: 42 },
      { x: 5800, w: 36, h: 42, inverted: true },
      { x: 7200, w: 36, h: 42, inverted: true },
      { x: 10400, w: 36, h: 42 },
      { x: 12200, w: 36, h: 42 },
      { x: 15200, w: 36, h: 42, inverted: true },
      { x: 16500, w: 36, h: 42, inverted: true },
      { x: 19200, w: 36, h: 42 },
      { x: 20100, w: 36, h: 42 }
    ],
    pits: [
      { startX: 11200, endX: 11600 }
    ],
    platforms: [
      { x: 2800, y: 528, w: 45, h: 42, isBlock: true },
      { x: 6500, y: 150, w: 50, h: 40, isBlock: true },
      { x: 11250, y: 480, w: 260, h: 25 },
      { x: 15900, y: 150, w: 50, h: 40, isBlock: true }
    ],
    jumpPads: [
      { x: 12700, y: 558, w: 48, h: 12, bounceForce: 980 }
    ],
    movingHazards: [],
    gravityPortals: [
      { x: 4200, w: 52, targetGravity: -1 },
      { x: 9000, w: 52, targetGravity: 1 },
      { x: 13600, w: 52, targetGravity: -1 },
      { x: 17800, w: 52, targetGravity: 1 }
    ]
  },

  // ============================================================================
  // FASE 7 — Skyline Corridor (Parkour Aéreo & Obstáculos Suspensos)
  // Velocidade: 650 px/s | Comprimento: 22.500px | 3 Moedas | Orbs
  // ============================================================================
  {
    id: 7,
    name: "Skyline Corridor",
    difficultyName: "Avançada",
    difficultyClass: "diff-avancada",
    speed: 650,
    finishX: 22500,
    colors: {
      primary: '#9d00ff',
      accent: '#ff00aa',
      bgGrad1: '#140026',
      bgGrad2: '#280242',
      floorTop: '#9d00ff',
      floorBody: '#18022b'
    },
    hints: [
      { x: 700, y: 460, text: "PARTE 1: PARKOUR NAS ALTURAS!" },
      { x: 4800, y: 440, text: "PARTE 2: DEGRAUS ESCALONADOS!" },
      { x: 11000, y: 460, text: "OBSTÁCULOS SUSPENSOS!" },
      { x: 15800, y: 460, text: "PARTE 3: TRAMPOLIM PARA A CORRIDA FINAL!" }
    ],
    secretCoins: [
      { id: 0, x: 3120, y: 420 },
      { id: 1, x: 6700, y: 310 },
      { id: 2, x: 16250, y: 400 }
    ],
    jumpOrbs: [
      { x: 9900, y: 450, radius: 22, jumpForce: 760, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 15500, w: 52, speedMultiplier: 1.15 }
    ],
    spikes: [
      { x: 2400, w: 36, h: 42 },
      { x: 3800, w: 36, h: 42 },
      { x: 8600, w: 36, h: 42 },
      { x: 9900, w: 36, h: 42 },
      { x: 12400, w: 36, h: 42 },

      // Triplo
      { x: 16400, w: 36, h: 42 },
      { x: 16436, w: 36, h: 42 },
      { x: 16472, w: 36, h: 42 },

      { x: 18200, w: 36, h: 42 },
      { x: 19600, w: 36, h: 42 },
      { x: 19636, w: 36, h: 42 },
      { x: 21200, w: 36, h: 42 }
    ],
    pits: [
      { startX: 5100, endX: 7900 },
      { startX: 14150, endX: 14550 }
    ],
    platforms: [
      { x: 3100, y: 528, w: 45, h: 42, isBlock: true },

      // Parkour escalonado seguro: 485 -> 430 -> 375 (sempre transições <= 60px)
      { x: 5200, y: 485, w: 360, h: 25 },
      { x: 5800, y: 430, w: 360, h: 25 },
      { x: 6450, y: 375, w: 480, h: 25 },
      { x: 7200, y: 440, w: 320, h: 25 },

      { x: 11400, y: 390, w: 70, h: 40, isBlock: true },
      { x: 14200, y: 485, w: 280, h: 25 }
    ],
    jumpPads: [
      { x: 16100, y: 558, w: 48, h: 12, bounceForce: 990 }
    ],
    movingHazards: [
      { x: 15000, baseY: 385, w: 42, h: 42, speed: 2.6, amplitude: 50, color: '#ff00aa' }
    ],
    gravityPortals: []
  },

  // ============================================================================
  // FASE 8 — Plasma Gauntlet (Desafios Combinados de Elite)
  // Velocidade: 680 px/s | Comprimento: 24.000px | 3 Moedas | Orbs
  // ============================================================================
  {
    id: 8,
    name: "Plasma Gauntlet",
    difficultyName: "Mestre",
    difficultyClass: "diff-mestre",
    speed: 680,
    finishX: 24000,
    colors: {
      primary: '#00f0ff',
      accent: '#ff0055',
      bgGrad1: '#02121c',
      bgGrad2: '#08253a',
      floorTop: '#00f0ff',
      floorBody: '#051926'
    },
    hints: [
      { x: 800, y: 460, text: "PARTE 1: ZONA DE PLASMA!" },
      { x: 5200, y: 350, text: "PARTE 2: ▲ VÓRTICE GRAVITACIONAL!" },
      { x: 11000, y: 350, text: "▼ RETORNO COM PREPARAÇÃO!" },
      { x: 16900, y: 460, text: "PARTE 3: CLÍMAX DE ELITE!" }
    ],
    secretCoins: [
      { id: 0, x: 3220, y: 420 },
      { id: 1, x: 8100, y: 230 },
      { id: 2, x: 17600, y: 410 }
    ],
    jumpOrbs: [
      { x: 14700, y: 450, radius: 22, jumpForce: 760, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 17000, w: 52, speedMultiplier: 1.15 }
    ],
    spikes: [
      { x: 2500, w: 36, h: 42 },
      { x: 3900, w: 36, h: 42 },
      { x: 3936, w: 36, h: 42 },

      // Teto:
      { x: 7400, w: 36, h: 42, inverted: true },
      { x: 8900, w: 36, h: 42, inverted: true },
      { x: 10300, w: 36, h: 42, inverted: true },

      // Chão:
      { x: 13200, w: 36, h: 42 },
      { x: 14700, w: 36, h: 42 },

      // Triplo
      { x: 17750, w: 36, h: 42 },
      { x: 17786, w: 36, h: 42 },
      { x: 17822, w: 36, h: 42 },

      { x: 19500, w: 36, h: 42 },
      { x: 20900, w: 36, h: 42 },
      { x: 20936, w: 36, h: 42 },
      { x: 22600, w: 36, h: 42 }
    ],
    pits: [
      { startX: 15150, endX: 15600 }
    ],
    platforms: [
      { x: 3200, y: 528, w: 45, h: 42, isBlock: true },
      { x: 8100, y: 150, w: 50, h: 40, isBlock: true },
      { x: 15200, y: 480, w: 300, h: 25 },
      { x: 16800, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [
      { x: 17400, y: 558, w: 48, h: 12, bounceForce: 1000 }
    ],
    movingHazards: [
      { x: 16200, baseY: 385, w: 42, h: 42, speed: 2.8, amplitude: 50, color: '#ff0055' }
    ],
    gravityPortals: [
      { x: 5600, w: 52, targetGravity: -1 },
      { x: 11400, w: 52, targetGravity: 1 }
    ]
  },

  // ============================================================================
  // FASE 9 — Chrono Vortex (Distorção Cósmica & Ritmo Fluido)
  // Velocidade: 710 px/s | Comprimento: 25.500px | 3 Moedas | Orbs
  // ============================================================================
  {
    id: 9,
    name: "Chrono Vortex",
    difficultyName: "Extrema",
    difficultyClass: "diff-extrema",
    speed: 710,
    finishX: 25500,
    colors: {
      primary: '#ffffff',
      accent: '#9d00ff',
      bgGrad1: '#110224',
      bgGrad2: '#230744',
      floorTop: '#ffffff',
      floorBody: '#1a0630'
    },
    hints: [
      { x: 800, y: 460, text: "PARTE 1: DISTORÇÃO TEMPORAL!" },
      { x: 5600, y: 350, text: "PARTE 2: ▲ TRANSIÇÃO CÓSMICA!" },
      { x: 12000, y: 350, text: "▼ RETORNO AO CHÃO!" },
      { x: 18000, y: 460, text: "PARTE 3: CORRIDA FINAL ATRAVÉS DO TEMPO!" }
    ],
    secretCoins: [
      { id: 0, x: 3320, y: 420 },
      { id: 1, x: 8700, y: 230 },
      { id: 2, x: 19000, y: 410 }
    ],
    jumpOrbs: [
      { x: 15800, y: 450, radius: 22, jumpForce: 770, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 18200, w: 52, speedMultiplier: 1.15 }
    ],
    spikes: [
      { x: 2600, w: 36, h: 42 },
      { x: 4100, w: 36, h: 42 },
      { x: 4136, w: 36, h: 42 },

      // Teto:
      { x: 7900, w: 36, h: 42, inverted: true },
      { x: 9500, w: 36, h: 42, inverted: true },
      { x: 11100, w: 36, h: 42, inverted: true },

      // Chão:
      { x: 14200, w: 36, h: 42 },
      { x: 15800, w: 36, h: 42 },

      { x: 18850, w: 36, h: 42 },
      { x: 18886, w: 36, h: 42 },

      { x: 20600, w: 36, h: 42 },
      { x: 22100, w: 36, h: 42 },
      { x: 22136, w: 36, h: 42 },
      { x: 23900, w: 36, h: 42 }
    ],
    pits: [
      { startX: 16350, endX: 16800 }
    ],
    platforms: [
      { x: 3300, y: 528, w: 45, h: 42, isBlock: true },
      { x: 8700, y: 150, w: 50, h: 40, isBlock: true },
      { x: 16400, y: 480, w: 340, h: 25 },
      { x: 17900, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [
      { x: 18500, y: 558, w: 48, h: 12, bounceForce: 1010 }
    ],
    movingHazards: [
      { x: 5000, baseY: 385, w: 42, h: 42, speed: 2.8, amplitude: 50, color: '#ffffff' }
    ],
    gravityPortals: [
      { x: 6000, w: 52, targetGravity: -1 },
      { x: 12400, w: 52, targetGravity: 1 }
    ]
  },

  // ============================================================================
  // FASE 10 — Singularity Overdrive (O Grande Clímax: O Desafio Supremo)
  // Velocidade: 750 px/s | Comprimento: 27.500px | 3 Moedas | Orbs | Portais
  // ============================================================================
  {
    id: 10,
    name: "Singularity Overdrive",
    difficultyName: "Suprema",
    difficultyClass: "diff-suprema",
    speed: 750,
    finishX: 27500,
    colors: {
      primary: '#ffcc00',
      accent: '#ff1744',
      bgGrad1: '#1a0d00',
      bgGrad2: '#351203',
      floorTop: '#ffcc00',
      floorBody: '#240f02'
    },
    hints: [
      { x: 800, y: 460, text: "PARTE 1: A SINGULARIDADE FINAL!" },
      { x: 5400, y: 350, text: "PARTE 2: ▲ INVERSÃO HIPERSÔNICA!" },
      { x: 11400, y: 350, text: "▼ RETORNO! SINTA O RITMO!" },
      { x: 17000, y: 350, text: "PARTE 3: ▲ ÚLTIMA INVERSÃO E COROA SUPREMA!" }
    ],
    secretCoins: [
      { id: 0, x: 3320, y: 420 },
      { id: 1, x: 8500, y: 230 },
      { id: 2, x: 20200, y: 230 }
    ],
    jumpOrbs: [
      { x: 15300, y: 450, radius: 22, jumpForce: 780, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 22800, w: 52, speedMultiplier: 1.15 }
    ],
    spikes: [
      { x: 2600, w: 36, h: 42 },
      { x: 4100, w: 36, h: 42 },
      { x: 4136, w: 36, h: 42 },

      // Teto 1:
      { x: 7700, w: 36, h: 42, inverted: true },
      { x: 9400, w: 36, h: 42, inverted: true },
      { x: 10800, w: 36, h: 42, inverted: true },

      // Chão:
      { x: 13700, w: 36, h: 42 },
      { x: 15300, w: 36, h: 42 },

      // Teto 2:
      { x: 19400, w: 36, h: 42, inverted: true },
      { x: 21100, w: 36, h: 42, inverted: true },

      // Final:
      { x: 24700, w: 36, h: 42 },
      { x: 25900, w: 36, h: 42 },
      { x: 25936, w: 36, h: 42 },
      { x: 26900, w: 36, h: 42 }
    ],
    pits: [
      { startX: 14050, endX: 14500 }
    ],
    platforms: [
      { x: 3300, y: 528, w: 45, h: 42, isBlock: true },
      { x: 8500, y: 150, w: 50, h: 40, isBlock: true },
      { x: 14100, y: 480, w: 340, h: 25 },
      { x: 16200, y: 528, w: 45, h: 42, isBlock: true },
      { x: 20200, y: 150, w: 50, h: 40, isBlock: true }
    ],
    jumpPads: [
      { x: 16750, y: 558, w: 48, h: 12, bounceForce: 1020 }
    ],
    movingHazards: [
      { x: 4900, baseY: 385, w: 42, h: 42, speed: 3.0, amplitude: 50, color: '#ff1744' }
    ],
    gravityPortals: [
      { x: 5800, w: 52, targetGravity: -1 },
      { x: 11800, w: 52, targetGravity: 1 },
      { x: 17500, w: 52, targetGravity: -1 },
      { x: 23000, w: 52, targetGravity: 1 }
    ]
  }
];
'@

[System.IO.File]::WriteAllText("$PSScriptRoot\..\js\levels.js", $levelsCode, [System.Text.Encoding]::UTF8)
Write-Host "Arquivo js/levels.js atualizado com sucesso!" -ForegroundColor Green
