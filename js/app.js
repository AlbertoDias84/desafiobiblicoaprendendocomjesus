/* Navegação e regras da partida. Todo o conteúdo funciona sem servidor; o PWA é registrado em HTTP(S). */
(() => {
  const $ = id => document.getElementById(id);
  const screens = ['home','setup','game','result','records','how'];
  const categorySelect = $('category-select');
  categorySelect.innerHTML = '<option value="__random">🎲 Modo aleatório (todas as categorias)</option>' + CATEGORIES.map(name => `<option value="${name}">${name}</option>`).join('');
  let session, timerId = null, secondsLeft = 30, answeredAt = 0;

  function show(name) {
    screens.forEach(screen => { const el = $(`${screen}-screen`); el.hidden = screen !== name; el.classList.toggle('active', screen === name); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function shuffled(list) { const copy = [...list]; for (let i=copy.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; } return copy; }
  function begin() {
    const category = categorySelect.value, difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    const count = Number(document.querySelector('input[name="count"]:checked').value), useTimer = $('timer-toggle').checked;
    let pool = QUESTIONS.filter(q => (category === '__random' || q.categoria === category) && (difficulty === 'todas' || q.dificuldade === difficulty));
    if (!pool.length) { $('setup-note').textContent = 'Não há perguntas nessa combinação. Escolha outra dificuldade.'; return; }
    const questions = shuffled(pool).slice(0, Math.min(count, pool.length));
    const player = $('player-name').value.trim().slice(0, 24) || 'Jogador';
    $('player-name').value = player;
    session = { questions, index: 0, score: 0, correct: 0, wrong: 0, streak: 0, comboReady: false, timed: useTimer, player, categoryName: category === '__random' ? 'Modo aleatório' : category };
    renderQuestion(); show('game');
  }
  function renderQuestion() {
    clearInterval(timerId);
    const q = session.questions[session.index], total = session.questions.length;
    $('question-count').textContent = `Pergunta ${session.index+1} de ${total}`;
    $('progress-bar').style.width = `${(session.index/total)*100}%`;
    $('score-display').textContent = `✦ ${session.score} pts`;
    $('category-tag').textContent = q.categoria;
    $('difficulty-tag').textContent = q.dificuldade;
    $('question-text').textContent = q.pergunta;
    $('answers').innerHTML = q.alternativas.map((text,index) => `<button class="answer-button" data-answer="${index}"><span class="answer-key">${String.fromCharCode(65+index)}</span><span>${text}</span></button>`).join('');
    $('feedback').hidden = true; $('feedback').textContent = ''; $('next-button').hidden = true;
    answeredAt = Date.now(); secondsLeft = 30;
    $('timer-display').hidden = !session.timed;
    if (session.timed) { $('timer-display').innerHTML = `⏱ <b>30</b>s`; timerId = setInterval(() => { secondsLeft--; $('timer-display').innerHTML = `⏱ <b>${secondsLeft}</b>s`; if (secondsLeft <= 0) answer(-1, true); }, 1000); }
  }
  function answer(index, timeout = false) {
    if (!session || $('next-button').hidden === false) return;
    clearInterval(timerId);
    const q = session.questions[session.index], correct = index === q.correta;
    [...$('answers').querySelectorAll('button')].forEach((button,i) => { button.disabled = true; if (i === q.correta) button.classList.add('correct'); if (i === index && !correct) button.classList.add('incorrect'); });
    if (correct) {
      session.correct++; session.streak++; let points = ({'fácil':10,'médio':20,'difícil':30})[q.dificuldade];
      if ((Date.now()-answeredAt)/1000 < 10) points += 5;
      if (session.comboReady) { points *= 2; session.comboReady = false; }
      if (session.streak % 3 === 0) session.comboReady = true;
      session.score += points; GameStorage.answer(true); GameAudio.correct();
    } else { session.wrong++; session.streak = 0; session.comboReady = false; GameStorage.answer(false); GameAudio.wrong(); }
    $('score-display').textContent = `✦ ${session.score} pts`;
    $('progress-bar').style.width = `${((session.index+1)/session.questions.length)*100}%`;
    $('feedback').innerHTML = `<strong>${correct ? 'Resposta correta!' : timeout ? 'O tempo acabou!' : 'Não foi dessa vez.'}${correct && session.comboReady ? ' 🔥 Combo ativo: próxima pontuação em dobro!' : ''}</strong>${q.explicacao}<span class="reference">📖 ${q.referencia}</span>`;
    $('feedback').hidden = false; $('next-button').hidden = false;
    $('next-button').innerHTML = session.index === session.questions.length-1 ? 'Ver resultado <span>→</span>' : 'Próxima pergunta <span>→</span>';
  }
  function finish() {
    clearInterval(timerId); const { score, correct, wrong, questions, categoryName } = session, total = questions.length;
    const recordKey = categoryName === 'Modo aleatório' ? 'Modo aleatório' : categoryName;
    const record = GameStorage.record(recordKey, session.player, score), accuracy = Math.round(correct/total*100);
    $('final-score').textContent = score; $('correct-total').textContent = `${correct}/${total}`; $('wrong-total').textContent = wrong; $('accuracy-total').textContent = `${accuracy}%`; $('best-total').textContent = record;
    $('result-player').textContent = `Recorde de ${session.player}`;
    $('medal').textContent = accuracy >= 90 ? '🥇' : accuracy >= 70 ? '🥈' : accuracy >= 40 ? '🥉' : '📖';
    $('result-message').textContent = accuracy >= 90 ? 'Uau! Você é um expert bíblico!' : accuracy >= 70 ? 'Excelente jornada! Você conhece muito bem as Escrituras.' : accuracy >= 40 ? 'Muito bem! Continue aprendendo e crescendo.' : 'Continue estudando a Palavra. Cada pergunta é uma nova descoberta!';
    GameAudio.victory(); show('result');
  }
  function records() {
    const stats = GameStorage.get(); $('lifetime-correct').textContent = stats.correct; $('lifetime-wrong').textContent = stats.wrong;
    const entries = Object.entries(stats.records).flatMap(([category, players]) => Object.values(players || {}).map(record => ({ category, ...record }))).sort((a,b)=>b.score-a.score);
    $('records-list').innerHTML = entries.length ? entries.map(({category,name,score})=>`<div class="record-row"><span>📖 ${category} <small>· ${name}</small></span><strong>${score} pts</strong></div>`).join('') : '<p class="muted-note">Ainda não há recordes. Jogue uma partida para começar!</p>';
    show('records');
  }
  function updateMute() { const muted = GameStorage.get().muted; $('mute-button').textContent = muted ? '🔇' : '🔊'; $('mute-button').setAttribute('aria-label', muted ? 'Ativar sons' : 'Desativar sons'); }
  document.addEventListener('click', async event => {
    const actionElement = event.target.closest('[data-action]');
    const action = actionElement ? actionElement.dataset.action : null;
    if (action) {
      GameAudio.click();
      if (action === 'home') show('home');
      if (action === 'setup') { $('setup-note').textContent = ''; show('setup'); }
      if (action === 'quick-play') { categorySelect.value = '__random'; document.querySelector('input[name="difficulty"][value="todas"]').checked = true; document.querySelector('input[name="count"][value="10"]').checked = true; begin(); }
      if (action === 'start') begin();
      if (action === 'records') records();
      if (action === 'how') show('how');
      if (action === 'quit') { clearInterval(timerId); show('home'); }
      if (action === 'next') { if (session.index < session.questions.length-1) { session.index++; renderQuestion(); } else finish(); }
      if (action === 'replay') begin();
      if (action === 'reset') { if (confirm('Apagar recordes, acertos, erros e preferência de som salvos neste aparelho?')) { GameStorage.reset(); records(); updateMute(); } }
      if (action === 'share') { const text = `${session.player} fez ${session.score} pontos e acertou ${session.correct} de ${session.questions.length} no Desafio Bíblico!`; try { if (navigator.share) await navigator.share({ title: 'Desafio Bíblico', text }); else if (navigator.clipboard) { await navigator.clipboard.writeText(text); event.target.closest('button').textContent = 'Resultado copiado!'; } } catch { /* compartilhamento cancelado */ } }
      return;
    }
    const answerButton = event.target.closest('[data-answer]'); if (answerButton) answer(Number(answerButton.dataset.answer));
    if (event.target.closest('#mute-button')) { GameStorage.setMuted(!GameStorage.get().muted); updateMute(); }
  });
  updateMute();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
})();
