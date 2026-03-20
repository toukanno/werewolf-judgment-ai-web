# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Browser-based Werewolf (Mafia) game where one human player competes against AI opponents. Vanilla JavaScript with no framework and no build step. AI players use OpenRouter/Groq/OpenAI (user-provided key) with MockAI fallback for offline play. Supports 5-20 player villages with 50+ role types.

**Live:** https://werewolf-judgment-ai-web.vercel.app

## Commands

```bash
# Serve locally (recommended)
python3 -m http.server 8080
# Then open http://localhost:8080/public/index.html

# Run tests (Node.js required)
node test/game-test.js
node test/image-prompt-builder-test.js
```

No npm, no build step, no linter. Tests are plain Node.js scripts using `assert`-style checks.

## Dependency Direction

```
src/data/ (roles, players)
  ↓
src/game/ (state, logic)
  ↓
src/ai/ (mock, openrouter)
  ↓
src/ui/ (screens, game-ui)
  ↓
public/app.js (orchestration)
```

All files are loaded via `<script>` tags in `public/index.html` in this exact order:
1. `src/data/roles.js` - `ROLES`, `DEFAULT_PRESETS`, `TEAMS`, `TEAM_INFO`
2. `src/data/players.js` - `AI_PLAYERS`, `createAvatarSVG`
3. `src/game/state.js` - `GameState`
4. `src/game/logic.js` - `GameLogic`
5. `src/ai/mock.js` - `MockAI`
6. `src/ai/openrouter.js` - `OpenRouterAI`, `AI_PROVIDER_CONFIGS`
7. `src/ui/screens.js` - `showScreen`, `selectPlayerCount`, `selectPreset`
8. `src/ui/game-ui.js` - `GameUI`
9. `public/app.js` - game loop, global `gameState`, `gameLogic`

No ES modules. Every export is a global variable/class/function.

## Architecture

| Directory | Role |
|-----------|------|
| `src/data/` | Static data: 50+ role definitions with team/ability metadata, 19 AI player profiles with personality/style, pre-balanced compositions for 5-20 players |
| `src/game/state.js` | `GameState` class: player list, phase tracking, role-specific flags, win condition checks, localStorage save/load (version 3) |
| `src/game/logic.js` | `GameLogic` class: vote tallying (mayor double vote, tie-breaking), night resolution (15-step ordered pipeline: guard -> trap -> heal -> bless -> attack -> divine -> ... -> medium), execution side effects |
| `src/ai/mock.js` | `MockAI`: personality-keyed dialogue templates, offline vote/night action logic |
| `src/ai/openrouter.js` | Multi-provider AI client (Groq/OpenRouter/OpenAI), auto-fallback to MockAI on error |
| `src/ui/` | DOM manipulation: screen transitions, message rendering (simple Markdown), player list, action buttons |
| `public/app.js` | Main loop: day discussion -> vote -> execution -> night abilities -> win check -> repeat |

## Entry Points

- **Browser:** `public/index.html` loads everything via script tags
- **Tests:** `test/game-test.js` concatenates source files via `fs.readFileSync` and injects into `globalThis`

## Testing Notes

- Runner: plain Node.js (`node test/game-test.js`), no framework
- Pattern: `assert(condition, message)` with pass/fail counter, exits non-zero on failure
- Tests load source files by concatenating them with `fs.readFileSync` then `new Function(...)` to inject globals
- 22+ assertions covering: player init, role distribution (5/7/9/20 players), kill/death, win conditions (village/werewolf/fox/lover), vote tallying, night resolution (guard blocks attack), MockAI responses
- To add a test: append assertions inside `runTests()` in `test/game-test.js`
- All tests must pass before merging

## Change Rules

### Do Not Modify

These are foundational constants that many parts of the codebase depend on. Changing them will break role distribution, win conditions, and tests.

- **`ROLES` object** (`src/data/roles.js`): role IDs, team assignments, ability flags. Role IDs are used as keys everywhere (state, logic, tests, AI prompts).
- **`DEFAULT_PRESETS`** (`src/data/roles.js`): balanced compositions for each player count (5-20). Tests assert exact role counts.
- **`TEAMS` / `TEAM_INFO`** (`src/data/roles.js`): team identifiers used in win condition logic.
- **`AI_PLAYERS` array** (`src/data/players.js`): 19 player profiles. Changing IDs breaks save compatibility. Changing count below 19 breaks 20-player games.
- **`GameState.SAVE_VERSION`** (`src/game/state.js`): increment only when save format changes (currently 3). Old saves are discarded on version mismatch.
- **`GameState.SAVE_KEY`** (`src/game/state.js`): localStorage key name.
- **Night resolution order** (`GameLogic.resolveNight` in `src/game/logic.js`): the 15-step sequence (guard -> trap -> heal -> ... -> medium) is the core game rule engine. Reordering changes game behavior.
- **Script load order** in `public/index.html`: each file depends on globals from the previous one.

### Before Any Change

1. Run `node test/game-test.js` and confirm all 22+ assertions pass.
2. If touching `src/game/state.js` or `src/game/logic.js`, verify win conditions still work (village, werewolf, fox, lover cases are all tested).
3. If adding a new source file, add its `<script>` tag in `public/index.html` in the correct dependency order AND add it to the `files` array in `test/game-test.js`.
4. If changing role data or presets, update the corresponding `.json` mirror file (`roles.json`, `players.json`).
5. If modifying save/load fields in `GameState`, bump `SAVE_VERSION`.
6. Keep all user-facing text in Japanese. Keep all code identifiers in English.
7. Do not introduce npm dependencies, ES modules, or build steps.
