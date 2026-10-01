/**
 * ==============================================================================
 * CYBER PULSE — js/collision.js
 * Motor de Detecção e Resolução de Colisões
 * ==============================================================================
 * Garante física precisa e justa, com caixas delimitadoras (hitboxes) ligeiramente
 * tolerantes para evitar mortes frustrantes em pixels soltos.
 */

'use strict';

class CollisionEngine {
  /**
   * Checagem de colisão do jogador contra espinho triangular (chão ou teto)
   */
  static checkPlayerSpike(player, spike) {
    // Margem interna de segurança (5px) para não punir o jogador injustamente
    const margin = 5;
    const px = player.x + margin;
    const py = player.y + margin;
    const pw = player.w - margin * 2;
    const ph = player.h - margin * 2;

    const sx = spike.x;
    const sw = spike.w;
    const sh = spike.h;
    const sy = spike.y !== undefined ? spike.y : (spike.inverted ? CONFIG.CEILING_Y : CONFIG.GROUND_Y - sh);

    // 1. Teste de Caixa Delimitadora Rápida (AABB)
    if (px + pw < sx || px > sx + sw || py + ph < sy || py > sy + sh) {
      return false;
    }

    // 2. Teste Preciso da Geometria Triangular
    const apexX = sx + sw / 2;
    const apexY = spike.inverted ? sy + sh : sy;
    const baseY = spike.inverted ? sy : sy + sh;

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
        // Espinho para cima no chão
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

  /**
   * Colisão do jogador com plataformas retangulares suspensas
   * Retorna 'land' se aterrissou com sucesso no topo/base, ou 'crash' se colidiu frontalmente
   */
  static handlePlayerPlatform(player, plat, dt) {
    const px = player.x;
    const py = player.y;
    const pw = player.w;
    const ph = player.h;

    // Checagem de sobreposição de caixas
    if (px + pw > plat.x && px < plat.x + plat.w && py + ph > plat.y && py < plat.y + plat.h) {
      const isNormal = player.gravityDir === 1;

      if (isNormal) {
        // Gravidade Normal: Pousando no topo da plataforma
        const prevY = py - player.vy * dt;
        if (prevY + ph <= plat.y + 14 && player.vy >= 0) {
          return { type: 'land', surfaceY: plat.y };
        }
      } else {
        // Gravidade Invertida: Apoiando na face inferior da plataforma
        const prevY = py - player.vy * dt;
        if (prevY >= plat.y + plat.h - 14 && player.vy <= 0) {
          return { type: 'land', surfaceY: plat.y + plat.h };
        }
      }

      // Se atingiu a quina ou a lateral de frente, é impacto fatal
      return { type: 'crash' };
    }

    return null;
  }

  /**
   * Verifica se o centro do jogador está dentro do raio de ativação do Jump Orb
   * @param {Player} player
   * @param {Object} orb { x, y, radius }
   * @returns {boolean}
   */
  static checkPlayerOrb(player, orb) {
    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;
    const ox = orb.x;
    const oy = orb.y;
    const dx = px - ox;
    const dy = py - oy;
    const distSq = dx * dx + dy * dy;
    const hitRadius = CONFIG.ORB_HIT_RADIUS || 65;
    return distSq <= hitRadius * hitRadius;
  }

  /**
   * Checagem de coleta de Moeda Secreta (AABB)
   * @param {Player} player
   * @param {Object} coin { x, y, size }
   * @returns {boolean}
   */
  static checkPlayerCoin(player, coin) {
    const size = coin.size || CONFIG.COIN_SIZE || 32;
    const cx = coin.x - size / 2;
    const cy = coin.y - size / 2;
    return (
      player.x + player.w > cx &&
      player.x < cx + size &&
      player.y + player.h > cy &&
      player.y < cy + size
    );
  }

  /**
   * Checagem de colisão com Speed Portal (Portal de Velocidade)
   * @param {Player} player
   * @param {Object} portal { x, w, speedMultiplier }
   * @returns {boolean}
   */
  static checkPlayerSpeedPortal(player, portal) {
    const pw = portal.w || 52;
    const py = CONFIG.CEILING_Y;
    const ph = CONFIG.GROUND_Y - CONFIG.CEILING_Y;
    return (
      player.x + player.w > portal.x &&
      player.x < portal.x + pw &&
      player.y + player.h >= py - 20 &&
      player.y <= py + ph + 20
    );
  }

  /**
   * Verifica se o centro do jogador está sobre um abismo (buraco no chão)
   */
  static isPlayerInPit(player, pits) {
    if (!pits || pits.length === 0) return false;
    const midX = player.x + player.w / 2;
    for (const pit of pits) {
      if (midX >= pit.startX && midX <= pit.endX) {
        return true;
      }
    }
    return false;
  }
}

