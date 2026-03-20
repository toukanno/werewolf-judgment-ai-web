// メインアプリケーション — 人狼ジャッジメントAI
let gameState = new GameState();
let gameLogic = null;
window._selectedPlayerCount = 5;

// 初期化
window.addEventListener("DOMContentLoaded", () => {
  selectPlayerCount(5);
  const savedKey = localStorage.getItem("werewolf_api_key");
  if (savedKey) document.getElementById("api-key").value = savedKey;

  if (GameState.hasSavedGame()) {
    document.getElementById("resume-banner").style.display = "flex";
  }
});

async function resumeGame() {
  document.getElementById("resume-banner").style.display = "none";
  const apiKey = localStorage.getItem("werewolf_api_key") || "";
  const ai = apiKey ? new OpenRouterAI(apiKey) : new MockAI();

  gameState.reset();
  if (!gameState.load()) {
    showScreen("lobby");
    return;
  }
  gameLogic = new GameLogic(gameState, ai);

  showScreen("game");
  GameUI.clearMessages();
  GameUI.updateHeader(gameState);
  GameUI.renderPlayers(gameState);

  for (const entry of gameState.log) {
    if (entry.type === "statement") {
      const player = gameState.players.find(p => p.name === entry.sender);
      if (player && player.isHuman) {
        GameUI.addMessage(entry.content, null, "you", player);
      } else if (player) {
        GameUI.addMessage(entry.content, null, "ai", player);
      }
    } else {
      GameUI.addMessage(entry.content, null, entry.type === "danger" ? "danger" : "system");
    }
  }

  GameUI.addMessage("--- ゲームを再開しました ---", null, "system");

  if (gameState.phase === "night") await runNightPhase();
  else if (gameState.phase === "vote") await runVotePhase();
  else await runDayPhase();
}

function dismissResume() {
  document.getElementById("resume-banner").style.display = "none";
  gameState.clearSave();
}

// ゲーム開始
async function startGame() {
  const playerName = document.getElementById("player-name").value.trim() || "プレイヤー";
  const count = window._selectedPlayerCount;
  const apiKey = document.getElementById("api-key").value.trim();
  const ai = apiKey ? new OpenRouterAI(apiKey) : new MockAI();

  gameState.clearSave();
  gameState.reset();
  gameState.initPlayers(playerName, count);
  gameLogic = new GameLogic(gameState, ai);

  showScreen("game");
  GameUI.clearMessages();
  GameUI.updateHeader(gameState);
  GameUI.renderPlayers(gameState);

  // Role reveal
  const human = gameState.getHuman();
  GameUI.addMessage("ゲームが始まります。役職を配ります…", null, "system");
  await sleep(600);

  await GameUI.showRoleReveal(human);

  // Notify werewolf allies
  if (human.role === "werewolf") {
    const allies = gameState.getAliveWerewolves().filter(p => p.id !== human.id);
    if (allies.length > 0) {
      GameUI.addMessage(`🐺 仲間の人狼: ${allies.map(a => a.name).join("、")}`, null, "system");
    }
  }
  if (human.role === "madman") {
    GameUI.addMessage("🃏 あなたは狂人です。人狼が誰かは分かりませんが、人狼陣営の勝利を目指しましょう。", null, "system");
  }

  await sleep(500);
  gameState.save();
  await runDayPhase();
}

// 昼フェーズ
async function runDayPhase() {
  gameState.phase = "day";
  GameUI.updateHeader(gameState);

  if (gameState.day === 1) {
    GameUI.addMessage("☀ 1日目の朝 — 今日は処刑はありません。自己紹介をしましょう。", null, "system");
  } else {
    GameUI.addMessage(`☀ ${gameState.day}日目の昼 — 議論の後、投票で1人を処刑します。`, null, "system");
  }

  // Medium result for human medium
  const human = gameState.getHuman();
  if (human.role === "medium" && human.isAlive && gameState.mediumResults.length > 0) {
    const lastResult = gameState.mediumResults[gameState.mediumResults.length - 1];
    const resultText = lastResult.result === "werewolf" ? "人狼" : "村人";
    GameUI.addMessage(`👁 霊能結果: ${lastResult.name}は【${resultText}】でした`, null, "system");
  }

  // Baker notification
  const aliveBaker = gameState.getAlive().find(p => p.role === "baker");
  if (aliveBaker) {
    // Baker is from old roles, ignore if not present
  }

  // AI statements
  const alive = gameState.getAlive();
  for (const player of alive) {
    if (player.isHuman) continue;
    const statement = await gameLogic.getAiStatement(player);
    GameUI.addMessage(statement, null, "ai", player);
    gameState.addLog("statement", statement, player.name);
  }

  // Human input
  if (human.isAlive) {
    await new Promise(resolve => {
      GameUI.showChatInput((text) => {
        GameUI.addMessage(text, null, "you", human);
        gameState.addLog("statement", text, human.name);
        resolve();
      });
    });
  } else {
    GameUI.addMessage("（あなたは死亡しています。観戦中…）", null, "system");
    await new Promise(resolve => {
      GameUI.showContinueButton("次へ", resolve);
    });
  }

  // Day 1: no execution
  if (gameState.day === 1) {
    GameUI.addMessage("1日目の議論が終了。夜になります…", null, "system");
    gameState.save();
    GameUI.showContinueButton("🌙 夜へ進む", () => runNightPhase());
    return;
  }

  gameState.save();
  await runVotePhase();
}

// 投票フェーズ
async function runVotePhase() {
  gameState.phase = "vote";
  GameUI.updateHeader(gameState);
  GameUI.addMessage("⚔ 投票の時間です。処刑する人を選んでください。", null, "system");

  const alive = gameState.getAlive();
  const human = gameState.getHuman();
  const votes = {};

  // Human vote
  if (human.isAlive) {
    const targets = alive.filter(p => p.id !== human.id);
    await new Promise(resolve => {
      GameUI.showVoteButtons(targets, (targetId) => {
        votes[human.id] = targetId;
        const target = gameState.getPlayerById(targetId);
        GameUI.addMessage(`あなたは ${target.name} に投票しました`, null, "system");
        resolve();
      });
    });
  } else {
    GameUI.addMessage("（投票権はありません）", null, "system");
  }

  // AI votes
  for (const player of alive) {
    if (player.isHuman) continue;
    const targets = alive.filter(p => p.id !== player.id);
    const targetId = await gameLogic.ai.getVote(player, targets, gameState);
    votes[player.id] = targetId;
  }

  // Show results
  GameUI.addMessage("━━━ 投票結果 ━━━", null, "system");
  const voteCounts = {};
  for (const [voterId, targetId] of Object.entries(votes)) {
    const voter = gameState.getPlayerById(voterId);
    const target = gameState.getPlayerById(targetId);
    if (voter && target) {
      GameUI.addMessage(`${voter.name} → ${target.name}`, null, "system");
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }
  }

  const executedId = gameLogic.tallyVotes(votes);
  const executed = gameState.getPlayerById(executedId);
  const voteCount = voteCounts[executedId] || 0;
  await sleep(500);

  GameUI.addMessage(`${executed.name} が${voteCount}票で処刑されました。`, null, "danger");
  gameState.executedToday = executedId;

  // Death effect
  await GameUI.showDeathEffect(executed);

  gameState.killPlayer(executedId);
  GameUI.renderPlayers(gameState);

  GameUI.addMessage(`${executed.name} の役職は【${ROLES[executed.role].name}】でした。`, null, "system");

  if (executed.isHuman) {
    GameUI.addMessage("あなたは処刑されました…。以降は観戦モードです。", null, "danger");
  }

  // Win check
  const winner = gameState.checkWinCondition();
  if (winner) {
    gameState.clearSave();
    await sleep(1000);
    GameUI.showResult(winner, gameState);
    return;
  }

  gameState.save();
  GameUI.showContinueButton("🌙 夜へ進む", () => runNightPhase());
}

// 夜フェーズ
async function runNightPhase() {
  gameState.phase = "night";
  GameUI.updateHeader(gameState);
  GameUI.addMessage(`🌙 ${gameState.day}日目の夜 — 静かに能力を行使してください…`, null, "system");

  const alive = gameState.getAlive();
  const human = gameState.getHuman();
  const nightActions = { divine: null, guard: null, attack: null };

  // Human night action
  if (human.isAlive && ROLES[human.role].nightAction) {
    const ability = ROLES[human.role].ability;
    const targets = alive.filter(p => p.id !== human.id);
    let actionTargets = targets;
    let actionLabel = "";

    if (ability === "guard") {
      actionTargets = targets.filter(p => p.id !== gameState.lastGuardTarget);
      actionLabel = "護衛";
      GameUI.addMessage("🛡 護衛する人を選んでください（前夜と同じ人は不可）", null, "system");
    } else if (ability === "divine") {
      actionLabel = "占い";
      GameUI.addMessage("🔮 占う人を選んでください", null, "system");
    } else if (ability === "attack") {
      actionTargets = targets.filter(p => p.role !== "werewolf");
      actionLabel = "襲撃";
      GameUI.addMessage("🐺 襲撃する人を選んでください", null, "system");
    }

    await new Promise(resolve => {
      GameUI.showNightActionButtons(actionTargets, actionLabel, (targetId) => {
        nightActions[ability] = targetId;
        const target = gameState.getPlayerById(targetId);
        GameUI.addMessage(`${target.name} を選択しました`, null, "system");
        resolve();
      });
    });
  } else if (human.isAlive) {
    GameUI.addMessage("あなたには夜の能力がありません。夜が明けるのを待ちましょう…", null, "system");
    await new Promise(resolve => {
      GameUI.showContinueButton("夜が明けるのを待つ", resolve);
    });
  } else {
    GameUI.addMessage("（観戦中です）", null, "system");
    await new Promise(resolve => {
      GameUI.showContinueButton("次へ", resolve);
    });
  }

  // AI night actions
  for (const player of alive) {
    if (player.isHuman) continue;
    if (!ROLES[player.role].nightAction) continue;
    const ability = ROLES[player.role].ability;
    const targetId = await gameLogic.getAiNightAction(player);
    if (targetId) {
      // For werewolf attack: only one attack per night (last wolf's choice wins, or could consolidate)
      nightActions[ability] = targetId;
    }
  }

  // Resolve night
  const result = gameLogic.resolveNight(nightActions);

  // Show divine result to seer
  if (result.divineTarget && human.role === "seer" && human.isAlive) {
    const target = gameState.getPlayerById(result.divineTarget);
    const resultText = result.divineResult === "werewolf" ? "人狼" : "村人";
    GameUI.addMessage(`🔮 占い結果: ${target.name} は【${resultText}】でした`, null, "system");
  }

  await sleep(800);

  // Advance day
  gameState.day++;
  gameState.phase = "day";
  GameUI.updateHeader(gameState);

  // Attack result
  if (result.killed) {
    const killed = gameState.getPlayerById(result.killed);
    GameUI.addMessage(`${killed.name} が無残な姿で発見されました…`, null, "danger");

    await GameUI.showDeathEffect(killed);
    GameUI.renderPlayers(gameState);

    if (killed.isHuman) {
      GameUI.addMessage("あなたは人狼に襲撃されました…。以降は観戦モードです。", null, "danger");
    }
  } else {
    GameUI.addMessage("昨晩は誰も襲撃されませんでした。", null, "system");
  }

  // Win check
  const winner = gameState.checkWinCondition();
  if (winner) {
    gameState.clearSave();
    await sleep(1000);
    GameUI.showResult(winner, gameState);
    return;
  }

  gameState.executedToday = null;
  gameState.save();
  GameUI.showContinueButton("☀ 議論を始める", () => runDayPhase());
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
