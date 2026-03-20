// AIプレイヤーデータ — 人狼ジャッジメント風キャラクター
const AI_PLAYERS = [
  { id: "ai_1",  name: "アキラ",   personality: "冷静沈着な分析家。矛盾を見逃さない。",  style: "analytical",   avatarColor: "#4fc3f7", avatarBg: "#0d47a1", initial: "ア" },
  { id: "ai_2",  name: "ミサキ",   personality: "直感的で大胆。怪しいと思ったら即攻撃。", style: "aggressive",   avatarColor: "#ef5350", avatarBg: "#b71c1c", initial: "ミ" },
  { id: "ai_3",  name: "ユウタ",   personality: "慎重で協調的。周りの意見をよく聞く。",   style: "cautious",     avatarColor: "#81c784", avatarBg: "#1b5e20", initial: "ユ" },
  { id: "ai_4",  name: "サクラ",   personality: "明るく社交的。場の空気を読むのが得意。", style: "social",       avatarColor: "#f48fb1", avatarBg: "#880e4f", initial: "サ" },
  { id: "ai_5",  name: "リョウ",   personality: "寡黙だが鋭い観察力を持つ。",             style: "observer",     avatarColor: "#b0bec5", avatarBg: "#37474f", initial: "リ" },
  { id: "ai_6",  name: "ハルカ",   personality: "正義感が強く、味方を全力で守る。",       style: "emotional",    avatarColor: "#ffb74d", avatarBg: "#e65100", initial: "ハ" },
  { id: "ai_7",  name: "ケンジ",   personality: "疑り深く、最悪のケースを常に想定する。", style: "suspicious",   avatarColor: "#a1887f", avatarBg: "#4e342e", initial: "ケ" },
  { id: "ai_8",  name: "マイ",     personality: "柔軟で適応力がある策士。",               style: "adaptive",     avatarColor: "#ce93d8", avatarBg: "#6a1b9a", initial: "マ" },
  { id: "ai_9",  name: "タクミ",   personality: "テンポ良く議論を回す司会者タイプ。",     style: "facilitator",  avatarColor: "#4dd0e1", avatarBg: "#006064", initial: "タ" },
  { id: "ai_10", name: "ナナ",     personality: "小さな違和感を丁寧に拾う。",             style: "careful",      avatarColor: "#aed581", avatarBg: "#33691e", initial: "ナ" },
  { id: "ai_11", name: "ソウタ",   personality: "確率と論理で判断する理詰め派。",         style: "logical",      avatarColor: "#90caf9", avatarBg: "#1565c0", initial: "ソ" },
  { id: "ai_12", name: "ユイ",     personality: "穏やかで、味方のフォローが上手い。",     style: "supportive",   avatarColor: "#fff176", avatarBg: "#f57f17", initial: "ユ" },
  { id: "ai_13", name: "カイト",   personality: "強気に攻める前衛タイプ。",               style: "offensive",    avatarColor: "#ff8a65", avatarBg: "#bf360c", initial: "カ" },
  { id: "ai_14", name: "レナ",     personality: "静かだが終盤に鋭い一撃を放つ。",         style: "latebloomer",  avatarColor: "#b39ddb", avatarBg: "#4527a0", initial: "レ" },
];

// アバターSVG生成
function createAvatarSVG(player, size = 48) {
  const color = player.avatarColor || "#aaa";
  const bg = player.avatarBg || "#333";
  const initial = player.initial || player.name.charAt(0);
  const fontSize = size * 0.45;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad_${player.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bg};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color};stop-opacity:0.3" />
      </linearGradient>
    </defs>
    <circle cx="${size/2}" cy="${size/2}" r="${size/2-1}" fill="url(#grad_${player.id})" stroke="${color}" stroke-width="2"/>
    <text x="${size/2}" y="${size/2}" dy=".35em" text-anchor="middle" fill="${color}" font-size="${fontSize}" font-weight="bold" font-family="sans-serif">${initial}</text>
  </svg>`;
}

function createAvatarDataURL(player, size) {
  const svg = createAvatarSVG(player, size);
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}
