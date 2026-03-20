// 画面切り替え管理
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const screen = document.getElementById(`screen-${id}`);
  if (screen) screen.classList.add("active");
}

function selectPlayerCount(count) {
  document.querySelectorAll(".btn-count").forEach(b => b.classList.remove("active"));
  const el = document.querySelector(`[data-count="${count}"]`);
  if (el) el.classList.add("active");
  document.getElementById("composition-info").textContent = getCompositionText(count);
  window._selectedPlayerCount = count;
}

async function testApiKey() {
  const key = document.getElementById("api-key").value.trim();
  const status = document.getElementById("api-key-status");
  if (!key) {
    status.textContent = "APIキーを入力してください";
    status.className = "api-status error";
    return;
  }
  status.textContent = "接続テスト中...";
  status.className = "api-status";
  const ok = await OpenRouterAI.testConnection(key);
  if (ok) {
    status.textContent = "✓ 接続成功";
    status.className = "api-status ok";
    localStorage.setItem("werewolf_api_key", key);
  } else {
    status.textContent = "✗ 接続失敗";
    status.className = "api-status error";
  }
}

function clearApiKey() {
  document.getElementById("api-key").value = "";
  localStorage.removeItem("werewolf_api_key");
  document.getElementById("api-key-status").textContent = "";
}
