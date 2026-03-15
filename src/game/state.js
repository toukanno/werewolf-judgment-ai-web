// ゲーム状態管理
class GameState {
  constructor() { this.reset(); }

  reset() {
    this.players = [];
    this.day = 1;
    this.phase = "day"; // "day" | "night" | "vote"
    this.log = [];
    this.voteHistory = [];
    this.nightActions = {};
    this.lastGuardTarget = null;
    this.isGameOver = false;
    this.winner = null;
  }

  initPlayers(playerName, playerCount) {
    const comp = COMPOSITIONS[playerCount];
    if (!comp) throw new Error(`Invalid player count: ${playerCount}`);

    // 役職リストを作成
    const roleList = [];
    for (const [roleId, count] of Object.entries(comp)) {
      for (let i = 0; i < count; i++) roleList.push(roleId);
    }

    // シャッフル
    for (let i = roleList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roleList[i], roleList[j]] = [roleList[j], roleList[i]];
    }

    // AIプレイヤーをシャッフルして選出
    const shuffledAI = [...AI_PLAYERS].sort(() => Math.random() - 0.5);
    const aiCount = playerCount - 1;

    this.players = [];

    // 人間プレイヤーを最初に追加
    this.players.push({
      id: "human",
      name: playerName,
      avatar: "🎮",
      role: roleList[0],
      isHuman: true,
      isAlive: true,
      personality: null,
      style: null
    });

    // AIプレイヤーを追加
    for (let i = 0; i < aiCount; i++) {
      const ai = shuffledAI[i];
      this.players.push({
        id: ai.id,
        name: ai.name,
        avatar: ai.avatar,
        role: roleList[i + 1],
        isHuman: false,
        isAlive: true,
        personality: ai.personality,
        style: ai.style
      });
    }
  }

  getAlive() { return this.players.filter(p => p.isAlive); }
  getAliveVillagers() { return this.getAlive().filter(p => ROLES[p.role].team === "village"); }
  getAliveWerewolves() { return this.getAlive().filter(p => p.role === "werewolf"); }
  getHuman() { return this.players.find(p => p.isHuman); }
  getPlayerById(id) { return this.players.find(p => p.id === id); }

  killPlayer(id) {
    const p = this.getPlayerById(id);
    if (p) p.isAlive = false;
  }

  addLog(type, content, sender) {
    this.log.push({ type, content, sender: sender || null, day: this.day, phase: this.phase, time: Date.now() });
  }

  checkWinCondition() {
    const wolves = this.getAliveWerewolves().length;
    const villagers = this.getAliveVillagers().length;

    if (wolves === 0) {
      this.isGameOver = true;
      this.winner = "village";
      return "village";
    }
    if (wolves >= villagers) {
      this.isGameOver = true;
      this.winner = "werewolf";
      return "werewolf";
    }
    return null;
  }
}
