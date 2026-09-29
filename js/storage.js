/* Camada pequena de persistência. Se o navegador bloquear storage, o jogo segue em memória. */
(() => {
  const KEY = 'desafioBiblico.v1';
  const empty = () => ({ records: {}, correct: 0, wrong: 0, muted: false });
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
      const state = { ...empty(), ...saved };
      // Converte recordes antigos (uma pontuação por categoria) para recordes por jogador.
      for (const [category, value] of Object.entries(state.records || {})) {
        if (typeof value === 'number') state.records[category] = { jogador: { name: 'Jogador', score: value } };
      }
      if (!state.records || typeof state.records !== 'object') state.records = {};
      return state;
    } catch { return empty(); }
  }
  let state = read();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* sessão continua funcional */ } }
  window.GameStorage = {
    get: () => typeof structuredClone === 'function' ? structuredClone(state) : JSON.parse(JSON.stringify(state)),
    record(category, playerName, score) {
      const name = (playerName || 'Jogador').trim().slice(0, 24) || 'Jogador';
      const playerKey = name.toLocaleLowerCase('pt-BR');
      if (!state.records[category]) state.records[category] = {};
      const previous = state.records[category][playerKey];
      const best = Math.max(previous ? previous.score : 0, score);
      state.records[category][playerKey] = { name: previous ? previous.name : name, score: best };
      save();
      return best;
    },
    answer(correct) { state[correct ? 'correct' : 'wrong'] += 1; save(); },
    setMuted(value) { state.muted = !!value; save(); },
    reset() { state = empty(); save(); }
  };
})();
