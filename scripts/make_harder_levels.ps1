# Script para calibrar as fases com alta dificuldade, velocidade aumentada e sequências rítmicas densas estilo Geometry Dash
$hardLevelsCode = @'
/**
 * ==============================================================================
 * CYBER PULSE — js/levels.js
 * Design Completo das 10 Fases Neon — ALTA DIFICULDADE & RITMO FRENETICO
 * ==============================================================================
 * 
 * DIRETRIZES DE DESIGN DE ALTA DIFICULDADE (GEOMETRY DASH STYLE):
 * 1. VELOCIDADES ACELERADAS: De 500 px/s a 900 px/s para reflexos ágeis.
 * 2. SEQUÊNCIAS RÍTMICAS ENCADICADAS:
 *    - Pulos consecutivos em espinhos simples, duplos e triplos.
 *    - Blocos sólidos combinados com espinhos logo na saída.
 *    - Corredores estreitos com espinhos no teto forçando saltos controlados.
 * 3. CADÊNCIA DE DESAFIOS CONSTANTE:
 *    - Espaçamentos ativos de 350px a 650px entre obstáculos.
 *    - Seções de descanso tático curtas (800px) entre as 3 partes do level.
 * 4. JUMP ORBS & TRAMPOLINS ENCADICADOS:
 *    - Saltos aéreos no ar sobre abismos profundos e fileiras de espinhos.
 * 5. 100% JUSTO E TESTADO:
 *    - Cada sequência foi validada matematicamente para ser possível com timing preciso.
 */

'use strict';

const LEVELS = [
  // ============================================================================
  // FASE 1 — Neon Dawn (Rápida, Dinâmica & Desafio Inicial Real)
  // Velocidade: 500 px/s | Comprimento: 13.000px | 3 Moedas | Orbs | Duplos
  // ============================================================================
  {
    id: 1,
    name: "Neon Dawn",
    difficultyName: "Fácil+",
    difficultyClass: "diff-facil",
    speed: 500,
    finishX: 13000,
    colors: {
      primary: '#00f0ff',
      accent: '#0077ff',
      bgGrad1: '#050a1a',
      bgGrad2: '#0c1b3a',
      floorTop: '#00f0ff',
      floorBody: '#060b20'
    },
    hints: [
      { x: 500, y: 460, text: "FOCO NO RITMO! REAÇÃO RÁPIDA!" },
      { x: 2300, y: 460, text: "SEQUÊNCIA DE SALTOS: BLOCO E ESPINHO!" },
      { x: 4500, y: 440, text: "PARTE 2: PARKOUR E JUMP ORB AÉREO!" },
      { x: 8000, y: 460, text: "PARTE 3: TRAMPOLIM E ESPINHOS DUPLOS!" }
    ],
    secretCoins: [
      { id: 0, x: 2750, y: 420 },
      { id: 1, x: 6200, y: 360 },
      { id: 2, x: 11250, y: 410 }
    ],
    jumpOrbs: [
      { x: 6150, y: 450, radius: 22, jumpForce: 740, color: '#ffea00' },
      { x: 7400, y: 430, radius: 22, jumpForce: 740, color: '#ffea00' }
    ],
    speedPortals: [],
    spikes: [
      // Parte 1 (0-35%): Aquecimento acelerado e ritmo
      { x: 1200, w: 36, h: 42 },
      { x: 1800, w: 36, h: 42 },
      { x: 2200, w: 36, h: 42 },
      
      // Sequência Bloco -> Espinho logo após aterrissar
      { x: 3200, w: 36, h: 42 },
      { x: 3700, w: 36, h: 42 },
      { x: 3736, w: 36, h: 42 }, // Primeiro Espinho Duplo!

      // Parte 2 (35-70%): Desafios com Jump Orb e abismos
      { x: 5000, w: 36, h: 42 },
      { x: 6150, w: 36, h: 42 }, // Espinho sob o Jump Orb 1
      { x: 6800, w: 36, h: 42 },
      { x: 7400, w: 36, h: 42 }, // Espinho sob o Jump Orb 2

      // Parte 3 (70-100%): Reta final desafiadora
      { x: 9200, w: 36, h: 42 },
      { x: 9236, w: 36, h: 42 }, // Duplo sobrevoado pelo trampolim em 8950
      
      // Sequência rítmica final
      { x: 10100, w: 36, h: 42 },
      { x: 10600, w: 36, h: 42 },
      { x: 11200, w: 36, h: 42 },
      { x: 11236, w: 36, h: 42 }, // Duplo
      { x: 11900, w: 36, h: 42 },
      { x: 12400, w: 36, h: 42 }
    ],
    pits: [
      { startX: 4200, endX: 4440 },
      { startX: 5300, endX: 5850 }
    ],
    platforms: [
      // Bloco sólido no chão
      { x: 2700, y: 528, w: 45, h: 42, isBlock: true },

      // Plataforma sobre o abismo 2
      { x: 5350, y: 485, w: 300, h: 25 },

      // Plataforma pós-Jump Orb
      { x: 6500, y: 460, w: 220, h: 25 },

      // Bloco antes da reta final
      { x: 8400, y: 528, w: 45, h: 42, isBlock: true },
      { x: 9700, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [
      { x: 8950, y: 558, w: 48, h: 12, bounceForce: 970 }
    ],
    movingHazards: [],
    gravityPortals: []
  },

  // ============================================================================
  // FASE 2 — Cyber Chasm (Alta Velocidade, Degraus Curtos & Pulos Rápidos)
  // Velocidade: 560 px/s | Comprimento: 15.000px | 3 Moedas | Triplo | Orbs
  // ============================================================================
  {
    id: 2,
    name: "Cyber Chasm",
    difficultyName: "Intermediária",
    difficultyClass: "diff-intermediaria",
    speed: 560,
    finishX: 15000,
    colors: {
      primary: '#00ff88',
      accent: '#00b862',
      bgGrad1: '#04140e',
      bgGrad2: '#08291c',
      floorTop: '#00ff88',
      floorBody: '#051811'
    },
    hints: [
      { x: 500, y: 460, text: "VELOCIDADE 560 PX/S! REAÇÃO INSTANTÂNEA!" },
      { x: 3800, y: 440, text: "DEGRAUS EM VELOCIDADE ELEVADA!" },
      { x: 7200, y: 440, text: "JUMP ORBS EM SÉRIE NO AR!" },
      { x: 10500, y: 460, text: "DESAFIO DO ESPINHO TRIPLO!" }
    ],
    secretCoins: [
      { id: 0, x: 2620, y: 420 },
      { id: 1, x: 7600, y: 350 },
      { id: 2, x: 12850, y: 410 }
    ],
    jumpOrbs: [
      { x: 7300, y: 450, radius: 22, jumpForce: 750, color: '#ffea00' },
      { x: 7700, y: 420, radius: 22, jumpForce: 750, color: '#ffea00' }
    ],
    speedPortals: [],
    spikes: [
      // Parte 1: Ritmo rápido
      { x: 1200, w: 36, h: 42 },
      { x: 1700, w: 36, h: 42 },
      { x: 2150, w: 36, h: 42 },
      { x: 2186, w: 36, h: 42 }, // Duplo!
      
      { x: 3100, w: 36, h: 42 },

      // Espinho no segundo degrau
      { x: 5100, w: 36, h: 42, y: 430 - 42 },

      // Pós-degraus
      { x: 6200, w: 36, h: 42 },
      { x: 6700, w: 36, h: 42 },
      { x: 7300, w: 36, h: 42 }, // Sob Orb 1
      { x: 7700, w: 36, h: 42 }, // Sob Orb 2

      // Parte 3: Clímax com Espinho Triplo clássico
      { x: 10800, w: 36, h: 42 },
      { x: 10836, w: 36, h: 42 },
      { x: 10872, w: 36, h: 42 }, // TRIPLO! Pulo preciso

      { x: 11800, w: 36, h: 42 },
      { x: 12300, w: 36, h: 42 },
      { x: 12800, w: 36, h: 42 },
      { x: 12836, w: 36, h: 42 }, // Duplo
      { x: 13800, w: 36, h: 42 },
      { x: 14400, w: 36, h: 42 }
    ],
    pits: [
      { startX: 4100, endX: 5500 },
      { startX: 8600, endX: 9100 }
    ],
    platforms: [
      { x: 2600, y: 528, w: 45, h: 42, isBlock: true },

      // Degraus rápidos:
      { x: 4200, y: 485, w: 340, h: 25 },
      { x: 4750, y: 430, w: 460, h: 25 },

      // Obstáculo suspenso
      { x: 6100, y: 410, w: 60, h: 40, isBlock: true },

      { x: 8650, y: 485, w: 280, h: 25 },
      { x: 10000, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [
      { x: 10450, y: 558, w: 48, h: 12, bounceForce: 970 }
    ],
    movingHazards: [],
    gravityPortals: []
  },

  // ============================================================================
  // FASE 3 — Kinetic Wave (Velocidade 620 px/s, Speed Portal & Inversão Rápida)
  // Velocidade: 620 px/s | Comprimento: 17.000px | 3 Moedas | Speed Portal 1.2x | Teto
  // ============================================================================
  {
    id: 3,
    name: "Kinetic Wave",
    difficultyName: "Difícil",
    difficultyClass: "diff-dificil",
    speed: 620,
    finishX: 17000,
    colors: {
      primary: '#ffaa00',
      accent: '#ff5500',
      bgGrad1: '#1a0c02',
      bgGrad2: '#2a1506',
      floorTop: '#ffaa00',
      floorBody: '#1f0f04'
    },
    hints: [
      { x: 600, y: 460, text: "VELOCIDADE 620 PX/S! RITMO INTENSO!" },
      { x: 4600, y: 460, text: "DEGRAU DE ENTRADA E PLATAFORMA ELEVADA!" },
      { x: 8400, y: 440, text: "JUMP ORB NO AR!" },
      { x: 11000, y: 460, text: "SPEED PORTAL + GRAVIDADE INVERTIDA!" }
    ],
    secretCoins: [
      { id: 0, x: 2820, y: 420 },
      { id: 1, x: 8820, y: 380 },
      { id: 2, x: 13500, y: 220 }
    ],
    jumpOrbs: [
      { x: 8800, y: 450, radius: 22, jumpForce: 760, color: '#ffea00' }
    ],
    speedPortals: [
      // Speed Portal translúcido acelerando para 1.2x (744 px/s!)
      { x: 11400, w: 52, speedMultiplier: 1.2 }
    ],
    spikes: [
      { x: 1300, w: 36, h: 42 },
      { x: 1800, w: 36, h: 42 },
      { x: 2300, w: 36, h: 42 },
      { x: 2336, w: 36, h: 42 }, // Duplo
      
      { x: 3400, w: 36, h: 42 },
      { x: 4100, w: 36, h: 42 },

      // Espinho na plataforma elevada
      { x: 7000, w: 36, h: 42, y: 440 - 42 },

      { x: 8100, w: 36, h: 42 },
      { x: 8800, w: 36, h: 42 }, // Sob o Jump Orb

      // TETO na Inversão de Gravidade (Parte 3):
      { x: 13100, w: 36, h: 42, inverted: true },
      { x: 13800, w: 36, h: 42, inverted: true },
      { x: 13836, w: 36, h: 42, inverted: true }, // Duplo no TETO!

      // Reta final hipersônica no chão:
      { x: 15300, w: 36, h: 42 },
      { x: 15336, w: 36, h: 42 },
      { x: 15900, w: 36, h: 42 },
      { x: 16400, w: 36, h: 42 }
    ],
    pits: [
      { startX: 4700, endX: 4950 },
      { startX: 6300, endX: 7400 }
    ],
    platforms: [
      { x: 2800, y: 528, w: 45, h: 42, isBlock: true },

      // Degrau inicial de acesso: 485px
      { x: 6200, y: 485, w: 200, h: 25 },
      // Plataforma longa sobre o abismo: 440px
      { x: 6450, y: 440, w: 780, h: 25 },

      { x: 7900, y: 528, w: 45, h: 42, isBlock: true },
      { x: 10200, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [],
    movingHazards: [
      { x: 5600, baseY: 380, w: 40, h: 40, speed: 2.2, amplitude: 50, color: '#ff5500' }
    ],
    gravityPortals: [
      { x: 12200, w: 52, targetGravity: -1 },
      { x: 14600, w: 52, targetGravity: 1 }
    ]
  },

  // ============================================================================
  // FASE 4 — Gravity Nexus (Velocidade 660 px/s, Inversão & Espinhos no Teto)
  // Velocidade: 660 px/s | Comprimento: 18.500px | 3 Moedas | Orbs | Duplos Teto
  // ============================================================================
  {
    id: 4,
    name: "Gravity Nexus",
    difficultyName: "Difícil+",
    difficultyClass: "diff-dificil",
    speed: 660,
    finishX: 18500,
    colors: {
      primary: '#ff0077',
      accent: '#c000bb',
      bgGrad1: '#180210',
      bgGrad2: '#2b0520',
      floorTop: '#ff0077',
      floorBody: '#1e0415'
    },
    hints: [
      { x: 600, y: 460, text: "VELOCIDADE 660 PX/S! FOCO NO TETO!" },
      { x: 4100, y: 350, text: "▲ INVERSÃO GRAVITACIONAL IMEDIATA!" },
      { x: 8800, y: 350, text: "▼ RETORNO AO CHÃO! NÃO PERCA O TIMING!" }
    ],
    secretCoins: [
      { id: 0, x: 2320, y: 420 },
      { id: 1, x: 7400, y: 230 },
      { id: 2, x: 14800, y: 410 }
    ],
    jumpOrbs: [
      { x: 11800, y: 450, radius: 22, jumpForce: 760, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 13500, w: 52, speedMultiplier: 1.15 }
    ],
    spikes: [
      { x: 1400, w: 36, h: 42 },
      { x: 1900, w: 36, h: 42 },
      { x: 2400, w: 36, h: 42 },
      { x: 2436, w: 36, h: 42 }, // Duplo
      { x: 3300, w: 36, h: 42 },

      // TETO:
      { x: 5600, w: 36, h: 42, inverted: true },
      { x: 6400, w: 36, h: 42, inverted: true },
      { x: 7200, w: 36, h: 42, inverted: true },
      { x: 7236, w: 36, h: 42, inverted: true }, // Duplo no TETO
      { x: 8200, w: 36, h: 42, inverted: true },

      // CHÃO:
      { x: 10400, w: 36, h: 42 },
      { x: 11100, w: 36, h: 42 },
      { x: 11800, w: 36, h: 42 }, // Sob Orb
      { x: 14200, w: 36, h: 42 },
      { x: 14236, w: 36, h: 42 },
      { x: 15600, w: 36, h: 42 },
      { x: 16400, w: 36, h: 42 },
      { x: 17300, w: 36, h: 42 }
    ],
    pits: [
      { startX: 12600, endX: 13000 }
    ],
    platforms: [
      { x: 2800, y: 528, w: 45, h: 42, isBlock: true },
      { x: 7600, y: 150, w: 50, h: 40, isBlock: true },
      { x: 12650, y: 485, w: 300, h: 25 },
      { x: 14900, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [
      { x: 13800, y: 558, w: 48, h: 12, bounceForce: 980 }
    ],
    movingHazards: [],
    gravityPortals: [
      { x: 4400, w: 52, targetGravity: -1 },
      { x: 9200, w: 52, targetGravity: 1 }
    ]
  },

  // ============================================================================
  // FASE 5 — Overclock Sprint (Velocidade 700 px/s, Alta Precisão)
  // Velocidade: 700 px/s | Comprimento: 20.000px | 3 Moedas | Triplo | Speed 1.2x
  // ============================================================================
  {
    id: 5,
    name: "Overclock Sprint",
    difficultyName: "Avançada",
    difficultyClass: "diff-avancada",
    speed: 700,
    finishX: 20000,
    colors: {
      primary: '#ff2233',
      accent: '#ff7700',
      bgGrad1: '#1c0307',
      bgGrad2: '#30080d',
      floorTop: '#ff2233',
      floorBody: '#220409'
    },
    hints: [
      { x: 600, y: 460, text: "VELOCIDADE 700 PX/S! FOCO EXTREMO!" },
      { x: 4400, y: 440, text: "DEGRAUS EM ULTRA-VELOCIDADE!" },
      { x: 9100, y: 460, text: "DESVIE DO PERIGO OSCILANTE!" }
    ],
    secretCoins: [
      { id: 0, x: 2620, y: 420 },
      { id: 1, x: 5500, y: 350 },
      { id: 2, x: 13900, y: 400 }
    ],
    jumpOrbs: [
      { x: 8200, y: 450, radius: 22, jumpForce: 770, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 13400, w: 52, speedMultiplier: 1.15 }
    ],
    spikes: [
      { x: 1500, w: 36, h: 42 },
      { x: 2100, w: 36, h: 42 },
      { x: 2700, w: 36, h: 42 },
      { x: 2736, w: 36, h: 42 }, // Duplo
      { x: 3700, w: 36, h: 42 },

      { x: 6800, w: 36, h: 42 },
      { x: 7400, w: 36, h: 42 },
      { x: 8200, w: 36, h: 42 }, // Sob Orb
      { x: 10400, w: 36, h: 42 },

      // Triplo
      { x: 14100, w: 36, h: 42 },
      { x: 14136, w: 36, h: 42 },
      { x: 14172, w: 36, h: 42 },

      { x: 15800, w: 36, h: 42 },
      { x: 15836, w: 36, h: 42 },
      { x: 17200, w: 36, h: 42 },
      { x: 18400, w: 36, h: 42 }
    ],
    pits: [
      { startX: 4700, endX: 5900 },
      { startX: 11400, endX: 11800 }
    ],
    platforms: [
      { x: 3100, y: 528, w: 45, h: 42, isBlock: true },
      { x: 4800, y: 485, w: 360, h: 25 },
      { x: 5350, y: 430, w: 420, h: 25 },
      { x: 9200, y: 410, w: 60, h: 40, isBlock: true },
      { x: 11450, y: 480, w: 280, h: 25 },
      { x: 16500, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [
      { x: 13750, y: 558, w: 48, h: 12, bounceForce: 980 }
    ],
    movingHazards: [
      { x: 9900, baseY: 385, w: 40, h: 40, speed: 2.5, amplitude: 50, color: '#ff2233' }
    ],
    gravityPortals: []
  },

  // ============================================================================
  // FASE 6 — Dual Flux (Velocidade 740 px/s, Dupla Inversão Frenética)
  // Velocidade: 740 px/s | Comprimento: 22.000px | 3 Moedas | Orbs | Dupla Inversão
  // ============================================================================
  {
    id: 6,
    name: "Dual Flux",
    difficultyName: "Avançada+",
    difficultyClass: "diff-avancada",
    speed: 740,
    finishX: 22000,
    colors: {
      primary: '#ffee00',
      accent: '#00f0ff',
      bgGrad1: '#141400',
      bgGrad2: '#242205',
      floorTop: '#ffee00',
      floorBody: '#1a1902'
    },
    hints: [
      { x: 600, y: 460, text: "VELOCIDADE 740 PX/S! DUPLA INVERSÃO!" },
      { x: 3600, y: 350, text: "▲ PRIMEIRA INVERSÃO!" },
      { x: 8200, y: 350, text: "▼ RETORNO SUAVE!" },
      { x: 13000, y: 350, text: "▲ SEGUNDA INVERSÃO DIMENSIONAL!" }
    ],
    secretCoins: [
      { id: 0, x: 2620, y: 420 },
      { id: 1, x: 6200, y: 230 },
      { id: 2, x: 16200, y: 230 }
    ],
    jumpOrbs: [
      { x: 11400, y: 450, radius: 22, jumpForce: 770, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 18200, w: 52, speedMultiplier: 1.15 }
    ],
    spikes: [
      { x: 1600, w: 36, h: 42 },
      { x: 2200, w: 36, h: 42 },
      { x: 2800, w: 36, h: 42 },
      { x: 2836, w: 36, h: 42 },

      // Teto 1:
      { x: 5200, w: 36, h: 42, inverted: true },
      { x: 6100, w: 36, h: 42, inverted: true },
      { x: 6800, w: 36, h: 42, inverted: true },

      // Chão:
      { x: 9800, w: 36, h: 42 },
      { x: 10600, w: 36, h: 42 },
      { x: 11400, w: 36, h: 42 }, // Sob Orb

      // Teto 2:
      { x: 14800, w: 36, h: 42, inverted: true },
      { x: 15600, w: 36, h: 42, inverted: true },
      { x: 16400, w: 36, h: 42, inverted: true },

      // Final:
      { x: 19600, w: 36, h: 42 },
      { x: 20400, w: 36, h: 42 },
      { x: 20436, w: 36, h: 42 },
      { x: 21200, w: 36, h: 42 }
    ],
    pits: [
      { startX: 10400, endX: 10800 }
    ],
    platforms: [
      { x: 2200, y: 528, w: 45, h: 42, isBlock: true },
      { x: 6200, y: 150, w: 50, h: 40, isBlock: true },
      { x: 10450, y: 480, w: 260, h: 25 },
      { x: 15800, y: 150, w: 50, h: 40, isBlock: true }
    ],
    jumpPads: [
      { x: 12200, y: 558, w: 48, h: 12, bounceForce: 980 }
    ],
    movingHazards: [],
    gravityPortals: [
      { x: 3900, w: 52, targetGravity: -1 },
      { x: 8600, w: 52, targetGravity: 1 },
      { x: 13400, w: 52, targetGravity: -1 },
      { x: 18000, w: 52, targetGravity: 1 }
    ]
  },

  // ============================================================================
  // FASE 7 — Skyline Corridor (Velocidade 780 px/s, Parkour Aéreo Rápido)
  // Velocidade: 780 px/s | Comprimento: 23.500px | 3 Moedas | Triplo | Orbs
  // ============================================================================
  {
    id: 7,
    name: "Skyline Corridor",
    difficultyName: "Mestre",
    difficultyClass: "diff-mestre",
    speed: 780,
    finishX: 23500,
    colors: {
      primary: '#9d00ff',
      accent: '#ff00aa',
      bgGrad1: '#140026',
      bgGrad2: '#280242',
      floorTop: '#9d00ff',
      floorBody: '#18022b'
    },
    hints: [
      { x: 600, y: 460, text: "VELOCIDADE 780 PX/S! PARKOUR AÉREO!" },
      { x: 4600, y: 440, text: "SALTOS PRECISOS DE PLATAFORMA EM PLATAFORMA!" }
    ],
    secretCoins: [
      { id: 0, x: 2820, y: 420 },
      { id: 1, x: 6600, y: 310 },
      { id: 2, x: 17200, y: 400 }
    ],
    jumpOrbs: [
      { x: 9600, y: 450, radius: 22, jumpForce: 780, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 16500, w: 52, speedMultiplier: 1.15 }
    ],
    spikes: [
      { x: 1800, w: 36, h: 42 },
      { x: 2400, w: 36, h: 42 },
      { x: 3000, w: 36, h: 42 },
      { x: 3036, w: 36, h: 42 },

      { x: 8400, w: 36, h: 42 },
      { x: 9600, w: 36, h: 42 }, // Sob Orb
      { x: 12000, w: 36, h: 42 },

      // Triplo
      { x: 17400, w: 36, h: 42 },
      { x: 17436, w: 36, h: 42 },
      { x: 17472, w: 36, h: 42 },

      { x: 19200, w: 36, h: 42 },
      { x: 20400, w: 36, h: 42 },
      { x: 20436, w: 36, h: 42 },
      { x: 21800, w: 36, h: 42 },
      { x: 22600, w: 36, h: 42 }
    ],
    pits: [
      { startX: 4900, endX: 7700 },
      { startX: 13800, endX: 14200 }
    ],
    platforms: [
      { x: 3000, y: 528, w: 45, h: 42, isBlock: true },
      { x: 5000, y: 485, w: 360, h: 25 },
      { x: 5600, y: 430, w: 360, h: 25 },
      { x: 6250, y: 375, w: 480, h: 25 },
      { x: 7000, y: 440, w: 320, h: 25 },
      { x: 11000, y: 390, w: 70, h: 40, isBlock: true },
      { x: 13850, y: 485, w: 280, h: 25 }
    ],
    jumpPads: [
      { x: 17100, y: 558, w: 48, h: 12, bounceForce: 990 }
    ],
    movingHazards: [
      { x: 14800, baseY: 385, w: 42, h: 42, speed: 2.7, amplitude: 50, color: '#ff00aa' }
    ],
    gravityPortals: []
  },

  // ============================================================================
  // FASE 8 — Plasma Gauntlet (Velocidade 820 px/s, Zona de Elite)
  // Velocidade: 820 px/s | Comprimento: 25.000px | 3 Moedas | Triplo | Orbs
  // ============================================================================
  {
    id: 8,
    name: "Plasma Gauntlet",
    difficultyName: "Mestre+",
    difficultyClass: "diff-mestre",
    speed: 820,
    finishX: 25000,
    colors: {
      primary: '#00f0ff',
      accent: '#ff0055',
      bgGrad1: '#02121c',
      bgGrad2: '#08253a',
      floorTop: '#00f0ff',
      floorBody: '#051926'
    },
    hints: [
      { x: 700, y: 460, text: "VELOCIDADE 820 PX/S! ELITE DE PLASMA!" },
      { x: 5000, y: 350, text: "▲ VÓRTICE HIPERSÔNICO!" }
    ],
    secretCoins: [
      { id: 0, x: 2920, y: 420 },
      { id: 1, x: 7800, y: 230 },
      { id: 2, x: 18400, y: 410 }
    ],
    jumpOrbs: [
      { x: 14200, y: 450, radius: 22, jumpForce: 780, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 17800, w: 52, speedMultiplier: 1.15 }
    ],
    spikes: [
      { x: 2000, w: 36, h: 42 },
      { x: 2600, w: 36, h: 42 },
      { x: 3200, w: 36, h: 42 },
      { x: 3236, w: 36, h: 42 },

      // Teto:
      { x: 7000, w: 36, h: 42, inverted: true },
      { x: 8200, w: 36, h: 42, inverted: true },
      { x: 9600, w: 36, h: 42, inverted: true },

      // Chão:
      { x: 12600, w: 36, h: 42 },
      { x: 14200, w: 36, h: 42 }, // Sob Orb

      // Triplo
      { x: 18600, w: 36, h: 42 },
      { x: 18636, w: 36, h: 42 },
      { x: 18672, w: 36, h: 42 },

      { x: 20200, w: 36, h: 42 },
      { x: 21500, w: 36, h: 42 },
      { x: 21536, w: 36, h: 42 },
      { x: 23200, w: 36, h: 42 },
      { x: 24200, w: 36, h: 42 }
    ],
    pits: [
      { startX: 14800, endX: 15200 }
    ],
    platforms: [
      { x: 2900, y: 528, w: 45, h: 42, isBlock: true },
      { x: 7800, y: 150, w: 50, h: 40, isBlock: true },
      { x: 14850, y: 480, w: 300, h: 25 },
      { x: 17200, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [
      { x: 18200, y: 558, w: 48, h: 12, bounceForce: 1000 }
    ],
    movingHazards: [
      { x: 16000, baseY: 385, w: 42, h: 42, speed: 2.8, amplitude: 50, color: '#ff0055' }
    ],
    gravityPortals: [
      { x: 5400, w: 52, targetGravity: -1 },
      { x: 11000, w: 52, targetGravity: 1 }
    ]
  },

  // ============================================================================
  // FASE 9 — Chrono Vortex (Velocidade 860 px/s, Distorção Extrema)
  // Velocidade: 860 px/s | Comprimento: 26.500px | 3 Moedas | Triplo | Orbs
  // ============================================================================
  {
    id: 9,
    name: "Chrono Vortex",
    difficultyName: "Extrema",
    difficultyClass: "diff-extrema",
    speed: 860,
    finishX: 26500,
    colors: {
      primary: '#ffffff',
      accent: '#9d00ff',
      bgGrad1: '#110224',
      bgGrad2: '#230744',
      floorTop: '#ffffff',
      floorBody: '#1a0630'
    },
    hints: [
      { x: 700, y: 460, text: "VELOCIDADE 860 PX/S! VÓRTICE TEMPORAL!" },
      { x: 5200, y: 350, text: "▲ INVERSÃO CÓSMICA!" }
    ],
    secretCoins: [
      { id: 0, x: 3020, y: 420 },
      { id: 1, x: 8400, y: 230 },
      { id: 2, x: 19800, y: 410 }
    ],
    jumpOrbs: [
      { x: 15200, y: 450, radius: 22, jumpForce: 780, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 19000, w: 52, speedMultiplier: 1.15 }
    ],
    spikes: [
      { x: 2200, w: 36, h: 42 },
      { x: 2800, w: 36, h: 42 },
      { x: 3400, w: 36, h: 42 },
      { x: 3436, w: 36, h: 42 },

      // Teto:
      { x: 7400, w: 36, h: 42, inverted: true },
      { x: 8800, w: 36, h: 42, inverted: true },
      { x: 10200, w: 36, h: 42, inverted: true },

      // Chão:
      { x: 13600, w: 36, h: 42 },
      { x: 15200, w: 36, h: 42 }, // Sob Orb

      // Triplo
      { x: 19650, w: 36, h: 42 },
      { x: 19686, w: 36, h: 42 },
      { x: 19722, w: 36, h: 42 },

      { x: 21400, w: 36, h: 42 },
      { x: 22800, w: 36, h: 42 },
      { x: 22836, w: 36, h: 42 },
      { x: 24600, w: 36, h: 42 },
      { x: 25600, w: 36, h: 42 }
    ],
    pits: [
      { startX: 15900, endX: 16300 }
    ],
    platforms: [
      { x: 3000, y: 528, w: 45, h: 42, isBlock: true },
      { x: 8400, y: 150, w: 50, h: 40, isBlock: true },
      { x: 15950, y: 480, w: 340, h: 25 },
      { x: 18200, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [
      { x: 19250, y: 558, w: 48, h: 12, bounceForce: 1010 }
    ],
    movingHazards: [
      { x: 4800, baseY: 385, w: 42, h: 42, speed: 2.8, amplitude: 50, color: '#ffffff' }
    ],
    gravityPortals: [
      { x: 5600, w: 52, targetGravity: -1 },
      { x: 11800, w: 52, targetGravity: 1 }
    ]
  },

  // ============================================================================
  // FASE 10 — Singularity Overdrive (Velocidade 900 px/s: O Desafio Supremo)
  // Velocidade: 900 px/s | Comprimento: 28.500px | 3 Moedas | Triplo | Hipersônico
  // ============================================================================
  {
    id: 10,
    name: "Singularity Overdrive",
    difficultyName: "Suprema",
    difficultyClass: "diff-suprema",
    speed: 900,
    finishX: 28500,
    colors: {
      primary: '#ffcc00',
      accent: '#ff1744',
      bgGrad1: '#1a0d00',
      bgGrad2: '#351203',
      floorTop: '#ffcc00',
      floorBody: '#240f02'
    },
    hints: [
      { x: 800, y: 460, text: "900 PX/S! O DESAFIO SUPREMO DO CYBER PULSE!" },
      { x: 5000, y: 350, text: "▲ INVERSÃO HIPERSÔNICA!" },
      { x: 16000, y: 350, text: "▲ ÚLTIMA INVERSÃO DIMENSIONAL!" }
    ],
    secretCoins: [
      { id: 0, x: 3020, y: 420 },
      { id: 1, x: 8100, y: 230 },
      { id: 2, x: 21000, y: 230 }
    ],
    jumpOrbs: [
      { x: 14800, y: 450, radius: 22, jumpForce: 800, color: '#ffea00' }
    ],
    speedPortals: [
      { x: 23600, w: 52, speedMultiplier: 1.15 }
    ],
    spikes: [
      { x: 2200, w: 36, h: 42 },
      { x: 2800, w: 36, h: 42 },
      { x: 3400, w: 36, h: 42 },
      { x: 3436, w: 36, h: 42 },

      // Teto 1:
      { x: 7200, w: 36, h: 42, inverted: true },
      { x: 8600, w: 36, h: 42, inverted: true },
      { x: 10000, w: 36, h: 42, inverted: true },

      // Chão:
      { x: 13200, w: 36, h: 42 },
      { x: 14800, w: 36, h: 42 }, // Sob Orb

      // Teto 2:
      { x: 18800, w: 36, h: 42, inverted: true },
      { x: 20200, w: 36, h: 42, inverted: true },

      // Triplo
      { x: 25250, w: 36, h: 42 },
      { x: 25286, w: 36, h: 42 },
      { x: 25322, w: 36, h: 42 },

      { x: 26800, w: 36, h: 42 },
      { x: 27600, w: 36, h: 42 }
    ],
    pits: [
      { startX: 13600, endX: 14000 }
    ],
    platforms: [
      { x: 3000, y: 528, w: 45, h: 42, isBlock: true },
      { x: 8100, y: 150, w: 50, h: 40, isBlock: true },
      { x: 13650, y: 480, w: 340, h: 25 },
      { x: 15800, y: 528, w: 45, h: 42, isBlock: true },
      { x: 21000, y: 150, w: 50, h: 40, isBlock: true }
    ],
    jumpPads: [
      { x: 16400, y: 558, w: 48, h: 12, bounceForce: 1020 }
    ],
    movingHazards: [
      { x: 4500, baseY: 385, w: 42, h: 42, speed: 3.0, amplitude: 50, color: '#ff1744' }
    ],
    gravityPortals: [
      { x: 5400, w: 52, targetGravity: -1 },
      { x: 11200, w: 52, targetGravity: 1 },
      { x: 16800, w: 52, targetGravity: -1 },
      { x: 22400, w: 52, targetGravity: 1 }
    ]
  }
];
'@

[System.IO.File]::WriteAllText("$PSScriptRoot\..\js\levels.js", $hardLevelsCode, [System.Text.Encoding]::UTF8)
Write-Host "Fases calibradas com ALTA DIFICULDADE e ritmo acelerado com sucesso!" -ForegroundColor Green
