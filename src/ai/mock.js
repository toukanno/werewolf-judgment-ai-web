// モックAI — APIキー不要で動作するダミーAI
class MockAI {
  constructor() {
    this.statements = {
      village: {
        day1: [
          "おはようございます。まずは様子を見ましょう。",
          "初日なので情報が少ないですね。慎重に行きましょう。",
          "占い師がいれば結果を教えてほしいですね。",
          "まだ何も分からないので、発言から怪しい人を探しましょう。",
          "初日は情報がないので、感覚で話すしかないですね。"
        ],
        general: [
          "昨日の投票結果を見ると、{target}さんが気になります。",
          "ここは冷静に考えましょう。発言が少ない人もチェックすべきです。",
          "私は村人です。占い師さん、もし結果があれば共有してください。",
          "今日の投票は重要です。間違った人を処刑すると村が不利になります。",
          "怪しい人が分からないなら、グレーを詰めていきましょう。"
        ]
      },
      werewolf: {
        day1: [
          "おはようございます。平和に初日を過ごしましょう。",
          "占い結果が気になりますね。誰を占ったんでしょうか。",
          "初日から疑い合っても仕方ないので、情報整理しましょう。"
        ],
        general: [
          "私は村人です。疑われる理由が分かりません。",
          "{target}さんの発言、少し矛盾がある気がします。",
          "ここは{target}さんに投票するべきだと思います。",
          "占い師を騙っている人がいるかもしれませんね。"
        ]
      },
      seer: {
        day1: [
          "占い師です。初日の結果をお伝えします。",
          "占いCOします。情報を共有したいと思います。"
        ],
        general: [
          "占い結果です。{target}さんは{result}でした。",
          "占い師として情報を提供し続けます。信じてください。"
        ]
      }
    };
  }

  _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  _randomTarget(alive, excludeId) {
    const targets = alive.filter(p => p.id !== excludeId);
    return targets.length > 0 ? this._pick(targets) : null;
  }

  async getStatement(player, state) {
    const role = player.role;
    const team = ROLES[role].team;
    const isDay1 = state.day === 1;
    const alive = state.getAlive();
    const target = this._randomTarget(alive, player.id);

    let pool;
    if (role === "seer") {
      pool = isDay1 ? this.statements.seer.day1 : this.statements.seer.general;
    } else if (team === "werewolf") {
      pool = isDay1 ? this.statements.werewolf.day1 : this.statements.werewolf.general;
    } else {
      pool = isDay1 ? this.statements.village.day1 : this.statements.village.general;
    }

    let text = this._pick(pool);
    if (target) text = text.replace("{target}", target.name);
    text = text.replace("{result}", Math.random() > 0.5 ? "村人" : "人狼");

    // 少し遅延を入れてリアル感を出す
    await new Promise(r => setTimeout(r, 300 + Math.random() * 700));
    return text;
  }

  async getVote(player, targets, state) {
    await new Promise(r => setTimeout(r, 200 + Math.random() * 400));

    // 人狼は村人を狙う、村人はランダム
    if (player.role === "werewolf") {
      const villagers = targets.filter(t => t.role !== "werewolf");
      if (villagers.length > 0) return this._pick(villagers).id;
    }
    return this._pick(targets).id;
  }

  async getNightAction(player, targets, state) {
    await new Promise(r => setTimeout(r, 200 + Math.random() * 400));

    const role = ROLES[player.role];
    if (!role.nightAction) return null;

    if (role.ability === "attack") {
      // 人狼: 村人陣営を襲撃
      const villagers = targets.filter(t => ROLES[t.role].team === "village");
      return villagers.length > 0 ? this._pick(villagers).id : this._pick(targets).id;
    }
    if (role.ability === "guard") {
      // 騎士: 前夜と違う人を護衛
      const guardable = targets.filter(t => t.id !== state.lastGuardTarget);
      return guardable.length > 0 ? this._pick(guardable).id : null;
    }
    if (role.ability === "divine") {
      // 占い師: ランダムに占う
      return this._pick(targets).id;
    }
    return null;
  }
}
