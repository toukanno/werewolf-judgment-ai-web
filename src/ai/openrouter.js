/**
 * OpenRouter API Integration
 * Handles API communication for AI player statements and decisions
 */

class OpenRouterAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.model = "anthropic/claude-sonnet-4";
    this.baseUrl = "https://openrouter.ai/api/v1/chat/completions";
  }

  /**
   * Test API key connection
   */
  static async testConnection(apiKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": location.origin,
          "X-Title": "Werewolf Judgment AI"
        }
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Internal API request
   */
  async _request(messages) {
    try {
      const res = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": location.origin,
          "X-Title": "Werewolf Judgment AI"
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.8,
          max_tokens: 300
        })
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("OpenRouter API error:", error);
      throw error;
    }
  }

  /**
   * Build prompt for AI player
   */
  _buildPrompt(player, state, task) {
    const alive = state.getAlive().map(p => p.name).join("、");
    const recentLog = state.log.slice(-20).map(l => {
      const sender = l.sender || "システム";
      return `${sender}: ${l.content}`;
    }).join("\n");

    const role = ROLES[player.role];
    const roleInfo = role ? `${role.name} (${role.team})` : player.role;

    let roleContext = `あなたは人狼ゲームのプレイヤーです。
名前: ${player.name}
役職: ${roleInfo}
性格: ${player.personality || "中立的"}
生存者: ${alive}

最近の議論:
${recentLog || "(まだ発言はありません)"}

タスク: ${task}

JSON形式で応答してください: {"statement": "...", "reasoning": "..."}`;

    // Add role-specific context
    if (player.role === "werewolf" || ROLES[player.role]?.team === "werewolf") {
      const allies = state.getAliveWerewolves().filter(p => p.id !== player.id).map(p => p.name).join("、");
      roleContext = `あなたは人狼ゲームのプレイヤーです。
名前: ${player.name}
役職: ${roleInfo}
性格: ${player.personality || "中立的"}
人狼仲間: ${allies || "(なし)"}
生存者: ${alive}

最近の議論:
${recentLog || "(まだ発言はありません)"}

タスク: ${task}

JSON形式で応答してください: {"statement": "...", "reasoning": "..."}`;
    }

    if (player.role === "seer") {
      const divined = Object.entries(state.divinedPlayers).map(([id, result]) => {
        const p = state.getPlayerById(id);
        return `${p?.name}: ${result === "werewolf" ? "人狼" : "村人"}`;
      }).join("、");

      roleContext = `あなたは人狼ゲームのプレイヤーです。
名前: ${player.name}
役職: ${roleInfo}
性格: ${player.personality || "中立的"}
占い結果: ${divined || "(なし)"}
生存者: ${alive}

最近の議論:
${recentLog || "(まだ発言はありません)"}

タスク: ${task}

JSON形式で応答してください: {"statement": "...", "reasoning": "..."}`;
    }

    return roleContext;
  }

  /**
   * Get AI statement for day phase
   */
  async getStatement(player, state) {
    try {
      const prompt = this._buildPrompt(
        player,
        state,
        "昼間の議論で自然な発言をしてください。statement に発言内容を入れてください。"
      );

      const raw = await this._request([{ role: "user", content: prompt }]);
      const parsed = JSON.parse(raw);
      return parsed.statement || raw;
    } catch (error) {
      console.error("OpenRouter getStatement error:", error);
      const mock = new MockAI();
      return mock.getStatement(player, state);
    }
  }

  /**
   * Get AI vote
   */
  async getVote(player, targets, state) {
    try {
      const targetList = targets.map(t => t.name).join("、");
      const prompt = this._buildPrompt(
        player,
        state,
        `投票する相手を決めてください。投票対象: ${targetList}。JSON形式で {"target": "対象者の名前", "reasoning": "理由"} として応答してください。`
      );

      const raw = await this._request([{ role: "user", content: prompt }]);
      const parsed = JSON.parse(raw);

      if (parsed.target) {
        const target = targets.find(t => t.name === parsed.target);
        return target ? target.id : targets[0].id;
      }
      return targets[0].id;
    } catch (error) {
      console.error("OpenRouter getVote error:", error);
      const mock = new MockAI();
      return mock.getVote(player, targets, state);
    }
  }

  /**
   * Get AI reaction to human player's statement
   */
  async getReaction(player, humanMessage, state) {
    try {
      const human = state.getHuman();
      const humanName = human ? human.name : "プレイヤー";
      const prompt = this._buildPrompt(
        player,
        state,
        `${humanName}が「${humanMessage}」と発言しました。この発言に対して自然に反応してください（同意・反論・質問など1〜2文）。statement に反応内容を入れてください。`
      );
      const raw = await this._request([{ role: "user", content: prompt }]);
      const parsed = JSON.parse(raw);
      return parsed.statement || raw;
    } catch (error) {
      console.error("OpenRouter getReaction error:", error);
      const mock = new MockAI();
      return mock.getReaction(player, humanMessage, state);
    }
  }

  /**
   * Get AI night action
   */
  async getNightAction(player, targets, state) {
    try {
      const role = ROLES[player.role];
      if (!role || !role.nightAction) return null;

      const availableTargets = Array.isArray(targets)
        ? targets
        : (state ? state.getAlive().filter(p => p.id !== player.id) : []);
      if (availableTargets.length === 0) return null;

      const targetList = availableTargets.map(p => p.name).join("、");
      const ability = role.ability;

      let actionName = "";
      if (ability === "divine") actionName = "占い";
      else if (ability === "guard") actionName = "護衛";
      else if (ability === "attack") actionName = "襲撃";
      else if (ability === "heal") actionName = "治癒";
      else if (ability === "poison") actionName = "毒殺";
      else actionName = role.name;

      const prompt = this._buildPrompt(
        player,
        state,
        `夜間に${actionName}する対象を選んでください。候補: ${targetList}。JSON形式で {"target": "対象者の名前", "reasoning": "理由"} として応答してください。`
      );

      const raw = await this._request([{ role: "user", content: prompt }]);
      const parsed = JSON.parse(raw);

      if (parsed.target) {
        const target = availableTargets.find(p => p.name === parsed.target);
        return target ? target.id : availableTargets[0].id;
      }
      return availableTargets[0].id;
    } catch (error) {
      console.error("OpenRouter getNightAction error:", error);
      const mock = new MockAI();
      return mock.getNightAction(player, targets, state);
    }
  }
}
