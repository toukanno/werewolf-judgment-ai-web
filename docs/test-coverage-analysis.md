# Test Coverage Analysis

## Current State

- **Test files**: 2 (`test/game-test.js`, `test/image-prompt-builder-test.js`)
- **Total assertions**: 25 (all passing)
- **Test framework**: Custom (native Node.js, manual `assert()` function)
- **Coverage tooling**: None
- **CI/CD**: None (tests run manually)

### What's Currently Covered

| Module | Covered Areas |
|--------|--------------|
| `GameState` | Player init, role distribution (5/7/9/20), kill, alive tracking, win conditions (village/werewolf) |
| `GameLogic` | Vote tallying (single winner), night resolution (guard success/fail, divine target) |
| `MockAI` | Return type validation for statements, votes, night actions |
| `ImagePromptBuilder` | Output format headers, adult guardrails, non-explicit constraint |

### What's NOT Covered

| Module | Missing Coverage |
|--------|-----------------|
| `game-ui.js` | `escapeHtml`, `renderInlineMarkdown`, `renderMarkdown` — 0 tests |
| `screens.js` | `showScreen`, `selectPlayerCount`, `testApiKey` — 0 tests (DOM-dependent) |
| `openrouter.js` | `OpenRouterAI` — 0 tests (requires fetch mock) |
| `app.js` | Game loop orchestration — 0 tests (DOM + async-dependent) |
| `state.js` | `save()`, `load()`, `hasSavedGame()`, `clearSave()` — 0 tests |

---

## Coverage Gaps by Priority

### P0 — High Priority

#### 1. Markdown Rendering (`game-ui.js`: `escapeHtml`, `renderInlineMarkdown`, `renderMarkdown`)

These are pure functions with **zero tests** that handle user-generated content. They are security-relevant (XSS prevention).

**Missing tests:**
- `escapeHtml`: `&`, `<`, `>`, `"`, `'` character escaping
- `renderInlineMarkdown`: bold (`**`), italic (`*`), inline code, links
- `renderMarkdown`: headings (h1-h3), blockquotes, unordered lists, paragraphs, list closure on blank lines
- Edge cases: nested inline markup, empty input, consecutive blank lines, `<script>` injection attempts

**Recommended**: Create `test/markdown-test.js` — these are pure functions, trivially testable in Node.

#### 2. `checkWinCondition()` Edge Cases

**Missing tests:**
- `null` return when both teams have survivors (game continues)
- `isGameOver` and `winner` state fields are correctly set after each condition
- Exact boundary: 1 wolf vs 1 villager (wolves === villagers → werewolf win)

#### 3. `tallyVotes()` Edge Cases

**Missing tests:**
- Tied votes (function picks randomly among tied candidates)
- Single vote
- Unanimous vote

---

### P1 — Medium Priority

#### 4. `resolveNight()` Edge Cases

**Missing tests:**
- All-null actions `{divine: null, guard: null, attack: null}`
- Attack-only (no guard, no divine)
- Divine-only (no attack)
- `state.lastGuardTarget` is updated correctly after guard
- `appearAsWerewolf` flag in divine result

#### 5. MockAI Behavioral Correctness

**Missing tests:**
- Werewolf voting strategy: wolves should preferentially target non-wolves
- Knight guard: should avoid guarding last night's target
- Seer divine: should always return a target ID
- Statement placeholder replacement: `{target}` and `{result}` are filled in
- Day-1 vs general statement pool selection logic

#### 6. State Persistence (`save`/`load`/`hasSavedGame`/`clearSave`)

**Missing tests (all):**
- Save → load round-trip preserves all fields
- `load()` returns `false` on missing/invalid/wrong-version data
- `hasSavedGame()` returns `false` when `isGameOver` is `true`
- `clearSave()` removes the save entry
- Log truncation to `MAX_LOG_SAVE` (50) entries on save

**Note**: Requires a `localStorage` mock (simple in-memory object).

---

### P2 — Low Priority

#### 7. `getCompositionText()`

- Valid count → returns human-readable role string
- Invalid count → returns `""`

#### 8. `initPlayers()` Validation

- Invalid player count throws error
- All AI players get unique IDs
- Human player always has `id: "human"`

#### 9. `OpenRouterAI` (requires `fetch` mock)

- `_buildPrompt` output includes player info, recent log, task
- Fallback to `MockAI` on API error
- `getVote` name-to-ID resolution and fallback to `targets[0]`
- `testConnection` returns boolean

---

## Recommended Implementation Plan

| Step | File | Tests to Add | Effort |
|------|------|-------------|--------|
| 1 | `test/markdown-test.js` (new) | `escapeHtml`, `renderInlineMarkdown`, `renderMarkdown` | Small |
| 2 | `test/game-test.js` | `tallyVotes` ties, `checkWinCondition` null/boundary | Small |
| 3 | `test/game-test.js` | `resolveNight` edge cases, `lastGuardTarget` | Small |
| 4 | `test/game-test.js` | MockAI wolf targeting, knight guard, placeholder replacement | Small |
| 5 | `test/state-persistence-test.js` (new) | localStorage mock, save/load round-trip | Medium |
| 6 | `test/game-test.js` | `initPlayers` invalid count, unique IDs | Small |
| 7 | `test/openrouter-test.js` (new) | Prompt building, fetch mock, fallback behavior | Medium |

### Infrastructure Improvements

- **Add a test runner script**: A simple `run-all-tests.sh` or an npm-free Node script to discover and run all `test/*-test.js` files
- **Consider adding c8 or istanbul** for code coverage metrics (would require a `package.json`)
- **Add CI**: A GitHub Actions workflow to run tests on push/PR
