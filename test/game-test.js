// ヘッドレスゲームロジックテスト
// ブラウザなしで GameState + GameLogic + MockAI の動作を検証

// --- モジュールをインライン読み込み (グローバルスコープに注入) ---
const fs = require("fs");
const files = [
  "src/data/roles.js", "src/data/players.js",
  "src/game/state.js", "src/game/logic.js", "src/ai/mock.js"
];
const combined = files.map(f => fs.readFileSync(f, "utf8")).join("\n");
new Function(combined + "\n" + "Object.assign(globalThis, {ROLES, DEFAULT_PRESETS, AI_PLAYERS, GameState, GameLogic, MockAI, getCompositionText});")();

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  ✓ ${msg}`); }
  else { failed++; console.error(`  ✗ ${msg}`); }
}

async function runTests() {
  console.log("=== GameState テスト ===");

  const countWerewolfTeam = (players) => (
    players.filter(p => ROLES[p.role] && ROLES[p.role].team === "werewolf").length
  );

  const state = new GameState();
  state.initPlayers("テスト太郎", 5);
  assert(state.players.length === 5, "5人のプレイヤーが作成される");
  assert(state.getHuman().name === "テスト太郎", "人間プレイヤーの名前が正しい");
  assert(state.getAlive().length === 5, "全員生存");
  assert(state.getHuman().isHuman === true, "人間フラグ");

  // 役職配分チェック
  const roles = state.players.map(p => p.role);
  const wolves = countWerewolfTeam(state.players);
  const seers = roles.filter(r => r === "seer").length;
  assert(wolves === 2, "5人戦: 人狼陣営が2人");
  assert(seers === 1, "占い師が1人");

  // killPlayer テスト
  const victim = state.players[1];
  state.killPlayer(victim.id);
  assert(state.getAlive().length === 4, "kill後に生存者4人");
  assert(!state.getPlayerById(victim.id).isAlive, "被害者が死亡");

  console.log("\n=== 勝敗判定テスト ===");

  // 全人狼を殺す → 村人勝利
  const state2 = new GameState();
  state2.initPlayers("村人", 5);
  const wolves2 = state2.getAliveWerewolves();
  wolves2.forEach(w => state2.killPlayer(w.id));
  assert(state2.checkWinCondition() === "village", "人狼全滅で村人勝利");

  // 人狼 >= 村人陣営 → 人狼勝利
  const state3 = new GameState();
  state3.initPlayers("村人", 5);
  const villagers3 = state3.getAliveVillageTeam();
  // 村人陣営を人狼の数まで減らす
  const wolvesCount = state3.getAliveWerewolves().length;
  let killed = 0;
  for (const v of villagers3) {
    if (state3.getAliveVillageTeam().length <= wolvesCount) break;
    state3.killPlayer(v.id);
    killed++;
  }
  assert(state3.checkWinCondition() === "werewolf", "人狼>=村人で人狼勝利");

  console.log("\n=== GameLogic テスト ===");

  const state4 = new GameState();
  state4.initPlayers("テスター", 7);
  const mockAi = new MockAI();
  const logic = new GameLogic(state4, mockAi);

  // 投票集計テスト
  const votes = { p1: "ai_1", p2: "ai_1", p3: "ai_2", p4: "ai_1" };
  const result = logic.tallyVotes(votes);
  assert(result === "ai_1", "最多得票者が選ばれる");

  // 夜アクションテスト
  const nightResult = logic.resolveNight({
    divine: state4.players[2].id,
    guard: state4.players[1].id,
    attack: state4.players[1].id  // 護衛と同じ対象
  });
  assert(Array.isArray(nightResult.killed) && nightResult.killed.length === 0, "護衛成功で襲撃失敗");
  assert(nightResult.divineTarget === state4.players[2].id, "占い対象が正しい");

  // 護衛されていない対象への襲撃
  const nightResult2 = logic.resolveNight({
    divine: null,
    guard: state4.players[1].id,
    attack: state4.players[3].id
  });
  assert(Array.isArray(nightResult2.killed) && nightResult2.killed[0] === state4.players[3].id, "護衛されていない対象は襲撃成功");

  console.log("\n=== MockAI テスト ===");

  const ai = new MockAI();
  const statement = await ai.getStatement(state4.players[1], state4);
  assert(typeof statement === "string" && statement.length > 0, "AI発言が文字列で返る");

  const voteTarget = await ai.getVote(state4.players[1], state4.getAlive().filter(p => p.id !== state4.players[1].id), state4);
  assert(typeof voteTarget === "string", "AI投票がIDで返る");

  const nightAction = await ai.getNightAction(state4.players.find(p => p.role === "werewolf"), state4.getAlive(), state4);
  assert(typeof nightAction === "string", "AI夜アクションがIDで返る");

  console.log("\n=== 7人戦 役職配分テスト ===");
  const state7 = new GameState();
  state7.initPlayers("七人目", 7);
  const roles7 = state7.players.map(p => p.role);
  assert(roles7.filter(r => r === "villager").length === 3, "7人戦: 村人3人");
  assert(roles7.filter(r => r === "knight").length === 1, "7人戦: 騎士1人");
  assert(countWerewolfTeam(state7.players) === 2, "7人戦: 人狼陣営2人");

  console.log("\n=== 9人戦 役職配分テスト ===");
  const state9 = new GameState();
  state9.initPlayers("九人目", 9);
  assert(countWerewolfTeam(state9.players) === 3, "9人戦: 人狼陣営3人");
  assert(state9.players.length === 9, "9人戦: 全9人");

  console.log("\n=== 20人戦 役職配分テスト ===");
  const state20 = new GameState();
  state20.initPlayers("二十人目", 20);
  const roles20 = state20.players.map(p => p.role);
  assert(state20.players.length === 20, "20人戦: 全20人");
  assert(countWerewolfTeam(state20.players) === 6, "20人戦: 人狼陣営6人");
  assert(roles20.filter(r => r === "seer").length === 1, "20人戦: 占い師1人");

  console.log("\n=== 勝利判定 拡張テスト ===");

  // Fox win: village wins but fox alive → fox takes it
  const stateFox = new GameState();
  stateFox.players = [
    { id: "h", name: "H", role: "villager", isAlive: true, isHuman: true },
    { id: "f", name: "F", role: "fox",      isAlive: true, isHuman: false },
    { id: "w", name: "W", role: "werewolf", isAlive: false, isHuman: false },
  ];
  stateFox.foxAlive = true;
  assert(stateFox.checkWinCondition() === "fox", "人狼全滅・妖狐生存 → 妖狐勝利");

  // Fox win when wolf >= village
  const stateFox2 = new GameState();
  stateFox2.players = [
    { id: "h", name: "H", role: "villager", isAlive: true, isHuman: true },
    { id: "f", name: "F", role: "fox",      isAlive: true, isHuman: false },
    { id: "w", name: "W", role: "werewolf", isAlive: true, isHuman: false },
  ];
  stateFox2.foxAlive = true;
  assert(stateFox2.checkWinCondition() === "fox", "人狼>=村人・妖狐生存 → 妖狐勝利");

  // No fox → normal werewolf win
  const stateWolf2 = new GameState();
  stateWolf2.players = [
    { id: "h", name: "H", role: "villager", isAlive: true, isHuman: true },
    { id: "w", name: "W", role: "werewolf", isAlive: true, isHuman: false },
  ];
  stateWolf2.foxAlive = false;
  assert(stateWolf2.checkWinCondition() === "werewolf", "妖狐なし・人狼>=村人 → 人狼勝利");

  // Lover win: only two lovers alive
  const stateLover = new GameState();
  stateLover.players = [
    { id: "l1", name: "L1", role: "villager", isAlive: true,  isHuman: true },
    { id: "l2", name: "L2", role: "villager", isAlive: true,  isHuman: false },
    { id: "w",  name: "W",  role: "werewolf", isAlive: false, isHuman: false },
    { id: "v",  name: "V",  role: "villager", isAlive: false, isHuman: false },
  ];
  stateLover.loversIds = ["l1", "l2"];
  assert(stateLover.checkWinCondition() === "lover", "恋人2人のみ生存 → 恋人勝利");

  console.log("\n=== ゲームフロー統合テスト ===");

  const stateFlow = new GameState();
  stateFlow.initPlayers("統合テスト", 7);
  const logicFlow = new GameLogic(stateFlow, new MockAI());

  // Vote: everyone votes for player[1]
  const flowAlive = stateFlow.getAlive();
  const flowVoteTarget = flowAlive[1].id;
  const flowVotes = {};
  flowAlive.forEach(p => { flowVotes[p.id] = flowVoteTarget; });
  const executed = logicFlow.tallyVotes(flowVotes);
  assert(executed === flowVoteTarget, "フロー: 投票集計が正しい");

  stateFlow.executedToday = executed;
  logicFlow.handleExecution(executed);
  assert(!stateFlow.getPlayerById(executed)?.isAlive, "フロー: 処刑後に死亡");

  // Night: attack a non-wolf
  const nonWolf = stateFlow.getAlive().find(p => !stateFlow.isWerewolf(p.id));
  if (nonWolf) {
    const nightRes = logicFlow.resolveNight({ attack: nonWolf.id });
    assert(Array.isArray(nightRes.killed), "フロー: 夜アクション結果が配列");
  }

  const winResult = stateFlow.checkWinCondition();
  assert(winResult === null || typeof winResult === "string", "フロー: 勝敗判定が実行できる");

  // === 罠師テスト ===
  console.log("\n=== 罠師テスト ===");
  const stateTrap = new GameState();
  stateTrap.players = [
    { id: "h", name: "H", role: "villager", isAlive: true, isHuman: true },
    { id: "t", name: "T", role: "trapper", isAlive: true, isHuman: false },
    { id: "w1", name: "W1", role: "werewolf", isAlive: true, isHuman: false },
    { id: "w2", name: "W2", role: "werewolf", isAlive: true, isHuman: false },
    { id: "v", name: "V", role: "villager", isAlive: true, isHuman: false },
  ];
  stateTrap.roleOverrides = {};
  stateTrap.suspendedPlayers = [];
  stateTrap.zombieIds = [];
  stateTrap.sickWolves = [];
  stateTrap.foxAlive = false;
  stateTrap.elderUsedLife = false;
  stateTrap.trapTarget = "t"; // trap set on self
  const logicTrap = new GameLogic(stateTrap, new MockAI());
  const trapResult = logicTrap.resolveAttack(["t"], { guarded: null, healed: null, events: [] });
  assert(trapResult.events.some(e => e.type === 'trap_triggered'), "罠: 罠が発動する");
  assert(trapResult.events.some(e => e.type === 'trap_kill_wolf'), "罠: 狼が死亡する");
  assert(!stateTrap.getPlayerById("w1").isAlive || !stateTrap.getPlayerById("w2").isAlive, "罠: 少なくとも1匹の狼が死亡");

  // === 狼キラーテスト ===
  console.log("\n=== 狼キラーテスト ===");
  const stateWK = new GameState();
  stateWK.players = [
    { id: "h", name: "H", role: "villager", isAlive: true, isHuman: true },
    { id: "wk", name: "WK", role: "wolfKiller", isAlive: true, isHuman: false },
    { id: "w1", name: "W1", role: "werewolf", isAlive: true, isHuman: false },
    { id: "v", name: "V", role: "villager", isAlive: true, isHuman: false },
  ];
  stateWK.roleOverrides = {};
  stateWK.suspendedPlayers = [];
  stateWK.zombieIds = [];
  stateWK.sickWolves = [];
  stateWK.foxAlive = false;
  stateWK.elderUsedLife = false;
  stateWK.trapTarget = null;
  const logicWK = new GameLogic(stateWK, new MockAI());
  const wkResult = logicWK.resolveAttack(["wk"], { guarded: null, healed: null, events: [] });
  assert(wkResult.events.some(e => e.type === 'wolfKiller_retaliate'), "狼キラー: 反撃イベント発生");
  assert(!stateWK.getPlayerById("w1").isAlive, "狼キラー: 狼が死亡する");
  assert(!stateWK.getPlayerById("wk").isAlive, "狼キラー: 自身も死亡する");

  // === 処刑順序テスト ===
  console.log("\n=== 処刑順序テスト ===");
  const stateExec = new GameState();
  stateExec.players = [
    { id: "h", name: "H", role: "villager", isAlive: true, isHuman: true },
    { id: "q", name: "Q", role: "queen", isAlive: true, isHuman: false },
    { id: "w", name: "W", role: "werewolf", isAlive: true, isHuman: false },
    { id: "v", name: "V", role: "villager", isAlive: true, isHuman: false },
  ];
  stateExec.roleOverrides = {};
  stateExec.suspendedPlayers = [];
  stateExec.loversIds = [];
  stateExec.foxAlive = false;
  stateExec.log = [];
  stateExec.addLog = function(phase, msg) { this.log.push({phase, msg}); };
  const logicExec = new GameLogic(stateExec, new MockAI());
  logicExec.handleExecution("q");
  assert(!stateExec.getPlayerById("q").isAlive, "処刑順序: 女王が死亡");
  assert(!stateExec.getPlayerById("h").isAlive, "処刑順序: 村人も女王効果で死亡");
  assert(stateExec.getPlayerById("w").isAlive, "処刑順序: 狼は女王効果で生存");

  // 結果
  console.log(`\n=== 結果: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => { console.error(e); process.exit(1); });
