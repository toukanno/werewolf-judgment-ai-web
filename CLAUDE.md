# CLAUDE.md

## Project Overview

Werewolf Judgment AI Web (人狼AI対戦) — a browser-based Werewolf (Mafia) game where a human player competes against AI opponents. Built with vanilla JavaScript (no framework, no build step). AI players are powered by OpenRouter (Claude Sonnet 4 default) with a fallback mock AI for offline play. Supports 5–20 player villages.

**Live:** https://werewolf-judgment-ai-web.vercel.app

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS — no bundler, no npm dependencies
- **AI API:** OpenRouter (user-provided API key), model `anthropic/claude-sonnet-4`
- **Hosting:** Vercel (static deployment)
- **Storage:** localStorage (game state persistence)
- **Language:** Japanese UI and documentation; code identifiers in English

## Project Structure

```
public/
  index.html          # Entry point — loads all JS via <script> tags
  app.js              # Main application orchestration (game loop, screen flow)
  style.css           # Dark-themed styling
src/
  ai/
    openrouter.js     # OpenRouter API client (temp 0.8, max 300 tokens)
    mock.js           # Offline fallback AI with scripted responses
    image-prompt-builder.js  # Image generation prompt utility
  game/
    state.js          # GameState class — players, phases, log, persistence
    logic.js          # GameLogic class — voting, night resolution, AI calls
  data/
    roles.js / roles.json      # Role definitions and compositions (5-20 players)
    players.js / players.json  # 20 AI player profiles with personalities
  ui/
    screens.js        # Screen switching (title → lobby → game → result)
    game-ui.js        # Message rendering (markdown), player list, action buttons
test/
  game-test.js        # 22-assertion headless test suite
  image-prompt-builder-test.js
docs/
  plan.md             # Game design document
```

## Development Commands

```bash
# Run the app locally
python3 -m http.server 8080
# Then open http://localhost:8080/public/index.html

# Or just open the file directly
open public/index.html

# Run tests
node test/game-test.js
node test/image-prompt-builder-test.js
```

## Testing

Tests are headless Node.js scripts with simple assert-based checks (no test framework). Run with `node test/game-test.js`. The suite covers:

- Player initialization and role distribution
- Death mechanics and win conditions
- Vote tallying and tie-breaking
- Night resolution (guard, attack, divine)
- MockAI statement generation
- Game save/restore via localStorage

All tests must pass before merging changes.

## Architecture & Key Patterns

### No Build System
All source files are loaded via `<script>` tags in `public/index.html`. Module-style exports use global variables. No ES modules, no bundler.

### Game Flow
1. **Lobby** — player count (5–20), name, optional API key
2. **Day Phase** — AI statements → human input → voting → execution → win check
3. **Night Phase** — seer divines, knight guards, werewolves attack → resolution
4. **Result** — winner announced with final player roster

### State Management
Single `GameState` instance manages all game data. Saved to localStorage after each major action (max 50 log entries persisted). Resume support via `GameState.hasSavedGame()`.

### AI Integration
- `OpenRouterAI` sends game context + player personality to the API, expects JSON responses
- On API failure, automatically falls back to `MockAI`
- AI responses include both statements (day discussion) and actions (voting, night abilities)

### Roles
Village team: Villager, Seer (占い師), Knight (騎士), Medium (霊能者), Hunter, Baker
Werewolf team: Werewolf (attack ability)
Pre-balanced compositions exist for each player count (5–20).

## Code Conventions

- **No npm dependencies** — keep it zero-dependency vanilla JS
- **Japanese** for all user-facing text and documentation
- **English** for code identifiers (variable names, function names, class names)
- **No linter/formatter configured** — follow existing code style
- Files are small and focused (~40–200 lines each)
- Classes use standard ES6 class syntax

## Deployment

Deployed to Vercel as static files. Config in `vercel.json`:
- No build step
- SPA rewrite: all routes → `/public/index.html`
- Security headers applied (X-Content-Type-Options, X-Frame-Options)

Files excluded from deployment (`.vercelignore`): `.git`, `test/`, `docs/`, `*.md`, `.env*`
