/**
 * 人狼ジャッジメント - Game Logic Engine
 * Handles vote tallying, night ability resolution, and complex role interactions
 */

class GameLogic {
  constructor(state, ai) {
    this.state = state;
    this.ai = ai;
  }

  /**
   * Tally votes with mayor's double vote
   */
  tallyVotes(votes) {
    const counts = {};

    for (const [voterId, targetId] of Object.entries(votes)) {
      const role = ROLES[this.state.getEffectiveRole(voterId)];

      // Mayor gets double vote
      const voteWeight = role && role.id === 'mayor' ? 2 : 1;
      counts[targetId] = (counts[targetId] || 0) + voteWeight;
    }

    const values = Object.values(counts);
    if (values.length === 0) return null;

    const maxVotes = Math.max(...values);
    const candidates = Object.keys(counts).filter(id => counts[id] === maxVotes);
    const executed = candidates[Math.floor(Math.random() * candidates.length)];

    this.state.executedToday = executed;
    return executed;
  }

  /**
   * Handle execution and its side effects
   */
  handleExecution(playerId) {
    const p = this.state.getPlayerById(playerId);
    if (!p) return;

    const roleId = this.state.getEffectiveRole(playerId);
    const role = ROLES[roleId];

    // Black cat: random non-wolf dies
    if (roleId === 'blackCat') {
      const nonWolves = this.state.getAlive().filter(player =>
        player.id !== playerId && !this.state.isWerewolf(player.id)
      );
      if (nonWolves.length > 0) {
        const victim = nonWolves[Math.floor(Math.random() * nonWolves.length)];
        this.state.killPlayer(victim.id, 'blackCat');
        this.state.addLog('処刑', `黒猫の効果により${victim.name}が死亡しました`, null);
      }
    }

    // Nekomata: random player dies
    if (roleId === 'nekomata') {
      const others = this.state.getAlive().filter(player => player.id !== playerId);
      if (others.length > 0) {
        const victim = others[Math.floor(Math.random() * others.length)];
        this.state.killPlayer(victim.id, 'nekomata');
        this.state.addLog('処刑', `猫又の効果により${victim.name}が死亡しました`, null);
      }
    }

    // Kill the executed player first, then trigger side effects
    this.state.killPlayer(playerId, 'execution');

    // Queen: all non-wolf, non-fox die
    if (roleId === 'queen') {
      const toKill = this.state.getAlive().filter(player =>
        !this.state.isWerewolf(player.id) &&
        this.state.getEffectiveRole(player.id) !== 'fox'
      );
      toKill.forEach(victim => {
        this.state.killPlayer(victim.id, 'queen');
      });
      if (toKill.length > 0) {
        this.state.addLog('処刑', `女王の効果により${toKill.length}人が死亡しました`, null);
      }
    }
  }

  /**
   * Resolve all night actions in proper order
   */
  resolveNight(actions) {
    const result = {
      killed: [],
      guarded: null,
      trapped: null,
      healed: [],
      divineResult: null,
      divineTarget: null,
      sageResult: null,
      sageTarget: null,
      mediumResult: null,
      events: []
    };

    // 1. Guard (knight)
    if (actions.guard) {
      result.guarded = actions.guard;
      this.state.lastGuardTarget = actions.guard;
      result.events.push({ type: 'guard', target: actions.guard });
    }

    // 2. Trap (trapper)
    if (actions.trap) {
      this.state.trapTarget = actions.trap;
      result.trapped = actions.trap;
      result.events.push({ type: 'trap', target: actions.trap });
    }

    // 3. Heal (doctor) - track consecutive healing
    if (actions.heal) {
      const lastDay = this.state.healTargets[actions.heal] || -2;
      const day = this.state.day;

      // Same person healed 2 nights in a row dies
      if (lastDay === day - 1) {
        this.state.killPlayer(actions.heal, 'overhealed');
        result.events.push({ type: 'heal_death', target: actions.heal });
      } else {
        result.healed.push(actions.heal);
        this.state.healTargets[actions.heal] = day;
      }
    }

    // 4. Bless (priest - one time)
    if (actions.bless && !this.state.priestUsed) {
      this.state.priestUsed = true;
      result.events.push({ type: 'bless', target: actions.bless });
    }

    // 5. Resolve attack with all interactions
    // Normalize attack to array (may be string from a single wolf)
    let attackTargets = actions.attack;
    if (attackTargets && !Array.isArray(attackTargets)) {
      attackTargets = [attackTargets];
    }
    if (attackTargets && attackTargets.length > 0) {
      const attackResult = this.resolveAttack(attackTargets, result);
      result.killed.push(...attackResult.killed);
      result.events.push(...attackResult.events);
    }

    // 6. Divine (seer)
    if (actions.divine) {
      const target = this.state.getPlayerById(actions.divine);
      if (target) {
        result.divineTarget = actions.divine;
        result.divineResult = this.state.appearsAsWerewolf(actions.divine) ? "werewolf" : "village";
        this.state.divinedPlayers[actions.divine] = result.divineResult;

        // Fox dies if divined
        if (this.state.getEffectiveRole(actions.divine) === 'fox') {
          this.state.foxAlive = false;
          this.state.killPlayer(actions.divine, 'divined');
          result.events.push({ type: 'fox_death', target: actions.divine });
        }

        result.events.push({ type: 'divine', target: actions.divine, result: result.divineResult });
      }
    }

    // 7. Sage divine (exact role)
    if (actions.sageDiv) {
      const target = this.state.getPlayerById(actions.sageDiv);
      if (target) {
        result.sageTarget = actions.sageDiv;
        result.sageResult = this.state.getEffectiveRole(actions.sageDiv);
        result.events.push({ type: 'sageDiv', target: actions.sageDiv, result: result.sageResult });
      }
    }

    // 8. Fake divine (always "not wolf")
    if (actions.fakeDivine) {
      result.events.push({ type: 'fakeDivine', target: actions.fakeDivine, result: "village" });
    }

    // 9. Weak divine (child fox - 50% accuracy)
    if (actions.weakDivine) {
      const accurate = Math.random() < 0.5;
      const target = this.state.getPlayerById(actions.weakDivine);
      let result_value = "village";
      if (accurate && target && this.state.appearsAsWerewolf(actions.weakDivine)) {
        result_value = "werewolf";
      }
      result.events.push({ type: 'weakDivine', target: actions.weakDivine, result: result_value, accurate });
    }

    // 10. Sorcery (exact role)
    if (actions.sorcery) {
      const target = this.state.getPlayerById(actions.sorcery);
      if (target) {
        result.events.push({ type: 'sorcery', target: actions.sorcery, result: this.state.getEffectiveRole(actions.sorcery) });
      }
    }

    // 11. Frame (wolf boy)
    if (actions.frame) {
      this.state.framed[actions.frame] = true;
      result.events.push({ type: 'frame', target: actions.frame });
    }

    // 12. Witch potions
    if (actions.witchRevive && this.state.witchPotions.revive && result.killed.length > 0) {
      const targetId = actions.witchRevive;
      this.state.witchPotions.revive = false;
      if (result.killed.includes(targetId)) {
        this.state.revivePlayer(targetId);
        // Remove revived player from killed list so result reflects final state
        result.killed = result.killed.filter(id => id !== targetId);
        result.events.push({ type: 'witch_revive', target: targetId });
      }
    }

    if (actions.witchPoison && this.state.witchPotions.poison && this.state.day >= 2) {
      const targetId = actions.witchPoison;
      this.state.witchPotions.poison = false;
      this.state.killPlayer(targetId, 'witch_poison');
      result.events.push({ type: 'witch_poison', target: targetId });
    }

    // 13. Flee (fugitive) — actions.flee is the destination player's ID
    if (actions.flee) {
      if (this.state.isWerewolf(actions.flee)) {
        // Fled to a werewolf — fugitive dies
        const fugitive = this.state.players.find(p => this.state.getEffectiveRole(p.id) === 'fugitive' && p.isAlive);
        if (fugitive) {
          this.state.killPlayer(fugitive.id, 'flee');
          result.events.push({ type: 'flee_death', target: fugitive.id });
        }
      }
    }

    // 14. Gift (santa) - handled separately, just log
    if (actions.gift) {
      result.events.push({ type: 'gift', target: actions.gift });
    }

    // 15. Medium check
    if (this.state.executedToday) {
      const executed = this.state.getPlayerById(this.state.executedToday);
      if (executed) {
        const medResult = this.state.appearsAsWerewolf(this.state.executedToday) ? "werewolf" : "village";
        result.mediumResult = {
          playerId: this.state.executedToday,
          name: executed.name,
          result: medResult
        };
        this.state.mediumResults.push(result.mediumResult);
        result.events.push({ type: 'medium', target: this.state.executedToday, result: medResult });
      }
    }

    return result;
  }

  /**
   * Resolve werewolf attack with all interactions
   */
  resolveAttack(attackTargets, result) {
    const killed = [];
    const events = [];

    for (const targetId of attackTargets) {
      const target = this.state.getPlayerById(targetId);
      if (!target || !target.isAlive) continue;

      // Guard blocks attack
      if (targetId === result.guarded) {
        events.push({ type: 'guard_success', target: targetId });
        continue;
      }

      // Trap kills attacking wolves
      if (targetId === this.state.trapTarget) {
        const attackingWolves = this.state.getAliveWerewolves();
        for (const wolf of attackingWolves) {
          this.state.killPlayer(wolf.id, 'trap');
          killed.push(wolf.id);
          events.push({ type: 'trap_kill_wolf', target: wolf.id });
        }
        events.push({ type: 'trap_triggered', target: targetId });
        continue;
      }

      // Elder survives first attack
      if (this.state.getEffectiveRole(targetId) === 'elder' && !this.state.elderUsedLife) {
        this.state.elderUsedLife = true;
        events.push({ type: 'elder_survives', target: targetId });
        continue;
      }

      // Red hood enters suspended animation
      if (this.state.getEffectiveRole(targetId) === 'redHood') {
        this.state.suspendedPlayers.push(targetId);
        events.push({ type: 'redHood_suspended', target: targetId });
        continue;
      }

      // Cursed becomes wolf
      if (this.state.getEffectiveRole(targetId) === 'cursed') {
        this.state.convertToWerewolf(targetId);
        events.push({ type: 'cursed_convert', target: targetId });
        continue;
      }

      // Fox is immune
      if (this.state.getEffectiveRole(targetId) === 'fox') {
        events.push({ type: 'fox_immune', target: targetId });
        continue;
      }

      // Zombie converts instead of killing
      if (this.state.zombieIds.length > 0) {
        this.state.convertToZombie(targetId);
        events.push({ type: 'zombie_convert', target: targetId });
        continue;
      }

      // Wolf killer kills back — attacking wolves die
      if (this.state.getEffectiveRole(targetId) === 'wolfKiller') {
        const attackingWolves = this.state.getAliveWerewolves();
        for (const wolf of attackingWolves) {
          this.state.killPlayer(wolf.id, 'wolfKiller_retaliate');
          killed.push(wolf.id);
          events.push({ type: 'wolfKiller_kill', target: wolf.id });
        }
        events.push({ type: 'wolfKiller_retaliate', target: targetId });
        // wolfKiller also dies from the attack
      }

      // Sick prevents next night wolf action
      if (this.state.getEffectiveRole(targetId) === 'sick') {
        this.state.sickWolves.push(targetId);
        events.push({ type: 'sick_effect', target: targetId });
      }

      // Slave dies instead of noble
      if (this.state.getEffectiveRole(targetId) === 'noble') {
        const slave = this.state.players.find(s =>
          s.isAlive && this.state.getEffectiveRole(s.id) === 'slave'
        );
        if (slave) {
          this.state.killPlayer(slave.id, 'slave_protection');
          events.push({ type: 'noble_protected', target: targetId, actualVictim: slave.id });
          continue;
        }
      }

      // Standard kill
      this.state.killPlayer(targetId, 'attack');
      killed.push(targetId);
      events.push({ type: 'killed', target: targetId });

      // Nekomata kills random wolf on death
      if (this.state.getEffectiveRole(targetId) === 'nekomata') {
        const wolves = this.state.getAliveWerewolves();
        if (wolves.length > 0) {
          const wolf = wolves[Math.floor(Math.random() * wolves.length)];
          this.state.killPlayer(wolf.id, 'nekomata_retaliate');
          events.push({ type: 'nekomata_kill', target: wolf.id });
        }
      }
    }

    return { killed, events };
  }

  /**
   * Get AI night action
   */
  async getAiNightAction(player) {
    const alive = this.state.getAlive().filter(p => p.id !== player.id);
    return await this.ai.getNightAction(player, alive, this.state);
  }

  /**
   * Get AI statement
   */
  async getAiStatement(player) {
    return await this.ai.getStatement(player, this.state);
  }

  /**
   * Get AI reaction to human player's message
   */
  async getAiReaction(player, humanMessage) {
    return await this.ai.getReaction(player, humanMessage, this.state);
  }
}
