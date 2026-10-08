/**
 * Generator and Physics Validator for Cyber Pulse Hardcore Levels
 */
const fs = require('fs');
const path = require('path');

const CONFIG = {
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  GROUND_Y: 570,
  CEILING_Y: 150,
  PLAYER_SIZE: 38,
  GRAVITY: 2150,
  JUMP_FORCE: 690,
  MAX_FALL_SPEED: 1100,
  MARGIN: 3
};

// Physics trajectory check
function getMaxJumpHeight() {
  return (CONFIG.JUMP_FORCE * CONFIG.JUMP_FORCE) / (2 * CONFIG.GRAVITY); // ~110.7px
}

function getAirTime() {
  return (2 * CONFIG.JUMP_FORCE) / CONFIG.GRAVITY; // ~0.642s
}

console.log(`Max jump height: ${getMaxJumpHeight().toFixed(1)}px`);
console.log(`Air time: ${getAirTime().toFixed(3)}s`);
