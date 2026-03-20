/**
 * 人狼ジャッジメント - Game State Manager
 * Manages all game state including players, phases, roles, and role-specific tracking
 */

class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.players = [];
    this.day = 1;
    this.phase = "day";
    this.log = [];
    this.voteHistory = [];
    this.executedToday = null;
    this.isGameOver = false;
    this.winner = null;

    // Role-specific state tracking
    this.divinedPlayers = {};
    this.mediumResults = [];
    this.lastGuardTarget = null;
    this.trapTarget = null;
    this.foxAlive = true;
    this.loversIds = [];
    this.zombieIds = [];
    this.elderUsedLife = false;
    this.witchPotions = { revive: true, poison: true };
    this.priestUsed = false;
    this.shrineUsed = false;
    this.assassinUsed = false;
    this.dictatorUsed = false;
    this.greedyWolfUsed = false;
    this.reviveWolfUsed = false;
    this.seerAlive = true;
    this.talkativeWolfWord = null;
    this.healTargets = {};
    this.roleOverrides = {};
    this.suspendedPlayers = [];
    this.framed = {};
    this.sickWolves = [];
  }

  initPlayers(playerName, playerCount, composition) {
    // Use provided composition or fall back to default preset
    const comp = composition || (DEFAULT_PRESETS[playerCount] && DEFAULT_PRESETS[playerCount].composition) || { villager: playerCount - 2, werewolf: 2 };
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

    this.setupRolePairs();
    this.setupStartingAbilities();
  }

  setupRolePairs() {
    // Find lovers and setup their pair
    const lovers = this.players.filter(p => p.role === 'lover' || this.roleOverrides[p.id] === 'lover');
    if (lovers.length === 2) {
      this.loversIds = [lovers[0].id, lovers[1].id];
    }
  }

  setupStartingAbilities() {
    // Talkative wolf gets a word
    this.players.forEach(p => {
      if (this.getEffectiveRole(p.id) === 'talkativeWolf') {
        this.talkativeWolfWord = this.getRandomWord();
      }
    });
  }

  getRandomWord() {
    const words = ['月', '狼', '夜', '襲撃', '投票', '村人', '秘密', '勝利', '生存'];
    return words[Math.floor(Math.random() * words.length)];
  }

  getAlive() {
    return this.players.filter(p => p.isAlive && !this.suspendedPlayers.includes(p.id));
  }

  getAliveVillageTeam() {
    return this.getAlive().filter(p => {
      const role = ROLES[this.getEffectiveRole(p.id)];
      return role && role.team === "village";
    });
  }

  getAliveWerewolves() {
    return this.getAlive().filter(p => {
      const role = ROLES[this.getEffectiveRole(p.id)];
      return role && role.team === "werewolf";
    });
  }

  getAliveWerewolfTeam() {
    return this.getAlive().filter(p => {
      const role = ROLES[this.getEffectiveRole(p.id)];
      return role && role.team === "werewolf";
    });
  }

  getAliveByRole(roleId) {
    return this.getAlive().filter(p => this.getEffectiveRole(p.id) === roleId);
  }

  getHuman() {
    return this.players.find(p => p.isHuman);
  }

  getPlayerById(id) {
    return this.players.find(p => p.id === id);
  }

  getEffectiveRole(playerId) {
    return this.roleOverrides[playerId] || this.getPlayerById(playerId)?.role;
  }

  getOriginalRole(playerId) {
    return this.getPlayerById(playerId)?.role;
  }

  isWerewolf(playerId) {
    const role = ROLES[this.getEffectiveRole(playerId)];
    return role && role.team === "werewolf";
  }

  appearsAsWerewolf(playerId) {
    if (this.framed[playerId]) return true;
    const role = ROLES[this.getEffectiveRole(playerId)];
    return role && role.appearAsWerewolf;
  }

  killPlayer(id, cause = 'unknown') {
    const p = this.getPlayerById(id);
    if (!p || !p.isAlive) return;

    p.isAlive = false;
    const roleId = this.getEffectiveRole(id);
    const role = ROLES[roleId];

    // Handle lover death
    if (this.loversIds.includes(id)) {
      const loverId = this.loversIds[0] === id ? this.loversIds[1] : this.loversIds[0];
      const lover = this.getPlayerById(loverId);
      if (lover && lover.isAlive) {
        this.killPlayer(loverId, 'lover_death');
      }
    }

    // Handle noble death (slave takes the hit)
    if (roleId === 'noble' && cause === 'attack') {
      const slave = this.players.find(s =>
        s.isAlive && this.getEffectiveRole(s.id) === 'slave'
      );
      if (slave) {
        p.isAlive = true;
        this.killPlayer(slave.id, 'slave_protection');
        return;
      }
    }

    // Handle seer apprentice inheritance
    if (roleId === 'seer') {
      this.seerAlive = false;
      const apprentice = this.players.find(a =>
        a.isAlive && this.getEffectiveRole(a.id) === 'seerApprentice'
      );
      if (apprentice) {
        this.roleOverrides[apprentice.id] = 'seer';
      }
    }

    // Handle immoralist linked to fox
    if (roleId === 'fox') {
      this.foxAlive = false;
      const immoralist = this.players.find(im =>
        im.isAlive && this.getEffectiveRole(im.id) === 'immoralist'
      );
      if (immoralist) {
        this.killPlayer(immoralist.id, 'immoralist_bond');
      }
    }

    this.addLog('死亡', `${p.name}が死亡しました（${cause}）`, null);
  }

  revivePlayer(playerId) {
    const p = this.getPlayerById(playerId);
    if (p) {
      p.isAlive = true;
      this.suspendedPlayers = this.suspendedPlayers.filter(id => id !== playerId);
    }
  }

  convertToZombie(playerId) {
    const p = this.getPlayerById(playerId);
    if (p && this.getEffectiveRole(playerId) !== 'zombie') {
      this.roleOverrides[playerId] = 'zombie';
      this.zombieIds.push(playerId);
      this.addLog('変身', `${p.name}がゾンビになりました`, null);
    }
  }

  convertToWerewolf(playerId) {
    const p = this.getPlayerById(playerId);
    if (p) {
      this.roleOverrides[playerId] = 'werewolf';
      this.addLog('変身', `${p.name}が人狼に変わりました`, null);
    }
  }

  addLog(type, content, sender) {
    this.log.push({
      type,
      content,
      sender: sender || null,
      day: this.day,
      phase: this.phase,
      time: Date.now()
    });
  }

  checkWinCondition() {
    const wolves = this.getAliveWerewolves().length;
    const zombies = this.getAlive().filter(p => this.getEffectiveRole(p.id) === 'zombie').length;
    const villagers = this.getAlive().filter(p => {
      const role = ROLES[this.getEffectiveRole(p.id)];
      return role && role.team === "village";
    }).length;

    // Zombie win condition
    if (zombies > 0 && zombies >= (villagers + wolves)) {
      this.isGameOver = true;
      this.winner = "zombie";
      return "zombie";
    }

    // Werewolf win condition
    if (wolves > 0 && wolves >= villagers) {
      this.isGameOver = true;
      this.winner = "werewolf";
      return "werewolf";
    }

    // Village win condition
    if (wolves === 0 && zombies === 0) {
      this.isGameOver = true;
      this.winner = "village";

      // Check additional winners
      if (this.foxAlive && this.getAlive().some(p => this.getEffectiveRole(p.id) === 'fox')) {
        // Fox also wins
      }

      if (this.loversIds.length === 2) {
        const l1 = this.getPlayerById(this.loversIds[0]);
        const l2 = this.getPlayerById(this.loversIds[1]);
        if (l1 && l2 && l1.isAlive && l2.isAlive) {
          // Lovers also win
        }
      }

      return "village";
    }

    return null;
  }

  // localStorage persistence
  static SAVE_KEY = "werewolf_game_save";
  static SAVE_VERSION = 3;

  save() {
    try {
      if (typeof localStorage === "undefined") return;
      const data = {
        version: GameState.SAVE_VERSION,
        players: this.players,
        day: this.day,
        phase: this.phase,
        log: this.log.slice(-100),
        voteHistory: this.voteHistory,
        executedToday: this.executedToday,
        isGameOver: this.isGameOver,
        winner: this.winner,
        divinedPlayers: this.divinedPlayers,
        mediumResults: this.mediumResults,
        lastGuardTarget: this.lastGuardTarget,
        trapTarget: this.trapTarget,
        foxAlive: this.foxAlive,
        loversIds: this.loversIds,
        zombieIds: this.zombieIds,
        elderUsedLife: this.elderUsedLife,
        witchPotions: this.witchPotions,
        priestUsed: this.priestUsed,
        shrineUsed: this.shrineUsed,
        assassinUsed: this.assassinUsed,
        dictatorUsed: this.dictatorUsed,
        greedyWolfUsed: this.greedyWolfUsed,
        reviveWolfUsed: this.reviveWolfUsed,
        seerAlive: this.seerAlive,
        talkativeWolfWord: this.talkativeWolfWord,
        healTargets: this.healTargets,
        roleOverrides: this.roleOverrides,
        suspendedPlayers: this.suspendedPlayers,
        framed: this.framed,
        sickWolves: this.sickWolves
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
        executedToday: data.executedToday || null,
        isGameOver: data.isGameOver || false,
        winner: data.winner || null,
        divinedPlayers: data.divinedPlayers || {},
        mediumResults: data.mediumResults || [],
        lastGuardTarget: data.lastGuardTarget || null,
        trapTarget: data.trapTarget || null,
        foxAlive: data.foxAlive !== false,
        loversIds: data.loversIds || [],
        zombieIds: data.zombieIds || [],
        elderUsedLife: data.elderUsedLife || false,
        witchPotions: data.witchPotions || { revive: true, poison: true },
        priestUsed: data.priestUsed || false,
        shrineUsed: data.shrineUsed || false,
        assassinUsed: data.assassinUsed || false,
        dictatorUsed: data.dictatorUsed || false,
        greedyWolfUsed: data.greedyWolfUsed || false,
        reviveWolfUsed: data.reviveWolfUsed || false,
        seerAlive: data.seerAlive !== false,
        talkativeWolfWord: data.talkativeWolfWord || null,
        healTargets: data.healTargets || {},
        roleOverrides: data.roleOverrides || {},
        suspendedPlayers: data.suspendedPlayers || [],
        framed: data.framed || {},
        sickWolves: data.sickWolves || []
      });
      return true;
    } catch {
      this.clearSave();
      return false;
    }
  }

  clearSave() {
    try {
      if (typeof localStorage !== "undefined") localStorage.removeItem(GameState.SAVE_KEY);
    } catch { }
  }

  static hasSavedGame() {
    try {
      if (typeof localStorage === "undefined") return false;
      const raw = localStorage.getItem(GameState.SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return data && data.version === GameState.SAVE_VERSION && Array.isArray(data.players) &&
             data.players.length > 0 && !data.isGameOver;
    } catch {
      return false;
    }
  }
}
