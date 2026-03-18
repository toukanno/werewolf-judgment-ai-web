// メインアプリケーション
let gameState = new GameState();
let gameLogic = null;
window._selectedPlayerCount = 5;

// 初期化
window.addEventListener("DOMContentLoaded", () => {
  selectPlayerCount(5);
  const savedKey = localStorage.getItem("werewolf_api_key");
  if (savedKey) document.getElementById("api-key").value = savedKey;

  // 保存データの復帰チェック
  if (GameState.hasSavedGame()) {
    document.getElementById("resume-banner").style.display = "flex";
  }
});

// 保存データから復帰
async function resumeGame() {
  document.getElementById("resume-banner").style.display = "none";
  const apiKey = localStorage.getItem("werewolf_api_key") || "";
  const ai = apiKey ? new OpenRouterAI(apiKey) : new MockAI();

  gameState.reset();
  if (!gameState.load()) {
    // 復帰失敗 → ロビーへ
    showScreen("lobby");
    return;
  }
  gameLogic = new GameLogic(gameState, ai);

  showScreen("game");
  GameUI.clearMessages();
  GameUI.updateHeader(gameState);
  GameUI.updateRolePanel(gameState);
  GameUI.renderPlayers(gameState);

  // 保存されたログを再表示
  for (const entry of gameState.log) {
    if (entry.type === "statement") {
      const player = gameState.players.find(p => p.name === entry.sender);
      if (player && player.isHuman) {
        GameUI.addMessage(entry.content, `🎮 ${entry.sender}`, "you");
      } else if (player) {
        GameUI.addMessage(entry.content, `${player.avatar} ${entry.sender}`, "ai");
      }
    } else {
      GameUI.addMessage(entry.content, null, "system");
    }
  }

  GameUI.addMessage("--- ゲームを再開しました ---", null, "system");

  // 保存時のフェーズに応じて再開
  if (gameState.phase === "night") {
    await runNightPhase();
  } else if (gameState.phase === "vote") {
    await runVotePhase();
  } else {
    await runDayPhase();
  }
}

// 保存データを無視して新規開始
function dismissResume() {
  document.getElementById("resume-banner").style.display = "none";
  gameState.clearSave();
}

// ゲーム開始
async function startGame() {
  const playerName = document.getElementById("player-name").value.trim() || "プレイヤー";
  const count = window._selectedPlayerCount;
  const apiKey = document.getElementById("api-key").value.trim();

  // AI選択
  const ai = apiKey ? new OpenRouterAI(apiKey) : new MockAI();

  // 状態初期化（前回の保存データをクリア）
  gameState.clearSave();
  gameState.reset();
  gameState.initPlayers(playerName, count);
  gameLogic = new GameLogic(gameState, ai);

  // ゲーム画面へ
  showScreen("game");
  GameUI.clearMessages();
  GameUI.updateHeader(gameState);
  GameUI.updateRolePanel(gameState);
  GameUI.renderPlayers(gameState);

  // 役職通知
  const human = gameState.getHuman();
  GameUI.addMessage("ゲームが始まりました。役職が配られます...", null, "system");
  await sleep(800);
  GameUI.addMessage(`あなたの役職は【${ROLES[human.role].name}】です。${ROLES[human.role].description}`, null, "system");

  // 人狼なら仲間を通知
  if (human.role === "werewolf") {
    const allies = gameState.getAliveWerewolves().filter(p => p.id !== human.id);
    if (allies.length > 0) {
      GameUI.addMessage(`仲間の人狼: ${allies.map(a => a.name).join("、")}`, null, "system");
    }
  }

  await sleep(1000);
  gameState.save();
  await runDayPhase();
}

// 昼フェーズ
async function runDayPhase() {
  gameState.phase = "day";
  GameUI.updateHeader(gameState);
  GameUI.updateRolePanel(gameState);

  if (gameState.day === 1) {
    GameUI.addMessage("☀️ 1日目の朝です。今日は処刑はありません。自己紹介をしましょう。", null, "system");
  } else {
    GameUI.addMessage(`☀️ ${gameState.day}日目の昼です。議論の後、投票で1人を処刑します。`, null, "system");
  }

  // AI発言
  const alive = gameState.getAlive();
  for (const player of alive) {
    if (player.isHuman) continue;
    const statement = await gameLogic.getAiStatement(player);
    GameUI.addMessage(statement, `${player.avatar} ${player.name}`, "ai");
    gameState.addLog("statement", statement, player.name);
  }

  // 人間の発言入力（生存時のみ）
  const human = gameState.getHuman();
  if (human.isAlive) {
    await new Promise(resolve => {
      GameUI.showChatInput((text) => {
        GameUI.addMessage(text, `🎮 ${human.name}`, "you");
        gameState.addLog("statement", text, human.name);
        resolve();
      });
    });
  } else {
    // 死亡時は観戦モード
    GameUI.addMessage("（あなたは死亡しています。観戦中です）", null, "system");
    await new Promise(resolve => {
      GameUI.showContinueButton("次へ進む", resolve);
    });
  }

  // 1日目は投票なし
  if (gameState.day === 1) {
    GameUI.addMessage("1日目の議論が終わりました。夜になります...", null, "system");
    gameState.save();
    GameUI.showContinueButton("🌙 夜へ進む", () => runNightPhase());
    return;
  }

  // 投票フェーズ
  gameState.save();
  await runVotePhase();
}

// 投票フェーズ
async function runVotePhase() {
  gameState.phase = "vote";
  GameUI.updateHeader(gameState);
  GameUI.updateRolePanel(gameState);
  GameUI.addMessage("🗳️ 投票の時間です。処刑する人を選んでください。", null, "system");

  const alive = gameState.getAlive();
  const human = gameState.getHuman();
  const votes = {};

  // 人間の投票（生存時のみ）
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
    GameUI.addMessage("（あなたは死亡しているため投票できません）", null, "system");
  }

  // AI投票
  for (const player of alive) {
    if (player.isHuman) continue;
    const targets = alive.filter(p => p.id !== player.id);
    const targetId = await gameLogic.ai.getVote(player, targets, gameState);
    votes[player.id] = targetId;
  }

  // 投票結果表示
  GameUI.addMessage("--- 投票結果 ---", null, "system");
  for (const [voterId, targetId] of Object.entries(votes)) {
    const voter = gameState.getPlayerById(voterId);
    const target = gameState.getPlayerById(targetId);
    if (voter && target) {
      GameUI.addMessage(`${voter.name} → ${target.name}`, null, "system");
    }
  }

  // 集計
  const executedId = gameLogic.tallyVotes(votes);
  const executed = gameState.getPlayerById(executedId);
  await sleep(500);
  if (executed.isHuman) {
    GameUI.addMessage("あなたが処刑されました...！ 以降は観戦モードになります。", null, "danger");
  }
  GameUI.addMessage(`${executed.name} が処刑されました。役職は【${ROLES[executed.role].name}】でした。`, null, "danger");
  gameState.killPlayer(executedId);
  GameUI.renderPlayers(gameState);
  GameUI.updateRolePanel(gameState);

  // 勝敗判定
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
  GameUI.updateRolePanel(gameState);
  GameUI.addMessage(`🌙 ${gameState.day}日目の夜です。静かに能力を行使してください...`, null, "system");

  const alive = gameState.getAlive();
  const human = gameState.getHuman();
  const nightActions = { divine: null, guard: null, attack: null };

  // 人間プレイヤーの夜アクション
  if (human.isAlive && ROLES[human.role].nightAction) {
    const ability = ROLES[human.role].ability;
    const targets = alive.filter(p => p.id !== human.id);
    let actionTargets = targets;

    if (ability === "guard") {
      actionTargets = targets.filter(p => p.id !== gameState.lastGuardTarget);
      GameUI.addMessage("護衛する人を選んでください（前夜と同じ人は不可）", null, "system");
    } else if (ability === "divine") {
      GameUI.addMessage("占う人を選んでください", null, "system");
    } else if (ability === "attack") {
      // 人狼は仲間の人狼を襲撃できない
      actionTargets = targets.filter(p => p.role !== "werewolf");
      GameUI.addMessage("襲撃する人を選んでください", null, "system");
    }

    await new Promise(resolve => {
      const actionName = ability === "divine" ? "占い" : ability === "guard" ? "護衛" : "襲撃";
      GameUI.showNightActionButtons(actionTargets, actionName, (targetId) => {
        nightActions[ability] = targetId;
        const target = gameState.getPlayerById(targetId);
        GameUI.addMessage(`${target.name} を選択しました`, null, "system");
        resolve();
      });
    });
  } else if (human.isAlive) {
    // 能力なしプレイヤー（村人）は待機
    GameUI.addMessage("あなたには夜の能力がありません。夜が明けるのを待ちましょう...", null, "system");
    await new Promise(resolve => {
      GameUI.showContinueButton("夜が明けるのを待つ", resolve);
    });
  } else {
    // 死亡時は観戦
    GameUI.addMessage("（あなたは死亡しています。夜が明けるのを待ちます）", null, "system");
    await new Promise(resolve => {
      GameUI.showContinueButton("次へ進む", resolve);
    });
  }

  // AI夜アクション
  for (const player of alive) {
    if (player.isHuman) continue;
    if (!ROLES[player.role].nightAction) continue;
    const ability = ROLES[player.role].ability;
    const targetId = await gameLogic.getAiNightAction(player);
    if (targetId) {
      nightActions[ability] = targetId;
    }
  }

  // 夜の処理
  const result = gameLogic.resolveNight(nightActions);

  // 占い結果を占い師に通知
  if (result.divineTarget && human.role === "seer" && human.isAlive) {
    const target = gameState.getPlayerById(result.divineTarget);
    const resultText = result.divineResult === "werewolf" ? "人狼" : "村人";
    GameUI.addMessage(`占い結果: ${target.name} は【${resultText}】でした`, null, "system");
  }

  await sleep(1000);

  // 日を進める
  gameState.day++;
  gameState.phase = "day";
  GameUI.updateHeader(gameState);
  GameUI.updateRolePanel(gameState);

  // 襲撃結果
  if (result.killed) {
    const killed = gameState.getPlayerById(result.killed);
    if (killed.isHuman) {
      GameUI.addMessage("あなたは人狼に襲撃されました...！ 以降は観戦モードになります。", null, "danger");
    }
    GameUI.addMessage(`${killed.name} が無残な姿で発見されました...`, null, "danger");
    GameUI.renderPlayers(gameState);
    GameUI.updateRolePanel(gameState);
  } else {
    GameUI.addMessage("昨晩は誰も襲撃されませんでした。", null, "system");
  }

  // 勝敗判定
  const winner = gameState.checkWinCondition();
  if (winner) {
    gameState.clearSave();
    await sleep(1000);
    GameUI.showResult(winner, gameState);
    return;
  }

  gameState.save();
  GameUI.showContinueButton("☀️ 議論を始める", () => runDayPhase());
}

// ユーティリティ
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
