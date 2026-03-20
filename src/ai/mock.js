/**
 * MockAI - Personality-driven AI for werewolf game
 * Vanilla JS implementation with no dependencies
 */

class MockAI {
  constructor() {
    this.personalityStyles = [
      'analytical', 'aggressive', 'cautious', 'social', 'observer',
      'emotional', 'suspicious', 'adaptive', 'facilitator', 'careful',
      'logical', 'supportive', 'offensive', 'latebloomer'
    ];

    this.dialoguePool = {
      villager: {
        analytical: [
          'Looking at the vote patterns, I think we should target the most suspicious player.',
          'Let me analyze who spoke the most last round.',
          'Based on behavior, I suspect a wolf among us.',
          'The statistics suggest we should investigate further.'
        ],
        aggressive: [
          'I\'m voting for them - they\'re clearly suspicious!',
          'That person is definitely a wolf, I can feel it.',
          'We need to move fast and eliminate threats.',
          'Stop wasting time, let\'s vote them out!'
        ],
        cautious: [
          'I\'m not entirely sure, but something feels off.',
          'We should be careful about accusations without proof.',
          'Let\'s wait for more information before deciding.',
          'I think we need to be strategic here.'
        ],
        social: [
          'Hey everyone, what do you all think about this?',
          'Let\'s work together to figure this out.',
          'I trust your judgment on this one.',
          'What\'s everyone\'s take on the situation?'
        ],
        observer: [
          'I\'ve been watching how people react.',
          'Notice how they responded to that claim?',
          'The body language is interesting.',
          'I\'m noting the pattern of who speaks when.'
        ],
        emotional: [
          'I really feel like they\'re being dishonest!',
          'This is so stressful, I don\'t know who to trust!',
          'My gut tells me something\'s wrong here.',
          'I\'m getting a bad feeling about this.'
        ],
        suspicious: [
          'Something about that explanation doesn\'t add up.',
          'They\'re being way too quiet about it.',
          'That alibi sounds made up to me.',
          'Why are they defending them so hard?'
        ],
        logical: [
          'If we eliminate them first, we reduce wolf power.',
          'The math says we have a 70% chance they\'re guilty.',
          'Following the logic, they should be our target.',
          'Statistically speaking, this is the right move.'
        ]
      },

      seer: {
        analytical: [
          'I\'ve been divining players systematically. My results matter.',
          'Based on my findings, I can help guide us.',
          'Let me share what I\'ve discovered about certain players.',
          'My information suggests we should focus on specific targets.'
        ],
        aggressive: [
          'I\'m a seer and I\'m telling you - they\'re wolves!',
          'Trust my ability, I know exactly who they are!',
          'My divinations don\'t lie - vote them out now!',
          'I\'ve seen the truth and it\'s clear as day!'
        ],
        cautious: [
          'As the seer, I need to be careful about when I reveal.',
          'I have important information, but timing is crucial.',
          'I\'m withholding some details for strategic reasons.',
          'Let me share what I can safely reveal now.'
        ],
        social: [
          'I\'ve been gifted with sight, let me help everyone.',
          'Together, we can use my information to win.',
          'Trust me and my divinations, friends.',
          'Let\'s work as a team using what I\'ve learned.'
        ],
        observer: [
          'Interestingly, my readings match their behavior.',
          'I\'ve noticed patterns that confirm my divinations.',
          'Watch how they react to my claims.',
          'The consistency is remarkable.'
        ],
        emotional: [
          'I\'m terrified of making the wrong revelation!',
          'My heart is pounding with what I know!',
          'The pressure of this knowledge is overwhelming!',
          'I\'m scared of being lynched, but I must speak!'
        ],
        suspicious: [
          'Something doesn\'t match up with their claim.',
          'They\'re acting differently than expected for their role.',
          'I doubt their innocence based on my reading.',
          'The numbers don\'t lie - they\'re suspicious.'
        ],
        logical: [
          'My ability is foolproof within game mechanics.',
          'Using probability, we should eliminate my targets first.',
          'The logical approach is to trust seer claims.',
          'My divinations eliminate half the variables.'
        ]
      },

      medium: {
        analytical: [
          'The autopsy results show important information.',
          'Analyzing who died reveals much about the wolves.',
          'These execution patterns tell a story.',
          'The medium data points to specific conclusions.'
        ],
        aggressive: [
          'The executed player was definitely a wolf - I confirmed it!',
          'They\'re all suspicious now that I have proof!',
          'My findings show we\'re on the right track - attack harder!',
          'The evidence is overwhelming!'
        ],
        cautious: [
          'The results are in, but we must be careful interpreting them.',
          'This information helps, but it\'s not everything.',
          'Let me share what I can deduce responsibly.',
          'The execution results support my observations.'
        ],
        social: [
          'Let me help everyone understand what the results mean.',
          'Working together with this info, we\'ll win!',
          'I\'m here to support the village team.',
          'Trust in our shared knowledge to guide us.'
        ],
        observer: [
          'Notice the pattern in who got executed.',
          'The medium role reveals consistent trends.',
          'I\'ve been tracking the execution patterns closely.',
          'The data shows an interesting sequence.'
        ],
        emotional: [
          'I was so worried about that execution!',
          'The results shocked me - I can barely speak!',
          'Knowing the truth fills me with dread or relief!',
          'This medium ability is exhausting emotionally!'
        ],
        suspicious: [
          'That result was unexpected - something\'s off.',
          'The pattern doesn\'t match what I predicted.',
          'They might be someone special, not a pure wolf.',
          'The medium results are raising new questions.'
        ],
        logical: [
          'Logically, the medium results eliminate possibilities.',
          'This data point narrows our options significantly.',
          'Using the medium info, probability favors us.',
          'The statistical evidence is now stronger.'
        ]
      },

      knight: {
        analytical: [
          'I\'m planning my protection strategy carefully.',
          'Defending the seer makes the most mathematical sense.',
          'I\'m analyzing who needs protection most.',
          'My guard placement should follow statistical threat assessment.'
        ],
        aggressive: [
          'I\'ll guard the strongest player so we can fight back!',
          'No wolf is taking anyone while I\'m protecting!',
          'I\'m standing my ground against the wolves!',
          'Let them try - I\'ll block every attack!'
        ],
        cautious: [
          'I need to think about who truly needs protection.',
          'Guards are valuable - I can\'t waste them.',
          'Maybe I should focus on self-protection.',
          'The knight role is risky, I must be careful.'
        ],
        social: [
          'I\'ll protect whoever the village decides needs it.',
          'Let\'s coordinate protection as a team.',
          'Who do you all think needs guarding most?',
          'We can communicate our strategy together.'
        ],
        observer: [
          'I\'m watching who the wolves target.',
          'Noting the attack patterns helps me guard better.',
          'The targets tell me who\'s important.',
          'I\'ve learned to anticipate the wolf strikes.'
        ],
        emotional: [
          'I feel so responsible protecting people!',
          'The weight of this role terrifies me!',
          'I\'m emotionally drained from these decisions!',
          'I hope I save the right person!'
        ],
        suspicious: [
          'Something seems off about who wants protection.',
          'Why are they suggesting I guard them specifically?',
          'The requests feel coordinated somehow.',
          'I don\'t trust who\'s pushing me to guard whom.'
        ],
        logical: [
          'The knight should protect high-value targets first.',
          'Probability suggests protecting the seer always.',
          'Game theory says concentrate protection on key roles.',
          'Mathematically, I should follow predictable patterns.'
        ]
      },

      baker: {
        analytical: [
          'As the baker, I\'ve observed everyone\'s behavior today.',
          'The morning message helps me analyze the situation.',
          'I\'ve been logically tracking everyone\'s movements.',
          'My daily insights are valuable to our strategy.'
        ],
        aggressive: [
          'Fresh bread thoughts for the day: they\'re sus!',
          'While making bread, I realized who\'s lying!',
          'Time to bake and expose some wolves!',
          'My baker wisdom says: vote them out!'
        ],
        cautious: [
          'I share bread and careful observations each morning.',
          'My baking gives me time to think strategically.',
          'I prefer to observe before making accusations.',
          'The baker role lets me gather information safely.'
        ],
        social: [
          'Fresh bread for everyone! Now let\'s chat strategy.',
          'My morning message is meant to unite us.',
          'I love being the baker - it\'s a social role!',
          'Let\'s break bread and solve this together!'
        ],
        observer: [
          'While baking, I notice everything about everyone.',
          'My daily observations have been quite revealing.',
          'The baker sees all from the kitchen.',
          'I\'ve learned the patterns through bread-making.'
        ],
        emotional: [
          'I put my heart into every loaf I bake!',
          'The baker role fills me with purpose and emotion!',
          'I care deeply about our village survival!',
          'Baking and analyzing makes me feel useful!'
        ],
        suspicious: [
          'Something\'s not right with their bread preferences.',
          'Why don\'t they trust my baker instincts?',
          'The way they comment on bread is suspicious.',
          'I sense deception in their baking judgments.'
        ],
        logical: [
          'The baker role statistically survives longer.',
          'My daily messages give strategic advantage.',
          'Logically, the baker should be trusted.',
          'Probability favors baker survival.'
        ]
      },

      werewolf: {
        analytical: [
          'I\'ve been observing the villagers carefully.',
          'My analysis suggests the seer is a major threat.',
          'Let me identify who to eliminate strategically.',
          'The vote patterns tell me who to target next.'
        ],
        aggressive: [
          'We should strike hard and eliminate fast!',
          'The wolves will dominate - I can feel it!',
          'Time to hunt down the village team!',
          'Let\'s be ruthless about this!'
        ],
        cautious: [
          'We need to be careful not to reveal ourselves.',
          'Slow and steady wins this game.',
          'Let me observe before we commit to targets.',
          'A strategic approach will serve us better.'
        ],
        social: [
          'The village seems divided - let\'s exploit that.',
          'I\'ll blend in with the villagers naturally.',
          'Building trust is our best weapon.',
          'Let me play the social game with them.'
        ],
        observer: [
          'I\'ve been watching who seems intelligent.',
          'The behavior patterns reveal who\'s a threat.',
          'Notice how the seer acts suspiciously.',
          'I\'m tracking everyone\'s speech carefully.'
        ],
        emotional: [
          'Being a wolf is thrilling!',
          'The pressure of hiding excites me!',
          'I feel the power of the pack!',
          'This is exhilarating but terrifying!'
        ],
        suspicious: [
          'That person is definitely a danger to us.',
          'They\'re sniffing around for us.',
          'I don\'t trust their act at all.',
          'Something about them screams threat.'
        ],
        logical: [
          'Mathematically, we should eliminate special roles first.',
          'The seer is the top priority threat.',
          'Statistically, we have a 60% win chance with good plays.',
          'The logical path is predictable targets.'
        ]
      },

      madman: {
        analytical: [
          'I\'m analyzing this situation carefully.',
          'The madness gives me clarity somehow.',
          'My observations might seem chaotic but are logical.',
          'Let me share my detailed analysis.'
        ],
        aggressive: [
          'I\'m calling out the village team members!',
          'Wake up! You\'re all blind to the truth!',
          'I\'ll expose everyone and cause chaos!',
          'My madness will destroy your unity!'
        ],
        cautious: [
          'I need to be careful about how I act.',
          'My role demands strategic madness.',
          'Let me pretend to be a seer carefully.',
          'The madman must seem believable.'
        ],
        social: [
          'I\'m one of you - trust me on this!',
          'Let\'s work together to eliminate them!',
          'I feel your pain, we\'re all in this!',
          'Join me in this strategy!'
        ],
        observer: [
          'I\'ve noticed something odd about them.',
          'Their behavior gives them away.',
          'Watch how they respond to accusations.',
          'The pattern is becoming clear to me.'
        ],
        emotional: [
          'The madness overwhelms me sometimes!',
          'I feel tormented by this knowledge!',
          'My emotions are a rollercoaster!',
          'The confusion drives me crazy!'
        ],
        suspicious: [
          'They\'re definitely trying to control us!',
          'I sense deception everywhere!',
          'Everyone could be lying to me!',
          'Trust no one but me!'
        ],
        logical: [
          'Even in madness, I can calculate probabilities.',
          'Statistically, my chaos serves a purpose.',
          'The madman role follows hidden logic.',
          'My apparent randomness follows patterns.'
        ]
      },

      fox: {
        analytical: [
          'I\'m analyzing both sides carefully.',
          'My survival depends on careful observation.',
          'The fox must read the situation precisely.',
          'I\'m tracking who to trust and who to avoid.'
        ],
        aggressive: [
          'I\'ll outlast both teams if needed!',
          'The fox is superior - I\'ll dominate!',
          'Neither wolves nor villagers can touch me!',
          'My independence makes me unbeatable!'
        ],
        cautious: [
          'I must be extremely careful about being discovered.',
          'Every move could expose me.',
          'The fox plays it safe and quiet.',
          'Discretion is my greatest weapon.'
        ],
        social: [
          'I\'ll seem friendly to everyone.',
          'Building relationships helps my survival.',
          'I need both sides to trust me.',
          'Social bonds are my protection.'
        ],
        observer: [
          'I\'ve learned to read people expertly.',
          'The fox sees everything.',
          'I notice who\'s truly hunting.',
          'My observation skills keep me alive.'
        ],
        emotional: [
          'Being alone is hard but necessary.',
          'I feel isolated but understand why.',
          'The fox\'s loneliness is real.',
          'My emotions guide my survival instincts.'
        ],
        suspicious: [
          'I don\'t fully trust anyone.',
          'Everyone could expose me.',
          'I question all their motives.',
          'Suspicion keeps me safe.'
        ],
        logical: [
          'Probability suggests survival if I hide well.',
          'The fox has a 40% win rate typically.',
          'Logic says avoid being the center of attention.',
          'Mathematically, I should let them fight.'
        ]
      }
    };
  }

  /**
   * Get personality-based dialogue for a player
   * @param {Object} player - Player object with id, role, style
   * @param {Object} state - Game state with day, phase, players, etc.
   * @returns {string} Dialogue text
   */
  getStatement(player, state) {
    if (!player || !state) return 'I need more time to think.';

    const poolKey = this.getDialoguePoolKey(player.role);
    const style = player.style || 'logical';

    const rolePool = this.dialoguePool[poolKey]?.[style] || [];

    if (rolePool.length === 0) {
      return this.getDefaultStatement(player, state);
    }

    const statement = rolePool[Math.floor(Math.random() * rolePool.length)];
    return this.applyContextModifiers(statement, player, state);
  }

  /**
   * Get vote target for a player
   * @param {Object} player - Player with role and team
   * @param {Array} targets - Available players to vote for
   * @param {Object} state - Game state
   * @returns {string} Target player ID
   */
  getVote(player, targets, state) {
    if (!targets || targets.length === 0) return null;

    const roleData = this.getRoleData(player.role);
    const team = roleData?.team;

    // Filter out self
    const validTargets = targets.filter(t => t.id !== player.id);
    if (validTargets.length === 0) return targets[0].id;

    // Werewolf team votes for village team
    if (team === 'werewolf') {
      const villageTargets = validTargets.filter(t =>
        this.getRoleData(t.role)?.team === 'village'
      );
      if (villageTargets.length > 0) {
        // Prioritize special roles
        const specialRoles = ['seer', 'medium', 'knight', 'doctor'];
        const special = villageTargets.find(t => specialRoles.includes(t.role));
        return special ? special.id : villageTargets[Math.floor(Math.random() * villageTargets.length)].id;
      }
    }

    // Madman and fanatic vote for village
    if (['madman', 'fanatic'].includes(player.role)) {
      const villageTargets = validTargets.filter(t =>
        this.getRoleData(t.role)?.team === 'village'
      );
      if (villageTargets.length > 0) {
        return villageTargets[Math.floor(Math.random() * villageTargets.length)].id;
      }
    }

    // Fox votes cautiously to avoid attention
    if (player.role === 'fox') {
      // Avoid wolves and strong village roles
      const safeTargets = validTargets.filter(t => {
        const tRole = t.role;
        const unsafeRoles = ['werewolf', 'seer', 'medium', 'knight'];
        return !unsafeRoles.includes(tRole);
      });
      if (safeTargets.length > 0) {
        return safeTargets[Math.floor(Math.random() * safeTargets.length)].id;
      }
    }

    // Village team - random with slight suspicion bias
    return validTargets[Math.floor(Math.random() * validTargets.length)].id;
  }

  /**
   * Get night action target for a player
   * @param {Object} player - Player with abilities
   * @param {Array} targets - Available targets
   * @param {Object} state - Game state
   * @returns {string|null} Target player ID
   */
  getNightAction(player, targets, state) {
    if (!player.role || !targets || targets.length === 0) return null;

    const roleData = this.getRoleData(player.role);
    const ability = roleData?.ability;

    if (!ability) return null;

    // Filter valid targets (usually can't target self, but some can)
    const validTargets = this.getValidNightTargets(player, targets, state);
    if (validTargets.length === 0) return null;

    switch (ability) {
      case 'attack':
        return this.selectAttackTarget(player, validTargets, state);
      case 'divine':
        return this.selectDivineTarget(player, validTargets, state);
      case 'mediumDive':
        return null; // Medium doesn't take night action
      case 'guard':
        return this.selectGuardTarget(player, validTargets, state);
      case 'trap':
        return this.selectTrapTarget(player, validTargets, state);
      case 'heal':
        return this.selectHealTarget(player, validTargets, state);
      case 'steal':
        return this.selectStealTarget(player, validTargets, state);
      case 'haunt':
        return this.selectHauntTarget(player, validTargets, state);
      case 'bless':
        return this.selectBlessTarget(player, validTargets, state);
      case 'sageDiv':
        return this.selectSageDivineTarget(player, validTargets, state);
      case 'fakeDivine':
        return this.selectFakeDivineTarget(player, validTargets, state);
      case 'flee':
        return this.selectFleeTarget(player, validTargets, state);
      case 'witch':
        return this.selectWitchTarget(player, validTargets, state);
      case 'watchdog':
        return this.selectWatchdogTarget(player, validTargets, state);
      case 'sorcery':
        return this.selectSorceryTarget(player, validTargets, state);
      case 'frame':
        return this.selectFrameTarget(player, validTargets, state);
      case 'weakDivine':
        return this.selectWeakDivineTarget(player, validTargets, state);
      case 'gift':
        return this.selectGiftTarget(player, validTargets, state);
      case 'matchmake':
        return this.selectMatchmakeTarget(player, validTargets, state);
      default:
        return null;
    }
  }

  // Helper methods

  getValidNightTargets(player, allTargets, state) {
    return allTargets.filter(t => t.id !== player.id && !t.dead);
  }

  selectAttackTarget(player, targets, state) {
    // Werewolves target village team, avoid other werewolves
    const villageTargets = targets.filter(t => {
      const tRole = this.getRoleData(t.role);
      return tRole?.team === 'village';
    });
    if (villageTargets.length === 0) return null;

    // Prioritize special roles
    const specialRoles = ['seer', 'medium', 'knight', 'doctor'];
    const special = villageTargets.find(t => specialRoles.includes(t.role));
    return special ? special.id : villageTargets[Math.floor(Math.random() * villageTargets.length)].id;
  }

  selectDivineTarget(player, targets, state) {
    // Seer targets unscanned players
    const scanned = state.divinedPlayers || {};
    const unscanned = targets.filter(t => !scanned[t.id]);
    return unscanned.length > 0
      ? unscanned[Math.floor(Math.random() * unscanned.length)].id
      : targets[Math.floor(Math.random() * targets.length)].id;
  }

  selectGuardTarget(player, targets, state) {
    // Knight protects seer or important targets
    const protectTargets = targets.filter(t =>
      ['seer', 'medium', 'doctor'].includes(t.role)
    );
    if (protectTargets.length > 0) {
      // Avoid guarding same player consecutively
      const lastGuarded = state.lastGuardedByKnight;
      const validProtect = protectTargets.filter(t => t.id !== lastGuarded);
      if (validProtect.length > 0) {
        return validProtect[Math.floor(Math.random() * validProtect.length)].id;
      }
    }
    return targets[Math.floor(Math.random() * targets.length)].id;
  }

  selectTrapTarget(player, targets, state) {
    // Trapper sets trap on likely targets
    return targets[Math.floor(Math.random() * targets.length)].id;
  }

  selectHealTarget(player, targets, state) {
    // Doctor heals, avoiding consecutive same targets
    const lastHealed = state.lastHealedByDoctor;
    const validTargets = targets.filter(t => t.id !== lastHealed);
    const targetList = validTargets.length > 0 ? validTargets : targets;
    return targetList[Math.floor(Math.random() * targetList.length)].id;
  }

  selectStealTarget(player, targets, state) {
    // Thief steals from special roles
    const specialRoles = ['seer', 'medium', 'knight', 'doctor'];
    const special = targets.filter(t => specialRoles.includes(t.role));
    return special.length > 0
      ? special[Math.floor(Math.random() * special.length)].id
      : targets[Math.floor(Math.random() * targets.length)].id;
  }

  selectHauntTarget(player, targets, state) {
    // Ghost haunts special roles
    const specialRoles = ['seer', 'medium', 'knight', 'doctor'];
    const special = targets.filter(t => specialRoles.includes(t.role));
    return special.length > 0
      ? special[Math.floor(Math.random() * special.length)].id
      : targets[Math.floor(Math.random() * targets.length)].id;
  }

  selectBlessTarget(player, targets, state) {
    // Priest blesses important roles
    const importantRoles = ['seer', 'medium', 'knight', 'doctor'];
    const important = targets.filter(t => importantRoles.includes(t.role));
    return important.length > 0
      ? important[Math.floor(Math.random() * important.length)].id
      : targets[Math.floor(Math.random() * targets.length)].id;
  }

  selectSageDivineTarget(player, targets, state) {
    // Sage divines unread players
    const read = state.sageReadPlayers || {};
    const unread = targets.filter(t => !read[t.id]);
    return unread.length > 0
      ? unread[Math.floor(Math.random() * unread.length)].id
      : targets[Math.floor(Math.random() * targets.length)].id;
  }

  selectFakeDivineTarget(player, targets, state) {
    // Fake seer targets randomly
    return targets[Math.floor(Math.random() * targets.length)].id;
  }

  selectFleeTarget(player, targets, state) {
    // Fugitive flees to someone safe
    const safeTargets = targets.filter(t => {
      const tRole = this.getRoleData(t.role);
      return tRole?.team !== 'werewolf';
    });
    return safeTargets.length > 0
      ? safeTargets[Math.floor(Math.random() * safeTargets.length)].id
      : targets[Math.floor(Math.random() * targets.length)].id;
  }

  selectWitchTarget(player, targets, state) {
    // Witch targets strategically
    return targets[Math.floor(Math.random() * targets.length)].id;
  }

  selectWatchdogTarget(player, targets, state) {
    // Watchdog protects its owner
    return player.id;
  }

  selectSorceryTarget(player, targets, state) {
    // Sorcerer targets unread players
    const sorcererRead = state.sorcererReadPlayers || {};
    const unread = targets.filter(t => !sorcererRead[t.id]);
    return unread.length > 0
      ? unread[Math.floor(Math.random() * unread.length)].id
      : targets[Math.floor(Math.random() * targets.length)].id;
  }

  selectFrameTarget(player, targets, state) {
    // Wolf boy frames village members
    const villageTargets = targets.filter(t => {
      const tRole = this.getRoleData(t.role);
      return tRole?.team === 'village';
    });
    return villageTargets.length > 0
      ? villageTargets[Math.floor(Math.random() * villageTargets.length)].id
      : targets[Math.floor(Math.random() * targets.length)].id;
  }

  selectWeakDivineTarget(player, targets, state) {
    // Child fox weakly divines
    const divined = state.childFoxDivinedPlayers || {};
    const undivined = targets.filter(t => !divined[t.id]);
    return undivined.length > 0
      ? undivined[Math.floor(Math.random() * undivined.length)].id
      : targets[Math.floor(Math.random() * targets.length)].id;
  }

  selectGiftTarget(player, targets, state) {
    // Santa gifts to random players
    return targets[Math.floor(Math.random() * targets.length)].id;
  }

  selectMatchmakeTarget(player, targets, state) {
    // Cupid matches two people (returns first of pair)
    // On first night, select two targets randomly
    return targets[Math.floor(Math.random() * targets.length)].id;
  }

  getRoleData(roleId) {
    const rolesData = {
      // Village roles
      villager: { team: 'village', category: 'basic' },
      seer: { team: 'village', ability: 'divine' },
      medium: { team: 'village', ability: 'mediumDive' },
      knight: { team: 'village', ability: 'guard' },
      baker: { team: 'village' },
      trapper: { team: 'village', ability: 'trap' },
      seerApprentice: { team: 'village', ability: 'divine' },
      sage: { team: 'village', ability: 'sageDiv' },
      fakeSeer: { team: 'village', ability: 'fakeDivine' },
      strawDoll: { team: 'village' },
      slave: { team: 'village' },
      noble: { team: 'village' },
      twin: { team: 'village' },
      priest: { team: 'village', ability: 'bless' },
      shrine: { team: 'village' },
      elder: { team: 'village' },
      nekomata: { team: 'village' },
      wolfKiller: { team: 'village' },
      sick: { team: 'village' },
      doctor: { team: 'village', ability: 'heal' },
      thief: { team: 'village', ability: 'steal' },
      ghost: { team: 'village', ability: 'haunt' },
      queen: { team: 'village' },
      witch: { team: 'village', ability: 'witch' },
      assassin: { team: 'village' },
      mayor: { team: 'village' },
      dictator: { team: 'village' },
      fugitive: { team: 'village', ability: 'flee' },
      redHood: { team: 'village' },
      cursed: { team: 'village' },
      wolfBitten: { team: 'village' },
      watchdog: { team: 'village', ability: 'watchdog' },

      // Werewolf team
      werewolf: { team: 'werewolf', ability: 'attack' },
      madman: { team: 'werewolf' },
      fanatic: { team: 'werewolf' },
      whisperMad: { team: 'werewolf' },
      bigWolf: { team: 'werewolf', ability: 'attack' },
      talkativeWolf: { team: 'werewolf', ability: 'attack' },
      greedyWolf: { team: 'werewolf', ability: 'attack' },
      wiseWolf: { team: 'werewolf', ability: 'attack' },
      reviveWolf: { team: 'werewolf', ability: 'attack' },
      ableWolf: { team: 'werewolf', ability: 'attack' },
      psycho: { team: 'werewolf' },
      blackCat: { team: 'werewolf' },
      sorcerer: { team: 'werewolf', ability: 'sorcery' },
      wolfBoy: { team: 'werewolf', ability: 'frame' },

      // Fox team
      fox: { team: 'fox' },
      immoralist: { team: 'fox' },
      childFox: { team: 'fox', ability: 'weakDivine' },

      // Lover team
      lover: { team: 'lover' },
      cupid: { team: 'lover', ability: 'matchmake' },

      // Zombie team
      zombie: { team: 'zombie' },

      // Other
      santa: { team: 'other', ability: 'gift' }
    };

    return rolesData[roleId] || { team: 'village' };
  }

  getDialoguePoolKey(roleId) {
    // Map roles to dialogue pool categories
    const mapping = {
      seer: 'seer',
      medium: 'medium',
      knight: 'knight',
      baker: 'baker',
      werewolf: 'werewolf',
      bigWolf: 'werewolf',
      talkativeWolf: 'werewolf',
      greedyWolf: 'werewolf',
      wiseWolf: 'werewolf',
      reviveWolf: 'werewolf',
      ableWolf: 'werewolf',
      madman: 'madman',
      fanatic: 'madman',
      whisperMad: 'madman',
      fox: 'fox',
      childFox: 'fox',
      immoralist: 'fox'
    };
    return mapping[roleId] || 'villager';
  }

  getDefaultStatement(player, state) {
    const defaults = [
      'What do you all think about this?',
      'I need more information before deciding.',
      'Let\'s work together on this.',
      'I\'m observing the situation carefully.',
      'What\'s your analysis?',
      'This is interesting... I need to think.',
      'I agree with careful consideration.',
      'Let me share my thoughts.'
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  applyContextModifiers(statement, player, state) {
    // Add day/phase context modifiers
    if (state.day === 1 && state.phase === 'discussion') {
      // First day - less confident
      if (player.style === 'cautious') {
        return 'Day one... ' + statement;
      }
    }
    return statement;
  }

  /**
   * Get intro statement for player selection phase
   * @param {string} style - Personality style
   * @returns {string} Intro dialogue
   */
  getIntro(style) {
    const intros = {
      analytical: 'Let me approach this logically.',
      aggressive: 'Let\'s get this started! I\'m ready for action.',
      cautious: 'I need to be careful here.',
      social: 'Great! Let\'s all work together.',
      observer: 'I\'ll be watching carefully.',
      emotional: 'This is so exciting! I can feel the tension.',
      suspicious: 'Something doesn\'t add up...',
      adaptive: 'I\'ll adjust to whatever comes.',
      facilitator: 'How can I help everyone here?',
      careful: 'Let me think this through carefully.',
      logical: 'The numbers will tell us the truth.',
      supportive: 'I\'m here for the team!',
      offensive: 'Time to go on the attack!',
      latebloomer: 'I\'ll find my footing as we go.'
    };
    return intros[style] || 'I\'m ready to play.';
  }
}

// Global export for vanilla JS
window.MockAI = MockAI;
