/**
 * Comprehensive Gameplay and Physics Validator for Cyber Pulse Hardcore Levels
 */
const fs = require('fs');
const path = require('path');

// Carregar js/levels.js
const levelsCode = fs.readFileSync(path.join(__dirname, '../js/levels.js'), 'utf8');
const LEVELS = eval(levelsCode.replace("'use strict';", "").replace("const LEVELS =", ""));

const GRAVITY = 2150.0;
const JUMP_FORCE = 690.0;
const GROUND_Y = 570.0;
const CEILING_Y = 150.0;
const PLAYER_SIZE = 38.0;

const airTime = (2.0 * JUMP_FORCE) / GRAVITY;
const maxJumpRise = (JUMP_FORCE * JUMP_FORCE) / (2.0 * GRAVITY);

console.log("==================================================================");
console.log("VALIDAÇÃO RIGOROSA DE JOGABILIDADE — MODO HARDCORE (CYBER PULSE)");
console.log("==================================================================");
console.log(`Tempo de voo no ar (salto plano): ${airTime.toFixed(3)} segundos`);
console.log(`Altura máxima do salto: ${maxJumpRise.toFixed(1)} px\n`);

let totalErrors = 0;
let totalSpikes = 0;

LEVELS.forEach((lvl) => {
  const jumpDist = lvl.speed * airTime;
  console.log(`------------------------------------------------------------------`);
  console.log(`FASE ${lvl.id}: ${lvl.name} | Dificuldade: ${lvl.difficultyName} (${lvl.difficultyClass})`);
  console.log(`Velocidade: ${lvl.speed} px/s | Alcance do salto: ${jumpDist.toFixed(1)} px | Extensão: ${lvl.finishX} px`);
  console.log(`Obstáculos: ${lvl.spikes.length} espinhos, ${lvl.platforms.length} plataformas, ${lvl.pits.length} abismos, ${lvl.jumpOrbs.length} orbes, ${lvl.jumpPads.length} trampolins, ${lvl.speedPortals.length} speed portals`);

  totalSpikes += lvl.spikes.length;

  // 1. Checar abismos (suporta abismo direto, plataforma única ou cadeia de parkour de plataformas)
  lvl.pits.forEach((pit, pIdx) => {
    const w = pit.endX - pit.startX;
    if (w <= jumpDist) {
      console.log(`  [OK] Abismo ${pIdx + 1} em x:${pit.startX} (largura ${w}px) — salto direto transponível (${jumpDist.toFixed(0)}px).`);
      return;
    }

    // Filtrar plataformas dentro ou sobre o abismo
    const bridgingPlats = lvl.platforms
      .filter(p => (p.x + p.w) >= pit.startX && p.x <= pit.endX)
      .sort((a, b) => a.x - b.x);

    if (bridgingPlats.length === 0) {
      console.error(`  [ERRO] Abismo ${pIdx + 1} em x:${pit.startX} (largura ${w}px) sem plataformas de suporte!`);
      totalErrors++;
      return;
    }

    // Verificar cadeia de salto
    let currentX = pit.startX;
    let currentY = GROUND_Y;
    let chainValid = true;

    for (let i = 0; i < bridgingPlats.length; i++) {
      const p = bridgingPlats[i];
      const gapToPlat = p.x - currentX;
      const heightDiff = currentY - p.y;

      if (gapToPlat > jumpDist) {
        console.error(`  [ERRO] Abismo ${pIdx + 1}: salto de x:${currentX} para plataforma em x:${p.x} excede alcance (${gapToPlat}px > ${jumpDist.toFixed(0)}px)!`);
        chainValid = false;
        break;
      }
      if (heightDiff > maxJumpRise + 5) {
        console.error(`  [ERRO] Abismo ${pIdx + 1}: desnível vertical para plataforma ${i + 1} muito alto (${heightDiff}px > ${maxJumpRise.toFixed(0)}px)!`);
        chainValid = false;
        break;
      }

      currentX = p.x + p.w;
      currentY = p.y;
    }

    // Salto final da última plataforma para a outra margem
    if (chainValid) {
      const finalGap = pit.endX - currentX;
      if (finalGap > jumpDist) {
        console.error(`  [ERRO] Abismo ${pIdx + 1}: salto final para terra firme excede alcance (${finalGap}px > ${jumpDist.toFixed(0)}px)!`);
        chainValid = false;
      }
    }

    if (chainValid) {
      console.log(`  [OK] Abismo ${pIdx + 1} em x:${pit.startX} (largura ${w}px) — cadeia de parkour com ${bridgingPlats.length} plataforma(s) validada com sucesso!`);
    } else {
      totalErrors++;
    }
  });

  // 2. Checar plataformas e blocos
  lvl.platforms.forEach((plat, pIdx) => {
    if (plat.isBlock) {
      if (plat.y <= CEILING_Y + 50) {
        // Bloco no teto (gravidade invertida)
        const hFromCeiling = plat.y - CEILING_Y;
        if (hFromCeiling > maxJumpRise) {
          console.error(`  [ERRO] Bloco no teto ${pIdx} em x:${plat.x} muito distante do teto!`);
          totalErrors++;
        }
      } else {
        // Bloco no chão
        const hFromGround = GROUND_Y - plat.y;
        if (hFromGround > maxJumpRise) {
          console.error(`  [ERRO] Bloco ${pIdx} em x:${plat.x} muito alto do chão (${hFromGround}px > ${maxJumpRise.toFixed(1)}px)!`);
          totalErrors++;
        }
      }
    }
  });

  // 3. Checar espinhos em plataformas
  lvl.spikes.forEach((s, sIdx) => {
    if (s.y !== undefined) {
      // Espinho colocado em uma plataforma suspensa
      const hostPlat = lvl.platforms.find(p => s.x >= p.x && (s.x + s.w) <= (p.x + p.w));
      if (!hostPlat) {
        console.error(`  [ERRO] Espinho suspenso ${sIdx} em x:${s.x} fora de qualquer plataforma!`);
        totalErrors++;
      }
    }
  });

  // 4. Checar que não há espinho no chão dentro de um abismo
  lvl.spikes.forEach((s, sIdx) => {
    if (s.y === undefined && !s.inverted) {
      const inPit = lvl.pits.some(pit => s.x >= pit.startX && (s.x + (s.w || 36)) <= pit.endX);
      if (inPit) {
        console.error(`  [ERRO] Espinho ${sIdx} em x:${s.x} colocado dentro de um abismo!`);
        totalErrors++;
      }
    }
  });
});

console.log(`\n==================================================================`);
console.log(`TOTAL DE ESPINHOS / DESAFIOS EM TODAS AS FASES: ${totalSpikes}`);
if (totalErrors === 0) {
  console.log(`RESULTADO: 100% DAS FASES ESTÃO MATEMATICAMENTE CALIBRADAS, SEM ERROS!`);
} else {
  console.error(`RESULTADO: ${totalErrors} erros encontrados.`);
}
console.log(`==================================================================`);
process.exit(totalErrors > 0 ? 1 : 0);
