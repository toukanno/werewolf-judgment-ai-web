// ゲーム進行ロジック
class GameLogic {
  constructor(state, ai) {
    this.state = state;
    this.ai = ai;
  }

  // 投票処理: 最多得票者を返す
  tallyVotes(votes) {
    const counts = {};
    for (const targetId of Object.values(votes)) {
      counts[targetId] = (counts[targetId] || 0) + 1;
    }
    const maxVotes = Math.max(...Object.values(counts));
    const candidates = Object.keys(counts).filter(id => counts[id] === maxVotes);
    // 同票ならランダム
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // 夜の処理
  resolveNight(actions) {
    const result = { killed: null, guarded: null, divineResult: null, divineTarget: null };

    // 護衛対象
    if (actions.guard) {
      result.guarded = actions.guard;
      this.state.lastGuardTarget = actions.guard;
    }

    // 襲撃
    if (actions.attack) {
      if (actions.attack === result.guarded) {
        result.killed = null; // 護衛成功
      } else {
        result.killed = actions.attack;
        this.state.killPlayer(actions.attack);
      }
    }

    // 占い
    if (actions.divine) {
      result.divineTarget = actions.divine;
      const target = this.state.getPlayerById(actions.divine);
      result.divineResult = target && ROLES[target.role].appearAsWerewolf ? "werewolf" : "village";
    }

    return result;
  }

  // AI投票を取得（モック）
  async getAiVotes(alivePlayers) {
    const votes = {};
    for (const player of alivePlayers) {
      if (player.isHuman) continue;
      const targets = alivePlayers.filter(p => p.id !== player.id);
      const response = await this.ai.getVote(player, targets, this.state);
      votes[player.id] = response;
    }
    return votes;
  }

  // AI夜アクションを取得（モック）
  async getAiNightAction(player) {
    const alive = this.state.getAlive().filter(p => p.id !== player.id);
    return await this.ai.getNightAction(player, alive, this.state);
  }

  // AI発言を取得
  async getAiStatement(player) {
    return await this.ai.getStatement(player, this.state);
  }
}
