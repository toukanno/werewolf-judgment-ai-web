// 役職データ定義
const ROLES = {
  villager: { id: "villager", name: "村人", team: "village", ability: null, nightAction: false, appearAsWerewolf: false, description: "特殊な能力を持たない一般村人。議論と投票で人狼を見つけ出す。" },
  seer:     { id: "seer",     name: "占い師", team: "village", ability: "divine", nightAction: true, appearAsWerewolf: false, description: "毎晩1人を占い、人狼かどうかを知ることができる。" },
  knight:   { id: "knight",   name: "騎士", team: "village", ability: "guard", nightAction: true, appearAsWerewolf: false, description: "毎晩1人を護衛し、襲撃から守る。" },
  medium:   { id: "medium",   name: "霊能者", team: "village", ability: null, nightAction: false, appearAsWerewolf: false, description: "処刑されたプレイヤーが人狼だったかどうかを知ることができる。" },
  hunter:   { id: "hunter",   name: "狩人", team: "village", ability: null, nightAction: false, appearAsWerewolf: false, description: "村人陣営として立ち回る役職。状況整理と誘導が得意。" },
  baker:    { id: "baker",    name: "パン屋", team: "village", ability: null, nightAction: false, appearAsWerewolf: false, description: "毎日パンを焼いて村に安心感を与える村人陣営役職。" },
  werewolf: { id: "werewolf", name: "人狼", team: "werewolf", ability: "attack", nightAction: true, appearAsWerewolf: true, description: "毎晩1人を襲撃して殺害する。" }
};

const COMPOSITIONS = {
  5:  { villager: 2, seer: 1, knight: 0, medium: 0, hunter: 0, baker: 0, werewolf: 2 },
  6:  { villager: 3, seer: 1, knight: 0, medium: 0, hunter: 0, baker: 0, werewolf: 2 },
  7:  { villager: 3, seer: 1, knight: 1, medium: 0, hunter: 0, baker: 0, werewolf: 2 },
  8:  { villager: 4, seer: 1, knight: 1, medium: 0, hunter: 0, baker: 0, werewolf: 2 },
  9:  { villager: 4, seer: 1, knight: 1, medium: 0, hunter: 0, baker: 0, werewolf: 3 },
  10: { villager: 4, seer: 1, knight: 1, medium: 1, hunter: 0, baker: 0, werewolf: 3 },
  11: { villager: 5, seer: 1, knight: 1, medium: 1, hunter: 0, baker: 0, werewolf: 3 },
  12: { villager: 5, seer: 1, knight: 1, medium: 1, hunter: 1, baker: 0, werewolf: 3 },
  13: { villager: 6, seer: 1, knight: 1, medium: 1, hunter: 1, baker: 0, werewolf: 3 },
  14: { villager: 6, seer: 1, knight: 1, medium: 1, hunter: 1, baker: 0, werewolf: 4 },
  15: { villager: 6, seer: 1, knight: 1, medium: 1, hunter: 1, baker: 1, werewolf: 4 },
  16: { villager: 7, seer: 1, knight: 1, medium: 1, hunter: 1, baker: 1, werewolf: 4 },
  17: { villager: 8, seer: 1, knight: 1, medium: 1, hunter: 1, baker: 1, werewolf: 4 },
  18: { villager: 8, seer: 1, knight: 1, medium: 1, hunter: 1, baker: 1, werewolf: 5 },
  19: { villager: 9, seer: 1, knight: 1, medium: 1, hunter: 1, baker: 1, werewolf: 5 },
  20: { villager: 10, seer: 1, knight: 1, medium: 1, hunter: 1, baker: 1, werewolf: 5 }
};

function getCompositionText(count) {
  const comp = COMPOSITIONS[count];
  if (!comp) return "";
  const parts = [];
  for (const [roleId, num] of Object.entries(comp)) {
    if (num > 0) parts.push(`${ROLES[roleId].name} ×${num}`);
  }
  return parts.join("、");
}
