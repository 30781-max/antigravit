/**
 * ==============================================================================
 * CYBER PULSE — js/collision.js
 * Motor de Detecção e Resolução de Colisões (Preciso, Justo e Sem Falsas Mortes)
 * ==============================================================================
 * Garante física justa inspirada em Geometry Dash:
 * - Hitboxes de espinhos calibradas geometricamente (sem falsos positivos).
 * - Pouso suave e estável em plataformas sem atravessamento ou morte na borda.
 * - Detecção frontal precisa para evitar atravessar paredes sólidas.
 * - Suporte a novo obstáculo: Serras Giratórias Neon (Sawblades).
 */

'use strict';

class CollisionEngine {
  /**
   * Checagem de colisão do jogador contra espinho triangular (chão ou teto)
   * Usa geometria real do triângulo com margem justa de tolerância (fair hitbox).
   */
  static checkPlayerSpike(player, spike) {
    // Margem interna justa de 3.5px para evitar mortes frustrantes em pixels vazios
    const margin = 3.5;
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

    // 2. Geometria do Triângulo
    const apexX = sx + sw / 2;
    const apexY = spike.inverted ? sy + sh : sy;
    const baseY = spike.inverted ? sy : sy + sh;

    // Teste A: O ápice do espinho está dentro do jogador?
    if (apexX >= px && apexX <= px + pw && apexY >= py && apexY <= py + ph) {
      return true;
    }

    // Teste B: Pontos chave da base/corpo do jogador dentro do triângulo do espinho
    const testPoints = spike.inverted ? [
      { x: px + 2, y: py },
      { x: px + pw - 2, y: py },
      { x: px + pw / 2, y: py },
      { x: px + pw / 2, y: py + ph * 0.4 }
    ] : [
      { x: px + 2, y: py + ph },
      { x: px + pw - 2, y: py + ph },
      { x: px + pw / 2, y: py + ph },
      { x: px + pw / 2, y: py + ph * 0.6 }
    ];

    for (const pt of testPoints) {
      if (spike.inverted) {
        // Espinho para baixo no teto
        if (pt.y >= baseY && pt.y <= apexY) {
          const halfWidthAtY = (sw / 2) * (1 - (pt.y - baseY) / sh);
          if (pt.x >= apexX - halfWidthAtY && pt.x <= apexX + halfWidthAtY) {
            return true;
          }
        }
      } else {
        // Espinho para cima no chão
        if (pt.y >= apexY && pt.y <= baseY) {
          const halfWidthAtY = (sw / 2) * ((pt.y - apexY) / sh);
          if (pt.x >= apexX - halfWidthAtY && pt.x <= apexX + halfWidthAtY) {
            return true;
          }
        }
      }
    }

    // Teste C: Interseção de segmento de borda da base com as diagonais do espinho
    // Se o espinho é no chão, verificar se o segmento inferior do player [py+ph] cruza os lados
    const playerBottom = py + ph;
    if (!spike.inverted && playerBottom >= apexY && playerBottom <= baseY) {
      const halfWidth = (sw / 2) * ((playerBottom - apexY) / sh);
      const minTriX = apexX - halfWidth;
      const maxTriX = apexX + halfWidth;
      if (px + pw >= minTriX && px <= maxTriX) {
        return true;
      }
    } else if (spike.inverted && py >= baseY && py <= apexY) {
      const halfWidth = (sw / 2) * (1 - (py - baseY) / sh);
      const minTriX = apexX - halfWidth;
      const maxTriX = apexX + halfWidth;
      if (px + pw >= minTriX && px <= maxTriX) {
        return true;
      }
    }

    // Se nenhum ponto ou borda colidiu, NÃO há colisão!
    return false;
  }

  /**
   * Colisão do jogador com plataformas retangulares e blocos sólidos.
   * Trata:
   * 1. Pouso seguro ao cair de cima (land)
   * 2. Condução estável sobre a plataforma sem afundar ou tremer (riding)
   * 3. Colisão frontal letal contra a parede esquerda (crash)
   * 4. Cabeçada no fundo da plataforma (crash)
   * 
   * @param {Player} player
   * @param {Object} plat { x, y, w, h, isBlock }
   * @param {number} dt
   * @returns {Object|null} { type: 'land'|'riding'|'crash', surfaceY: number }
   */
  static handlePlayerPlatform(player, plat, dt) {
    const px = player.x;
    const py = player.y;
    const pw = player.w;
    const ph = player.h;

    const platLeft = plat.x;
    const platRight = plat.x + plat.w;
    const platTop = plat.y;
    const platBottom = plat.y + plat.h;

    // Checagem de proximidade horizontal rápida
    if (px + pw < platLeft - 10 || px > platRight + 10) {
      return null;
    }

    const isNormal = player.gravityDir === 1;

    // Sobreposição horizontal com margem justa de borda
    const horizontalOverlap = (px + pw > platLeft + 3) && (px < platRight - 3);

    if (isNormal) {
      // =========================================================================
      // GRAVIDADE NORMAL
      // =========================================================================
      const currentBottom = py + ph;
      const prevBottom = (player.prevY !== undefined ? player.prevY : (py - player.vy * dt)) + ph;

      // 1. CASO CONDUÇÃO / CORRIDA ESTÁVEL NO TOPO (RIDING)
      // Se o jogador já estava apoiado sobre a plataforma
      if (horizontalOverlap && Math.abs(currentBottom - platTop) <= 6 && Math.abs(prevBottom - platTop) <= 6 && player.vy >= 0) {
        return { type: 'riding', surfaceY: platTop };
      }

      // 2. CASO ATERRISSAGEM (LAND) DE CIMA PARA BAIXO
      // O jogador veio do ar e tocou a superfície superior
      const wasAboveTop = prevBottom <= platTop + 8;
      const isTouchingTop = currentBottom >= platTop - 2 && py < platBottom - 4;

      if (horizontalOverlap && wasAboveTop && isTouchingTop && player.vy >= 0) {
        return { type: 'land', surfaceY: platTop };
      }

      // 3. CASO CABEÇADA NO FUNDO DA PLATAFORMA (PULO SUBINDO)
      if (horizontalOverlap && player.vy < 0) {
        const prevTop = (player.prevY !== undefined ? player.prevY : py);
        if (py <= platBottom + 2 && prevTop >= platBottom - 8) {
          return { type: 'crash' };
        }
      }

      // 4. CASO COLISÃO FRONTAL / LATERAL (CRASH NA PAREDE)
      // O jogador penetrou lateralmente na plataforma abaixo da linha de pouso
      if (px + pw > platLeft + 2 && px < platRight - 2) {
        if (currentBottom > platTop + 10 && py < platBottom - 2) {
          if (!wasAboveTop) {
            return { type: 'crash' };
          }
        }
      }

    } else {
      // =========================================================================
      // GRAVIDADE INVERTIDA (TETO)
      // =========================================================================
      const currentTop = py;
      const prevTop = (player.prevY !== undefined ? player.prevY : (py - player.vy * dt));

      // 1. CONDUÇÃO ESTÁVEL NO TETO (RIDING)
      if (horizontalOverlap && Math.abs(currentTop - platBottom) <= 6 && Math.abs(prevTop - platBottom) <= 6 && player.vy <= 0) {
        return { type: 'riding', surfaceY: platBottom };
      }

      // 2. ATERRISSAGEM NA FACE INFERIOR DA PLATAFORMA
      const wasBelowBottom = prevTop >= platBottom - 8;
      const isTouchingBottom = currentTop <= platBottom + 2 && (py + ph) > platTop + 4;

      if (horizontalOverlap && wasBelowBottom && isTouchingBottom && player.vy <= 0) {
        return { type: 'land', surfaceY: platBottom };
      }

      // 3. BATIDA NA FACE SUPERIOR ENQUANTO CAI PARA CIMA
      if (horizontalOverlap && player.vy > 0) {
        const prevBottom = (player.prevY !== undefined ? player.prevY : py) + ph;
        if (currentTop + ph >= platTop - 2 && prevBottom <= platTop + 8) {
          return { type: 'crash' };
        }
      }

      // 4. COLISÃO FRONTAL NA GRAVIDADE INVERTIDA
      if (px + pw > platLeft + 2 && px < platRight - 2) {
        if (currentTop < platBottom - 10 && (py + ph) > platTop + 2) {
          if (!wasBelowBottom) {
            return { type: 'crash' };
          }
        }
      }
    }

    return null;
  }

  /**
   * Checagem de colisão com Serra Giratória Neon (Sawblade)
   * Novo obstáculo clássico de Geometry Dash.
   * @param {Player} player
   * @param {Object} saw { x, y, radius }
   * @returns {boolean}
   */
  static checkPlayerSaw(player, saw) {
    const radius = saw.radius || 24;
    const hitRadius = radius * (CONFIG.SAW_HIT_RATIO || 0.82);

    // Margem de 3px no retângulo do player
    const px = player.x + 3;
    const py = player.y + 3;
    const pw = player.w - 6;
    const ph = player.h - 6;

    // Ponto mais próximo no retângulo em relação ao centro da serra
    const closeX = Math.max(px, Math.min(saw.x, px + pw));
    const closeY = Math.max(py, Math.min(saw.y, py + ph));

    const dx = saw.x - closeX;
    const dy = saw.y - closeY;
    return (dx * dx + dy * dy) <= (hitRadius * hitRadius);
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
    const hitRadius = CONFIG.ORB_HIT_RADIUS || 68;
    return distSq <= hitRadius * hitRadius;
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
