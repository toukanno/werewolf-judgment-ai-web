function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function renderMarkdown(content) {
  const safe = escapeHtml(content).replace(/\r\n/g, "\n");
  const lines = safe.split("\n");
  const html = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  for (const line of lines) {
    if (!line.trim()) {
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const quote = line.match(/^&gt;\s?(.+)$/);
    if (quote) {
      closeList();
      html.push(`<blockquote>${renderInlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${renderInlineMarkdown(listItem[1])}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${renderInlineMarkdown(line)}</p>`);
  }

  closeList();
  return html.join("");
}

// ゲームUI操作
const GameUI = {
  updateHeader(state) {
    document.getElementById("day-count").textContent = `${state.day}日目`;
    const phaseLabel = document.getElementById("phase-label");
    if (state.phase === "day") {
      phaseLabel.textContent = "☀️ 昼";
      phaseLabel.className = "phase-badge phase-day";
    } else if (state.phase === "night") {
      phaseLabel.textContent = "🌙 夜";
      phaseLabel.className = "phase-badge phase-night";
    } else if (state.phase === "vote") {
      phaseLabel.textContent = "🗳️ 投票";
      phaseLabel.className = "phase-badge phase-vote";
    }
    document.getElementById("alive-count").textContent = state.getAlive().length;
  },

  renderPlayers(state) {
    const list = document.getElementById("player-list");
    list.innerHTML = state.players.map(p => {
      const classes = ["player-chip"];
      if (!p.isAlive) classes.push("dead");
      if (p.isHuman) classes.push("is-you");
      return `<div class="${classes.join(" ")}"><span class="avatar">${p.avatar}</span> ${p.name}</div>`;
    }).join("");
  },

  addMessage(content, sender, type) {
    const msgs = document.getElementById("messages");
    const msg = document.createElement("div");
    const classes = ["msg"];
    if (type === "system") classes.push("system");
    if (type === "danger") classes.push("system", "danger");
    if (type === "you") classes.push("you");
    msg.className = classes.join(" ");

    const renderedContent = renderMarkdown(content);

    if (sender && type !== "system" && type !== "danger") {
      msg.innerHTML = `<div class="msg-name">${escapeHtml(sender)}</div><div class="msg-body markdown-body">${renderedContent}</div>`;
    } else {
      msg.innerHTML = `<div class="msg-body markdown-body">${renderedContent}</div>`;
    }
    msgs.appendChild(msg);
    document.getElementById("message-area").scrollTop = document.getElementById("message-area").scrollHeight;
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
        <input type="text" class="input" id="chat-input" placeholder="発言を入力...">
        <button class="btn btn-primary" id="chat-send-btn">送信</button>
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
    const buttons = targets.map(p =>
      `<button class="btn" data-id="${p.id}">${p.avatar} ${p.name}</button>`
    ).join("");
    this.setAction(`<p style="font-size:12px;color:var(--text2);margin-bottom:8px;">処刑する人を選んでください</p><div class="action-buttons">${buttons}</div>`);
    document.querySelectorAll(".action-buttons .btn").forEach(btn => {
      btn.onclick = () => onVote(btn.dataset.id);
    });
  },

  showNightActionButtons(targets, actionName, onSelect) {
    const buttons = targets.map(p =>
      `<button class="btn" data-id="${p.id}">${p.avatar} ${p.name}</button>`
    ).join("");
    this.setAction(`<p style="font-size:12px;color:var(--text2);margin-bottom:8px;">${actionName}する対象を選んでください</p><div class="action-buttons">${buttons}</div>`);
    document.querySelectorAll(".action-buttons .btn").forEach(btn => {
      btn.onclick = () => onSelect(btn.dataset.id);
    });
  },

  showContinueButton(label, onClick) {
    this.setAction(`<button class="btn btn-primary" style="width:100%">${label}</button>`);
    document.querySelector(".action-area .btn").onclick = onClick;
  },

  showResult(winner, state) {
    const title = document.getElementById("result-title");
    const message = document.getElementById("result-message");
    const playersDiv = document.getElementById("result-players");

    if (winner === "village") {
      title.textContent = "🎉 村人陣営の勝利！";
      title.className = "result-title village-win";
      message.textContent = "人狼を全員見つけ出しました。村に平和が訪れます。";
    } else {
      title.textContent = "🐺 人狼陣営の勝利！";
      title.className = "result-title werewolf-win";
      message.textContent = "人狼が村を支配しました。闇が広がります...";
    }

    playersDiv.innerHTML = state.players.map(p => {
      const dead = p.isAlive ? "" : " dead";
      const status = p.isAlive ? "生存" : "死亡";
      return `<div class="result-player${dead}">
        <div>${p.avatar} ${p.name} ${p.isHuman ? "(あなた)" : ""}</div>
        <div class="role-name">${ROLES[p.role].name} — ${status}</div>
      </div>`;
    }).join("");

    showScreen("result");
  }
};
