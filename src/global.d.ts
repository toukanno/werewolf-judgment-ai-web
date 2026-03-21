/* eslint-disable @typescript-eslint/no-explicit-any */

declare module '*.js' {
  const value: any;
  export default value;
  export const TEAMS: any;
  export const TEAM_INFO: Record<string, any>;
  export const ROLES: Record<string, any>;
  export const ROLE_CATEGORIES: string[];
  export const DEFAULT_PRESETS: Record<number, any>;
  export const COMPOSITIONS: Record<number, any>;
  export const AI_PLAYERS: any[];
  export const AI_PROVIDER_CONFIGS: Record<string, any>;
  export function getTeamLabel(team: string): string;
  export function getCompositionText(composition: Record<string, number>): string;
  export function getRolesByTeam(team: string): any[];
  export function getRolesByCategory(category: string): any[];
  export function getTotalRoleCount(): number;
  export function validateComposition(composition: Record<string, number>): any;
  export function createAvatarSVG(player: any, size?: number): string;
  export function createAvatarDataURL(player: any, size?: number): string;
  export class GameState {
    constructor();
    players: any[];
    day: number;
    phase: string;
    log: any[];
    voteHistory: any[];
    executedToday: string | null;
    isGameOver: boolean;
    winner: string | null;
    divinedPlayers: Record<string, string>;
    mediumResults: any[];
    lastGuardTarget: string | null;
    foxAlive: boolean;
    loversIds: string[];
    roleOverrides: Record<string, string>;
    suspendedPlayers: string[];
    reset(): void;
    initPlayers(name: string, count: number, composition?: Record<string, number>): void;
    getAlive(): any[];
    getAlivePlayers(): any[];
    getAliveVillageTeam(): any[];
    getAliveWerewolves(): any[];
    getAliveByRole(roleId: string): any[];
    getHuman(): any;
    getPlayerById(id: string): any;
    getEffectiveRole(playerId: string): string;
    isWerewolf(playerId: string): boolean;
    appearsAsWerewolf(playerId: string): boolean;
    killPlayer(id: string, cause?: string): void;
    revivePlayer(playerId: string): void;
    addLog(type: string, content: string, sender: string | null): void;
    checkWinCondition(): string | null;
    save(): void;
    load(): boolean;
    clearSave(): void;
    static hasSavedGame(): boolean;
  }
  export class GameLogic {
    constructor(state: any, ai: any);
    state: any;
    ai: any;
    tallyVotes(votes: Record<string, string>): string | null;
    handleExecution(playerId: string): void;
    resolveNight(actions: Record<string, any>): any;
    getAiNightAction(player: any): Promise<string | null>;
    getAiStatement(player: any): Promise<string>;
    getAiReaction(player: any, humanMessage: string): Promise<string>;
  }
  export class MockAI {
    constructor();
    getStatement(player: any, state: any): Promise<string>;
    getVote(player: any, targets: any[], state: any): Promise<string>;
    getReaction(player: any, humanMessage: string, state: any): Promise<string>;
    getNightAction(player: any, targets: any[], state: any): Promise<string | null>;
  }
  export class OpenRouterAI {
    constructor(apiKey: string, apiType?: string);
    static testConnection(apiKey: string, apiType?: string): Promise<boolean>;
    getStatement(player: any, state: any): Promise<string>;
    getVote(player: any, targets: any[], state: any): Promise<string>;
    getReaction(player: any, humanMessage: string, state: any): Promise<string>;
    getNightAction(player: any, targets: any[], state: any): Promise<string | null>;
  }
}
