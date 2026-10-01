/**
 * ==============================================================================
 * CYBER PULSE — js/levels.js
 * Design Completo das 10 Fases Neon — Geometria, Ritmo e Espaçamento Perfeitos
 * ==============================================================================
 * 
 * DIRETRIZES DE DESIGN APLICADAS:
 * 1. ESPAÇAMENTO GENEROSO: Distância ampla entre obstáculos (1200px a 1800px no início)
 *    para o jogador reagir, respirar e calcular os saltos com calma e prazer.
 * 2. PROGRESSÃO NATURAL DE DIFICULDADE: Cada fase começa acessível e ganha ritmo
 *    gradualmente, sem picos injustos de frustração.
 * 3. GRANDE VARIEDADE DE OBSTÁCULOS:
 *    - Espinhos no chão (solos e duplos bem calculados)
 *    - Blocos sólidos no chão para pular por cima (estilo clássico Geometry Dash)
 *    - Plataformas em diferentes alturas (degraus baixos, médios e altos)
 *    - Obstáculos e espinhos suspensos / espinhos no teto
 *    - Buracos no chão (abismos seguros de 200px a 240px, e abismos com ilha central)
 *    - Trampolins neon (Jump Pads com salto alto e sobrevoo emocionante)
 *    - Portais de inversão gravitacional (chão ao teto) com pista de estabilização
 *    - Combinações rítmicas variadas (sem repetições monótonas)
 * 4. 100% JUSTO E POSSÍVEL: Toda a física foi calibrada matematicamente.
 */

'use strict';

const LEVELS = [
  // ============================================================================
  // FASE 1 — Neon Dawn (Tutorial Amigável & Introdução aos Desafios)
  // Velocidade: 430 px/s | Comprimento: 12.500px | Espaçamento: 1200px a 1600px
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
      { x: 600, y: 460, text: "ESPAÇO, W OU TOQUE PARA PULAR" },
      { x: 2600, y: 460, text: "PULANDO O PRIMEIRO BLOCO!" },
      { x: 4000, y: 460, text: "SALTO LIMPO SOBRE O ABISMO!" },
      { x: 5400, y: 440, text: "SUBA NA PLATAFORMA SUSPENSA!" },
      { x: 7800, y: 460, text: "TRAMPOLIM NEON! DEIXE-SE LANÇAR!" },
      { x: 9900, y: 460, text: "DESAFIO FINAL: ESPINHO DUPLO!" }
    ],
    spikes: [
      // 1. Primeiro espinho simples — bem distante do início (1700px livres)
      { x: 1700, w: 36, h: 42 },

      // 2. Espinho solo após a plataforma (com 1100px de preparação)
      { x: 7200, w: 36, h: 42 },

      // 3. Fileira dupla sobrevoada pelo trampolim em x: 8150
      { x: 8400, w: 36, h: 42 },
      { x: 8436, w: 36, h: 42 },

      // 4. Espinho duplo de desafio final (com 1100px livres antes)
      { x: 10400, w: 36, h: 42 },
      { x: 10436, w: 36, h: 42 },

      // 5. Salto comemorativo final
      { x: 11600, w: 36, h: 42 }
    ],
    pits: [
      // Abismo 1: Vão de 220px (o pulo cobre 276px, passa com folga tranquila)
      { startX: 4400, endX: 4620 },
      // Abismo 2: Abismo com plataforma de travessia ampla
      { startX: 5700, endX: 6150 }
    ],
    platforms: [
      // Bloco sólido no chão para pular por cima (altura 42px)
      { x: 3100, y: 528, w: 45, h: 42, isBlock: true },

      // Plataforma suspensa sobre o abismo 2 (ampla e confortável para pouso)
      { x: 5750, y: 485, w: 320, h: 25 },

      // Bloco intermediário
      { x: 9300, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [
      // Trampolim que arremessa alto sobre o obstáculo duplo
      { x: 8150, y: 558, w: 48, h: 12, bounceForce: 950 }
    ],
    movingHazards: [],
    gravityPortals: []
  },

  // ============================================================================
  // FASE 2 — Cyber Chasm (Parkour de Plataformas em Alturas Diferentes)
  // Velocidade: 470 px/s | Comprimento: 14.500px | Espaçamento: 1100px a 1500px
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
      { x: 600, y: 460, text: "NOVOS OBSTÁCULOS: DEGRAUS E BLOCOS!" },
      { x: 4000, y: 440, text: "PARKOUR EM PLATAFORMAS ESCALONADAS!" },
      { x: 7000, y: 460, text: "OBSTÁCULO SUSPENSO: PASSE POR BAIXO!" },
      { x: 9600, y: 460, text: "SUPER PULO COM TRAMPOLIM!" },
      { x: 12000, y: 460, text: "SEQUÊNCIA FINAL DE SALTOS!" }
    ],
    spikes: [
      { x: 1800, w: 36, h: 42 },

      // Espinho no degrau 2 (com 280px livres de corrida no degrau antes do espinho)
      { x: 5280, w: 36, h: 42, y: 420 - 42 },

      // Espinho no chão após os degraus
      { x: 6700, w: 36, h: 42 },
      { x: 8600, w: 36, h: 42 },

      // Fileira tripla sobrevoada pelo trampolim em 10000
      { x: 10250, w: 36, h: 42 },
      { x: 10286, w: 36, h: 42 },
      { x: 10322, w: 36, h: 42 },

      // Fileira dupla na reta final
      { x: 12200, w: 36, h: 42 },
      { x: 12236, w: 36, h: 42 },

      { x: 13500, w: 36, h: 42 }
    ],
    pits: [
      // Grande abismo com degraus suspensos
      { startX: 4300, endX: 5550 },
      // Abismo com plataforma de travessia
      { startX: 8850, endX: 9200 }
    ],
    platforms: [
      // Bloco para pular por cima
      { x: 3000, y: 528, w: 45, h: 42, isBlock: true },

      // Degraus em alturas diferentes sobre o abismo:
      // Degrau 1 (Baixo: y = 480)
      { x: 4400, y: 480, w: 340, h: 25 },
      // Degrau 2 (Médio: y = 420, comprimento 450px)
      { x: 5000, y: 420, w: 450, h: 25 },

      // Obstáculo suspenso no ar (corre por baixo no chão sem perigo)
      { x: 7400, y: 410, w: 60, h: 40, isBlock: true },

      // Plataforma sobre o abismo 2
      { x: 8900, y: 485, w: 260, h: 25 },

      // Bloco antes do fim
      { x: 11200, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [
      { x: 10000, y: 558, w: 48, h: 12, bounceForce: 960 }
    ],
    movingHazards: [],
    gravityPortals: []
  },

  // ============================================================================
  // FASE 3 — Kinetic Wave (Ritmo Fluido & Bloco Oscilante Suspenso)
  // Velocidade: 510 px/s | Comprimento: 16.000px | Espaçamento: 1100px a 1500px
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
      { x: 600, y: 460, text: "RITMO DINÂMICO! COMBINAÇÕES VARIADAS!" },
      { x: 2800, y: 440, text: "SUBINDO DE BLOCO EM BLOCO!" },
      { x: 5700, y: 440, text: "PERIGO OSCILANTE! OBSERVE A ONDA!" },
      { x: 9000, y: 460, text: "SALTOS RÍTMICOS BEM ESPAÇADOS!" },
      { x: 12300, y: 460, text: "GRANDE SALTO SOBRE O ABISMO!" }
    ],
    spikes: [
      { x: 2000, w: 36, h: 42 },
      { x: 4500, w: 36, h: 42 },

      // Espinho na plataforma longa (com 350px de corrida livre antes)
      { x: 7450, w: 36, h: 42, y: 440 - 42 },

      // Sequência rítmica com muito espaço de preparação
      { x: 9400, w: 36, h: 42 },
      { x: 10600, w: 36, h: 42 },
      { x: 10636, w: 36, h: 42 }, // Duplo

      // Fileira limpa com o trampolim em 12700
      { x: 13600, w: 36, h: 42 },
      { x: 13636, w: 36, h: 42 },

      { x: 14600, w: 36, h: 42 },
      { x: 15400, w: 36, h: 42 }
    ],
    pits: [
      { startX: 5300, endX: 5540 },
      { startX: 7000, endX: 7850 }, // Abismo superado por plataforma elevada
      { startX: 12950, endX: 13170 } // Vão de 220px seguro e cruzado com folga
    ],
    platforms: [
      { x: 3200, y: 528, w: 45, h: 42, isBlock: true },

      // Plataforma longa sobre o abismo 2 (largura 650px)
      { x: 7100, y: 440, w: 650, h: 25 },

      { x: 8400, y: 528, w: 45, h: 42, isBlock: true },
      { x: 11700, y: 528, w: 45, h: 42, isBlock: true }
    ],
    jumpPads: [
      { x: 12700, y: 558, w: 48, h: 12, bounceForce: 970 }
    ],
    movingHazards: [
      { x: 6100, baseY: 380, w: 40, h: 40, speed: 2.0, amplitude: 50, color: '#ff5500' }
    ],
    gravityPortals: []
  },

  // ============================================================================
  // FASE 4 — Gravity Nexus (Introdução ao Portal & Espinhos no Teto)
  // Velocidade: 550 px/s | Comprimento: 17.500px | Espaçamento: 1200px a 1600px
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
      { x: 700, y: 460, text: "O PORTAL INVERTE A GRAVIDADE!" },
      { x: 4100, y: 350, text: "▲ PORTAL! PREPARE-SE PARA CORRER NO TETO!" },
      { x: 6000, y: 240, text: "ESPINHO NO TETO! SALTE PARA BAIXO!" },
      { x: 9300, y: 350, text: "▼ PORTAL DE RETORNO AO CHÃO!" },
      { x: 12000, y: 460, text: "DESAFIO COMBINADO CHÃO E PLATAFORMA!" }
    ],
    spikes: [
      // Chão Inicial
      { x: 2000, w: 36, h: 42 },
      { x: 3200, w: 36, h: 42 },

      // TETO: O portal fica em x: 4400. Primeiro espinho em x: 6200 (1800px livres no teto!)
      { x: 6200, w: 36, h: 42, inverted: true },
      { x: 7500, w: 36, h: 42, inverted: true },
      { x: 8700, w: 36, h: 42, inverted: true },

      // CHÃO: O portal de retorno fica em x: 9600. Pouso seguro e livre até x: 11200 (1600px livres!)
      { x: 11200, w: 36, h: 42 },
      { x: 12400, w: 36, h: 42 },
      { x: 12436, w: 36, h: 42 }, // Duplo
      { x: 14750, w: 36, h: 42 },
      { x: 14786, w: 36, h: 42 },
      { x: 16200, w: 36, h: 42 }
    ],
    pits: [
      { startX: 13300, endX: 13700 }
    ],
    platforms: [
      { x: 2600, y: 528, w: 45, h: 42, isBlock: true },

      // Bloco invertido no teto
      { x: 8000, y: 150, w: 50, h: 40, isBlock: true },

      // Plataforma sobre o abismo de retorno
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
  // Velocidade: 590 px/s | Comprimento: 19.000px | Espaçamento: 1100px a 1500px
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
      { x: 700, y: 460, text: "ALTA VELOCIDADE! REAÇÃO PRECISA!" },
      { x: 4700, y: 440, text: "DEGRAUS EM ALTA VELOCIDADE!" },
      { x: 9300, y: 460, text: "DESVIE DO PERIGO OSCILANTE!" },
      { x: 14800, y: 460, text: "RETA FINAL DO SPRINT!" }
    ],
    spikes: [
      { x: 2200, w: 36, h: 42 },
      { x: 3600, w: 36, h: 42 },

      // Espinho após os degraus
      { x: 7200, w: 36, h: 42 },
      { x: 8500, w: 36, h: 42 },
      { x: 8536, w: 36, h: 42 }, // Duplo

      { x: 11200, w: 36, h: 42 },

      // Fileira tripla sobrevoada pelo trampolim em 13350
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

      // Degraus sobre o abismo (com espaçamento limpo entre eles):
      { x: 5000, y: 485, w: 320, h: 25 },
      { x: 5650, y: 425, w: 360, h: 25 },

      // Obstáculo suspenso
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
  // FASE 6 — Dual Flux (Dupla Inversão com Espaçamento Amplo no Teto e Chão)
  // Velocidade: 620 px/s | Comprimento: 21.000px | Espaçamento: 1200px a 1600px
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
      { x: 700, y: 460, text: "DUPLA INVERSÃO GRAVITACIONAL!" },
      { x: 3800, y: 350, text: "▲ PRIMEIRA INVERSÃO! FOCO NO TETO!" },
      { x: 8600, y: 350, text: "▼ RETORNO SUAVE AO CHÃO!" },
      { x: 13200, y: 350, text: "▲ SEGUNDA INVERSÃO! TIMING PRECISO!" },
      { x: 17400, y: 350, text: "▼ RETORNO FINAL PARA A CHEGADA!" }
    ],
    spikes: [
      // Chão Inicial
      { x: 2300, w: 36, h: 42 },
      { x: 3400, w: 36, h: 42 },

      // Teto 1 (Portal em x: 4200, primeiro espinho em x: 5800 -> 1600px livres!)
      { x: 5800, w: 36, h: 42, inverted: true },
      { x: 7200, w: 36, h: 42, inverted: true },

      // Chão Intermediário (Portal de volta em x: 9000, primeiro espinho em x: 10400)
      { x: 10400, w: 36, h: 42 },
      { x: 12200, w: 36, h: 42 },
      { x: 12236, w: 36, h: 42 }, // Duplo

      // Teto 2 (Portal em x: 13600, primeiro espinho em x: 15200)
      { x: 15200, w: 36, h: 42, inverted: true },
      { x: 16500, w: 36, h: 42, inverted: true },

      // Chão Final (Portal de volta em x: 17800)
      { x: 19200, w: 36, h: 42 },
      { x: 20100, w: 36, h: 42 }
    ],
    pits: [
      { startX: 11200, endX: 11600 }
    ],
    platforms: [
      { x: 2800, y: 528, w: 45, h: 42, isBlock: true },

      // Bloco no teto 1
      { x: 6500, y: 150, w: 50, h: 40, isBlock: true },

      // Plataforma no chão intermediário
      { x: 11250, y: 480, w: 260, h: 25 },

      // Bloco no teto 2
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
  // FASE 7 — Skyline Corridor (Parkour Aéreo em 3 Alturas & Obstáculos Suspensos)
  // Velocidade: 650 px/s | Comprimento: 22.500px | Espaçamento: 1200px a 1600px
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
      { x: 700, y: 460, text: "PARKOUR AÉREO NAS ALTURAS!" },
      { x: 4800, y: 440, text: "DEGRAUS: BAIXO, MÉDIO E ALTO!" },
      { x: 11000, y: 460, text: "OBSTÁCULOS SUSPENSOS: FIQUE ATENTO!" },
      { x: 15800, y: 460, text: "TRAMPOLIM PARA A CORRIDA FINAL!" }
    ],
    spikes: [
      { x: 2400, w: 36, h: 42 },
      { x: 3800, w: 36, h: 42 },

      // Espinho no chão após descer do degrau alto
      { x: 8600, w: 36, h: 42 },
      { x: 9900, w: 36, h: 42 },
      { x: 9936, w: 36, h: 42 }, // Duplo

      // Espinho solo após o bloco suspenso (1000px de preparação)
      { x: 12400, w: 36, h: 42 },

      // Fileira tripla sobrevoada pelo trampolim em 16100
      { x: 16400, w: 36, h: 42 },
      { x: 16436, w: 36, h: 42 },
      { x: 16472, w: 36, h: 42 },

      { x: 18200, w: 36, h: 42 },
      { x: 19600, w: 36, h: 42 },
      { x: 19636, w: 36, h: 42 },
      { x: 21200, w: 36, h: 42 }
    ],
    pits: [
      { startX: 5100, endX: 7900 }, // Vão aéreo coberto por degraus
      { startX: 14150, endX: 14550 }
    ],
    platforms: [
      { x: 3100, y: 528, w: 45, h: 42, isBlock: true },

      // Parkour em 3 alturas diferentes:
      { x: 5200, y: 490, w: 340, h: 25 },
      { x: 5850, y: 430, w: 340, h: 25 },
      { x: 6500, y: 370, w: 450, h: 25 }, // Degrau alto amplo e limpo
      { x: 7250, y: 450, w: 320, h: 25 },

      // Bloco suspenso (corre por baixo no chão)
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
  // Velocidade: 680 px/s | Comprimento: 24.000px | Espaçamento: 1300px a 1700px
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
      { x: 800, y: 460, text: "ZONA DE PLASMA! REFLEXOS DE ELITE!" },
      { x: 5200, y: 350, text: "▲ VÓRTICE GRAVITACIONAL IMINENTE!" },
      { x: 11000, y: 350, text: "▼ RETORNO COM RESPIRO E PREPARAÇÃO!" },
      { x: 16900, y: 460, text: "COMBINAÇÃO TÁTICA: BLOCO E TRAMPOLIM!" }
    ],
    spikes: [
      { x: 2500, w: 36, h: 42 },
      { x: 3900, w: 36, h: 42 },
      { x: 3936, w: 36, h: 42 },

      // Teto (Portal em 5600, primeiro espinho em 7400 -> 1800px livres!)
      { x: 7400, w: 36, h: 42, inverted: true },
      { x: 8900, w: 36, h: 42, inverted: true },
      { x: 10300, w: 36, h: 42, inverted: true },

      // Chão Pós-Retorno (Portal em 11400, primeiro espinho em 13200 -> 1800px livres!)
      { x: 13200, w: 36, h: 42 },
      { x: 14700, w: 36, h: 42 },

      // Fileira tripla limpa com trampolim em 17400
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

      // Bloco no teto
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
  // Velocidade: 710 px/s | Comprimento: 25.500px | Espaçamento: 1300px a 1800px
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
      { x: 800, y: 460, text: "O VÓRTICE TEMPORAL: FOCO ABSOLUTO!" },
      { x: 5600, y: 350, text: "▲ VÓRTICE CÓSMICO: TRANSIÇÃO LIMPA!" },
      { x: 12000, y: 350, text: "▼ RETORNO ESTABILIZADO AO CHÃO!" },
      { x: 18000, y: 460, text: "CORRIDA FINAL ATRAVÉS DO TEMPO!" }
    ],
    spikes: [
      { x: 2600, w: 36, h: 42 },
      { x: 4100, w: 36, h: 42 },
      { x: 4136, w: 36, h: 42 },

      // Teto (Portal em 6000, primeiro espinho em 7900 -> 1900px livres!)
      { x: 7900, w: 36, h: 42, inverted: true },
      { x: 9500, w: 36, h: 42, inverted: true },
      { x: 11100, w: 36, h: 42, inverted: true },

      // Chão Pós-Retorno (Portal em 12400, primeiro espinho em 14200)
      { x: 14200, w: 36, h: 42 },
      { x: 15800, w: 36, h: 42 },

      // Fileira limpa com trampolim em 18500
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

      // Bloco no teto
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
  // Velocidade: 750 px/s | Comprimento: 27.500px | Espaçamento: 1400px a 1900px
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
      { x: 800, y: 460, text: "A SINGULARIDADE FINAL! PROVE SEU VALOR!" },
      { x: 5400, y: 350, text: "▲ INVERSÃO HIPERSÔNICA!" },
      { x: 11400, y: 350, text: "▼ RETORNO AO CHÃO! SINTA O RITMO!" },
      { x: 17000, y: 350, text: "▲ ÚLTIMA INVERSÃO DIMENSIONAL!" },
      { x: 22600, y: 350, text: "▼ CORRIDA SUPREMA PARA A COROA!" }
    ],
    spikes: [
      // Chão Inicial
      { x: 2600, w: 36, h: 42 },
      { x: 4100, w: 36, h: 42 },
      { x: 4136, w: 36, h: 42 },

      // Teto 1 (Portal em 5800, primeiro espinho em 7700 -> 1900px livres!)
      { x: 7700, w: 36, h: 42, inverted: true },
      { x: 9400, w: 36, h: 42, inverted: true },
      { x: 10800, w: 36, h: 42, inverted: true },

      // Chão Intermediário (Portal em 11800, primeiro espinho em 13700)
      { x: 13700, w: 36, h: 42 },
      { x: 15300, w: 36, h: 42 },
      { x: 15336, w: 36, h: 42 },

      // Teto 2 (Portal em 17500, primeiro espinho em 19400)
      { x: 19400, w: 36, h: 42, inverted: true },
      { x: 21100, w: 36, h: 42, inverted: true },

      // Grande Sprint Final no Chão (Portal de volta em 23000)
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

      // Bloco no teto 1
      { x: 8500, y: 150, w: 50, h: 40, isBlock: true },

      { x: 14100, y: 480, w: 340, h: 25 },
      { x: 16200, y: 528, w: 45, h: 42, isBlock: true },

      // Bloco no teto 2
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
