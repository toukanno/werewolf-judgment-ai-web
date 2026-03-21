export interface Player {
  id: string;
  name: string;
  role: string;
  isHuman: boolean;
  isAlive: boolean;
  personality: string | null;
  style: string | null;
  avatarColor: string;
  avatarBg: string;
  initial: string;
}

export interface Role {
  id: string;
  name: string;
  team: string;
  ability: string | null;
  nightAction: boolean;
  appearAsWerewolf: boolean;
  description: string;
  color: string;
  icon: string;
  category: string;
}

export interface TeamInfo {
  name: string;
  color: string;
  displayColor: string;
}

export interface LogEntry {
  type: string;
  content: string;
  sender: string | null;
  day: number;
  phase: string;
  time: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  content: string;
  isHuman: boolean;
  avatarColor: string;
  avatarBg: string;
  initial: string;
  type: 'statement' | 'system' | 'vote' | 'night';
}

export interface NightResult {
  killed: string[];
  guarded: string | null;
  trapped: string | null;
  healed: string[];
  divineResult: string | null;
  divineTarget: string | null;
  sageResult: string | null;
  sageTarget: string | null;
  mediumResult: { playerId: string; name: string; result: string } | null;
  events: NightEvent[];
}

export interface NightEvent {
  type: string;
  target: string;
  result?: string;
  accurate?: boolean;
  actualVictim?: string;
}

export interface VoteRecord {
  [voterId: string]: string;
}

export type Screen = 'title' | 'lobby' | 'game' | 'result' | 'guide';
export type GamePhase = 'day' | 'vote' | 'night';
export type ApiProvider = 'groq' | 'openrouter' | 'openai' | 'none';

export interface GameConfig {
  playerName: string;
  playerCount: number;
  preset: 'standard' | 'advanced' | 'custom';
  composition: Record<string, number>;
  apiProvider: ApiProvider;
  apiKey: string;
}
