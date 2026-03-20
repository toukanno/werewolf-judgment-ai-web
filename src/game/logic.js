// ゲーム進行ロジック
class GameLogic {
  constructor(state, ai) {
    this.state = state;
    this.ai = ai;
  }

  tallyVotes(votes) {
    const counts = {};
    for (const targetId of Object.values(votes)) {
      counts[targetId] = (counts[targetId] || 0) + 1;
    }
    const maxVotes = Math.max(...Object.values(counts));
    const candidates = Object.keys(counts).filter(id => counts[id] === maxVotes);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  resolveNight(actions) {
    const result = { killed: null, guarded: null, divineResult: null, divineTarget: null, mediumResult: null };

    // Guard
    if (actions.guard) {
      result.guarded = actions.guard;
      this.state.lastGuardTarget = actions.guard;
    }

    // Attack
    if (actions.attack) {
      if (actions.attack === result.guarded) {
        result.killed = null; // Guard success
      } else {
        result.killed = actions.attack;
        this.state.killPlayer(actions.attack);
      }
    }

    // Divine
    if (actions.divine) {
      result.divineTarget = actions.divine;
      const target = this.state.getPlayerById(actions.divine);
      result.divineResult = target && ROLES[target.role].appearAsWerewolf ? "werewolf" : "village";
      this.state.divinedPlayers[actions.divine] = result.divineResult;
    }

    // Medium - check last executed player
    if (this.state.executedToday) {
      const executed = this.state.getPlayerById(this.state.executedToday);
      if (executed) {
        const medResult = ROLES[executed.role].appearAsWerewolf ? "werewolf" : "village";
        result.mediumResult = { playerId: this.state.executedToday, name: executed.name, result: medResult };
        this.state.mediumResults.push(result.mediumResult);
      }
    }

    return result;
  }

  async getAiNightAction(player) {
    const alive = this.state.getAlive().filter(p => p.id !== player.id);
    return await this.ai.getNightAction(player, alive, this.state);
  }

  async getAiStatement(player) {
    return await this.ai.getStatement(player, this.state);
  }
}
