import { useReducer, useCallback } from 'react';
import type { Player, ChatMessage, GamePhase, NightResult, VoteRecord, GameConfig } from '../types';

// Import from existing JS
// @ts-ignore
import { ROLES, DEFAULT_PRESETS, TEAM_INFO } from '../data/roles.js';
// @ts-ignore
import { AI_PLAYERS } from '../data/players.js';
// @ts-ignore
import { GameState } from '../game/state.js';
// @ts-ignore
import { GameLogic } from '../game/logic.js';
// @ts-ignore
import { MockAI } from '../ai/mock.js';
// @ts-ignore
import { OpenRouterAI } from '../ai/openrouter.js';

interface State {
  gameState: any; // GameState instance
  gameLogic: any; // GameLogic instance
  ai: any; // AI instance
  messages: ChatMessage[];
  phase: GamePhase;
  day: number;
  isGameOver: boolean;
  winner: string | null;
  humanRole: string | null;
  votes: VoteRecord;
  nightResult: NightResult | null;
  currentSpeakerIndex: number;
  isAiSpeaking: boolean;
  showRoleReveal: boolean;
  showDeathEffect: string | null;
}

type Action =
  | { type: 'INIT_GAME'; config: GameConfig }
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'SET_DAY'; day: number }
  | { type: 'SET_AI_SPEAKING'; speaking: boolean }
  | { type: 'SET_SPEAKER_INDEX'; index: number }
  | { type: 'CAST_VOTE'; voterId: string; targetId: string }
  | { type: 'SET_NIGHT_RESULT'; result: NightResult }
  | { type: 'SET_GAME_OVER'; winner: string }
  | { type: 'SHOW_ROLE_REVEAL'; show: boolean }
  | { type: 'SHOW_DEATH_EFFECT'; playerId: string | null }
  | { type: 'RESET' };

const initialState: State = {
  gameState: null,
  gameLogic: null,
  ai: null,
  messages: [],
  phase: 'day',
  day: 1,
  isGameOver: false,
  winner: null,
  humanRole: null,
  votes: {},
  nightResult: null,
  currentSpeakerIndex: 0,
  isAiSpeaking: false,
  showRoleReveal: false,
  showDeathEffect: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INIT_GAME': {
      const { config } = action;
      const gs = new GameState();
      const comp = config.preset === 'custom'
        ? config.composition
        : DEFAULT_PRESETS[config.playerCount]?.composition;
      gs.initPlayers(config.playerName, config.playerCount, comp);

      let ai: any;
      if (config.apiProvider !== 'none' && config.apiKey) {
        ai = new OpenRouterAI(config.apiKey, config.apiProvider);
      } else {
        ai = new MockAI();
      }
      const logic = new GameLogic(gs, ai);
      const human = gs.getHuman();

      return {
        ...initialState,
        gameState: gs,
        gameLogic: logic,
        ai,
        humanRole: human?.role || null,
        showRoleReveal: true,
      };
    }
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };
    case 'SET_PHASE':
      return { ...state, phase: action.phase };
    case 'SET_DAY':
      return { ...state, day: action.day };
    case 'SET_AI_SPEAKING':
      return { ...state, isAiSpeaking: action.speaking };
    case 'SET_SPEAKER_INDEX':
      return { ...state, currentSpeakerIndex: action.index };
    case 'CAST_VOTE':
      return { ...state, votes: { ...state.votes, [action.voterId]: action.targetId } };
    case 'SET_NIGHT_RESULT':
      return { ...state, nightResult: action.result };
    case 'SET_GAME_OVER':
      return { ...state, isGameOver: true, winner: action.winner };
    case 'SHOW_ROLE_REVEAL':
      return { ...state, showRoleReveal: action.show };
    case 'SHOW_DEATH_EFFECT':
      return { ...state, showDeathEffect: action.playerId };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initGame = useCallback((config: GameConfig) => {
    dispatch({ type: 'INIT_GAME', config });
  }, []);

  const addMessage = useCallback((msg: ChatMessage) => {
    dispatch({ type: 'ADD_MESSAGE', message: msg });
  }, []);

  const addSystemMessage = useCallback((content: string) => {
    dispatch({
      type: 'ADD_MESSAGE',
      message: {
        id: `sys_${Date.now()}_${Math.random()}`,
        sender: 'system',
        senderName: 'システム',
        content,
        isHuman: false,
        avatarColor: '#d4a040',
        avatarBg: '#333',
        initial: '⚙',
        type: 'system',
      },
    });
  }, []);

  const setPhase = useCallback((phase: GamePhase) => {
    dispatch({ type: 'SET_PHASE', phase });
  }, []);

  const setDay = useCallback((day: number) => {
    dispatch({ type: 'SET_DAY', day });
  }, []);

  const setAiSpeaking = useCallback((speaking: boolean) => {
    dispatch({ type: 'SET_AI_SPEAKING', speaking });
  }, []);

  const setSpeakerIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_SPEAKER_INDEX', index });
  }, []);

  const castVote = useCallback((voterId: string, targetId: string) => {
    dispatch({ type: 'CAST_VOTE', voterId, targetId });
  }, []);

  const setNightResult = useCallback((result: NightResult) => {
    dispatch({ type: 'SET_NIGHT_RESULT', result });
  }, []);

  const setGameOver = useCallback((winner: string) => {
    dispatch({ type: 'SET_GAME_OVER', winner });
  }, []);

  const showRoleReveal = useCallback((show: boolean) => {
    dispatch({ type: 'SHOW_ROLE_REVEAL', show });
  }, []);

  const showDeathEffect = useCallback((playerId: string | null) => {
    dispatch({ type: 'SHOW_DEATH_EFFECT', playerId });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    initGame,
    addMessage,
    addSystemMessage,
    setPhase,
    setDay,
    setAiSpeaking,
    setSpeakerIndex,
    castVote,
    setNightResult,
    setGameOver,
    showRoleReveal,
    showDeathEffect,
    reset,
  };
}

export { ROLES, DEFAULT_PRESETS, TEAM_INFO, AI_PLAYERS };
