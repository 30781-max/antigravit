/**
 * ==============================================================================
 * CYBER PULSE — js/config.js
 * Configurações Gerais e Constantes Físicas do Jogo (Inspirado em Geometry Dash)
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

/**
 * Constantes globais de configuração do jogo
 */
const CONFIG = {
  // Dimensões nativas do Canvas (formato 16:9 widescreen)
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,

  // Altura das superfícies de contato
  GROUND_Y: 570,          // Altura onde fica a linha do chão normal
  CEILING_Y: 150,         // Altura onde fica a linha do teto (para gravidade invertida)

  // Propriedades do Jogador (Cubo Neon)
  PLAYER_SIZE: 38,        // Largura e altura do cubo (em pixels)

  // ============================================================================
  // VELOCIDADE FIXA E CONTROLADA DO PERSONAGEM (Variável Central do Sistema)
  // ============================================================================
  // Velocidade padrão consistente para todo o jogo (pode ser ajustada aqui para calibrar tudo)
  PLAYER_SPEED: 450,

  // Escala controlada e intencional de velocidade por fase (progressão suave e previsível)
  LEVEL_SPEED_TABLE: {
    1: 420,  // Fase 1: Neon Dawn (Fácil / Introdução ao ritmo)
    2: 435,  // Fase 2: Cyber Chasm (Iniciante)
    3: 450,  // Fase 3: Kinetic Wave (Normal - Velocidade padrão)
    4: 470,  // Fase 4: Gravity Nexus (Avançado)
    5: 490,  // Fase 5: Overclock Sprint (Desafiador)
    6: 510,  // Fase 6: Dual Flux (Difícil)
    7: 530,  // Fase 7: Skyline Corridor (Muito Difícil)
    8: 550,  // Fase 8: Plasma Gauntlet (Insano)
    9: 570,  // Fase 9: Chrono Vortex (Demon)
    10: 590  // Fase 10: Singularity Overdrive (Extremo)
  },

  /**
   * Obtém a velocidade exata, fixa e previsível para uma fase.
   * Não varia durante a execução da fase.
   * @param {number} levelId
   * @returns {number}
   */
  getLevelSpeed(levelId) {
    if (this.LEVEL_SPEED_TABLE && this.LEVEL_SPEED_TABLE[levelId]) {
      const ratio = this.PLAYER_SPEED / 450;
      return Math.round(this.LEVEL_SPEED_TABLE[levelId] * ratio);
    }
    return this.PLAYER_SPEED;
  },

  // Física do Movimento
  GRAVITY: 2150,          // Aceleração da gravidade (pixels por segundo ao quadrado)
  JUMP_FORCE: 690,        // Impulso inicial ao pular (pixels por segundo para cima)
  MAX_FALL_SPEED: 1100,   // Velocidade terminal máxima de queda (evita atravessar chão)
  
  // Janelas de tolerância calibradas para controle extremamente responsivo e justo
  COYOTE_TIME: 0.10,      // Tolerância de beirada de 0.10s (permite saltos na borda de plataformas)
  JUMP_BUFFER: 0.14,      // Buffer de pulo de 0.14s (evita pulos ignorados antes de pousar)

  // Animação do Cubo
  ROTATION_SPEED: 480,    // Velocidade de giro dinâmico no ar em graus por segundo

  // Mecânicas de Geometry Dash (Jump Orbs e Portais de Gravidade)
  ORB_RADIUS: 22,         // Raio visual do orbe
  ORB_HIT_RADIUS: 68,     // Distância precisa e justa para tocar e ativar o orbe
  ORB_JUMP_FORCE: 750,    // Impulso vertical concedido pelo Jump Orb amarelo
  
  // Novos tipos de obstáculos (Serras Giratórias Neon)
  SAW_HIT_RATIO: 0.82,    // Margem justa da caixa de colisão da serra circular
  
  // Efeitos de Sincronia e Batida da Música
  BEAT_PULSE_DURATION: 0.16
};
