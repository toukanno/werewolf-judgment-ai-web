/**
 * GameUI - User Interface Management
 * Handles all rendering and interaction for the werewolf game UI
 * 人狼ジャッジメント-style interface
 */

const GameUI = {
  /**
   * Update header with day/phase information
   */
  updateHeader(state) {
    const header = document.getElementById('game-header');
    if (!header) return;

    const phaseText = state.phase === 'day' ? '昼' : '夜';
    const phaseEmoji = state.phase === 'day' ? '☀️' : '🌙';

    header.innerHTML = `
      <div class="header-content">
        <h2>${phaseEmoji} ${state.day}日目 ${phaseText}フェーズ</h2>
        <p class="phase-info">プレイヤー数: ${state.getAlive().length}/${state.players.length}</p>
      </div>
    `;
  },

  /**
   * Render player list with avatars and status
   */
  renderPlayers(state) {
    const container = document.getElementById('player-list');
    if (!container) return;

    const players = state.players;
    const alivePlayers = state.getAlive();

    let html = '<div class="player-chips">';

    for (const player of players) {
      const isAlive = alivePlayers.some(p => p.id === player.id);
      const isMe = player.isHuman === true;
      const role = ROLES[state.getEffectiveRole(player.id)];
      const roleIcon = role ? role.icon : '❓';

      const statusClass = isAlive ? 'alive' : 'dead';
      const meClass = isMe ? 'me' : '';
      const backgroundColor = isAlive
        ? (TEAM_INFO[role?.team || 'other']?.color || '#999')
        : '#666';

      html += `
        <div class="player-chip ${statusClass} ${meClass}"
             style="background-color: ${backgroundColor}; opacity: ${isAlive ? 1 : 0.5}">
          <div class="avatar" style="background-color: ${backgroundColor}">
            <span class="initial">${player.name.charAt(0)}</span>
          </div>
          <div class="player-name">${player.name}</div>
          ${!isAlive ? '<div class="status-badge">×</div>' : ''}
          ${isMe ? '<div class="me-badge">YOU</div>' : ''}
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;
  },

  /**
   * Add message to chat area
   */
  addMessage(content, sender = '', type = 'system', player = null) {
    const messagesArea = document.getElementById('messages-area');
    if (!messagesArea) return;

    const messageEl = document.createElement('div');
    const safeContent = this.escapeHtml(content);

    if (type === 'system' || type === 'danger') {
      messageEl.className = `chat-system ${type === 'danger' ? 'chat-danger' : ''}`;
      messageEl.innerHTML = safeContent;
    } else if (type === 'ai' && player) {
      messageEl.className = 'chat-row chat-left';
      const color = player.avatarColor || '#ccc';
      const bg = player.avatarBg || '#333';
      const initial = player.initial || player.name.charAt(0);
      messageEl.innerHTML = `
        <div class="chat-avatar" style="background:linear-gradient(135deg,${bg},${color}30);border-color:${color};color:${color};">${initial}</div>
        <div class="chat-bubble-wrap">
          <div class="chat-name" style="color:${color}">${this.escapeHtml(player.name)}</div>
          <div class="chat-bubble chat-bubble-left">${safeContent}</div>
        </div>`;
    } else if (type === 'you' && player) {
      messageEl.className = 'chat-row chat-right';
      messageEl.innerHTML = `
        <div class="chat-bubble-wrap">
          <div class="chat-name chat-name-right">${this.escapeHtml(player.name)}</div>
          <div class="chat-bubble chat-bubble-right">${safeContent}</div>
        </div>
        <div class="chat-avatar chat-avatar-you">${player.initial || player.name.charAt(0)}</div>`;
    } else {
      messageEl.className = 'chat-system';
      messageEl.innerHTML = safeContent;
    }

    messagesArea.appendChild(messageEl);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  },

  /**
   * Clear all messages
   */
  clearMessages() {
    const messagesArea = document.getElementById('messages-area');
    if (messagesArea) {
      messagesArea.innerHTML = '';
    }
  },

  /**
   * Set action area content
   */
  setAction(html) {
    const actionArea = document.getElementById('action-area');
    if (actionArea) {
      actionArea.innerHTML = html;
    }
  },

  /**
   * Show persistent discussion input with "proceed" button.
   * onMessage is called each time the player sends a message (does NOT close input).
   * onProceed is called when the player clicks the proceed button.
   */
  showDiscussionInput(onMessage, onProceed, proceedLabel = '⚔ 投票に進む ▶') {
    // Build player chips for quick mention
    let playerChipsHtml = '';
    if (typeof gameState !== 'undefined' && gameState.getAlive) {
      const alivePlayers = gameState.getAlive();
      playerChipsHtml = '<div id="player-mention-bar" style="display:flex;gap:6px;overflow-x:auto;padding:4px 2px;-webkit-overflow-scrolling:touch;">';
      for (const p of alivePlayers) {
        if (p.isHuman) continue;
        const color = p.avatarColor || '#ccc';
        const bg = p.avatarBg || '#333';
        playerChipsHtml += `<button class="mention-chip" data-name="${this.escapeHtml(p.name)}" style="flex-shrink:0;display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:16px;border:1px solid ${color}40;background:${color}15;color:${color};font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;">
          <span style="width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,${bg},${color}30);display:flex;align-items:center;justify-content:center;font-size:10px;color:${color};border:1px solid ${color}50;">${p.name.charAt(0)}</span>
          ${this.escapeHtml(p.name)}
        </button>`;
      }
      playerChipsHtml += '</div>';
    }

    const html = `
      <div id="discussion-ui" style="display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0 2px;">
          <span style="font-size:11px;color:var(--text2);">議論時間</span>
          <span id="discussion-timer" style="font-size:13px;font-weight:700;color:var(--success);font-variant-numeric:tabular-nums;">120秒</span>
        </div>
        <div class="chat-input-container">
          <button id="co-btn" class="btn co-btn">CO</button>
          <input type="text" id="chat-input" class="chat-input" placeholder="発言を入力...">
          <button id="chat-send-btn" class="btn btn-primary">発言</button>
        </div>
        <div id="co-popup" class="co-popup" style="display:none;">
          <div class="co-popup-title">役職カミングアウト</div>
          <div class="co-popup-grid">
            <button class="co-role-btn" data-co="占い師">🔮 占い師</button>
            <button class="co-role-btn" data-co="霊能者">👁 霊能者</button>
            <button class="co-role-btn" data-co="狩人">🛡 狩人</button>
            <button class="co-role-btn" data-co="市民">👤 市民</button>
            <button class="co-role-btn" data-co="騎士">🛡 騎士</button>
            <button class="co-role-btn" data-co="パン屋">🍞 パン屋</button>
            <button class="co-role-btn" data-co="狂人">🃏 狂人</button>
            <button class="co-role-btn" data-co="人狼">🐺 人狼</button>
          </div>
          <button id="co-cancel" class="btn btn-sm co-cancel">キャンセル</button>
        </div>
        <button id="proceed-btn" class="btn btn-ghost" style="width:100%;padding:10px;font-size:14px;font-weight:700;border-color:var(--gold);color:var(--gold);">
          ${this.escapeHtml(proceedLabel)}
        </button>
        ${playerChipsHtml}
      </div>
    `;

    this.setAction(html);

    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const coBtn = document.getElementById('co-btn');
    const coPopup = document.getElementById('co-popup');
    const coCancel = document.getElementById('co-cancel');
    const proceedBtn = document.getElementById('proceed-btn');
    const timerEl = document.getElementById('discussion-timer');

    if (!input || !sendBtn) return;

    // 120-second countdown — visual only, does NOT auto-advance
    let timeLeft = 120;
    const timerInterval = setInterval(() => {
      timeLeft--;
      if (timerEl) {
        if (timeLeft > 60) {
          timerEl.style.color = 'var(--success)';
          timerEl.textContent = `${timeLeft}秒`;
        } else if (timeLeft > 30) {
          timerEl.style.color = 'var(--gold)';
          timerEl.textContent = `${timeLeft}秒`;
        } else if (timeLeft > 0) {
          timerEl.style.color = 'var(--danger)';
          timerEl.textContent = `${timeLeft}秒`;
        } else {
          clearInterval(timerInterval);
          timerEl.style.color = 'var(--danger)';
          timerEl.textContent = '時間切れ（投票に進んでください）';
        }
      }
    }, 1000);

    const proceed = () => {
      clearInterval(timerInterval);
      onProceed();
    };

    const send = () => {
      const text = input.value.trim();
      if (text && !sendBtn.disabled) {
        input.value = '';
        onMessage(text);
      }
    };

    sendBtn.addEventListener('click', send);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') send();
    });

    if (coBtn && coPopup) {
      coBtn.addEventListener('click', () => {
        coPopup.style.display = coPopup.style.display === 'none' ? 'block' : 'none';
      });
    }
    if (coCancel) {
      coCancel.addEventListener('click', () => { coPopup.style.display = 'none'; });
    }
    document.querySelectorAll('.co-role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const roleName = btn.dataset.co;
        onMessage(`【${roleName}CO】${roleName}です！`);
        coPopup.style.display = 'none';
      });
    });

    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        if (!proceedBtn.disabled) proceed();
      });
    }

    // Mention chips: tap to insert @name into input
    document.querySelectorAll('.mention-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (input) {
          const name = chip.dataset.name;
          const curVal = input.value;
          input.value = curVal + (curVal && !curVal.endsWith(' ') ? ' ' : '') + '@' + name + ' ';
          input.focus();
        }
      });
    });

    input.focus();
  },

  /**
   * Lock/unlock the discussion send button and proceed button during AI reactions
   */
  setDiscussionSendLocked(locked) {
    const sendBtn = document.getElementById('chat-send-btn');
    const input = document.getElementById('chat-input');
    const proceedBtn = document.getElementById('proceed-btn');
    if (sendBtn) {
      sendBtn.disabled = locked;
      sendBtn.textContent = locked ? '…' : '発言';
    }
    if (input) input.disabled = locked;
    if (proceedBtn) proceedBtn.disabled = locked;
  },

  /**
   * Show text input for day discussion (legacy single-send, kept for compatibility)
   */
  showChatInput(onSend) {
    this.showDiscussionInput(onSend, () => {}, '発言完了');
  },

  /**
   * Show voting buttons with player portraits
   */
  showVoteButtons(targets, onVote) {
    let html = '<div class="vote-grid">';

    for (const target of targets) {
      const role = ROLES[target.role || 'villager'];
      const teamColor = TEAM_INFO[role?.team || 'other']?.color || '#999';
      const initial = target.name.charAt(0);

      html += `
        <button class="vote-btn" data-player-id="${target.id}">
          <div class="vote-avatar" style="background-color: ${teamColor}">
            ${initial}
          </div>
          <div class="vote-name">${this.escapeHtml(target.name)}</div>
        </button>
      `;
    }

    html += '</div>';
    this.setAction(html);

    // Attach event listeners to vote buttons
    const voteButtons = document.querySelectorAll('.vote-btn');
    for (const btn of voteButtons) {
      btn.addEventListener('click', () => {
        const playerId = btn.getAttribute('data-player-id');
        onVote(playerId);
      });
    }
  },

  /**
   * Show buttons for night action target selection
   */
  showNightActionButtons(targets, actionName, onSelect) {
    let html = `<div class="night-action-container">
      <h3>${this.escapeHtml(actionName)}の対象を選択</h3>
      <div class="target-grid">`;

    for (const target of targets) {
      const role = ROLES[target.role || 'villager'];
      const teamColor = TEAM_INFO[role?.team || 'other']?.color || '#999';

      html += `
        <button class="target-btn" data-player-id="${target.id}">
          <div class="target-avatar" style="background-color: ${teamColor}">
            ${target.name.charAt(0)}
          </div>
          <div class="target-name">${this.escapeHtml(target.name)}</div>
        </button>
      `;
    }

    html += '</div></div>';
    this.setAction(html);

    // Attach event listeners to target buttons
    const targetButtons = document.querySelectorAll('.target-btn');
    for (const btn of targetButtons) {
      btn.addEventListener('click', () => {
        const playerId = btn.getAttribute('data-player-id');
        onSelect(playerId);
      });
    }
  },

  /**
   * Show day-time action buttons (assassin, dictator, straw doll, etc)
   */
  showDayActionButtons(player, state, callbacks) {
    const role = ROLES[state.getEffectiveRole(player.id)];
    if (!role || !role.dayAction) return;

    let html = `<div class="day-action-container">
      <h3>${this.escapeHtml(role.name)}の昼間能力を使用</h3>
      <div class="day-action-buttons">`;

    const targets = state.getAlive().filter(p => p.id !== player.id);

    if (role.id === 'assassin') {
      html += '<p class="action-description">処刑の投票を1票追加できます</p>';
      for (const target of targets) {
        const targetRole = ROLES[state.getEffectiveRole(target.id)];
        const color = TEAM_INFO[targetRole?.team || 'other']?.color || '#999';
        html += `
          <button class="day-action-btn" data-action="assassin" data-target-id="${target.id}">
            <span style="background-color: ${color}; padding: 5px 10px; border-radius: 4px; color: white;">
              ${this.escapeHtml(target.name)}に投票
            </span>
          </button>
        `;
      }
    } else if (role.id === 'dictator') {
      html += '<p class="action-description">1人を処刑できます</p>';
      for (const target of targets) {
        const targetRole = ROLES[state.getEffectiveRole(target.id)];
        const color = TEAM_INFO[targetRole?.team || 'other']?.color || '#999';
        html += `
          <button class="day-action-btn" data-action="dictator" data-target-id="${target.id}">
            <span style="background-color: ${color}; padding: 5px 10px; border-radius: 4px; color: white;">
              ${this.escapeHtml(target.name)}を処刑
            </span>
          </button>
        `;
      }
    } else if (role.id === 'strawDoll') {
      html += '<p class="action-description">1人の処刑を免れる権を譲ります</p>';
      for (const target of targets) {
        html += `
          <button class="day-action-btn" data-action="strawDoll" data-target-id="${target.id}">
            ${this.escapeHtml(target.name)}に譲る
          </button>
        `;
      }
    }

    html += '</div></div>';
    this.setAction(html);

    // Attach event listeners to day action buttons
    const actionButtons = document.querySelectorAll('.day-action-btn');
    for (const btn of actionButtons) {
      btn.addEventListener('click', () => {
        const actionType = btn.getAttribute('data-action');
        const targetId = btn.getAttribute('data-target-id');
        if (callbacks && callbacks[actionType]) {
          callbacks[actionType](targetId);
        }
      });
    }
  },

  /**
   * Show continue button for phase transitions
   */
  showContinueButton(label, onClick) {
    const html = `
      <div class="continue-container">
        <button id="continue-btn" class="btn btn-primary btn-large">
          ${this.escapeHtml(label)}
        </button>
      </div>
    `;

    this.setAction(html);

    const btn = document.getElementById('continue-btn');
    if (btn) {
      btn.addEventListener('click', onClick);
    }
  },

  /**
   * Show dramatic role reveal card
   */
  showRoleReveal(player) {
    const role = ROLES[player.role || 'villager'];
    const team = role?.team || 'other';
    const teamInfo = TEAM_INFO[team];

    const overlay = document.getElementById('role-overlay');
    if (!overlay) return;

    const revealCard = document.createElement('div');
    revealCard.className = 'role-reveal-card';
    revealCard.style.borderColor = teamInfo.color;

    const html = `
      <div class="reveal-header" style="background-color: ${teamInfo.color}">
        <h2>${this.escapeHtml(player.name)}</h2>
      </div>
      <div class="reveal-body">
        <div class="role-icon" style="color: ${role?.color || '#999'}">
          ${role?.icon || '❓'}
        </div>
        <div class="role-name">${this.escapeHtml(role?.name || '？？？')}</div>
        <div class="team-name" style="color: ${teamInfo.color}">
          ${this.escapeHtml(teamInfo.name)}
        </div>
        <div class="role-description">
          ${this.renderMarkdown(role?.description || '')}
        </div>
      </div>
    `;

    revealCard.innerHTML = html;
    overlay.innerHTML = '';
    overlay.appendChild(revealCard);
    overlay.classList.add('active');

    return new Promise(resolve => {
      setTimeout(() => {
        overlay.classList.remove('active');
        resolve();
      }, 4000);
    });
  },

  /**
   * Show death animation/effect
   */
  showDeathEffect(player) {
    const overlay = document.getElementById('role-overlay');
    if (!overlay) return;

    const deathEl = document.createElement('div');
    deathEl.className = 'death-effect';

    deathEl.innerHTML = `
      <div class="death-content">
        <div class="death-icon">💀</div>
        <div class="death-name">${this.escapeHtml(player.name)}</div>
        <div class="death-text">が死亡しました</div>
      </div>
    `;

    overlay.innerHTML = '';
    overlay.appendChild(deathEl);
    overlay.classList.add('active');

    return new Promise(resolve => {
      setTimeout(() => {
        overlay.classList.remove('active');
        resolve();
      }, 3000);
    });
  },

  /**
   * Show game result screen
   */
  showResult(winner, state) {
    const screen = document.getElementById('screen-result');
    if (!screen) return;

    const winnerTeamInfo = TEAM_INFO[winner];
    const winnerColor = winnerTeamInfo?.color || '#999';

    let winnersList = '';
    const winnerPlayers = state.players.filter(p => {
      if (winner === 'fox') {
        return p.role === 'fox' || state.getEffectiveRole(p.id) === 'fox';
      } else if (winner === 'lover') {
        return state.loversIds.includes(p.id);
      } else {
        const effectiveRole = state.getEffectiveRole(p.id);
      return ROLES[effectiveRole]?.team === winner;
      }
    });

    for (const player of winnerPlayers) {
      winnersList += `
        <div class="winner-badge">
          <span class="winner-name">${this.escapeHtml(player.name)}</span>
          <span class="winner-role">${ROLES[state.getEffectiveRole(player.id)]?.name || '?'}</span>
        </div>
      `;
    }

    const resultHtml = `
      <div class="result-container">
        <h1 class="result-title" style="color: ${winnerColor}">
          ${this.escapeHtml(winnerTeamInfo?.name || '?陣営')}の勝利！
        </h1>
        <div class="winners-grid">
          ${winnersList}
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px;">
          <button class="btn btn-primary btn-large" onclick="showScreen('lobby')">もう一度プレイ</button>
          <button class="btn btn-ghost" onclick="showScreen('title')">タイトルへ戻る</button>
        </div>
      </div>
    `;

    screen.innerHTML = resultHtml;
    showScreen('result');
  },

  /**
   * Escape HTML special characters
   */
  escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  },

  /**
   * Simple markdown rendering for **bold** and *italic*
   */
  renderMarkdown(content) {
    if (!content) return '';

    return this.escapeHtml(content)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  },

  /**
   * Get HTML for player avatar
   */
  getAvatarHTML(player, size = 'medium') {
    const role = ROLES[player.role || 'villager'];
    const teamColor = TEAM_INFO[role?.team || 'other']?.color || '#999';
    const initial = player.name.charAt(0);

    const sizeClass = `avatar-${size}`;

    return `
      <div class="avatar ${sizeClass}" style="background-color: ${teamColor}">
        <span class="initial">${initial}</span>
      </div>
    `;
  }
};
