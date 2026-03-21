import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';

// Inject globals needed by legacy JS modules (state.js, logic.js, mock.js)
// These files reference ROLES, DEFAULT_PRESETS, AI_PLAYERS, TEAM_INFO as globals
// @ts-ignore
import { ROLES, DEFAULT_PRESETS, TEAM_INFO, TEAMS, ROLE_CATEGORIES, getTeamLabel, getCompositionText, getRolesByTeam, getRolesByCategory, getTotalRoleCount, validateComposition, COMPOSITIONS } from './data/roles.js';
// @ts-ignore
import { AI_PLAYERS, createAvatarSVG, createAvatarDataURL } from './data/players.js';
// @ts-ignore
import { MockAI } from './ai/mock.js';

Object.assign(globalThis, {
  ROLES, DEFAULT_PRESETS, TEAM_INFO, TEAMS, ROLE_CATEGORIES,
  getTeamLabel, getCompositionText, getRolesByTeam, getRolesByCategory,
  getTotalRoleCount, validateComposition, COMPOSITIONS,
  AI_PLAYERS, createAvatarSVG, createAvatarDataURL,
  MockAI,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
