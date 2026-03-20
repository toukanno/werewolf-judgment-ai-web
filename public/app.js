/**
 * メインアプリケーション — 人狼ジャッジメントAI
 * Game orchestration: day discussion → vote → night → result loop
 * All game-area buttons use addEventListener (no inline onclick in game flow)
 */

let gameState = new GameState();
let gameLogic = null;
window._selectedPlayerCount = 5;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Add a message to the chat area */
function addMsg(text, type = "system", player = null) {
  GameUI.addMessage(text, null, type, player);
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

window.addEventListener("DOMContentLoaded", () => {
  selectPlayerCount(5);
  const savedProvider = localStorage.getItem("werewolf_api_type") || "none";
  const savedKey = localStorage.getItem("werewolf_api_key") || "";
  const providerEl = document.getElementById("api-provider");
  if (providerEl) providerEl.value = savedProvider;
  const keyEl = document.getElementById("api-key");
  if (keyEl && savedKey) keyEl.value = savedKey;
  onProviderChange();
  if (GameState.hasSavedGame()) {
    document.getElementById("resume-banner").style.display = "flex";
  }
});

function onProviderChange() {
  const provider = document.getElementById("api-provider")?.value || "none";
  const section = document.getElementById("api-key-section");
  if (section) section.style.display = provider === "none" ? "none" : "block";
}

async function testApiKey() {
  const provider = document.getElementById("api-provider")?.value || "none";
  const apiKey = document.getElementById("api-key")?.value.trim() || "";
  const statusEl = document.getElementById("api-key-status");
  if (!statusEl) return;
  if (provider === "none" || !apiKey) {
    statusEl.textContent = "プロバイダとAPIキーを選択してください";
    statusEl.className = "api-status error";
    return;
  }
  statusEl.textContent = "接続確認中…";
  statusEl.className = "api-status";
  const ok = await OpenRouterAI.testConnection(apiKey, provider);
  if (ok) {
    statusEl.textContent = "✓ 接続成功";
    statusEl.className = "api-status ok";
  } else {
    statusEl.textContent = "✗ 接続失敗（キーまたはプロバイダを確認してください）";
    statusEl.className = "api-status error";
  }
}

function clearApiKey() {
  const keyEl = document.getElementById("api-key");
  if (keyEl) keyEl.value = "";
  localStorage.removeItem("werewolf_api_key");
  localStorage.removeItem("werewolf_api_type");
  const providerEl = document.getElementById("api-provider");
  if (providerEl) providerEl.value = "none";
  onProviderChange();
  const statusEl = document.getElementById("api-key-status");
  if (statusEl) { statusEl.textContent = "クリアしました"; statusEl.className = "api-status"; }
}

// ─── Resume ───────────────────────────────────────────────────────────────────

async function resumeGame() {
  document.getElementById("resume-banner").style.display = "none";
  const apiKey = localStorage.getItem("werewolf_api_key") || "";
  const apiType = localStorage.getItem("werewolf_api_type") || "none";
  const ai = (apiKey && apiType !== "none") ? new OpenRouterAI(apiKey, apiType) : new MockAI();

  gameState.reset();
  if (!gameState.load()) { showScreen("lobby"); return; }
  gameLogic = new GameLogic(gameState, ai);

  showScreen("game");
  GameUI.clearMessages();
  GameUI.updateHeader(gameState);
  GameUI.renderPlayers(gameState);

  for (const entry of gameState.log) {
    if (entry.type === "statement") {
      const p = gameState.players.find(q => q.name === entry.sender);
      if (p && p.isHuman) addMsg(entry.content, "you", p);
      else if (p) addMsg(entry.content, "ai", p);
    } else {
      addMsg(entry.content, entry.type === "danger" ? "danger" : "system");
    }
  }
  addMsg("--- ゲームを再開しました ---");

  if (gameState.phase === "night") await runNightPhase();
  else if (gameState.phase === "vote") await runVotePhase();
  else await runDayPhase();
}

function dismissResume() {
  document.getElementById("resume-banner").style.display = "none";
  gameState.clearSave();
}

// ─── Start New Game ───────────────────────────────────────────────────────────

async function startGame() {
  const playerName = document.getElementById("player-name").value.trim() || "プレイヤー";
  const count = window._selectedPlayerCount;
  const apiKey = document.getElementById("api-key")?.value.trim() || "";
  const apiType = document.getElementById("api-provider")?.value || "none";
  if (apiKey) localStorage.setItem("werewolf_api_key", apiKey);
  localStorage.setItem("werewolf_api_type", apiType);

  const ai = (apiKey && apiType !== "none") ? new OpenRouterAI(apiKey, apiType) : new MockAI();
  console.log(`[AI] Using ${apiKey && apiType !== "none" ? apiType : "MockAI"}`);

  // Validate custom composition
  const composition = (typeof getCustomComposition === 'function') ? getCustomComposition() : null;
  if (composition) {
    const total = Object.values(composition).reduce((s, c) => s + c, 0);
    if (total !== count) {
      alert(`役職の合計人数（${total}人）がプレイヤー数（${count}人）と一致しません。`);
      return;
    }
    const hasWolf = Object.entries(composition).some(([id, cnt]) => {
      const r = ROLES[id];
      return r && r.team === "werewolf" && cnt > 0;
    });
    if (!hasWolf) {
      alert("人狼が1人以上必要です。");
      return;
    }
  }

  gameState.clearSave();
  gameState.reset();
  gameState.initPlayers(playerName, count, composition);
  gameLogic = new GameLogic(gameState, ai);

  showScreen("game");
  GameUI.clearMessages();
  GameUI.updateHeader(gameState);
  GameUI.renderPlayers(gameState);

  const human = gameState.getHuman();
  addMsg("ゲームが始まります。役職を配ります…");
  await sleep(600);
  await GameUI.showRoleReveal(human);
  notifyAllies(human);
  await sleep(500);
  gameState.save();
  await runDayPhase();
}

// ─── Ally Notifications ───────────────────────────────────────────────────────

function notifyAllies(human) {
  if (human.role === "werewolf") {
    const allies = gameState.getAliveWerewolves().filter(p => p.id !== human.id);
    if (allies.length > 0)
      addMsg(`🐺 仲間の人狼: ${allies.map(a => a.name).join("、")}`);
  }
  if (human.role === "madman")
    addMsg("🃏 あなたは狂人です。人狼陣営の勝利を目指しましょう。");
  if (human.role === "fanatic") {
    const wolves = gameState.getAliveWerewolves().filter(p => p.id !== human.id);
    if (wolves.length > 0)
      addMsg(`👁️ 人狼のメンバー: ${wolves.map(w => w.name).join("、")}`);
  }
  if (gameState.loversIds.includes(human.id)) {
    const lover = gameState.players.find(p =>
      gameState.loversIds.includes(p.id) && p.id !== human.id && p.isAlive
    );
    if (lover) addMsg(`💕 恋人: ${lover.name}`);
  }
  if (human.role === "immoralist") {
    const fox = gameState.players.find(p => p.role === "fox" && p.isAlive);
    if (fox) addMsg(`🦊 妖狐: ${fox.name}`);
  }
}

// ─── DAY PHASE ────────────────────────────────────────────────────────────────

async function runDayPhase() {
  gameState.phase = "day";
  document.getElementById("screen-game")?.classList.remove("phase-night");
  GameUI.updateHeader(gameState);
  const human = gameState.getHuman();

  if (gameState.day === 1) {
    addMsg("☀ 1日目の朝 — 今日は処刑はありません。自己紹介をしましょう。");
  } else {
    addMsg(`☀ ${gameState.day}日目の昼 — 議論の後、投票で1人を処刑します。`);
  }

  // Baker notification
  if (gameState.getAlive().find(p => p.role === "baker") && gameState.day > 1)
    addMsg("🍞 パンが焼けました！");

  // Medium result
  if (human.role === "medium" && human.isAlive && gameState.mediumResults.length > 0) {
    const last = gameState.mediumResults[gameState.mediumResults.length - 1];
    addMsg(`👁 霊能結果: ${last.name}は【${last.result === "werewolf" ? "人狼" : "村人"}】でした`);
  }

  // Red hood revival
  if (gameState.getAliveWerewolves().length === 0 && gameState.suspendedPlayers.length > 0) {
    for (const id of gameState.suspendedPlayers) {
      const p = gameState.getPlayerById(id);
      if (p && !p.isAlive) { p.isAlive = true; addMsg(`✨ ${p.name} が蘇りました！`); }
    }
    gameState.suspendedPlayers = [];
  }

  // AI statements — 1-2 second intervals
  const alive = gameState.getAlive();
  let firstAi = true;
  for (const player of alive) {
    if (player.isHuman) continue;
    await sleep(firstAi ? (800 + Math.random() * 400) : (1000 + Math.random() * 1000));
    firstAi = false;
    const stmt = await gameLogic.getAiStatement(player);
    addMsg(stmt, "ai", player);
    gameState.addLog("statement", stmt, player.name);
  }

  // Human persistent discussion
  const isDay1 = gameState.day === 1;
  const proceedLabel = isDay1 ? "🌙 夜へ進む" : "⚔ 投票に進む ▶";

  if (human.isAlive) {
    await new Promise(resolve => {
      GameUI.showDiscussionInput(
        async (text) => {
          addMsg(text, "you", human);
          gameState.addLog("statement", text, human.name);
          if (human.role === "talkativeWolf" && gameState.talkativeWolfWord &&
              text.includes(gameState.talkativeWolfWord)) {
            addMsg(`🎯 禁句「${gameState.talkativeWolfWord}」を言ってしまった！`, "danger");
            gameState.talkativeWolfWord = null;
          }
          // AI reactions — lock UI while reacting
          GameUI.setDiscussionSendLocked(true);
          const reactors = gameState.getAlive()
            .filter(p => !p.isHuman)
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.min(2, alive.length));
          for (const r of reactors) {
            await sleep(1500 + Math.random() * 1500);
            const reaction = await gameLogic.getAiReaction(r, text);
            if (reaction) { addMsg(reaction, "ai", r); gameState.addLog("statement", reaction, r.name); }
          }
          GameUI.setDiscussionSendLocked(false);
        },
        resolve,
        proceedLabel
      );
    });
  } else {
    addMsg("（あなたは死亡しています。観戦中…）");
    await waitForContinue("次へ");
  }

  // Day 1 → night
  if (isDay1) {
    addMsg("1日目の議論が終了。夜になります…");
    gameState.save();
    GameUI.showContinueButton("🌙 夜へ進む", () => runNightPhase());
    return;
  }

  // Day 2+ special actions (assassin, dictator)
  if (human.isAlive) {
    if (human.role === "assassin" && !gameState.assassinUsed) {
      addMsg("🗡 暗殺者として、昼間に一人を暗殺できます。");
      const targets = alive.filter(p => p.id !== human.id);
      await waitForNightAction(targets, "暗殺", (tid) => {
        const t = gameState.getPlayerById(tid);
        gameState.assassinUsed = true;
        gameState.killPlayer(tid, "assassin");
        addMsg(`${t.name} が暗殺されました！`, "danger");
        GameUI.renderPlayers(gameState);
      });
    }
    if (human.role === "dictator" && !gameState.dictatorUsed) {
      addMsg("👑 独裁者として、昼間に一人を強制投票対象にできます。");
      const targets = alive.filter(p => p.id !== human.id);
      await waitForNightAction(targets, "指定", (tid) => {
        gameState.dictatorTarget = tid;
        gameState.dictatorUsed = true;
        addMsg(`${gameState.getPlayerById(tid).name} が投票対象に指定されました。`);
      });
    }
  }

  gameState.save();
  await runVotePhase();
}

// ─── VOTE PHASE ───────────────────────────────────────────────────────────────

async function runVotePhase() {
  gameState.phase = "vote";
  GameUI.updateHeader(gameState);
  addMsg("⚔ 投票の時間です。処刑する人を選んでください。");

  const alive = gameState.getAlive();
  const human = gameState.getHuman();
  const votes = {};

  // Human vote
  if (human.isAlive) {
    const targets = alive.filter(p => p.id !== human.id);
    const targetId = await waitForVote(targets);
    votes[human.id] = targetId;
    addMsg(`あなたは ${gameState.getPlayerById(targetId).name} に投票しました`);
  }

  // AI votes
  for (const player of alive) {
    if (player.isHuman) continue;
    const targets = alive.filter(p => p.id !== player.id);
    votes[player.id] = await gameLogic.ai.getVote(player, targets, gameState);
  }

  // Show vote results
  addMsg("━━━ 投票結果 ━━━");
  const voteCounts = {};
  for (const [voterId, targetId] of Object.entries(votes)) {
    const voter = gameState.getPlayerById(voterId);
    const target = gameState.getPlayerById(targetId);
    if (voter && target) {
      addMsg(`${voter.name} → ${target.name}`);
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }
  }

  // Dictator override
  if (gameState.dictatorTarget) {
    const dt = gameState.getPlayerById(gameState.dictatorTarget);
    gameState.dictatorTarget = null;
    if (dt && dt.isAlive) {
      addMsg(`👑 独裁者の命令により ${dt.name} が処刑されます！`, "danger");
      gameState.executedToday = dt.id;
      await GameUI.showDeathEffect(dt);
      gameLogic.handleExecution(dt.id);
      if (gameState.getPlayerById(dt.id)?.isAlive) gameState.killPlayer(dt.id);
      GameUI.renderPlayers(gameState);
      addMsg(`${dt.name} の役職は【${(ROLES[dt.role] && ROLES[dt.role].name) || dt.role}】でした。`);
      const w = gameState.checkWinCondition();
      if (w) { gameState.clearSave(); await sleep(1000); GameUI.showResult(w, gameState); return; }
      gameState.save();
      GameUI.showContinueButton("🌙 夜へ進む", () => runNightPhase());
      return;
    }
  }

  // Tally votes
  const executedId = gameLogic.tallyVotes(votes);
  if (!executedId) {
    addMsg("投票が無効でした。夜へ進みます。");
    gameState.save();
    GameUI.showContinueButton("🌙 夜へ進む", () => runNightPhase());
    return;
  }

  const executed = gameState.getPlayerById(executedId);
  const voteCount = voteCounts[executedId] || 0;
  await sleep(500);
  addMsg(`${executed.name} が${voteCount}票で処刑されました。`, "danger");
  gameState.executedToday = executedId;

  await GameUI.showDeathEffect(executed);
  gameLogic.handleExecution(executedId);
  if (gameState.getPlayerById(executedId)?.isAlive) gameState.killPlayer(executedId);
  GameUI.renderPlayers(gameState);

  const roleName = (ROLES[executed.role] && ROLES[executed.role].name) || executed.role;
  addMsg(`${executed.name} の役職は【${roleName}】でした。`);
  if (executed.isHuman) addMsg("あなたは処刑されました…。以降は観戦モードです。", "danger");

  const winner = gameState.checkWinCondition();
  if (winner) { gameState.clearSave(); await sleep(1000); GameUI.showResult(winner, gameState); return; }

  gameState.save();
  GameUI.showContinueButton("🌙 夜へ進む", () => runNightPhase());
}

// ─── NIGHT PHASE ──────────────────────────────────────────────────────────────

async function runNightPhase() {
  gameState.phase = "night";
  document.getElementById("screen-game")?.classList.add("phase-night");
  GameUI.updateHeader(gameState);
  addMsg(`🌙 ${gameState.day}日目の夜 — 静かに能力を行使してください…`);

  const alive = gameState.getAlive();
  const human = gameState.getHuman();
  const nightActions = {};

  // Human night action
  if (human.isAlive && ROLES[human.role] && ROLES[human.role].nightAction) {
    const ability = ROLES[human.role].ability;
    const targets = alive.filter(p => p.id !== human.id);
    let actionTargets = targets;

    const labels = {
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
    const actionLabel = labels[ability] || ROLES[human.role].name;

    if (ability === "guard") {
      actionTargets = targets.filter(p => p.id !== gameState.lastGuardTarget);
      addMsg("🛡 護衛する人を選んでください（前夜と同じ人は不可）");
    } else if (["divine", "sageDiv", "fakeDivine", "weakDivine"].includes(ability)) {
      addMsg("🔮 占う人を選んでください");
    } else if (ability === "attack") {
      actionTargets = targets.filter(p => { const r = ROLES[p.role]; return !r || r.team !== "werewolf"; });
      addMsg("🐺 襲撃する人を選んでください");
    } else {
      addMsg(`${ROLES[human.role].icon || "✨"} ${actionLabel}する人を選んでください`);
    }

    if (actionTargets.length > 0) {
      await waitForNightAction(actionTargets, actionLabel, (tid) => {
        nightActions[ability] = tid;
        addMsg(`${gameState.getPlayerById(tid).name} を選択しました`);
      });
    } else {
      addMsg("対象がいません。");
      await waitForContinue("次へ");
    }
  } else if (human.isAlive) {
    addMsg("あなたには夜の能力がありません。夜が明けるのを待ちましょう…");
    await waitForContinue("夜が明けるのを待つ");
  } else {
    addMsg("（観戦中です）");
    await waitForContinue("次へ");
  }

  // AI night actions
  for (const player of alive) {
    if (player.isHuman) continue;
    if (!ROLES[player.role] || !ROLES[player.role].nightAction) continue;
    const ability = ROLES[player.role].ability;
    const tid = await gameLogic.getAiNightAction(player);
    if (tid) {
      if (ability === "attack") { if (!nightActions.attack) nightActions.attack = tid; }
      else nightActions[ability] = tid;
    }
  }

  // Resolve night
  const result = gameLogic.resolveNight(nightActions);

  // Show seer result to human seer
  if (result.divineTarget && human.role === "seer" && human.isAlive) {
    const t = gameState.getPlayerById(result.divineTarget);
    addMsg(`🔮 占い結果: ${t.name} は【${result.divineResult === "werewolf" ? "人狼" : "村人"}】でした`);
  }

  // Show sage result
  if (result.sageTarget && human.role === "sage" && human.isAlive) {
    const t = gameState.getPlayerById(result.sageTarget);
    const roleName = (ROLES[result.sageResult] && ROLES[result.sageResult].name) || result.sageResult;
    addMsg(`📖 賢者占い結果: ${t.name} の役職は【${roleName}】でした`);
  }

  await sleep(800);

  // Advance to next day
  gameState.day++;
  gameState.phase = "day";
  GameUI.updateHeader(gameState);

  // Show attack results
  const killedIds = Array.isArray(result.killed) ? result.killed : (result.killed ? [result.killed] : []);
  if (killedIds.length > 0) {
    for (const id of killedIds) {
      const k = gameState.getPlayerById(id);
      if (!k) continue;
      addMsg(`${k.name} が無残な姿で発見されました…`, "danger");
      await GameUI.showDeathEffect(k);
      if (k.isHuman) addMsg("あなたは人狼に襲撃されました…。以降は観戦モードです。", "danger");
    }
    GameUI.renderPlayers(gameState);
  } else {
    addMsg("昨晩は誰も襲撃されませんでした。");
  }

  const winner = gameState.checkWinCondition();
  if (winner) { gameState.clearSave(); await sleep(1000); GameUI.showResult(winner, gameState); return; }

  gameState.executedToday = null;
  gameState.save();
  GameUI.showContinueButton("☀ 議論を始める", () => runDayPhase());
}

// ─── UI Wait Helpers ──────────────────────────────────────────────────────────

/** Show a continue button and wait for click */
function waitForContinue(label) {
  return new Promise(resolve => {
    GameUI.showContinueButton(label, resolve);
  });
}

/** Show vote grid and wait for player to tap a target */
function waitForVote(targets) {
  return new Promise(resolve => {
    // Build vote grid HTML
    let html = '<div style="display:flex;flex-direction:column;gap:8px;">';
    html += '<p style="font-size:12px;color:var(--text2);text-align:center;">投票先を選んでください（タップで選択、決定ボタンで確定）</p>';
    html += '<div class="vote-grid" id="vote-grid-inner">';
    for (const t of targets) {
      const role = ROLES[t.role || "villager"];
      const color = TEAM_INFO[role?.team || "other"]?.color || "#999";
      html += `<button class="vote-btn" data-id="${t.id}" style="border-color:var(--border);">
        <div class="vote-avatar" style="background:${color}">${t.name.charAt(0)}</div>
        <div class="vote-name">${GameUI.escapeHtml(t.name)}</div>
      </button>`;
    }
    html += '</div>';
    html += '<button id="vote-confirm-btn" class="btn btn-primary" disabled style="width:100%;padding:12px;font-size:15px;font-weight:700;opacity:0.5;">決定</button>';
    html += '</div>';
    GameUI.setAction(html);

    let selected = null;
    const confirmBtn = document.getElementById("vote-confirm-btn");

    document.querySelectorAll(".vote-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        // Highlight selected
        document.querySelectorAll(".vote-btn").forEach(b => {
          b.style.borderColor = "var(--border)";
          b.style.boxShadow = "";
        });
        btn.style.borderColor = "var(--accent)";
        btn.style.boxShadow = "0 0 12px var(--accent-glow)";
        selected = btn.dataset.id;
        if (confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.style.opacity = "1";
        }
      });
    });

    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        if (selected) resolve(selected);
      });
    }
  });
}

/** Show night action grid and resolve with chosen target, then call onSelect callback */
function waitForNightAction(targets, label, onSelect) {
  return new Promise(resolve => {
    GameUI.showNightActionButtons(targets, label, (tid) => {
      onSelect(tid);
      resolve();
    });
  });
}
