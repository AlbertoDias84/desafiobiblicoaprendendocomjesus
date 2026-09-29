/* Sons curtos feitos com Web Audio API; nenhum arquivo de áudio externo é necessário. */
(() => {
  let context;
  function tone(freq, start, duration, type = 'sine', volume = .09) {
    if (GameStorage.get().muted) return;
    try {
      if (!context) context = new (window.AudioContext || window.webkitAudioContext)();
      if (context.state === 'suspended') context.resume();
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.type = type; oscillator.frequency.value = freq; gain.gain.setValueAtTime(volume, context.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + start + duration);
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(context.currentTime + start); oscillator.stop(context.currentTime + start + duration);
    } catch { /* áudio opcional */ }
  }
  window.GameAudio = { correct() { tone(523,0,.13); tone(659,.14,.18); }, wrong() { tone(220,0,.23,'triangle'); }, click() { tone(440,0,.06,'sine',.035); }, victory() { [523,659,784,1047].forEach((n,i)=>tone(n,i*.14,.26)); } };
})();
