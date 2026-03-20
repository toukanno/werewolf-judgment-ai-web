// OpenRouter API連携
class OpenRouterAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.model = "anthropic/claude-sonnet-4";
    this.baseUrl = "https://openrouter.ai/api/v1/chat/completions";
  }

  async _request(messages) {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        "HTTP-Referer": location.origin,
        "X-Title": "Werewolf Judgment AI"
      },
      body: JSON.stringify({ model: this.model, messages, temperature: 0.8, max_tokens: 300 })
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
  }

  _buildPrompt(player, state, task) {
    const alive = state.getAlive().map(p => p.name).join("、");
    const recentLog = state.log.slice(-20).map(l => `${l.sender || "システム"}: ${l.content}`).join("\n");

    return `あなたは人狼ゲームのプレイヤーです。
名前: ${player.name}
役職: ${ROLES[player.role].name}
性格: ${player.personality}
生存者: ${alive}

最近の議論:
${recentLog || "(まだ発言はありません)"}

タスク: ${task}

JSONで応答してください: {"action": "...", "target": "...", "statement": "..."}`;
  }

  async getStatement(player, state) {
    try {
      const prompt = this._buildPrompt(player, state, "議論で発言してください。statement に発言内容を入れてください。");
      const raw = await this._request([{ role: "user", content: prompt }]);
      const parsed = JSON.parse(raw);
      return parsed.statement || raw;
    } catch {
      const mock = new MockAI();
      return mock.getStatement(player, state);
    }
  }

  async getVote(player, targets, state) {
    try {
      const targetNames = targets.map(t => t.name).join("、");
      const prompt = this._buildPrompt(player, state, `投票してください。対象: ${targetNames}。target に投票先の名前を入れてください。`);
      const raw = await this._request([{ role: "user", content: prompt }]);
      const parsed = JSON.parse(raw);
      const target = targets.find(t => t.name === parsed.target);
      return target ? target.id : targets[0].id;
    } catch {
      const mock = new MockAI();
      return mock.getVote(player, targets, state);
    }
  }

  async getNightAction(player, targets, state) {
    try {
      const ability = ROLES[player.role].ability;
      const targetNames = targets.map(t => t.name).join("、");
      const prompt = this._buildPrompt(player, state, `夜の行動（${ability}）を行ってください。対象: ${targetNames}。target に対象の名前を入れてください。`);
      const raw = await this._request([{ role: "user", content: prompt }]);
      const parsed = JSON.parse(raw);
      const target = targets.find(t => t.name === parsed.target);
      return target ? target.id : targets[0].id;
    } catch {
      const mock = new MockAI();
      return mock.getNightAction(player, targets, state);
    }
  }

  static async testConnection(apiKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { "Authorization": `Bearer ${apiKey}` }
      });
      return res.ok;
    } catch { return false; }
  }
}
