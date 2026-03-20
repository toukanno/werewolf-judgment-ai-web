// モックAI — 性格に基づく高度な発言生成
class MockAI {
  constructor() {
    this._buildDialogue();
  }

  _buildDialogue() {
    // Day 1 introductions by style
    this.intros = {
      analytical: [
        "おはようございます。まずは情報整理から始めましょう。占い師がいれば結果共有をお願いします。",
        "冷静に行きましょう。初日は情報が少ないので、発言の内容と態度をよく観察します。",
        "初日ですね。占いCOがあるかどうか、まずはそこから確認したいです。",
      ],
      aggressive: [
        "おはよう！初日から全力で行くよ！怪しい人いたらどんどん指摘して！",
        "さっさと人狼見つけようよ。黙ってる人は怪しいからね。",
        "占い師、早くCOして！情報がないと話にならないから！",
      ],
      cautious: [
        "おはようございます。初日は慎重に行きたいですね。まずは皆さんの意見を聞きましょう。",
        "焦って間違った人を吊ってしまわないよう、じっくり議論しましょう。",
        "皆さんの発言をしっかり聞いてから判断したいと思います。",
      ],
      social: [
        "おはようございます〜！楽しく、でも真剣に行きましょうね！",
        "みんなで協力して人狼を見つけましょう！占い師さん、お願いしますね♪",
        "初日って緊張しますよね〜。でも頑張りましょう！",
      ],
      observer: [
        "…おはよう。様子を見させてもらう。",
        "まずは聞く側に回る。何か気になったら言う。",
        "初日か。…まずは全員の反応を見てからだな。",
      ],
      emotional: [
        "おはよう！絶対に人狼を見つけ出してみせる！村を守るんだ！",
        "みんな、信じ合うことも大事だけど、騙されないようにしないとね！",
        "正義は必ず勝つ！みんなで力を合わせよう！",
      ],
      suspicious: [
        "…おはよう。正直、この中に人狼がいると思うと気が気じゃない。",
        "誰も信用できない状況だけど、少しずつ情報を集めよう。",
        "占い師が本物かどうかも疑わないとな…。",
      ],
      adaptive: [
        "おはようございます。状況を見て柔軟に対応していきますね。",
        "初日の流れ次第で動き方を決めます。まずは様子見。",
        "情報をしっかり集めてから方針を決めたいです。",
      ],
      facilitator: [
        "おはようございます！まず占い師のCOを聞いてから議論を進めましょう。",
        "はい、では順番に意見を出していきましょう。まず占い師から。",
        "効率よく議論を進めたいです。まずは情報共有から始めましょう。",
      ],
      careful: [
        "おはようございます。些細なことでも気になったら共有してくださいね。",
        "小さな矛盾が大きな手がかりになることもあります。丁寧に行きましょう。",
        "発言のニュアンスにも注目していきたいと思います。",
      ],
      logical: [
        "おはよう。確率論的に考えると、初日は情報が足りない。まずはデータ収集だ。",
        "論理的に整理しよう。まず人数構成から考えて、人狼の数は…",
        "感覚じゃなくて事実に基づいて判断しよう。",
      ],
      supportive: [
        "おはようございます。みなさん、一緒に頑張りましょうね。",
        "初日は不安ですけど、きっと大丈夫。冷静に行きましょう。",
        "誰かが困ってたらフォローしますので、安心して発言してください。",
      ],
      offensive: [
        "よっしゃ、始まったな！初日から攻めるぞ！",
        "黙ってる奴は怪しい。どんどん意見出していこう！",
        "さあ、人狼をあぶり出すぞ！遠慮はいらない！",
      ],
      latebloomer: [
        "……おはよう。まだ何も分からないから、聞いてる。",
        "今は静かにしてるけど…何か見えたら言う。",
        "初日はまだ早い。じっくり見てからにする。",
      ],
    };

    // Village team day statements (non-Day1)
    this.villageStatements = [
      "{target}さんの発言が気になります。少し矛盾を感じました。",
      "昨日の投票先を整理しましょう。{target}さんはなぜあの人に入れたんですか？",
      "私は村人です。疑うなら占ってもらえればいい。",
      "冷静に考えて、{target}さんが一番怪しいと思います。",
      "ここで間違えると村は終わりです。慎重に選びましょう。",
      "今日は{target}さんに投票しようと思います。理由は昨日の発言の違和感です。",
      "発言が少ない人も気になります。{target}さん、何か意見はありますか？",
      "人狼は必ずボロを出す。焦らず観察しましょう。",
      "占い結果と合わせて考えると、{target}さんのラインが気になりますね。",
      "グレーの中で一番怪しいのは{target}さんだと思います。",
      "そろそろ決断の時です。{target}さんに票を集めませんか？",
      "昨日の夜の結果を踏まえると、{target}さんの立場は苦しいですね。",
    ];

    // Seer CO and statements
    this.seerStatements = {
      co: [
        "占いCOします！{target}さんを占った結果、【{result}】でした！",
        "占い師です。昨晩{target}さんを占いました。結果は【{result}】です。",
      ],
      general: [
        "占い結果を報告します。{target}さんは【{result}】でした。",
        "昨晩の占い結果：{target}さん→【{result}】。慎重に進めましょう。",
        "私の占い結果を信じてください。{target}さんは【{result}】です。",
      ]
    };

    // Werewolf team statements (pretending to be villager)
    this.wolfStatements = [
      "私は村人です。{target}さんの方が怪しくないですか？",
      "{target}さんに投票します。あの発言は明らかにおかしい。",
      "落ち着いて考えましょう。{target}さんの発言に違和感がありました。",
      "占い師の結果を信じるなら、{target}さんが怪しいですよね。",
      "ここは{target}さんを吊るべきだと思います。消去法で考えて。",
      "自分は村人側です。信じてほしい。{target}さんこそ怪しい。",
      "人狼を見つけないと。{target}さん、弁明はありますか？",
      "村のために発言してるのに疑われるのは辛いです…。",
      "{target}さんのさっきの発言、引っかかりました。人狼っぽくないですか？",
    ];

    // Madman statements (try to protect wolves / cause chaos)
    this.madmanStatements = [
      "占いCOします！{target}さんは【村人】でした！",
      "皆さん、{target}さんは怪しいですよ。投票しましょう。",
      "私が占い師です。対抗がいますが、私が本物です。",
      "情報が錯綜してますね…{target}さんに注目した方がいいかも。",
      "{target}さんを信じるのは危険だと思います。",
      "ちょっと待ってください。{target}さんの発言をもう一度考えましょう。",
    ];

    // Style-specific flavor modifiers
    this.styleModifiers = {
      analytical: { prefix: "", suffix: "" },
      aggressive: { prefix: "", suffix: "！" },
      cautious: { prefix: "うーん、", suffix: "" },
      social: { prefix: "", suffix: "ね〜" },
      observer: { prefix: "…", suffix: "" },
      emotional: { prefix: "", suffix: "！" },
      suspicious: { prefix: "正直、", suffix: "" },
      adaptive: { prefix: "", suffix: "" },
      facilitator: { prefix: "整理すると、", suffix: "" },
      careful: { prefix: "ちょっと気になるのが、", suffix: "" },
      logical: { prefix: "論理的に考えて、", suffix: "" },
      supportive: { prefix: "", suffix: "よね。" },
      offensive: { prefix: "", suffix: "ぞ！" },
      latebloomer: { prefix: "……", suffix: "" },
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
    const targetName = target ? target.name : "誰か";

    let text;

    if (isDay1) {
      // Day 1: Use personality-based introductions
      const styleIntros = this.intros[player.style] || this.intros.cautious;
      text = this._pick(styleIntros);
    } else if (role === "seer") {
      // Seer: CO or report results
      const pool = state.day === 2 ? this.seerStatements.co : this.seerStatements.general;
      text = this._pick(pool);
      const divineResult = Math.random() > 0.6 ? "人狼" : "村人";
      text = text.replace("{result}", divineResult);
    } else if (role === "madman") {
      text = this._pick(this.madmanStatements);
    } else if (team === "werewolf") {
      text = this._pick(this.wolfStatements);
    } else {
      text = this._pick(this.villageStatements);
    }

    text = text.replace(/{target}/g, targetName);

    // Apply style modifier occasionally
    if (!isDay1 && Math.random() > 0.6) {
      const mod = this.styleModifiers[player.style] || {};
      if (mod.prefix && !text.startsWith(mod.prefix)) text = mod.prefix + text;
      if (mod.suffix) text = text.replace(/[。！？]?$/, mod.suffix);
    }

    await new Promise(r => setTimeout(r, 400 + Math.random() * 800));
    return text;
  }

  async getVote(player, targets, state) {
    await new Promise(r => setTimeout(r, 200 + Math.random() * 400));

    if (player.role === "werewolf") {
      // Wolves vote for villagers (avoid voting other wolves)
      const villagers = targets.filter(t => t.role !== "werewolf" && t.role !== "madman");
      if (villagers.length > 0) return this._pick(villagers).id;
    } else if (player.role === "madman") {
      // Madman tries to protect wolves — vote for village team
      const villagers = targets.filter(t => ROLES[t.role].team === "village");
      if (villagers.length > 0) return this._pick(villagers).id;
    }
    return this._pick(targets).id;
  }

  async getNightAction(player, targets, state) {
    await new Promise(r => setTimeout(r, 200 + Math.random() * 400));

    const role = ROLES[player.role];
    if (!role.nightAction) return null;

    if (role.ability === "attack") {
      const villagers = targets.filter(t => ROLES[t.role].team === "village");
      return villagers.length > 0 ? this._pick(villagers).id : this._pick(targets).id;
    }
    if (role.ability === "guard") {
      const guardable = targets.filter(t => t.id !== state.lastGuardTarget);
      return guardable.length > 0 ? this._pick(guardable).id : null;
    }
    if (role.ability === "divine") {
      // Prefer unscanned players
      const unscanned = targets.filter(t => !state.divinedPlayers[t.id]);
      return unscanned.length > 0 ? this._pick(unscanned).id : this._pick(targets).id;
    }
    return null;
  }
}
