// ヘッドレスゲームロジックテスト
// ブラウザなしで GameState + GameLogic + MockAI の動作を検証

// --- モジュールをインライン読み込み (グローバルスコープに注入) ---
const fs = require("fs");
const files = [
  "src/data/roles.js", "src/data/players.js",
  "src/game/state.js", "src/game/logic.js", "src/ai/mock.js"
];
const combined = files.map(f => fs.readFileSync(f, "utf8")).join("\n");
new Function(combined + "\n" + "Object.assign(globalThis, {ROLES, COMPOSITIONS, AI_PLAYERS, GameState, GameLogic, MockAI, getCompositionText});")();

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  ✓ ${msg}`); }
  else { failed++; console.error(`  ✗ ${msg}`); }
}

async function runTests() {
  console.log("=== GameState テスト ===");

  const state = new GameState();
  state.initPlayers("テスト太郎", 5);
  assert(state.players.length === 5, "5人のプレイヤーが作成される");
  assert(state.getHuman().name === "テスト太郎", "人間プレイヤーの名前が正しい");
  assert(state.getAlive().length === 5, "全員生存");
  assert(state.getHuman().isHuman === true, "人間フラグ");

  // 役職配分チェック
  const roles = state.players.map(p => p.role);
  const wolves = roles.filter(r => r === "werewolf").length;
  const seers = roles.filter(r => r === "seer").length;
  assert(wolves === 2, "人狼が2人");
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
  const villagers3 = state3.getAliveVillagers();
  // 村人陣営を人狼の数まで減らす
  const wolvesCount = state3.getAliveWerewolves().length;
  let killed = 0;
  for (const v of villagers3) {
    if (state3.getAliveVillagers().length <= wolvesCount) break;
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
  assert(nightResult.killed === null, "護衛成功で襲撃失敗");
  assert(nightResult.divineTarget === state4.players[2].id, "占い対象が正しい");

  // 護衛されていない対象への襲撃
  const nightResult2 = logic.resolveNight({
    divine: null,
    guard: state4.players[1].id,
    attack: state4.players[3].id
  });
  assert(nightResult2.killed === state4.players[3].id, "護衛されていない対象は襲撃成功");

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
  assert(roles7.filter(r => r === "werewolf").length === 2, "7人戦: 人狼2人");

  console.log("\n=== 9人戦 役職配分テスト ===");
  const state9 = new GameState();
  state9.initPlayers("九人目", 9);
  const roles9 = state9.players.map(p => p.role);
  assert(roles9.filter(r => r === "werewolf").length === 3, "9人戦: 人狼3人");
  assert(state9.players.length === 9, "9人戦: 全9人");

  console.log("\n=== 20人戦 役職配分テスト ===");
  const state20 = new GameState();
  state20.initPlayers("二十人目", 20);
  const roles20 = state20.players.map(p => p.role);
  assert(state20.players.length === 20, "20人戦: 全20人");
  assert(roles20.filter(r => r === "werewolf").length === 5, "20人戦: 人狼5人");
  assert(roles20.filter(r => r === "seer").length === 1, "20人戦: 占い師1人");

  // 結果
  console.log(`\n=== 結果: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => { console.error(e); process.exit(1); });
