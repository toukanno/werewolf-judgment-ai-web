# CLAUDE.md

## Project Overview

Werewolf Judgment AI Web (人狼AI対戦) — a browser-based Werewolf (Mafia) game where a human player competes against AI opponents. Built with React + Vite + TypeScript. AI players are powered by Groq/OpenRouter/OpenAI (user-selected) with a fallback mock AI for offline play. Supports 5–20 player villages with 121 roles.

**Live:** https://werewolf-judgment-ai-web.vercel.app

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **AI API:** Groq (free) / OpenRouter / OpenAI (user-provided API key, combobox selection)
- **Hosting:** Vercel (Vite build → dist/)
- **Storage:** localStorage (game state persistence)
- **Language:** Japanese UI and documentation; code identifiers in English
- **Font:** M PLUS Rounded 1c (Google Fonts)

## Project Structure

```
index.html              # Vite entry point
vite.config.ts          # Vite config (base: '/', react plugin)
tsconfig.json           # TypeScript config
vercel.json             # Vercel deploy config (npm run build → dist/)
public/
  favicon.svg           # Wolf favicon
  og-image.png          # OGP image (1200x630)
src/
  main.tsx              # React entry (createRoot)
  App.tsx               # Screen router (title/lobby/game/result/guide)
  App.css               # Full dark theme CSS
  global.d.ts           # Type declarations for JS modules
  types/
    index.ts            # TypeScript interfaces (Player, Role, ChatMessage, etc.)
  components/
    TitleScreen.tsx      # Title with start + guide buttons
    LobbyScreen.tsx      # Player count, role presets, API config
    GameScreen.tsx       # Day chat + vote grid + night action (main game loop)
    ResultScreen.tsx     # Winner banner + all roles revealed
    GuideScreen.tsx      # API key setup guide
    ChatMessage.tsx      # LINE-style chat bubble (AI left, human right)
    PlayerChip.tsx       # Player avatar + name + status
    VoteGrid.tsx         # 3-column vote target grid
    NightAction.tsx      # Night ability target selection
    RoleReveal.tsx       # Role reveal modal overlay
  hooks/
    useGameState.ts      # useReducer game state management
    useAI.ts             # AI statement/vote/night action orchestration
  ai/
    openrouter.js        # Multi-provider API client (Groq/OpenRouter/OpenAI)
    mock.js              # Offline pattern-based AI
    image-prompt-builder.js
  game/
    state.js             # GameState class (players, phases, persistence)
    logic.js             # GameLogic class (voting, night resolution, role interactions)
  data/
    roles.js             # 121 role definitions + presets (5-20 players)
    players.js           # 19 AI player profiles with personalities
    roles.json / players.json
  ui/                    # Legacy (unused by React app)
    screens.js
    game-ui.js
test/
  game-test.cjs          # 33-assertion headless test suite
  image-prompt-builder-test.js
legacy/                  # Old vanilla JS files (pre-React)
docs/
  plan.md
```

## Development Commands

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Build (TypeScript check + Vite build → dist/)
npm run build

# Preview production build locally
npm run preview

# Run tests
npm test
```

## Testing

Tests are headless Node.js scripts (`.cjs`) with assert-based checks. Run with `npm test`. The suite covers:

- Player initialization and role distribution (5/7/9/20 players)
- Death mechanics and win conditions (village/werewolf/fox/lover)
- Vote tallying and tie-breaking
- Night resolution (guard, attack, divine)
- MockAI statement/vote/night action generation
- Integration flow (vote → execution → night → win check)

All 33 tests must pass before merging changes.

## Architecture & Key Patterns

### React + Vite
- Vite builds from `index.html` (root) → `src/main.tsx`
- Existing game logic JS files are imported as ES modules (with `export` statements added)
- TypeScript declarations in `src/global.d.ts` provide types for JS modules

### Screen Flow (useState in App.tsx)
1. **Title** → 2. **Lobby** (player count, roles, API) → 3. **Game** → 4. **Result**
- Guide screen accessible from title

### Game Flow (GameScreen.tsx)
1. **Day Phase** — AI speaks 1-2s intervals via setTimeout, human chats + CO buttons, "投票に進む" button (never auto-advances)
2. **Vote Phase** — 3-column grid, select → red border → confirm → tally → execution
3. **Night Phase** — Role-specific target selection → resolve all actions → morning message

### State Management
- `useGameState` hook with `useReducer` wraps the existing `GameState` class
- `useAI` hook orchestrates AI statements, reactions, votes, and night actions
- Game state saved to localStorage after major actions

### AI Integration
- Combobox in lobby: Groq / OpenRouter / OpenAI / None
- `OpenRouterAI` class handles all providers via config map
- On API failure, auto-fallback to `MockAI`
- API key never stored server-side

### Roles (121 total)
Village team, Werewolf team, Fox team, Lover team, Zombie team, Devil team, Other.
Pre-balanced compositions for 5–20 players in `DEFAULT_PRESETS`.

## Code Conventions

- **Japanese** for all user-facing text
- **English** for code identifiers
- Existing JS files (game logic) kept as `.js` with added `export` statements
- New code is TypeScript (`.tsx` / `.ts`)
- CSS uses custom properties (CSS variables) with dark theme
- No CSS modules — single `App.css` with BEM-ish class names

## Do Not Modify

- **`ROLES` object** / **`DEFAULT_PRESETS`** / **`TEAMS`** / **`TEAM_INFO`** (`src/data/roles.js`)
- **`AI_PLAYERS` array** (`src/data/players.js`)
- **`GameState.SAVE_VERSION`** / **`GameState.SAVE_KEY`** (`src/game/state.js`)
- **Night resolution order** (`GameLogic.resolveNight` in `src/game/logic.js`)

## Deployment

Vercel deployment via `vercel.json`:
- Build: `npm run build`
- Output: `dist/`
- SPA rewrite: all routes → `/index.html`
- Security headers: X-Content-Type-Options, X-Frame-Options

`.vercelignore`: `.git`, `test`, `docs`, `*.md`, `.env*`
