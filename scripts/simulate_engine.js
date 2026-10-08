/**
 * Test Simulator for Cyber Pulse Levels
 * Simulates a perfect player following optimal jump inputs.
 */
const fs = require('fs');

const CONFIG = {
  GROUND_Y: 570,
  CEILING_Y: 150,
  PLAYER_SIZE: 38,
  GRAVITY: 2150,
  JUMP_FORCE: 690,
  MAX_FALL_SPEED: 1100,
  ORB_HIT_RADIUS: 65,
  ORB_JUMP_FORCE: 740,
  MARGIN: 3
};

function checkSpike(player, spike) {
  const margin = CONFIG.MARGIN;
  const px = player.x + margin;
  const py = player.y + margin;
  const pw = CONFIG.PLAYER_SIZE - margin * 2;
  const ph = CONFIG.PLAYER_SIZE - margin * 2;

  const sx = spike.x;
  const sw = spike.w || 36;
  const sh = spike.h || 42;
  const sy = spike.y !== undefined ? spike.y : (spike.inverted ? CONFIG.CEILING_Y : CONFIG.GROUND_Y - sh);

  if (px + pw < sx || px > sx + sw || py + ph < sy || py > sy + sh) {
    return false;
  }

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
      if (c.y >= baseY && c.y <= apexY) {
        const halfWidthAtY = (sw / 2) * (1 - (c.y - baseY) / sh);
        if (c.x >= apexX - halfWidthAtY && c.x <= apexX + halfWidthAtY) return true;
      }
    } else {
      if (c.y >= apexY && c.y <= baseY) {
        const halfWidthAtY = (sw / 2) * ((c.y - apexY) / sh);
        if (c.x >= apexX - halfWidthAtY && c.x <= apexX + halfWidthAtY) return true;
      }
    }
  }
  return true;
}

console.log("Simulator engine helper ready.");
