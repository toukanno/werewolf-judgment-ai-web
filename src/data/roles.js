/**
 * 人狼ジャッジメント - Role Definitions
 * Complete role data for the werewolf judgment game
 */

// Team definitions
const TEAMS = {
  VILLAGE: 'village',
  WEREWOLF: 'werewolf',
  FOX: 'fox',
  LOVER: 'lover',
  ZOMBIE: 'zombie',
  DEVIL: 'devil',
  OTHER: 'other'
};

// Team display information
const TEAM_INFO = {
  village: {
    name: '村人陣営',
    color: '#44cc66',
    displayColor: '#8bc34a'
  },
  werewolf: {
    name: '人狼陣営',
    color: '#ff2255',
    displayColor: '#ef5350'
  },
  fox: {
    name: '妖狐陣営',
    color: '#ff6f00',
    displayColor: '#ff6f00'
  },
  lover: {
    name: '恋人陣営',
    color: '#e91e63',
    displayColor: '#e91e63'
  },
  zombie: {
    name: 'ゾンビ陣営',
    color: '#558b2f',
    displayColor: '#558b2f'
  },
  devil: {
    name: '悪魔陣営',
    color: '#6a0080',
    displayColor: '#6a0080'
  },
  other: {
    name: 'その他',
    color: '#9e9e9e',
    displayColor: '#9e9e9e'
  }
};

// All roles - 50+ roles
const ROLES = {
  // 市民陣営 - Village Team
  villager: {
    id: 'villager',
    name: '市民',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '特別な能力を持たない村人。投票で人狼を見つけ出す必要があります。',
    color: '#8bc34a',
    icon: '👤',
    category: '市民陣営（基本）'
  },

  seer: {
    id: 'seer',
    name: '占い師',
    team: TEAMS.VILLAGE,
    ability: 'divine',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人を選んで、その人が人狼かどうかを知ることができます。',
    color: '#ce93d8',
    icon: '🔮',
    category: '市民陣営（特殊）'
  },

  medium: {
    id: 'medium',
    name: '霊能者',
    team: TEAMS.VILLAGE,
    ability: 'mediumDive',
    nightAction: true,
    appearAsWerewolf: false,
    description: '処刑された人が人狼だったかどうかを、翌朝に知ることができます。',
    color: '#64b5f6',
    icon: '👁',
    category: '市民陣営（特殊）'
  },

  knight: {
    id: 'knight',
    name: '狩人',
    team: TEAMS.VILLAGE,
    ability: 'guard',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人を選んで、その人を人狼の襲撃から守ることができます。ただし自分自身や同じ人を連続で守ることはできません。',
    color: '#ffb74d',
    icon: '🛡',
    category: '市民陣営（特殊）'
  },

  baker: {
    id: 'baker',
    name: 'パン屋',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '生きている限り、毎朝メッセージを発言することができます。',
    color: '#d4a040',
    icon: '🍞',
    category: '市民陣営（サポート）'
  },

  trapper: {
    id: 'trapper',
    name: '罠師',
    team: TEAMS.VILLAGE,
    ability: 'trap',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人に罠を仕掛けます。罠が仕掛けられた人が襲撃されると、襲撃した人狼が死亡します。',
    color: '#795548',
    icon: '🪤',
    category: '市民陣営（特殊）'
  },

  seerApprentice: {
    id: 'seerApprentice',
    name: '占い師の弟子',
    team: TEAMS.VILLAGE,
    ability: 'divine',
    nightAction: true,
    appearAsWerewolf: false,
    description: '占い師が死亡すると、その能力を継承して占い師になります。',
    color: '#ba68c8',
    icon: '📖',
    category: '市民陣営（継承）'
  },

  sage: {
    id: 'sage',
    name: '賢者',
    team: TEAMS.VILLAGE,
    ability: 'sageDiv',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人を選んで、その人の正確な役職を知ることができます。',
    color: '#7e57c2',
    icon: '📿',
    category: '市民陣営（特殊）'
  },

  fakeSeer: {
    id: 'fakeSeer',
    name: '偽占い師',
    team: TEAMS.VILLAGE,
    ability: 'fakeDivine',
    nightAction: true,
    appearAsWerewolf: false,
    description: '自分を占い師だと思っていますが、占いの結果は常に「人狼ではない」と表示されます。',
    color: '#9575cd',
    icon: '🔮',
    category: '市民陣営（トリック）'
  },

  strawDoll: {
    id: 'strawDoll',
    name: 'わら人形',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '死亡する際に、一人を道ずれにすることができます。',
    color: '#a1887f',
    icon: '🧸',
    category: '市民陣営（特殊）'
  },

  slave: {
    id: 'slave',
    name: '奴隷',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '貴族と対になっており、貴族が襲撃される際に代わりに死亡します。',
    color: '#78909c',
    icon: '⛓',
    category: '市民陣営（ペア）'
  },

  noble: {
    id: 'noble',
    name: '貴族',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '奴隷と対になっており、奴隷が身代わりになるため、人狼の襲撃から保護されています。',
    color: '#ffd700',
    icon: '👑',
    category: '市民陣営（ペア）'
  },

  twin: {
    id: 'twin',
    name: '双子',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '二人の双子はお互いを市民だと知っています。',
    color: '#4db6ac',
    icon: '👯',
    category: '市民陣営（ペア）'
  },

  priest: {
    id: 'priest',
    name: '聖職者',
    team: TEAMS.VILLAGE,
    ability: 'bless',
    nightAction: true,
    appearAsWerewolf: false,
    description: 'ゲーム中一度だけ、一人を死亡から守ることができます。',
    color: '#66bb6a',
    icon: '⛪',
    category: '市民陣営（特殊）'
  },

  shrine: {
    id: 'shrine',
    name: '巫女',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: 'ゲーム中一度だけ、自分の死亡を防ぐことができます。',
    color: '#f06292',
    icon: '🎀',
    category: '市民陣営（特殊）'
  },

  elder: {
    id: 'elder',
    name: '長老',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '最初の襲撃を生き残ります。死亡する際に、全ての村人の特殊能力が失われます。',
    color: '#8d6e63',
    icon: '👴',
    category: '市民陣営（特殊）'
  },

  nekomata: {
    id: 'nekomata',
    name: '猫又',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '襲撃されるとランダムな人狼が死亡します。処刑されるとランダムなプレイヤーが死亡します。',
    color: '#ff8a65',
    icon: '🐱',
    category: '市民陣営（特殊）'
  },

  wolfKiller: {
    id: 'wolfKiller',
    name: '人狼キラー',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '襲撃されると、襲撃した人狼も一緒に死亡します。',
    color: '#e53935',
    icon: '⚔',
    category: '市民陣営（特殊）'
  },

  sick: {
    id: 'sick',
    name: '病人',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '襲撃されると、翌晩の人狼の行動が失われます。',
    color: '#66bb6a',
    icon: '🤒',
    category: '市民陣営（特殊）'
  },

  doctor: {
    id: 'doctor',
    name: '医者',
    team: TEAMS.VILLAGE,
    ability: 'heal',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人を選んで治療します。同じ人を2晩連続で治療すると、その人は死亡します。',
    color: '#26a69a',
    icon: '💊',
    category: '市民陣営（特殊）'
  },

  thief: {
    id: 'thief',
    name: '怪盗',
    team: TEAMS.VILLAGE,
    ability: 'steal',
    nightAction: true,
    appearAsWerewolf: false,
    description: '初夜に一人を選んで、その人の役職を奪います。奪われた人は市民になります。',
    color: '#5c6bc0',
    icon: '🦹',
    category: '市民陣営（特殊）'
  },

  ghost: {
    id: 'ghost',
    name: '生霊',
    team: TEAMS.VILLAGE,
    ability: 'haunt',
    nightAction: true,
    appearAsWerewolf: false,
    description: '初夜に一人を選んで憑き、その人が死亡すると、その役職を継承します。',
    color: '#b0bec5',
    icon: '👻',
    category: '市民陣営（継承）'
  },

  queen: {
    id: 'queen',
    name: '女王',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '死亡すると、人狼でも妖狐でもない全てのプレイヤーが死亡します。',
    color: '#ffd54f',
    icon: '👸',
    category: '市民陣営（特殊）'
  },

  witch: {
    id: 'witch',
    name: '魔女',
    team: TEAMS.VILLAGE,
    ability: 'witch',
    nightAction: true,
    appearAsWerewolf: false,
    description: 'リバイバルポーション（初夜から使用可）と毒ポーション（2日目から使用可）を持っています。',
    color: '#ab47bc',
    icon: '🧙',
    category: '市民陣営（特殊）'
  },

  assassin: {
    id: 'assassin',
    name: '暗殺者',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: 'ゲーム中一度だけ、昼間に一人を暗殺することができます。',
    color: '#455a64',
    icon: '🗡',
    category: '市民陣営（特殊）'
  },

  mayor: {
    id: 'mayor',
    name: '市長',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '投票時の票が2票として数えられます。',
    color: '#5d4037',
    icon: '🎩',
    category: '市民陣営（特殊）'
  },

  dictator: {
    id: 'dictator',
    name: '独裁者',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: 'ゲーム中一度だけ、昼間に一人を強制的に処刑することができます。',
    color: '#37474f',
    icon: '👨‍⚖️',
    category: '市民陣営（特殊）'
  },

  fugitive: {
    id: 'fugitive',
    name: '逃亡者',
    team: TEAMS.VILLAGE,
    ability: 'flee',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人を選んでその人のもとに逃げます。逃げた先の人が人狼の場合、自分が死亡します。',
    color: '#66bb6a',
    icon: '🏃',
    category: '市民陣営（特殊）'
  },

  redHood: {
    id: 'redHood',
    name: '赤ずきん',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '襲撃されると仮死状態になり、全ての人狼が死亡すると復活します。',
    color: '#ef5350',
    icon: '🧣',
    category: '市民陣営（特殊）'
  },

  cursed: {
    id: 'cursed',
    name: '呪われし者',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '最初は市民ですが、襲撃されると人狼に変わります。',
    color: '#757575',
    icon: '💀',
    category: '市民陣営（変身）'
  },

  wolfBitten: {
    id: 'wolfBitten',
    name: '狼憑き',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: true,
    description: '村人陣営ですが、占い師には人狼として判定されます。',
    color: '#8d6e63',
    icon: '🐕',
    category: '市民陣営（トリック）'
  },

  watchdog: {
    id: 'watchdog',
    name: '番犬',
    team: TEAMS.VILLAGE,
    ability: 'watchdog',
    nightAction: true,
    appearAsWerewolf: false,
    description: '初夜に飼い主を選びます。飼い主を守ることも、人狼を倒すこともできます。',
    color: '#a1887f',
    icon: '🐶',
    category: '市民陣営（特殊）'
  },

  // 人狼陣営 - Werewolf Team
  werewolf: {
    id: 'werewolf',
    name: '人狼',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: true,
    description: '毎晩誰かを襲撃することができます。他の人狼と話し合って、襲撃対象を決定します。',
    color: '#ef5350',
    icon: '🐺',
    category: '人狼陣営（基本）'
  },

  madman: {
    id: 'madman',
    name: '狂人',
    team: TEAMS.WEREWOLF,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '人狼と一緒に勝利することを目指します。人狼の仲間ではありませんが、村人でもありません。',
    color: '#ec407a',
    icon: '🃏',
    category: '人狼陣営（同盟）'
  },

  fanatic: {
    id: 'fanatic',
    name: '狂信者',
    team: TEAMS.WEREWOLF,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: 'ゲーム開始時に全ての人狼を知ります。人狼と一緒に勝利することを目指します。',
    color: '#e91e63',
    icon: '🙏',
    category: '人狼陣営（同盟）'
  },

  whisperMad: {
    id: 'whisperMad',
    name: 'ささやく狂人',
    team: TEAMS.WEREWOLF,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '人狼とささやく（夜間に話す）ことができます。人狼と一緒に勝利することを目指します。',
    color: '#d81b60',
    icon: '🤫',
    category: '人狼陣営（同盟）'
  },

  bigWolf: {
    id: 'bigWolf',
    name: '大狼',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: false,
    description: '通常の人狼と同じですが、占い師には人狼ではなく判定されます。',
    color: '#c62828',
    icon: '🐺',
    category: '人狼陣営（特殊）'
  },

  talkativeWolf: {
    id: 'talkativeWolf',
    name: '饒舌な人狼',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: true,
    description: '毎日指定された単語を発言する必要があります。言わないと死亡します。',
    color: '#d32f2f',
    icon: '🗣',
    category: '人狼陣営（特殊）'
  },

  greedyWolf: {
    id: 'greedyWolf',
    name: '強欲な人狼',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: true,
    description: 'ゲーム中一度だけ、同じ夜に2人を襲撃することができます。',
    color: '#b71c1c',
    icon: '💰',
    category: '人狼陣営（特殊）'
  },

  wiseWolf: {
    id: 'wiseWolf',
    name: '賢狼',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: true,
    description: '毎晩、襲撃対象に選んだ人の役職を知ることができます。',
    color: '#880e4f',
    icon: '🧠',
    category: '人狼陣営（特殊）'
  },

  reviveWolf: {
    id: 'reviveWolf',
    name: '蘇る人狼',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: true,
    description: 'ゲーム中一度だけ、死亡したふりをして、後で復活することができます。',
    color: '#4a148c',
    icon: '🧟',
    category: '人狼陣営（特殊）'
  },

  ableWolf: {
    id: 'ableWolf',
    name: '能ある人狼',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: true,
    description: '毎晩、誰かを襲撃するか、襲撃しないかを選択できます。',
    color: '#bf360c',
    icon: '🦊',
    category: '人狼陣営（特殊）'
  },

  psycho: {
    id: 'psycho',
    name: 'サイコ',
    team: TEAMS.WEREWOLF,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '夜間に行動した全てのプレイヤーが死亡します。',
    color: '#311b92',
    icon: '☠',
    category: '人狼陣営（特殊）'
  },

  blackCat: {
    id: 'blackCat',
    name: '黒猫',
    team: TEAMS.WEREWOLF,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '処刑されるとランダムな人狼でない者が死亡します。',
    color: '#212121',
    icon: '🐈‍⬛',
    category: '人狼陣営（同盟）'
  },

  sorcerer: {
    id: 'sorcerer',
    name: '妖術師',
    team: TEAMS.WEREWOLF,
    ability: 'sorcery',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人を選んで、その人の正確な役職を知ることができます。',
    color: '#4a148c',
    icon: '🧿',
    category: '人狼陣営（特殊）'
  },

  wolfBoy: {
    id: 'wolfBoy',
    name: '狼少年',
    team: TEAMS.WEREWOLF,
    ability: 'frame',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人を選んで、その人を人狼として告発することができます。占い師の占いには人狼と判定されます。',
    color: '#880e4f',
    icon: '👦',
    category: '人狼陣営（特殊）'
  },

  // 妖狐陣営 - Fox Team
  fox: {
    id: 'fox',
    name: '妖狐',
    team: TEAMS.FOX,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '人狼の襲撃を受けても死亡しません。占い師に占われると死亡します。ゲーム終了時に生き残っていれば勝利します。',
    color: '#ff6f00',
    icon: '🦊',
    category: '妖狐陣営'
  },

  immoralist: {
    id: 'immoralist',
    name: '背徳者',
    team: TEAMS.FOX,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: 'ゲーム開始時に妖狐の正体を知ります。妖狐が死亡すると一緒に死亡します。',
    color: '#e65100',
    icon: '😈',
    category: '妖狐陣営'
  },

  childFox: {
    id: 'childFox',
    name: '子狐',
    team: TEAMS.FOX,
    ability: 'weakDivine',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人を選んで占います。50%の確率で正確な判定を得られます。人狼の襲撃を受けても死亡しません。',
    color: '#ff8f00',
    icon: '🦊',
    category: '妖狐陣営'
  },

  // 恋人陣営 - Lover Team
  lover: {
    id: 'lover',
    name: '恋人',
    team: TEAMS.LOVER,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: 'キューピッドに選ばれた2人です。一人が死亡すると他方も死亡します。両者が生き残ると勝利します。',
    color: '#e91e63',
    icon: '💕',
    category: '恋人陣営'
  },

  cupid: {
    id: 'cupid',
    name: 'キューピッド',
    team: TEAMS.LOVER,
    ability: 'matchmake',
    nightAction: true,
    appearAsWerewolf: false,
    description: '初夜に2人を選んで、恋人にします。その後は通常の村人として行動します。',
    color: '#f06292',
    icon: '💘',
    category: '恋人陣営'
  },

  // ゾンビ陣営 - Zombie Team
  zombie: {
    id: 'zombie',
    name: 'ゾンビ',
    team: TEAMS.ZOMBIE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '人狼に襲撃されたプレイヤーはゾンビになります。ゾンビは自分たちの勝利を目指します。',
    color: '#558b2f',
    icon: '🧟',
    category: 'ゾンビ陣営'
  },

  // その他 - Other Team
  santa: {
    id: 'santa',
    name: 'サンタ',
    team: TEAMS.OTHER,
    ability: 'gift',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩プレゼントを配ります。ゲーム終了時に生き残っていれば勝利します。',
    color: '#c62828',
    icon: '🎅',
    category: 'その他'
  },

  // 市民陣営 new roles
  detective: {
    id: 'detective',
    name: '名探偵',
    team: TEAMS.VILLAGE,
    ability: 'investigate',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人を調査し、その人の正確な役職を知ることができる。',
    color: '#546e7a',
    icon: '🔍',
    category: '市民陣営（特殊）'
  },

  itako: {
    id: 'itako',
    name: 'イタコ',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '死者と交信できる。死者の役職を知ることができる。',
    color: '#7986cb',
    icon: '🔮',
    category: '市民陣営（特殊）'
  },

  father: {
    id: 'father',
    name: '神父',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '処刑投票時、自分への投票者を知ることができる。',
    color: '#78909c',
    icon: '⛪',
    category: '市民陣営（特殊）'
  },

  housekeeper: {
    id: 'housekeeper',
    name: '家政婦',
    team: TEAMS.VILLAGE,
    ability: 'housekeep',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人の家を訪問し、その人への訪問者を知ることができる。',
    color: '#a1887f',
    icon: '🏠',
    category: '市民陣営（特殊）'
  },

  wanderer: {
    id: 'wanderer',
    name: '風来坊',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '投票先を公開しない。誰に投票したか他のプレイヤーには分からない。',
    color: '#8d6e63',
    icon: '🌀',
    category: '市民陣営（特殊）'
  },

  poet: {
    id: 'poet',
    name: '詩人',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '死亡時にポエムを残す。ポエムの内容から情報を推理できる。',
    color: '#b39ddb',
    icon: '📝',
    category: '市民陣営（特殊）'
  },

  talkativeHunter: {
    id: 'talkativeHunter',
    name: '饒舌な狩人',
    team: TEAMS.VILLAGE,
    ability: 'guard',
    nightAction: true,
    appearAsWerewolf: false,
    description: '狩人と同じ能力を持つが、毎日指定された単語を発言しないと死亡する。',
    color: '#ff8f00',
    icon: '🛡',
    category: '市民陣営（特殊）'
  },

  princess: {
    id: 'princess',
    name: 'プリンセス',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '処刑されると、投票した人の中からランダムで一人が道連れになる。',
    color: '#f48fb1',
    icon: '👸',
    category: '市民陣営（特殊）'
  },

  newspaper: {
    id: 'newspaper',
    name: '新聞配達',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '死亡した翌朝、遺言を届けることができる。',
    color: '#90a4ae',
    icon: '📰',
    category: '市民陣営（特殊）'
  },

  gambler: {
    id: 'gambler',
    name: 'ギャンブラー',
    team: TEAMS.VILLAGE,
    ability: 'gamble',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人を選び、その人の役職を当てる。当たれば生存、外れれば死亡。',
    color: '#ffd54f',
    icon: '🎰',
    category: '市民陣営（特殊）'
  },

  ironLady: {
    id: 'ironLady',
    name: '鉄の女',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '投票では処刑されない。襲撃でのみ死亡する。',
    color: '#607d8b',
    icon: '🔩',
    category: '市民陣営（特殊）'
  },

  happyOwl: {
    id: 'happyOwl',
    name: '幸福の梟',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '護衛が成功した場合、護衛された人に通知される。',
    color: '#fff176',
    icon: '🦉',
    category: '市民陣営（特殊）'
  },

  wolfHunter: {
    id: 'wolfHunter',
    name: '狼憑きの狩人',
    team: TEAMS.VILLAGE,
    ability: 'guard',
    nightAction: true,
    appearAsWerewolf: true,
    description: '狩人と同じ能力を持つが、占いでは人狼と判定される。',
    color: '#6d4c41',
    icon: '🐕',
    category: '市民陣営（特殊）'
  },

  nobleSon: {
    id: 'nobleSon',
    name: '貴族の息子',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '貴族と対になっており、貴族が死亡すると能力を継承する。',
    color: '#ffcc02',
    icon: '👑',
    category: '市民陣営（ペア）'
  },

  annoyingHunter: {
    id: 'annoyingHunter',
    name: '迷惑な狩人',
    team: TEAMS.VILLAGE,
    ability: 'guard',
    nightAction: true,
    appearAsWerewolf: false,
    description: '護衛に成功すると護衛対象も自分も死亡する。',
    color: '#bf360c',
    icon: '💥',
    category: '市民陣営（特殊）'
  },

  dualPistol: {
    id: 'dualPistol',
    name: '二丁拳銃',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '処刑時に二人を道連れにできる。',
    color: '#455a64',
    icon: '🔫',
    category: '市民陣営（特殊）'
  },

  whisperTwin: {
    id: 'whisperTwin',
    name: 'ささやく双子',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '双子同士で夜にささやき合うことができる。',
    color: '#80cbc4',
    icon: '👯',
    category: '市民陣営（ペア）'
  },

  paladin: {
    id: 'paladin',
    name: '聖騎士',
    team: TEAMS.VILLAGE,
    ability: 'paladinCheck',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人を選び、その人が人狼陣営かどうかを知ることができる。',
    color: '#ffd600',
    icon: '⚔',
    category: '市民陣営（特殊）'
  },

  leader: {
    id: 'leader',
    name: '指導者',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '死亡すると全員の投票先が公開される。',
    color: '#0277bd',
    icon: '📢',
    category: '市民陣営（特殊）'
  },

  gravePriest: {
    id: 'gravePriest',
    name: '墓場の司祭',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '死者の数だけ投票数が増える。',
    color: '#37474f',
    icon: '⛪',
    category: '市民陣営（特殊）'
  },

  magicalGirl: {
    id: 'magicalGirl',
    name: '魔法少女',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '死亡すると人狼を一人道連れにする。',
    color: '#e040fb',
    icon: '✨',
    category: '市民陣営（特殊）'
  },

  chicken: {
    id: 'chicken',
    name: 'チキン',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '最初の投票で最多票になると逃亡して死亡する。',
    color: '#ffab40',
    icon: '🐔',
    category: '市民陣営（特殊）'
  },

  fakeQueen: {
    id: 'fakeQueen',
    name: '偽女王',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '女王と同じように見えるが、死亡しても他のプレイヤーは死亡しない。',
    color: '#ffc107',
    icon: '👸',
    category: '市民陣営（トリック）'
  },

  matchSeller: {
    id: 'matchSeller',
    name: 'マッチ売り',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '襲撃されると、翌日の投票が無効になる。',
    color: '#ff7043',
    icon: '🔥',
    category: '市民陣営（特殊）'
  },

  lightApostle: {
    id: 'lightApostle',
    name: '光の使徒',
    team: TEAMS.VILLAGE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '処刑されると翌日が平和になる（襲撃が発生しない）。',
    color: '#fff9c4',
    icon: '☀',
    category: '市民陣営（特殊）'
  },

  // 人狼陣営 new roles
  newSpeciesWolf: {
    id: 'newSpeciesWolf',
    name: '新種の人狼',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: false,
    description: '占いでも霊能でも人狼と判定されない特殊な人狼。',
    color: '#880e4f',
    icon: '🐺',
    category: '人狼陣営（特殊）'
  },

  devotedWolf: {
    id: 'devotedWolf',
    name: '一途な人狼',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: true,
    description: '毎晩同じ人しか襲撃できない。',
    color: '#ad1457',
    icon: '🐺',
    category: '人狼陣営（特殊）'
  },

  loneWolf: {
    id: 'loneWolf',
    name: '一匹狼',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: true,
    description: '他の人狼と会話できない孤独な人狼。',
    color: '#6a1b9a',
    icon: '🐺',
    category: '人狼陣営（特殊）'
  },

  mindEyeWolf: {
    id: 'mindEyeWolf',
    name: '心眼の人狼',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: true,
    description: '襲撃対象の役職を知ることができる。',
    color: '#4a148c',
    icon: '👁',
    category: '人狼陣営（特殊）'
  },

  gamblingWolf: {
    id: 'gamblingWolf',
    name: 'ギャンブル狼',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: true,
    description: '襲撃成功で能力強化、失敗で弱体化する。',
    color: '#f9a825',
    icon: '🎲',
    category: '人狼陣営（特殊）'
  },

  wolfKing: {
    id: 'wolfKing',
    name: '人狼王',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: true,
    description: '処刑されると一人を道連れにできる人狼。',
    color: '#b71c1c',
    icon: '👑',
    category: '人狼陣営（特殊）'
  },

  corneredWolf: {
    id: 'corneredWolf',
    name: '窮地の人狼',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: true,
    description: '最後の人狼になると能力が強化される。',
    color: '#d50000',
    icon: '🐺',
    category: '人狼陣営（特殊）'
  },

  curseWolf: {
    id: 'curseWolf',
    name: '呪狼',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: true,
    description: '占われると占い師が死亡する。',
    color: '#311b92',
    icon: '💜',
    category: '人狼陣営（特殊）'
  },

  wolfGirl: {
    id: 'wolfGirl',
    name: '狼少女',
    team: TEAMS.WEREWOLF,
    ability: 'attack',
    nightAction: true,
    appearAsWerewolf: true,
    description: '人狼の中で最も若い。特定条件で能力が発動する。',
    color: '#e91e63',
    icon: '🐺',
    category: '人狼陣営（特殊）'
  },

  rebelMadman: {
    id: 'rebelMadman',
    name: '反逆の狂人',
    team: TEAMS.WEREWOLF,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '人狼陣営だが、最終日に生き残ると村人陣営に寝返る。',
    color: '#ff5722',
    icon: '🃏',
    category: '人狼陣営（同盟）'
  },

  bombMadman: {
    id: 'bombMadman',
    name: '爆弾狂',
    team: TEAMS.WEREWOLF,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '処刑されると周囲のプレイヤーを巻き込んで爆発する。',
    color: '#ff3d00',
    icon: '💣',
    category: '人狼陣営（同盟）'
  },

  corruptPolitician: {
    id: 'corruptPolitician',
    name: '悪徳政治家',
    team: TEAMS.WEREWOLF,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '投票数を操作できる。',
    color: '#37474f',
    icon: '🏛',
    category: '人狼陣営（同盟）'
  },

  wolfDescendant: {
    id: 'wolfDescendant',
    name: '人狼の末裔',
    team: TEAMS.WEREWOLF,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '全ての人狼が死亡すると人狼に変化する。',
    color: '#880e4f',
    icon: '🐺',
    category: '人狼陣営（同盟）'
  },

  darkSeer: {
    id: 'darkSeer',
    name: '黒い占い師',
    team: TEAMS.WEREWOLF,
    ability: 'darkDivine',
    nightAction: true,
    appearAsWerewolf: false,
    description: '占い師と同じ能力を持つが人狼陣営。',
    color: '#1a237e',
    icon: '🔮',
    category: '人狼陣営（特殊）'
  },

  seductiveFollower: {
    id: 'seductiveFollower',
    name: '誘惑の狼信者',
    team: TEAMS.WEREWOLF,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '処刑されると投票した人を人狼陣営に引き込む。',
    color: '#c2185b',
    icon: '💋',
    category: '人狼陣営（同盟）'
  },

  sealFollower: {
    id: 'sealFollower',
    name: '封魔の狼信者',
    team: TEAMS.WEREWOLF,
    ability: 'seal',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人の能力を封印できる。',
    color: '#4527a0',
    icon: '🔒',
    category: '人狼陣営（特殊）'
  },

  queenImpersonator: {
    id: 'queenImpersonator',
    name: '女王騙り',
    team: TEAMS.WEREWOLF,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '女王のふりをする人狼陣営。処刑されても女王効果は発動しない。',
    color: '#f50057',
    icon: '👸',
    category: '人狼陣営（同盟）'
  },

  darkIncarnation: {
    id: 'darkIncarnation',
    name: '闇の化身',
    team: TEAMS.WEREWOLF,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '人狼陣営の勝利条件を満たすと特殊勝利する。',
    color: '#12005e',
    icon: '🌑',
    category: '人狼陣営（特殊）'
  },

  // 妖狐陣営 new roles
  traitor: {
    id: 'traitor',
    name: '背信者',
    team: TEAMS.FOX,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '妖狐と相互認識できる。妖狐陣営の勝利を目指す。',
    color: '#e65100',
    icon: '🦊',
    category: '妖狐陣営'
  },

  nineTailFox: {
    id: 'nineTailFox',
    name: '九尾の狐',
    team: TEAMS.FOX,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '占われても一度だけ死亡を回避できる強力な妖狐。',
    color: '#ff6d00',
    icon: '🦊',
    category: '妖狐陣営'
  },

  talkativeFox: {
    id: 'talkativeFox',
    name: '饒舌な妖狐',
    team: TEAMS.FOX,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '毎日指定された単語を発言しないと死亡する妖狐。',
    color: '#ff9100',
    icon: '🦊',
    category: '妖狐陣営'
  },

  whisperApostate: {
    id: 'whisperApostate',
    name: 'ささやく背教者',
    team: TEAMS.FOX,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '妖狐とささやき合うことができる背徳者。',
    color: '#bf360c',
    icon: '😈',
    category: '妖狐陣営'
  },

  mutantFox: {
    id: 'mutantFox',
    name: '変異狐',
    team: TEAMS.FOX,
    ability: null,
    nightAction: false,
    appearAsWerewolf: true,
    description: '占いで人狼と判定される妖狐。',
    color: '#e64a19',
    icon: '🦊',
    category: '妖狐陣営'
  },

  corruptSorcerer: {
    id: 'corruptSorcerer',
    name: '背徳の呪術師',
    team: TEAMS.FOX,
    ability: 'sorcery',
    nightAction: true,
    appearAsWerewolf: false,
    description: '妖術師と同じ能力を持つ妖狐陣営。',
    color: '#4e342e',
    icon: '🧿',
    category: '妖狐陣営'
  },

  // ゾンビ陣営 new roles
  zombieMania: {
    id: 'zombieMania',
    name: 'ゾンビマニア',
    team: TEAMS.ZOMBIE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: 'ゲーム開始時にゾンビ陣営に加わる。ゾンビの勝利が自分の勝利。',
    color: '#33691e',
    icon: '🧟',
    category: 'ゾンビ陣営'
  },

  whisperZombieDoc: {
    id: 'whisperZombieDoc',
    name: '囁くゾンビ博士',
    team: TEAMS.ZOMBIE,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: 'ゾンビとささやき合うことができる。',
    color: '#1b5e20',
    icon: '🧟',
    category: 'ゾンビ陣営'
  },

  assaultZombie: {
    id: 'assaultZombie',
    name: '襲撃のゾンビ',
    team: TEAMS.ZOMBIE,
    ability: 'zombieAttack',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人を襲撃してゾンビに変えることができる。',
    color: '#2e7d32',
    icon: '🧟',
    category: 'ゾンビ陣営'
  },

  // 恋人陣営 new roles
  femmeFatale: {
    id: 'femmeFatale',
    name: '悪女',
    team: TEAMS.LOVER,
    ability: 'seduce',
    nightAction: true,
    appearAsWerewolf: false,
    description: '毎晩一人を誘惑し、恋人にすることができる。',
    color: '#d50000',
    icon: '💔',
    category: '恋人陣営'
  },

  // 悪魔陣営 - Devil Team
  devil: {
    id: 'devil',
    name: '悪魔',
    team: TEAMS.DEVIL,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '死亡後に覚醒し、下僕を選ぶことができる。',
    color: '#6a0080',
    icon: '😈',
    category: '悪魔陣営'
  },

  // その他 - Other Team
  reindeer: {
    id: 'reindeer',
    name: '赤鼻のトナカイ',
    team: TEAMS.OTHER,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: 'サンタと対になっている。サンタが死亡すると後を追って死亡する。',
    color: '#d84315',
    icon: '🦌',
    category: 'その他'
  },

  martyr: {
    id: 'martyr',
    name: '殉教者',
    team: TEAMS.OTHER,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '死亡すると勝利する。生き残ると敗北。',
    color: '#5d4037',
    icon: '✝',
    category: 'その他'
  },

  teruterubozu: {
    id: 'teruterubozu',
    name: 'てるてる坊主',
    team: TEAMS.OTHER,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '処刑されると勝利する。襲撃で死亡すると敗北。',
    color: '#e0e0e0',
    icon: '🌤',
    category: 'その他'
  },

  pigMan: {
    id: 'pigMan',
    name: 'ぶた男',
    team: TEAMS.OTHER,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '人狼に襲撃されると勝利する。',
    color: '#f48fb1',
    icon: '🐷',
    category: 'その他'
  },

  batMan: {
    id: 'batMan',
    name: 'コウモリ男',
    team: TEAMS.OTHER,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '最後まで生き残ると勝利する。どの陣営にも属さない。',
    color: '#424242',
    icon: '🦇',
    category: 'その他'
  },

  avenger: {
    id: 'avenger',
    name: '復讐者',
    team: TEAMS.OTHER,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '特定のプレイヤーを道連れにすると勝利する。',
    color: '#b71c1c',
    icon: '💢',
    category: 'その他'
  },

  contrarian: {
    id: 'contrarian',
    name: '天邪鬼',
    team: TEAMS.OTHER,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '負けた陣営が勝利条件。通常の勝敗が逆転する。',
    color: '#ff6f00',
    icon: '👹',
    category: 'その他'
  },

  trueLover: {
    id: 'trueLover',
    name: '純愛者',
    team: TEAMS.OTHER,
    ability: 'chooseLove',
    nightAction: true,
    appearAsWerewolf: false,
    description: '初夜に一人を選び、その人と運命を共にする。',
    color: '#e91e63',
    icon: '💗',
    category: 'その他'
  },

  drunkard: {
    id: 'drunkard',
    name: '酔っぱらい',
    team: TEAMS.OTHER,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '自分の役職が分からない。3日目に本当の役職が判明する。',
    color: '#ff8a65',
    icon: '🍺',
    category: 'その他'
  },

  plagueGod: {
    id: 'plagueGod',
    name: '疫病神',
    team: TEAMS.OTHER,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '隣に座っている人を呪い、不幸にする。',
    color: '#4a148c',
    icon: '☠',
    category: 'その他'
  },

  telepathist: {
    id: 'telepathist',
    name: 'テレパシスト',
    team: TEAMS.OTHER,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '他のプレイヤーの心を読むことができる。',
    color: '#00bcd4',
    icon: '🧠',
    category: 'その他'
  },

  jekyllHyde: {
    id: 'jekyllHyde',
    name: 'ジキルとハイド',
    team: TEAMS.OTHER,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '昼は村人、夜は人狼として行動する二重人格。',
    color: '#9e9e9e',
    icon: '🎭',
    category: 'その他'
  },

  ratGirl: {
    id: 'ratGirl',
    name: 'ねずみ娘',
    team: TEAMS.OTHER,
    ability: null,
    nightAction: false,
    appearAsWerewolf: false,
    description: '毎晩誰かの家を訪問する。訪問先が襲撃されると一緒に死亡。',
    color: '#8d6e63',
    icon: '🐭',
    category: 'その他'
  },

  passionateLover: {
    id: 'passionateLover',
    name: '激愛女',
    team: TEAMS.OTHER,
    ability: 'chooseLove',
    nightAction: true,
    appearAsWerewolf: false,
    description: '初夜に一人を選び、その人を独占する。',
    color: '#d50000',
    icon: '❤',
    category: 'その他'
  }
};

// Role categories for UI display
const ROLE_CATEGORIES = [
  '市民陣営（基本）',
  '市民陣営（特殊）',
  '市民陣営（サポート）',
  '市民陣営（継承）',
  '市民陣営（トリック）',
  '市民陣営（変身）',
  '市民陣営（ペア）',
  '人狼陣営（基本）',
  '人狼陣営（同盟）',
  '人狼陣営（特殊）',
  '妖狐陣営',
  '恋人陣営',
  'ゾンビ陣営',
  '悪魔陣営',
  'その他'
];

// Helper function to get team label
function getTeamLabel(team) {
  return TEAM_INFO[team]?.name || team;
}

// Preset compositions for different player counts
const DEFAULT_PRESETS = {
  5: {
    name: '5人村',
    composition: {
      villager: 2,
      seer: 1,
      werewolf: 2
    }
  },

  6: {
    name: '6人村',
    composition: {
      villager: 2,
      seer: 1,
      knight: 1,
      werewolf: 1,
      madman: 1
    }
  },

  7: {
    name: '7人村',
    composition: {
      villager: 3,
      seer: 1,
      knight: 1,
      werewolf: 2
    }
  },

  8: {
    name: '8人村',
    composition: {
      villager: 3,
      seer: 1,
      knight: 1,
      medium: 1,
      werewolf: 1,
      madman: 1
    }
  },

  9: {
    name: '9人村',
    composition: {
      villager: 3,
      seer: 1,
      knight: 1,
      medium: 1,
      werewolf: 3
    }
  },

  10: {
    name: '10人村',
    composition: {
      villager: 4,
      seer: 1,
      knight: 1,
      medium: 1,
      werewolf: 2,
      madman: 1
    }
  },

  11: {
    name: '11人村',
    composition: {
      villager: 4,
      seer: 1,
      knight: 1,
      medium: 1,
      sage: 1,
      werewolf: 2,
      madman: 1
    }
  },

  12: {
    name: '12人村',
    composition: {
      villager: 4,
      seer: 1,
      knight: 1,
      medium: 1,
      sage: 1,
      doctor: 1,
      werewolf: 2,
      madman: 1
    }
  },

  13: {
    name: '13人村',
    composition: {
      villager: 3,
      seer: 1,
      knight: 1,
      medium: 1,
      sage: 1,
      detective: 1,
      doctor: 1,
      werewolf: 2,
      fox: 1,
      madman: 1
    }
  },

  14: {
    name: '14人村',
    composition: {
      villager: 3,
      seer: 1,
      knight: 1,
      medium: 1,
      sage: 1,
      doctor: 1,
      paladin: 1,
      werewolf: 2,
      wiseWolf: 1,
      fox: 1,
      madman: 1
    }
  },

  15: {
    name: '15人村',
    composition: {
      villager: 3,
      seer: 1,
      knight: 1,
      medium: 1,
      sage: 1,
      doctor: 1,
      witch: 1,
      housekeeper: 1,
      werewolf: 2,
      wiseWolf: 1,
      fox: 1,
      madman: 1
    }
  },

  16: {
    name: '16人村',
    composition: {
      villager: 2,
      seer: 1,
      knight: 1,
      medium: 1,
      sage: 1,
      doctor: 1,
      witch: 1,
      assassin: 1,
      housekeeper: 1,
      werewolf: 2,
      wiseWolf: 1,
      bigWolf: 1,
      fox: 1,
      madman: 1
    }
  },

  17: {
    name: '17人村',
    composition: {
      villager: 2,
      seer: 1,
      knight: 1,
      medium: 1,
      sage: 1,
      doctor: 1,
      witch: 1,
      assassin: 1,
      paladin: 1,
      werewolf: 2,
      wiseWolf: 1,
      bigWolf: 1,
      fox: 1,
      immoralist: 1,
      madman: 1
    }
  },

  18: {
    name: '18人村',
    composition: {
      villager: 2,
      seer: 1,
      knight: 1,
      medium: 1,
      sage: 1,
      doctor: 1,
      witch: 1,
      assassin: 1,
      trapper: 1,
      detective: 1,
      werewolf: 2,
      wiseWolf: 1,
      bigWolf: 1,
      fox: 1,
      immoralist: 1,
      madman: 1
    }
  },

  19: {
    name: '19人村',
    composition: {
      villager: 2,
      seer: 1,
      knight: 1,
      medium: 1,
      sage: 1,
      doctor: 1,
      witch: 1,
      assassin: 1,
      trapper: 1,
      mayor: 1,
      housekeeper: 1,
      werewolf: 2,
      wiseWolf: 1,
      bigWolf: 1,
      fox: 1,
      immoralist: 1,
      madman: 1
    }
  },

  20: {
    name: '20人村',
    composition: {
      villager: 5,
      seer: 1,
      knight: 1,
      medium: 1,
      sage: 1,
      doctor: 1,
      trapper: 1,
      werewolf: 5,
      madman: 1,
      fox: 1,
      immoralist: 1,
      nekomata: 1
    }
  }
};

// Backward-compatible alias used by older tests / callers
const COMPOSITIONS = DEFAULT_PRESETS;

/**
 * Get composition text for display
 * @param {Object} composition - Role ID to count mapping
 * @returns {string} Formatted composition text
 */
function getCompositionText(composition) {
  if (!composition || typeof composition !== 'object') {
    return '';
  }

  const parts = [];
  Object.entries(composition).forEach(([roleId, count]) => {
    const role = ROLES[roleId];
    if (role && count > 0) {
      if (count === 1) {
        parts.push(role.name);
      } else {
        parts.push(`${role.name}×${count}`);
      }
    }
  });

  return parts.join('・');
}

/**
 * Get all roles of a specific team
 * @param {string} team - Team ID
 * @returns {Array} Array of role objects
 */
function getRolesByTeam(team) {
  return Object.values(ROLES).filter(role => role.team === team);
}

/**
 * Get all roles in a specific category
 * @param {string} category - Category name
 * @returns {Array} Array of role objects
 */
function getRolesByCategory(category) {
  return Object.values(ROLES).filter(role => role.category === category);
}

/**
 * Get total role count
 * @returns {number} Total number of roles
 */
function getTotalRoleCount() {
  return Object.keys(ROLES).length;
}

/**
 * Validate composition for player count
 * @param {Object} composition - Role ID to count mapping
 * @returns {Object} Validation result with isValid and playerCount
 */
function validateComposition(composition) {
  if (!composition || typeof composition !== 'object') {
    return { isValid: false, playerCount: 0, error: '構成が無効です' };
  }

  let playerCount = 0;
  let villageCount = 0;
  let werewolfCount = 0;
  let foxCount = 0;

  Object.entries(composition).forEach(([roleId, count]) => {
    const role = ROLES[roleId];
    if (!role) {
      return;
    }

    const num = parseInt(count) || 0;
    playerCount += num;

    if (role.team === TEAMS.VILLAGE) {
      villageCount += num;
    } else if (role.team === TEAMS.WEREWOLF) {
      werewolfCount += num;
    } else if (role.team === TEAMS.FOX) {
      foxCount += num;
    }
  });

  if (playerCount < 5) {
    return { isValid: false, playerCount, error: '最低5人が必要です' };
  }

  if (playerCount > 20) {
    return { isValid: false, playerCount, error: '最大20人までです' };
  }

  if (werewolfCount === 0) {
    return { isValid: false, playerCount, error: '人狼が必要です' };
  }

  if (villageCount === 0) {
    return { isValid: false, playerCount, error: '村人が必要です' };
  }

  return { isValid: true, playerCount, villageCount, werewolfCount, foxCount };
}

// Exported globals:
// TEAMS, TEAM_INFO, ROLES, ROLE_CATEGORIES, DEFAULT_PRESETS, COMPOSITIONS
// getTeamLabel, getCompositionText, getRolesByTeam, getRolesByCategory, getTotalRoleCount, validateComposition
const _rolesExport = {
  TEAMS,
  TEAM_INFO,
  ROLES,
  ROLE_CATEGORIES,
  DEFAULT_PRESETS,
  COMPOSITIONS,
  getTeamLabel,
  getCompositionText,
  getRolesByTeam,
  getRolesByCategory,
  getTotalRoleCount,
  validateComposition
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = _rolesExport;
}

if (typeof globalThis !== 'undefined') {
  Object.assign(globalThis, _rolesExport);
}

export { TEAMS, TEAM_INFO, ROLES, ROLE_CATEGORIES, DEFAULT_PRESETS, COMPOSITIONS, getTeamLabel, getCompositionText, getRolesByTeam, getRolesByCategory, getTotalRoleCount, validateComposition };
