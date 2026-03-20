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
      const isMe = player.isAI === false;
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
   * Show text input for day discussion
   */
  showChatInput(onSend) {
    const html = `
      <div class="chat-input-container">
        <input type="text" id="chat-input" class="chat-input" placeholder="発言を入力...">
        <button id="chat-send-btn" class="btn btn-primary">発言</button>
      </div>
    `;

    this.setAction(html);

    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');

    if (!input || !sendBtn) return;

    const send = () => {
      const text = input.value.trim();
      if (text) {
        onSend(text);
        input.value = '';
      }
    };

    sendBtn.addEventListener('click', send);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') send();
    });
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
    } else if (role.id === 'straw_doll') {
      html += '<p class="action-description">1人の処刑を免れる権を譲ります</p>';
      for (const target of targets) {
        html += `
          <button class="day-action-btn" data-action="straw_doll" data-target-id="${target.id}">
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
        return state.isFoxWinner && p.role === 'fox';
      } else if (winner === 'lover') {
        return state.isLoverWinner && p.role === 'lover';
      } else {
        return ROLES[p.role]?.team === winner;
      }
    });

    for (const player of winnerPlayers) {
      winnersList += `
        <div class="winner-badge">
          <span class="winner-name">${this.escapeHtml(player.name)}</span>
          <span class="winner-role">${ROLES[player.role]?.name || '?'}</span>
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
        <button id="restart-btn" class="btn btn-primary btn-large">もう一度プレイ</button>
      </div>
    `;

    screen.innerHTML = resultHtml;

    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn && window._gameRestartCallback) {
      restartBtn.addEventListener('click', window._gameRestartCallback);
    }
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
