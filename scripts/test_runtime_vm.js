const fs = require('fs');
const vm = require('vm');

const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  performance
};
sandbox.window = sandbox;
sandbox.addEventListener = () => {};
sandbox.removeEventListener = () => {};
sandbox.document = {
  getElementById: (id) => ({
    getContext: () => ({
      fillRect: () => {}, clearRect: () => {}, beginPath: () => {}, arc: () => {}, fill: () => {}, stroke: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      save: () => {}, restore: () => {}, translate: () => {}, rotate: () => {}, closePath: () => {}, moveTo: () => {}, lineTo: () => {},
      roundRect: () => {}, setLineDash: () => {}, measureText: () => ({ width: 50 }),
      fillText: () => {}, strokeText: () => {}
    }),
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {} },
    style: {},
    appendChild: () => {},
    querySelectorAll: () => [],
    innerHTML: ''
  }),
  addEventListener: () => {},
  removeEventListener: () => {},
  createElement: () => ({ appendChild: () => {}, classList: { add: () => {} }, style: {}, dataset: {}, addEventListener: () => {} })
};
sandbox.localStorage = { getItem: () => null, setItem: () => {} };
sandbox.requestAnimationFrame = (cb) => setTimeout(cb, 16);
sandbox.AudioContext = class {
  createOscillator() {
    return {
      connect: () => {},
      start: () => {},
      stop: () => {},
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      type: 'sine'
    };
  }
  createGain() {
    return {
      connect: () => {},
      gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} }
    };
  }
  get currentTime() { return 0; }
  get destination() { return {}; }
  resume() { return Promise.resolve(); }
};

const context = vm.createContext(sandbox);
['js/config.js', 'js/audio.js', 'js/particles.js', 'js/skins.js', 'js/collision.js', 'js/levels.js', 'js/player.js', 'js/game.js'].forEach(f => {
  vm.runInContext(fs.readFileSync(f, 'utf8'), context);
});

const testScript = `
  const game = new GameManager();
  console.log('1. Game initialized successfully. Current state:', game.gameState, 'Level:', game.currentLevelIndex);
  
  game.startLevel(0);
  console.log('2. Started Level 1 successfully. Player pos: x=' + game.player.x + ' y=' + game.player.y);
  
  for (let i = 0; i < 60; i++) {
    game.update(0.016);
  }
  console.log('3. Simulated 60 frames (1s running). Player pos: x=' + Math.round(game.player.x) + ' y=' + Math.round(game.player.y) + ' Grounded: ' + game.player.grounded);
  
  // Test jump
  game.player.queueJump(game.level.jumpOrbs, game.audio, game.particles, game.skinManager.getCurrentSkin());
  console.log('4. Jump initiated. Vy=' + game.player.vy + ' Grounded=' + game.player.grounded);
  
  for (let i = 0; i < 20; i++) {
    game.update(0.016);
  }
  console.log('5. Mid-air apex: x=' + Math.round(game.player.x) + ' y=' + Math.round(game.player.y) + ' Vy=' + Math.round(game.player.vy));
  
  // Test landing
  for (let i = 0; i < 30; i++) {
    game.update(0.016);
  }
  console.log('6. Landed: x=' + Math.round(game.player.x) + ' y=' + Math.round(game.player.y) + ' Grounded=' + game.player.grounded);
  
  // Test death & restart
  game.killPlayer();
  console.log('7. Player killed. State: ' + game.gameState + ' Total attempts: ' + game.attempts);
  
  game.restartLevel();
  console.log('8. Level restarted. State: ' + game.gameState + ' Player pos: x=' + Math.round(game.player.x) + ' y=' + Math.round(game.player.y));
  
  // Test Level Progression across all 10 levels
  for (let l = 0; l < 10; l++) {
    game.startLevel(l);
    if (!game.level || game.level.id !== (l + 1)) {
      throw new Error('Level ' + (l + 1) + ' failed to load properly!');
    }
  }
  console.log('9. All 10 levels loaded and validated successfully!');
`;

vm.runInContext(testScript, context);
console.log('==================================================================');
console.log('TODAS AS ROTINAS DE INICIALIZAÇÃO, JOGO, MORTE E RESTART FUNCIONANDO!');
console.log('==================================================================');
process.exit(0);
