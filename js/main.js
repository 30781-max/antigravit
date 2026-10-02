/**
 * ==============================================================================
 * CYBER PULSE — js/main.js
 * Ponto de Entrada da Aplicação
 * ==============================================================================
 * Inicializa a instância do GameManager quando o DOM estiver completamente carregado.
 */

'use strict';

window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameManager();
});
