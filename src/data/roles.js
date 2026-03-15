// 役職データ定義
const ROLES = {
  villager: { id: "villager", name: "村人", team: "village", ability: null, nightAction: false, appearAsWerewolf: false, description: "特殊な能力を持たない一般村人。" },
  seer:     { id: "seer",     name: "占い師", team: "village", ability: "divine", nightAction: true, appearAsWerewolf: false, description: "毎晩1人を占い、人狼かどうかを知る。" },
  knight:   { id: "knight",   name: "騎士", team: "village", ability: "guard", nightAction: true, appearAsWerewolf: false, description: "毎晩1人を護衛し、襲撃から守る。" },
  werewolf: { id: "werewolf", name: "人狼", team: "werewolf", ability: "attack", nightAction: true, appearAsWerewolf: true, description: "毎晩1人を襲撃して殺害する。" }
};

const COMPOSITIONS = {
  5: { villager: 2, seer: 1, knight: 0, werewolf: 2 },
  7: { villager: 3, seer: 1, knight: 1, werewolf: 2 },
  9: { villager: 4, seer: 1, knight: 1, werewolf: 3 }
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
