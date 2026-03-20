// 役職データ定義 — 人狼ジャッジメント準拠
const ROLES = {
  villager:  { id: "villager",  name: "村人",   team: "village",   ability: null,     nightAction: false, appearAsWerewolf: false, description: "特殊な能力を持たない村人。議論と投票で人狼を見つけ出そう。", color: "#8bc34a", icon: "👤" },
  seer:      { id: "seer",      name: "占い師", team: "village",   ability: "divine",  nightAction: true,  appearAsWerewolf: false, description: "毎晩1人を占い、人狼かどうかを知ることができる。", color: "#ce93d8", icon: "🔮" },
  medium:    { id: "medium",    name: "霊能者", team: "village",   ability: "medium",  nightAction: false, appearAsWerewolf: false, description: "処刑された者が人狼だったかを知ることができる。", color: "#64b5f6", icon: "👁" },
  knight:    { id: "knight",    name: "騎士",   team: "village",   ability: "guard",   nightAction: true,  appearAsWerewolf: false, description: "毎晩1人を護衛し、人狼の襲撃から守る。連続護衛不可。", color: "#ffb74d", icon: "🛡" },
  werewolf:  { id: "werewolf",  name: "人狼",   team: "werewolf",  ability: "attack",  nightAction: true,  appearAsWerewolf: true,  description: "毎晩1人を襲撃する。仲間の人狼と協力して村を支配せよ。", color: "#ef5350", icon: "🐺" },
  madman:    { id: "madman",    name: "狂人",   team: "werewolf",  ability: null,     nightAction: false, appearAsWerewolf: false, description: "人狼陣営だが占いでは村人と出る。人狼の勝利が自分の勝利。", color: "#ec407a", icon: "🃏" },
};

// 人数別役職構成
const COMPOSITIONS = {
  5:  { villager: 2, seer: 1, knight: 0, medium: 0, madman: 0, werewolf: 2 },
  6:  { villager: 2, seer: 1, knight: 1, medium: 0, madman: 0, werewolf: 2 },
  7:  { villager: 2, seer: 1, knight: 1, medium: 1, madman: 0, werewolf: 2 },
  8:  { villager: 3, seer: 1, knight: 1, medium: 1, madman: 0, werewolf: 2 },
  9:  { villager: 3, seer: 1, knight: 1, medium: 1, madman: 0, werewolf: 3 },
  10: { villager: 3, seer: 1, knight: 1, medium: 1, madman: 1, werewolf: 3 },
  11: { villager: 4, seer: 1, knight: 1, medium: 1, madman: 1, werewolf: 3 },
  12: { villager: 4, seer: 1, knight: 1, medium: 1, madman: 1, werewolf: 4 },
  13: { villager: 5, seer: 1, knight: 1, medium: 1, madman: 1, werewolf: 4 },
  14: { villager: 6, seer: 1, knight: 1, medium: 1, madman: 1, werewolf: 4 },
  15: { villager: 6, seer: 1, knight: 1, medium: 1, madman: 2, werewolf: 4 },
};

function getCompositionText(count) {
  const comp = COMPOSITIONS[count];
  if (!comp) return "";
  const parts = [];
  for (const [roleId, num] of Object.entries(comp)) {
    if (num > 0) parts.push(`${ROLES[roleId].icon} ${ROLES[roleId].name}×${num}`);
  }
  return parts.join("　");
}
