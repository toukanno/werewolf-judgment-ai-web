// ゲームUI — 人狼ジャッジメント風

function escapeHtml(value) {
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
}

function renderMarkdown(content) {
  let safe = escapeHtml(content);
  safe = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  safe = safe.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return `<p>${safe}</p>`;
}

function getAvatarHTML(player, size = 40) {
  const color = player.avatarColor || "#aaa";
  const bg = player.avatarBg || "#333";
  const initial = player.initial || player.name.charAt(0);
  return `<div class="avatar-circle" style="width:${size}px;height:${size}px;background:linear-gradient(135deg,${bg},${color}30);border:2px solid ${color};color:${color};font-size:${size*0.42}px;"><span>${initial}</span></div>`;
}

const GameUI = {
  updateHeader(state) {
    document.getElementById("day-count").textContent = `${state.day}日目`;
    const phaseLabel = document.getElementById("phase-label");
    if (state.phase === "day") {
      phaseLabel.innerHTML = '<span class="phase-icon">☀</span> 昼の議論';
      phaseLabel.className = "phase-badge phase-day";
    } else if (state.phase === "night") {
      phaseLabel.innerHTML = '<span class="phase-icon">🌙</span> 夜';
      phaseLabel.className = "phase-badge phase-night";
    } else if (state.phase === "vote") {
      phaseLabel.innerHTML = '<span class="phase-icon">⚔</span> 投票';
      phaseLabel.className = "phase-badge phase-vote";
    }
    document.getElementById("alive-count").textContent = state.getAlive().length;
    document.getElementById("total-count").textContent = state.players.length;
  },

  renderPlayers(state) {
    const list = document.getElementById("player-list");
    list.innerHTML = state.players.map(p => {
      const classes = ["player-chip"];
      if (!p.isAlive) classes.push("dead");
      if (p.isHuman) classes.push("is-you");
      return `<div class="${classes.join(" ")}">
        ${getAvatarHTML(p, 28)}
        <span class="chip-name">${escapeHtml(p.name)}</span>
        ${!p.isAlive ? '<span class="chip-dead-mark">✕</span>' : ''}
      </div>`;
    }).join("");
  },

  addMessage(content, sender, type, player) {
    const msgs = document.getElementById("messages");
    const msg = document.createElement("div");
    const classes = ["msg"];
    if (type === "system") classes.push("system");
    if (type === "danger") classes.push("system","danger");
    if (type === "you") classes.push("you");
    if (type === "ai") classes.push("ai");
    msg.className = classes.join(" ");

    const rendered = renderMarkdown(content);

    if (type === "ai" && player) {
      msg.innerHTML = `<div class="msg-avatar">${getAvatarHTML(player, 36)}</div>
        <div class="msg-content"><div class="msg-name" style="color:${player.avatarColor || '#ccc'}">${escapeHtml(player.name)}</div><div class="msg-body">${rendered}</div></div>`;
    } else if (type === "you" && player) {
      msg.innerHTML = `<div class="msg-content"><div class="msg-name" style="color:${player.avatarColor || '#ffd54f'}">${escapeHtml(player.name)}</div><div class="msg-body">${rendered}</div></div>
        <div class="msg-avatar">${getAvatarHTML(player, 36)}</div>`;
    } else {
      msg.innerHTML = `<div class="msg-body">${rendered}</div>`;
    }

    msgs.appendChild(msg);
    const area = document.getElementById("message-area");
    area.scrollTop = area.scrollHeight;
  },

  clearMessages() {
    document.getElementById("messages").innerHTML = "";
  },

  setAction(html) {
    document.getElementById("action-area").innerHTML = html;
  },

  showChatInput(onSend) {
    this.setAction(`
      <div class="chat-input-area">
        <input type="text" class="input chat-input" id="chat-input" placeholder="発言を入力..." maxlength="200">
        <button class="btn btn-send" id="chat-send-btn">送信</button>
      </div>
    `);
    const input = document.getElementById("chat-input");
    const btn = document.getElementById("chat-send-btn");
    const send = () => {
      const text = input.value.trim();
      if (text) { onSend(text); input.value = ""; }
    };
    btn.onclick = send;
    input.onkeydown = (e) => { if (e.key === "Enter") send(); };
    input.focus();
  },

  showVoteButtons(targets, onVote) {
    const grid = targets.map(p =>
      `<button class="vote-card" data-id="${p.id}">
        ${getAvatarHTML(p, 52)}
        <span class="vote-name">${escapeHtml(p.name)}</span>
      </button>`
    ).join("");
    this.setAction(`<div class="vote-label">⚔ 処刑する人を選んでください</div><div class="vote-grid">${grid}</div>`);
    document.querySelectorAll(".vote-card").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll(".vote-card").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        setTimeout(() => onVote(btn.dataset.id), 300);
      };
    });
  },

  showNightActionButtons(targets, actionName, onSelect) {
    const grid = targets.map(p =>
      `<button class="vote-card night-card" data-id="${p.id}">
        ${getAvatarHTML(p, 52)}
        <span class="vote-name">${escapeHtml(p.name)}</span>
      </button>`
    ).join("");
    this.setAction(`<div class="vote-label">🌙 ${actionName}する対象を選んでください</div><div class="vote-grid">${grid}</div>`);
    document.querySelectorAll(".vote-card").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll(".vote-card").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        setTimeout(() => onSelect(btn.dataset.id), 300);
      };
    });
  },

  showContinueButton(label, onClick) {
    this.setAction(`<button class="btn btn-primary btn-continue">${label}</button>`);
    document.querySelector(".btn-continue").onclick = onClick;
  },

  // Role reveal animation
  async showRoleReveal(player) {
    return new Promise(resolve => {
      const overlay = document.getElementById("role-overlay");
      const role = ROLES[player.role];
      overlay.innerHTML = `
        <div class="role-reveal">
          <div class="role-reveal-card">
            <div class="role-reveal-icon">${role.icon}</div>
            <div class="role-reveal-name" style="color:${role.color}">${role.name}</div>
            <div class="role-reveal-team ${role.team}">${role.team === "village" ? "村人陣営" : "人狼陣営"}</div>
            <div class="role-reveal-desc">${role.description}</div>
            <button class="btn btn-primary role-reveal-btn">了解</button>
          </div>
        </div>
      `;
      overlay.classList.add("active");
      overlay.querySelector(".role-reveal-btn").onclick = () => {
        overlay.classList.remove("active");
        setTimeout(resolve, 300);
      };
    });
  },

  // Death effect
  async showDeathEffect(player) {
    return new Promise(resolve => {
      const overlay = document.getElementById("role-overlay");
      overlay.innerHTML = `
        <div class="death-effect">
          <div class="death-card">
            ${getAvatarHTML(player, 80)}
            <div class="death-name">${escapeHtml(player.name)}</div>
            <div class="death-text">は死亡した…</div>
            <div class="death-role">${ROLES[player.role].icon} ${ROLES[player.role].name}</div>
          </div>
        </div>
      `;
      overlay.classList.add("active");
      setTimeout(() => {
        overlay.classList.remove("active");
        setTimeout(resolve, 300);
      }, 2000);
    });
  },

  showResult(winner, state) {
    const title = document.getElementById("result-title");
    const message = document.getElementById("result-message");
    const playersDiv = document.getElementById("result-players");

    if (winner === "village") {
      title.innerHTML = '🎉 村人陣営の勝利';
      title.className = "result-title village-win";
      message.textContent = "すべての人狼を見つけ出した。村に平和が訪れる。";
    } else {
      title.innerHTML = '🐺 人狼陣営の勝利';
      title.className = "result-title werewolf-win";
      message.textContent = "人狼が村を支配した。闇が村を覆う…";
    }

    playersDiv.innerHTML = state.players.map(p => {
      const dead = p.isAlive ? "" : " dead";
      const role = ROLES[p.role];
      const isWinner = (winner === "village" && role.team === "village") || (winner === "werewolf" && role.team === "werewolf");
      return `<div class="result-player${dead}${isWinner ? ' winner' : ''}">
        ${getAvatarHTML(p, 44)}
        <div class="result-player-info">
          <div class="result-player-name">${escapeHtml(p.name)} ${p.isHuman ? '<span class="you-tag">YOU</span>' : ''}</div>
          <div class="result-player-role" style="color:${role.color}">${role.icon} ${role.name}</div>
          <div class="result-player-status">${p.isAlive ? "生存" : "死亡"}</div>
        </div>
      </div>`;
    }).join("");

    showScreen("result");
  }
};
