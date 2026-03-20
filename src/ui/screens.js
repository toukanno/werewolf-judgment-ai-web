/**
 * Screen Management and UI Control for Werewolf Game
 * Vanilla JS with no dependencies
 */

// Screen UI state (separate from game state)
let _screenState = {
  selectedPlayerCount: 5,
  selectedPreset: 'standard',
};
let _currentComposition = {};

/**
 * Show a specific screen by ID
 * @param {string} id - Screen identifier (e.g., 'setup', 'lobby', 'game')
 */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const screen = document.getElementById(`screen-${id}`);
  if (screen) screen.classList.add("active");
}

/**
 * Select player count and update UI
 * @param {number} count - Number of players (5-20)
 */
function selectPlayerCount(count) {
  _screenState.selectedPlayerCount = count;
  window._selectedPlayerCount = count; // backward compat with app.js

  // Update button states
  document.querySelectorAll(".btn-count").forEach(b => {
    b.classList.remove("active");
  });
  const el = document.querySelector(`[data-count="${count}"]`);
  if (el) el.classList.add("active");

  // Show preset composition if available
  const preset = DEFAULT_PRESETS[count];
  if (preset) {
    document.getElementById("composition-info").textContent = getCompositionText(preset.composition);
    _screenState.selectedPreset = 'standard';
    _currentComposition = { ...preset.composition };
  }

  // Initialize role config if the container exists
  const configContainer = document.getElementById("role-config");
  if (configContainer) {
    initRoleConfig(count);
  }
}

/**
 * Test API key connection
 */
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

  try {
    const ok = await OpenRouterAI.testConnection(key);
    if (ok) {
      status.textContent = "✓ 接続成功";
      status.className = "api-status ok";
      localStorage.setItem("werewolf_api_key", key);
      _screenState.apiKey = key;
    } else {
      status.textContent = "✗ 接続失敗";
      status.className = "api-status error";
    }
  } catch (e) {
    status.textContent = "✗ エラーが発生しました";
    status.className = "api-status error";
  }
}

/**
 * Clear stored API key
 */
function clearApiKey() {
  document.getElementById("api-key").value = "";
  localStorage.removeItem("werewolf_api_key");
  document.getElementById("api-key-status").textContent = "";
  _screenState.apiKey = '';
}

/**
 * Initialize role configuration UI for lobby
 * @param {number} playerCount - Total number of players
 */
function initRoleConfig(playerCount) {
  _screenState.selectedPlayerCount = playerCount;
  _currentComposition = {};

  // Create role selector container
  const container = document.getElementById("role-config");
  if (!container) return;

  container.innerHTML = '';

  // Create preset buttons
  const presetDiv = document.createElement('div');
  presetDiv.className = 'role-config-presets';
  presetDiv.innerHTML = `
    <button class="preset-btn active" data-preset="standard">スタンダード</button>
    <button class="preset-btn" data-preset="advanced">上級</button>
    <button class="preset-btn" data-preset="custom">カスタム</button>
  `;

  presetDiv.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => selectPreset(btn.dataset.preset, playerCount));
  });

  container.appendChild(presetDiv);

  // Create role selector
  const selectorDiv = document.createElement('div');
  selectorDiv.className = 'role-selector';
  selectorDiv.id = 'role-selector-inner';
  container.appendChild(selectorDiv);

  // Load standard preset by default
  selectPreset('standard', playerCount);
}

/**
 * Select a preset composition
 * @param {string} preset - 'standard', 'advanced', or 'custom'
 * @param {number} playerCount - Number of players
 */
function selectPreset(preset, playerCount) {
  playerCount = playerCount || _screenState.selectedPlayerCount;
  _screenState.selectedPreset = preset;

  // Update button states
  document.querySelectorAll('.preset-btn').forEach(b => {
    b.classList.remove('active');
  });
  document.querySelector(`.preset-btn[data-preset="${preset}"]`)?.classList.add('active');

  if (preset === 'standard') {
    // Use default preset
    const defaultPreset = DEFAULT_PRESETS[playerCount];
    if (defaultPreset) {
      _currentComposition = { ...defaultPreset.composition };
      renderRoleSelector(defaultPreset.composition, playerCount, false);
    }
  } else if (preset === 'advanced') {
    // Use advanced preset (more complex)
    const advancedPreset = getAdvancedPreset(playerCount);
    _currentComposition = { ...advancedPreset };
    renderRoleSelector(advancedPreset, playerCount, false);
  } else if (preset === 'custom') {
    // Allow custom configuration
    const defaultPreset = DEFAULT_PRESETS[playerCount];
    _currentComposition = { ...defaultPreset.composition };
    renderRoleSelector(defaultPreset.composition, playerCount, true);
  }
}

/**
 * Get advanced preset for player count
 * @param {number} playerCount
 * @returns {Object} Composition with more special roles
 */
function getAdvancedPreset(playerCount) {
  const presets = {
    5: { villager: 1, seer: 1, werewolf: 1, madman: 1, fox: 1 },
    6: { villager: 1, seer: 1, knight: 1, werewolf: 1, madman: 1, fox: 1 },
    7: { villager: 1, seer: 1, knight: 1, medium: 1, werewolf: 1, madman: 1, fox: 1 },
    8: { villager: 1, seer: 1, knight: 1, medium: 1, werewolf: 1, madman: 1, fox: 1, doctor: 1 },
    9: { villager: 1, seer: 1, knight: 1, medium: 1, doctor: 1, werewolf: 2, madman: 1, fox: 1 },
    10: { villager: 2, seer: 1, knight: 1, medium: 1, doctor: 1, werewolf: 2, madman: 1, fox: 1 },
    11: { villager: 2, seer: 1, knight: 1, medium: 1, doctor: 1, witch: 1, werewolf: 2, madman: 1, fox: 1 },
    12: { villager: 2, seer: 1, knight: 1, medium: 1, doctor: 1, witch: 1, werewolf: 2, wiseWolf: 1, fox: 1, madman: 1 },
    13: { villager: 2, seer: 1, knight: 1, medium: 1, doctor: 1, witch: 1, detective: 1, werewolf: 2, wiseWolf: 1, fox: 1, madman: 1 },
    14: { villager: 2, seer: 1, knight: 1, medium: 1, doctor: 1, witch: 1, detective: 1, werewolf: 2, wiseWolf: 1, bigWolf: 1, fox: 1, madman: 1 },
    15: { villager: 2, seer: 1, knight: 1, medium: 1, doctor: 1, witch: 1, detective: 1, nekomata: 1, werewolf: 2, wiseWolf: 1, bigWolf: 1, fox: 1, madman: 1 },
    16: { villager: 2, seer: 1, knight: 1, medium: 1, doctor: 1, witch: 1, detective: 1, nekomata: 1, paladin: 1, werewolf: 2, wiseWolf: 1, bigWolf: 1, fox: 1, immoralist: 1, madman: 1 },
    17: { villager: 2, seer: 1, knight: 1, medium: 1, doctor: 1, witch: 1, detective: 1, nekomata: 1, paladin: 1, werewolf: 2, wiseWolf: 1, bigWolf: 1, curseWolf: 1, fox: 1, immoralist: 1, madman: 1 },
    18: { villager: 2, seer: 1, knight: 1, medium: 1, doctor: 1, witch: 1, detective: 1, nekomata: 1, paladin: 1, assassin: 1, werewolf: 2, wiseWolf: 1, bigWolf: 1, curseWolf: 1, fox: 1, immoralist: 1, madman: 1 },
    19: { villager: 2, seer: 1, knight: 1, medium: 1, doctor: 1, witch: 1, detective: 1, nekomata: 1, paladin: 1, assassin: 1, werewolf: 2, wiseWolf: 1, bigWolf: 1, curseWolf: 1, wolfKing: 1, fox: 1, immoralist: 1, madman: 1 },
    20: { villager: 2, seer: 1, knight: 1, medium: 1, doctor: 1, witch: 1, detective: 1, nekomata: 1, paladin: 1, assassin: 1, magicalGirl: 1, werewolf: 2, wiseWolf: 1, bigWolf: 1, curseWolf: 1, wolfKing: 1, fox: 1, immoralist: 1, madman: 1 },
  };
  return presets[playerCount] || DEFAULT_PRESETS[playerCount]?.composition || { villager: playerCount - 2, werewolf: 2 };
}

/**
 * Render role selector UI with toggleable role cards
 * @param {Object} composition - Current composition
 * @param {number} playerCount - Total players
 * @param {boolean} editable - Whether roles can be adjusted
 */
function renderRoleSelector(composition, playerCount, editable) {
  const container = document.getElementById('role-selector-inner');
  if (!container) return;

  container.innerHTML = '';

  // Group roles by team
  const groupedRoles = groupRolesByTeam();

  // Create sections for each team
  Object.entries(groupedRoles).forEach(([teamId, roles]) => {
    const teamSection = document.createElement('div');
    teamSection.className = 'role-section';
    teamSection.dataset.team = teamId;

    // Team header
    const teamHeader = document.createElement('h3');
    teamHeader.className = 'team-header';
    teamHeader.innerHTML = getTeamIcon(teamId) + ' ' + getTeamLabel(teamId);
    teamSection.appendChild(teamHeader);

    // Role cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'role-cards';

    roles.forEach(role => {
      const card = createRoleCard(role, composition[role.id] || 0, editable);
      cardsContainer.appendChild(card);
    });

    teamSection.appendChild(cardsContainer);
    container.appendChild(teamSection);
  });

  // Add composition summary
  addCompositionSummary(container, playerCount);
}

/**
 * Create a role card element
 * @param {Object} role - Role data
 * @param {number} count - Current count of this role
 * @param {boolean} editable - Whether it can be edited
 * @returns {HTMLElement}
 */
function createRoleCard(role, count, editable) {
  const card = document.createElement('div');
  card.className = 'role-card';
  card.dataset.roleId = role.id;

  const content = `
    <div class="role-icon">${role.icon}</div>
    <div class="role-name">${role.name}</div>
    ${editable ? `
      <div class="role-controls">
        <button class="role-btn minus" data-role="${role.id}">−</button>
        <span class="role-count">${count}</span>
        <button class="role-btn plus" data-role="${role.id}">+</button>
      </div>
    ` : `
      <div class="role-count-fixed">${count > 0 ? count : '−'}</div>
    `}
  `;

  card.innerHTML = content;
  card.style.borderColor = role.color;

  if (editable) {
    const minusBtn = card.querySelector('.minus');
    const plusBtn = card.querySelector('.plus');

    minusBtn?.addEventListener('click', () => {
      adjustRoleCount(role.id, -1);
    });

    plusBtn?.addEventListener('click', () => {
      adjustRoleCount(role.id, 1);
    });
  }

  return card;
}

/**
 * Adjust role count in composition
 * @param {string} roleId - Role ID
 * @param {number} delta - Amount to change (+1 or -1)
 */
function adjustRoleCount(roleId, delta) {
  const playerCount = _screenState.selectedPlayerCount;
  const currentCount = _currentComposition[roleId] || 0;
  const newCount = Math.max(0, currentCount + delta);

  // Calculate total
  let total = 0;
  Object.values(_currentComposition).forEach(c => total += c);

  if (delta > 0 && total >= playerCount) {
    // Can't exceed player count
    return;
  }

  if (newCount === 0) {
    delete _currentComposition[roleId];
  } else {
    _currentComposition[roleId] = newCount;
  }

  // Update display
  const card = document.querySelector(`[data-role-id="${roleId}"]`);
  if (card) {
    const countEl = card.querySelector('.role-count');
    if (countEl) countEl.textContent = newCount;
  }

  addCompositionSummary(document.getElementById('role-selector-inner'), playerCount);
}

/**
 * Add composition summary at bottom
 * @param {HTMLElement} container - Container element
 * @param {number} playerCount - Total players
 */
function addCompositionSummary(container, playerCount) {
  // Remove existing summary
  const oldSummary = container.querySelector('.composition-summary');
  if (oldSummary) oldSummary.remove();

  // Calculate totals
  let total = 0;
  Object.values(_currentComposition).forEach(c => total += c);

  const summary = document.createElement('div');
  summary.className = 'composition-summary';

  const isValid = total === playerCount;
  const validClass = isValid ? 'valid' : 'invalid';

  summary.innerHTML = `
    <div class="summary-${validClass}">
      人数: ${total}/${playerCount}
      ${isValid ? '<span class="valid-icon">✓</span>' : '<span class="invalid-icon">✗ 人数が合いません</span>'}
    </div>
  `;

  container.appendChild(summary);
}

/**
 * Get custom composition object
 * @returns {Object} Current custom composition
 */
function getCustomComposition() {
  return { ..._currentComposition };
}

/**
 * Update composition from UI state
 * @returns {Object} Updated composition
 */
function updateCompositionFromConfig() {
  const composition = {};

  document.querySelectorAll('[data-role-id]').forEach(card => {
    const roleId = card.dataset.roleId;
    const countEl = card.querySelector('.role-count, .role-count-fixed');
    const count = parseInt(countEl?.textContent) || 0;

    if (count > 0) {
      composition[roleId] = count;
    }
  });

  _currentComposition = composition;
  return composition;
}

/**
 * Group roles by team for display
 * @returns {Object} Roles grouped by team
 */
function groupRolesByTeam() {
  const grouped = {};
  // Dynamically read all roles from the global ROLES object
  Object.values(ROLES).forEach(role => {
    const team = role.team || 'other';
    if (!grouped[team]) grouped[team] = [];
    grouped[team].push(role);
  });
  return grouped;
}

/**
 * Get team icon
 * @param {string} teamId - Team identifier
 * @returns {string} Team icon
 */
function getTeamIcon(teamId) {
  const icons = {
    village: '🏘',
    werewolf: '🐺',
    fox: '🦊',
    lover: '💕',
    zombie: '🧟',
    devil: '😈',
    other: '🎪'
  };
  return icons[teamId] || '⚪';
}

/**
 * Get team label in Japanese
 * @param {string} teamId - Team identifier
 * @returns {string} Team name
 */
function getTeamLabel(teamId) {
  // Use TEAM_INFO if available, fall back to hardcoded
  if (typeof TEAM_INFO !== 'undefined' && TEAM_INFO[teamId]) {
    return TEAM_INFO[teamId].name;
  }
  const labels = {
    village: '村人陣営',
    werewolf: '人狼陣営',
    fox: '妖狐陣営',
    lover: '恋人陣営',
    zombie: 'ゾンビ陣営',
    devil: '悪魔陣営',
    other: 'その他'
  };
  return labels[teamId] || 'チーム';
}

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
    const role = (typeof ROLES !== 'undefined') ? ROLES[roleId] : null;
    const name = role ? role.name : roleId;
    if (count > 0) {
      if (count === 1) {
        parts.push(name);
      } else {
        parts.push(`${name}×${count}`);
      }
    }
  });

  return parts.join('・');
}

// Global exports
window.showScreen = showScreen;
window.selectPlayerCount = selectPlayerCount;
window.testApiKey = testApiKey;
window.clearApiKey = clearApiKey;
window.initRoleConfig = initRoleConfig;
window.selectPreset = selectPreset;
window.renderRoleSelector = renderRoleSelector;
window.updateCompositionFromConfig = updateCompositionFromConfig;
window.getCustomComposition = getCustomComposition;
window.adjustRoleCount = adjustRoleCount;
window.getCompositionText = getCompositionText;
