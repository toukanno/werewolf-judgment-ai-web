// ゲーム状態管理
class GameState {
  constructor() { this.reset(); }

  reset() {
    this.players = [];
    this.day = 1;
    this.phase = "day";
    this.log = [];
    this.voteHistory = [];
    this.nightActions = {};
    this.lastGuardTarget = null;
    this.isGameOver = false;
    this.winner = null;
    this.mediumResults = []; // 霊能結果の履歴
    this.divinedPlayers = {}; // 占い済みプレイヤー {playerId: "werewolf"|"village"}
    this.executedToday = null; // 今日処刑されたプレイヤーID
  }

  initPlayers(playerName, playerCount) {
    const comp = COMPOSITIONS[playerCount];
    if (!comp) throw new Error(`Invalid player count: ${playerCount}`);

    const roleList = [];
    for (const [roleId, count] of Object.entries(comp)) {
      for (let i = 0; i < count; i++) roleList.push(roleId);
    }

    // Fisher-Yates shuffle
    for (let i = roleList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roleList[i], roleList[j]] = [roleList[j], roleList[i]];
    }

    const shuffledAI = [...AI_PLAYERS].sort(() => Math.random() - 0.5);
    const aiCount = playerCount - 1;

    this.players = [];

    // Human player
    this.players.push({
      id: "human",
      name: playerName,
      role: roleList[0],
      isHuman: true,
      isAlive: true,
      personality: null,
      style: null,
      avatarColor: "#ffd54f",
      avatarBg: "#ff6f00",
      initial: playerName.charAt(0) || "P"
    });

    // AI players
    for (let i = 0; i < aiCount; i++) {
      const ai = shuffledAI[i];
      this.players.push({
        id: ai.id,
        name: ai.name,
        role: roleList[i + 1],
        isHuman: false,
        isAlive: true,
        personality: ai.personality,
        style: ai.style,
        avatarColor: ai.avatarColor,
        avatarBg: ai.avatarBg,
        initial: ai.initial
      });
    }
  }

  getAlive() { return this.players.filter(p => p.isAlive); }
  getAliveVillageTeam() { return this.getAlive().filter(p => ROLES[p.role].team === "village"); }
  getAliveWerewolves() { return this.getAlive().filter(p => p.role === "werewolf"); }
  getAliveWerewolfTeam() { return this.getAlive().filter(p => ROLES[p.role].team === "werewolf"); }
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
    // Count village team only (not madman)
    const villagers = this.getAlive().filter(p => ROLES[p.role].team === "village").length;

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

  // localStorage persistence
  static SAVE_KEY = "werewolf_game_save";
  static SAVE_VERSION = 2;

  save() {
    try {
      if (typeof localStorage === "undefined") return;
      const data = {
        version: GameState.SAVE_VERSION,
        players: this.players,
        day: this.day,
        phase: this.phase,
        log: this.log.slice(-60),
        voteHistory: this.voteHistory,
        lastGuardTarget: this.lastGuardTarget,
        isGameOver: this.isGameOver,
        winner: this.winner,
        mediumResults: this.mediumResults,
        divinedPlayers: this.divinedPlayers,
        executedToday: this.executedToday
      };
      localStorage.setItem(GameState.SAVE_KEY, JSON.stringify(data));
    } catch { }
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
      Object.assign(this, {
        players: data.players,
        day: data.day,
        phase: data.phase,
        log: data.log || [],
        voteHistory: data.voteHistory || [],
        lastGuardTarget: data.lastGuardTarget || null,
        isGameOver: data.isGameOver || false,
        winner: data.winner || null,
        mediumResults: data.mediumResults || [],
        divinedPlayers: data.divinedPlayers || {},
        executedToday: data.executedToday || null,
      });
      return true;
    } catch {
      this.clearSave();
      return false;
    }
  }

  clearSave() {
    try { if (typeof localStorage !== "undefined") localStorage.removeItem(GameState.SAVE_KEY); } catch { }
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
