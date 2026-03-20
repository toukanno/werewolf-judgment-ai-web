/**
 * メインアプリケーション — 人狼ジャッジメント
 * Game orchestration, phase management, and player interaction handling
 */

let gameState = new GameState();
let gameLogic = null;
window._selectedPlayerCount = 5;

/**
 * Initialize application on DOM load
 */
window.addEventListener("DOMContentLoaded", () => {
  selectPlayerCount(5);

  // Load saved API key
  const savedKey = localStorage.getItem("werewolf_api_key");
  if (savedKey) document.getElementById("api-key").value = savedKey;

  // Check for saved game and show resume banner
  if (GameState.hasSavedGame()) {
    document.getElementById("resume-banner").style.display = "flex";
  }
});

/**
 * Resume a previously saved game
 */
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

  // Replay game log
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

/**
 * Dismiss resume banner and start fresh
 */
function dismissResume() {
  document.getElementById("resume-banner").style.display = "none";
  gameState.clearSave();
}

/**
 * Start a new game
 */
async function startGame() {
  const playerName = document.getElementById("player-name").value.trim() || "プレイヤー";
  const count = window._selectedPlayerCount;
  const apiKey = document.getElementById("api-key").value.trim();

  if (apiKey) {
    localStorage.setItem("werewolf_api_key", apiKey);
  }

  const ai = apiKey ? new OpenRouterAI(apiKey) : new MockAI();

  gameState.clearSave();
  gameState.reset();

  // Get composition from UI (custom or preset)
  const composition = (typeof getCustomComposition === 'function') ? getCustomComposition() : null;

  // Initialize with composition
  gameState.initPlayers(playerName, count, composition);

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

  // Notify allies based on role
  notifyAllies(human);

  await sleep(500);
  gameState.save();
  await runDayPhase();
}

/**
 * Notify human player of their allies based on role
 */
function notifyAllies(human) {
  if (human.role === "werewolf") {
    const allies = gameState.getAliveWerewolves().filter(p => p.id !== human.id);
    if (allies.length > 0) {
      GameUI.addMessage(`🐺 仲間の人狼: ${allies.map(a => a.name).join("、")}`, null, "system");
    }
  }

  if (human.role === "madman") {
    GameUI.addMessage("🃏 あなたは狂人です。人狼陣営の勝利を目指しましょう。", null, "system");
  }

  if (human.role === "fanatic") {
    const wolves = gameState.getAliveWerewolves().filter(p => p.id !== human.id);
    if (wolves.length > 0) {
      GameUI.addMessage(`👁️ 人狼のメンバー: ${wolves.map(w => w.name).join("、")}`, null, "system");
    }
  }

  // Lovers see each other
  if (gameState.loversIds.includes(human.id)) {
    const lover = gameState.players.find(p =>
      gameState.loversIds.includes(p.id) && p.id !== human.id && p.isAlive
    );
    if (lover) {
      GameUI.addMessage(`💕 恋人: ${lover.name}`, null, "system");
    }
  }

  // Immoralist sees fox
  if (human.role === "immoralist") {
    const fox = gameState.players.find(p => p.role === "fox" && p.isAlive);
    if (fox) {
      GameUI.addMessage(`🦊 妖狐: ${fox.name}`, null, "system");
    }
  }
}

/**
 * Run day phase: AI statements, human chat, then proceed to vote or night
 */
async function runDayPhase() {
  gameState.phase = "day";
  GameUI.updateHeader(gameState);

  const human = gameState.getHuman();

  if (gameState.day === 1) {
    GameUI.addMessage("☀ 1日目の朝 — 今日は処刑はありません。自己紹介をしましょう。", null, "system");
  } else {
    GameUI.addMessage(`☀ ${gameState.day}日目の昼 — 議論の後、投票で1人を処刑します。`, null, "system");
  }

  // Show baker notification
  const aliveBaker = gameState.getAlive().find(p => p.role === "baker");
  if (aliveBaker && gameState.day > 1) {
    GameUI.addMessage("🍞 パンが焼けました！", null, "system");
  }

  // Show medium result
  if (human.role === "medium" && human.isAlive && gameState.mediumResults.length > 0) {
    const lastResult = gameState.mediumResults[gameState.mediumResults.length - 1];
    const resultText = lastResult.result === "werewolf" ? "人狼" : "村人";
    GameUI.addMessage(`👁 霊能結果: ${lastResult.name}は【${resultText}】でした`, null, "system");
  }

  // Red hood revival check: if all wolves dead, revive suspended players
  if (gameState.getAliveWerewolves().length === 0 && gameState.suspendedPlayers.length > 0) {
    for (const playerId of gameState.suspendedPlayers) {
      const player = gameState.getPlayerById(playerId);
      if (player && !player.isAlive) {
        player.isAlive = true;
        GameUI.addMessage(`✨ ${player.name} が赤ずきんの力で蘇りました！`, null, "system");
      }
    }
    gameState.suspendedPlayers = [];
  }

  // AI statements
  const alive = gameState.getAlive();
  for (const player of alive) {
    if (player.isHuman) continue;
    const statement = await gameLogic.getAiStatement(player);
    GameUI.addMessage(statement, null, "ai", player);
    gameState.addLog("statement", statement, player.name);
    await sleep(300);
  }

  // Human input
  let humanText = "";
  if (human.isAlive) {
    await new Promise(resolve => {
      GameUI.showChatInput((text) => {
        humanText = text;
        GameUI.addMessage(text, null, "you", human);
        gameState.addLog("statement", text, human.name);

        // Check if talkative wolf used word
        if (human.role === "talkativeWolf" && gameState.talkativeWolfWord) {
          if (text.includes(gameState.talkativeWolfWord)) {
            GameUI.addMessage(`🎯 禁句「${gameState.talkativeWolfWord}」を言ってしまった！`, null, "danger");
            gameState.talkativeWolfWord = null;
          }
        }

        resolve();
      });
    });

    // AI reactions to human's message (1-2 AIs respond after 2-3 seconds)
    if (humanText) {
      const aliveAI = gameState.getAlive().filter(p => !p.isHuman);
      const reactorCount = Math.min(2, aliveAI.length);
      const reactors = aliveAI.sort(() => Math.random() - 0.5).slice(0, reactorCount);
      for (const reactor of reactors) {
        await sleep(1500 + Math.random() * 1500);
        const reaction = await gameLogic.getAiReaction(reactor, humanText);
        if (reaction) {
          GameUI.addMessage(reaction, null, "ai", reactor);
          gameState.addLog("statement", reaction, reactor.name);
        }
      }
    }
  } else {
    GameUI.addMessage("（あなたは死亡しています。観戦中…）", null, "system");
    await new Promise(resolve => {
      GameUI.showContinueButton("次へ", resolve);
    });
  }

  // Day 1: no execution, proceed to night
  if (gameState.day === 1) {
    GameUI.addMessage("1日目の議論が終了。夜になります…", null, "system");
    gameState.save();
    GameUI.showContinueButton("🌙 夜へ進む", () => runNightPhase());
    return;
  }

  // Day 2+: handle day actions (assassin, dictator) then proceed to vote
  if (human.isAlive && ROLES[human.role]) {
    const role = ROLES[human.role];

    // Assassin day action
    if (human.role === "assassin" && !gameState.assassinUsed) {
      GameUI.addMessage("🗡 暗殺者として、昼間に一人を暗殺できます。", null, "system");
      await new Promise(resolve => {
        const targets = alive.filter(p => p.id !== human.id);
        GameUI.showNightActionButtons(targets, "暗殺", (targetId) => {
          const target = gameState.getPlayerById(targetId);
          gameState.assassinUsed = true;
          gameState.killPlayer(targetId, 'assassin');
          GameUI.addMessage(`${target.name} が暗殺されました！`, null, "danger");
          GameUI.renderPlayers(gameState);
          resolve();
        });
      });
    }

    // Dictator day action
    if (human.role === "dictator" && !gameState.dictatorUsed) {
      GameUI.addMessage("👑 独裁者として、昼間に一人を強制投票対象にできます。", null, "system");
      await new Promise(resolve => {
        const targets = alive.filter(p => p.id !== human.id);
        GameUI.showNightActionButtons(targets, "指定", (targetId) => {
          gameState.dictatorTarget = targetId;
          gameState.dictatorUsed = true;
          const target = gameState.getPlayerById(targetId);
          GameUI.addMessage(`${target.name} が投票対象に指定されました。`, null, "system");
          resolve();
        });
      });
    }
  }

  gameState.save();
  await runVotePhase();
}

/**
 * Run vote phase: human votes, AI votes, tally, execute, check win
 */
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

  // Show vote results
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

  // Dictator overrides vote result
  if (gameState.dictatorTarget) {
    const dictTarget = gameState.dictatorTarget;
    gameState.dictatorTarget = null;
    const dt = gameState.getPlayerById(dictTarget);
    if (dt && dt.isAlive) {
      GameUI.addMessage(`👑 独裁者の命令により ${dt.name} が処刑されます！`, null, "danger");
      gameState.executedToday = dictTarget;
      const dtRoleName = (ROLES[dt.role] && ROLES[dt.role].name) || dt.role;
      await GameUI.showDeathEffect(dt);
      gameLogic.handleExecution(dictTarget);
      if (gameState.getPlayerById(dictTarget)?.isAlive) gameState.killPlayer(dictTarget);
      GameUI.renderPlayers(gameState);
      GameUI.addMessage(`${dt.name} の役職は【${dtRoleName}】でした。`, null, "system");
      const winnerDt = gameState.checkWinCondition();
      if (winnerDt) { gameState.clearSave(); await sleep(1000); GameUI.showResult(winnerDt, gameState); return; }
      gameState.save();
      GameUI.showContinueButton("🌙 夜へ進む", () => runNightPhase());
      return;
    }
  }

  // Tally votes with mayor bonus
  const executedId = gameLogic.tallyVotes(votes);
  if (!executedId) {
    GameUI.addMessage("投票が無効でした。夜へ進みます。", null, "system");
    gameState.save();
    GameUI.showContinueButton("🌙 夜へ進む", () => runNightPhase());
    return;
  }
  const executed = gameState.getPlayerById(executedId);
  const voteCount = voteCounts[executedId] || 0;
  await sleep(500);

  GameUI.addMessage(`${executed.name} が${voteCount}票で処刑されました。`, null, "danger");
  gameState.executedToday = executedId;

  // Death effect
  await GameUI.showDeathEffect(executed);

  // Handle execution effects (lover chain, queen chain, etc.)
  gameLogic.handleExecution(executedId);

  // killPlayer is already called inside handleExecution
  if (gameState.getPlayerById(executedId)?.isAlive) {
    gameState.killPlayer(executedId);
  }
  GameUI.renderPlayers(gameState);

  const executedRoleName = (ROLES[executed.role] && ROLES[executed.role].name) || executed.role;
  GameUI.addMessage(`${executed.name} の役職は【${executedRoleName}】でした。`, null, "system");

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

/**
 * Run night phase: abilities, resolve, show results
 */
async function runNightPhase() {
  gameState.phase = "night";
  GameUI.updateHeader(gameState);
  GameUI.addMessage(`🌙 ${gameState.day}日目の夜 — 静かに能力を行使してください…`, null, "system");

  const alive = gameState.getAlive();
  const human = gameState.getHuman();
  const nightActions = {};

  // Human night action
  if (human.isAlive && ROLES[human.role] && ROLES[human.role].nightAction) {
    const ability = ROLES[human.role].ability;
    const targets = alive.filter(p => p.id !== human.id);
    let actionTargets = targets;
    let actionLabel = "";

    const abilityLabels = {
      guard: "護衛", divine: "占い", attack: "襲撃", heal: "治癒",
      trap: "罠設置", sageDiv: "賢者占い", fakeDivine: "占い",
      steal: "怪盗", haunt: "呪い", bless: "祝福", witch: "魔女",
      flee: "逃亡", sorcery: "妖術", frame: "フレーム",
      weakDivine: "占い", gift: "贈り物", watchdog: "番犬",
      matchmake: "恋結び", investigate: "調査", housekeep: "訪問",
      gamble: "ギャンブル", paladinCheck: "聖騎士調査", darkDivine: "闇占い",
      seal: "封印", zombieAttack: "ゾンビ襲撃", seduce: "誘惑",
      chooseLove: "選択", poison: "毒殺"
    };
    actionLabel = abilityLabels[ability] || ROLES[human.role].name;

    if (ability === "guard") {
      actionTargets = targets.filter(p => p.id !== gameState.lastGuardTarget);
      GameUI.addMessage("🛡 護衛する人を選んでください（前夜と同じ人は不可）", null, "system");
    } else if (ability === "divine" || ability === "sageDiv" || ability === "fakeDivine" || ability === "weakDivine") {
      GameUI.addMessage("🔮 占う人を選んでください", null, "system");
    } else if (ability === "attack") {
      actionTargets = targets.filter(p => {
        const r = ROLES[p.role];
        return !r || r.team !== "werewolf";
      });
      GameUI.addMessage("🐺 襲撃する人を選んでください", null, "system");
    } else {
      GameUI.addMessage(`${ROLES[human.role].icon || '✨'} ${actionLabel}する人を選んでください`, null, "system");
    }

    if (actionTargets.length > 0) {
      await new Promise(resolve => {
        GameUI.showNightActionButtons(actionTargets, actionLabel, (targetId) => {
          nightActions[ability] = targetId;
          const target = gameState.getPlayerById(targetId);
          GameUI.addMessage(`${target.name} を選択しました`, null, "system");
          resolve();
        });
      });
    } else {
      GameUI.addMessage("対象がいません。", null, "system");
      await new Promise(resolve => {
        GameUI.showContinueButton("次へ", resolve);
      });
    }
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
    if (!ROLES[player.role] || !ROLES[player.role].nightAction) continue;
    const ability = ROLES[player.role].ability;
    const targetId = await gameLogic.getAiNightAction(player);
    if (targetId) {
      // Attack supports multiple wolves — collect as array
      if (ability === "attack") {
        if (!nightActions.attack) nightActions.attack = targetId;
        // If multiple wolves choose different targets, keep first (consensus)
      } else {
        nightActions[ability] = targetId;
      }
    }
  }

  // Resolve night
  const result = gameLogic.resolveNight(nightActions);

  // Show divine result to human seer
  if (result.divineTarget && human.role === "seer" && human.isAlive) {
    const target = gameState.getPlayerById(result.divineTarget);
    const resultText = result.divineResult === "werewolf" ? "人狼" : "村人";
    GameUI.addMessage(`🔮 占い結果: ${target.name} は【${resultText}】でした`, null, "system");
  }

  await sleep(800);

  // Advance to next day
  gameState.day++;
  gameState.phase = "day";
  GameUI.updateHeader(gameState);

  // Show attack results (killed is an array)
  const killedIds = Array.isArray(result.killed) ? result.killed : (result.killed ? [result.killed] : []);
  if (killedIds.length > 0) {
    for (const killedId of killedIds) {
      const killed = gameState.getPlayerById(killedId);
      if (!killed) continue;
      GameUI.addMessage(`${killed.name} が無残な姿で発見されました…`, null, "danger");
      await GameUI.showDeathEffect(killed);

      if (killed.isHuman) {
        GameUI.addMessage("あなたは人狼に襲撃されました…。以降は観戦モードです。", null, "danger");
      }
    }
    GameUI.renderPlayers(gameState);
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

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
