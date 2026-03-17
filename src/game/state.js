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
      style: null,
      design: null
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
        style: ai.style,
        design: ai.design || null
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

  // --- localStorage 保存/復元 ---

  static SAVE_KEY = "werewolf_game_save";
  static SAVE_VERSION = 1;
  static MAX_LOG_SAVE = 50;

  save() {
    try {
      if (typeof localStorage === "undefined") return;
      const data = {
        version: GameState.SAVE_VERSION,
        players: this.players,
        day: this.day,
        phase: this.phase,
        log: this.log.slice(-GameState.MAX_LOG_SAVE),
        voteHistory: this.voteHistory,
        nightActions: this.nightActions,
        lastGuardTarget: this.lastGuardTarget,
        isGameOver: this.isGameOver,
        winner: this.winner
      };
      localStorage.setItem(GameState.SAVE_KEY, JSON.stringify(data));
    } catch { /* 容量超過等は無視 */ }
  }

  load() {
    try {
      if (typeof localStorage === "undefined") return false;
      const raw = localStorage.getItem(GameState.SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || data.version !== GameState.SAVE_VERSION || !Array.isArray(data.players) || data.players.length === 0) {
        this.clearSave();
        return false;
      }
      this.players = data.players;
      this.day = data.day;
      this.phase = data.phase;
      this.log = data.log || [];
      this.voteHistory = data.voteHistory || [];
      this.nightActions = data.nightActions || {};
      this.lastGuardTarget = data.lastGuardTarget || null;
      this.isGameOver = data.isGameOver || false;
      this.winner = data.winner || null;
      return true;
    } catch {
      this.clearSave();
      return false;
    }
  }

  clearSave() {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.removeItem(GameState.SAVE_KEY);
    } catch { /* 無視 */ }
  }

  static hasSavedGame() {
    try {
      if (typeof localStorage === "undefined") return false;
      const raw = localStorage.getItem(GameState.SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return data && data.version === GameState.SAVE_VERSION && Array.isArray(data.players) && data.players.length > 0 && !data.isGameOver;
    } catch { return false; }
  }
}
