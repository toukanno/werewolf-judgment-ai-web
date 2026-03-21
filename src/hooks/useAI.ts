import { useRef, useCallback } from 'react';
import type { ChatMessage } from '../types';

// @ts-ignore
import { ROLES } from '../data/roles.js';

interface UseAIOptions {
  gameState: any;
  gameLogic: any;
  addMessage: (msg: ChatMessage) => void;
  setAiSpeaking: (speaking: boolean) => void;
  setSpeakerIndex: (index: number) => void;
  addSystemMessage: (content: string) => void;
}

export function useAI({
  gameState,
  gameLogic,
  addMessage,
  setAiSpeaking,
  setSpeakerIndex,
  addSystemMessage,
}: UseAIOptions) {
  const cancelRef = useRef(false);

  const makeMessage = (player: any, content: string, type: ChatMessage['type'] = 'statement'): ChatMessage => ({
    id: `msg_${Date.now()}_${Math.random()}`,
    sender: player.id,
    senderName: player.name,
    content,
    isHuman: player.isHuman,
    avatarColor: player.avatarColor || '#aaa',
    avatarBg: player.avatarBg || '#333',
    initial: player.initial || player.name.charAt(0),
    type,
  });

  const runAiStatements = useCallback(async () => {
    if (!gameState || !gameLogic) return;
    cancelRef.current = false;
    setAiSpeaking(true);

    const alive = gameState.getAlive().filter((p: any) => !p.isHuman);

    for (let i = 0; i < alive.length; i++) {
      if (cancelRef.current) break;
      setSpeakerIndex(i);
      const player = alive[i];

      try {
        const statement = await gameLogic.getAiStatement(player);
        if (cancelRef.current) break;
        addMessage(makeMessage(player, statement));
      } catch (e) {
        console.error('AI statement error:', e);
        addMessage(makeMessage(player, '...（考え中）'));
      }

      // 1-2 second delay between speakers
      if (i < alive.length - 1 && !cancelRef.current) {
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
      }
    }

    setAiSpeaking(false);
  }, [gameState, gameLogic, addMessage, setAiSpeaking, setSpeakerIndex]);

  const getAiReactions = useCallback(async (humanMessage: string) => {
    if (!gameState || !gameLogic) return;
    cancelRef.current = false;
    setAiSpeaking(true);

    const alive = gameState.getAlive().filter((p: any) => !p.isHuman);
    // 1-3 random reactors
    const reactorCount = Math.min(alive.length, 1 + Math.floor(Math.random() * 3));
    const shuffled = [...alive].sort(() => Math.random() - 0.5);
    const reactors = shuffled.slice(0, reactorCount);

    for (const player of reactors) {
      if (cancelRef.current) break;
      try {
        const reaction = await gameLogic.getAiReaction(player, humanMessage);
        if (cancelRef.current) break;
        addMessage(makeMessage(player, reaction));
      } catch (e) {
        console.error('AI reaction error:', e);
      }
      await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
    }

    setAiSpeaking(false);
  }, [gameState, gameLogic, addMessage, setAiSpeaking]);

  const getAiVotes = useCallback(async (): Promise<Record<string, string>> => {
    if (!gameState || !gameLogic) return {};

    const alive = gameState.getAlive();
    const aiPlayers = alive.filter((p: any) => !p.isHuman);
    const targets = alive;
    const votes: Record<string, string> = {};

    for (const player of aiPlayers) {
      try {
        const targetId = await gameLogic.ai.getVote(player, targets.filter((t: any) => t.id !== player.id), gameState);
        votes[player.id] = targetId;
        const target = gameState.getPlayerById(targetId);
        addMessage(makeMessage(player, `${target?.name || '???'}に投票しました`, 'vote'));
      } catch (e) {
        console.error('AI vote error:', e);
        const randomTarget = targets.filter((t: any) => t.id !== player.id)[0];
        if (randomTarget) votes[player.id] = randomTarget.id;
      }
      await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
    }

    return votes;
  }, [gameState, gameLogic, addMessage]);

  const getAiNightActions = useCallback(async (): Promise<Record<string, string>> => {
    if (!gameState || !gameLogic) return {};

    const alive = gameState.getAlive();
    const actions: Record<string, string> = {};

    for (const player of alive) {
      if (player.isHuman) continue;
      const role = ROLES[gameState.getEffectiveRole(player.id)];
      if (!role || !role.nightAction) continue;

      try {
        const targetId = await gameLogic.getAiNightAction(player);
        if (targetId) {
          const ability = role.ability;
          if (ability === 'attack') actions.attack = targetId;
          else if (ability === 'guard') actions.guard = targetId;
          else if (ability === 'divine') actions.divine = targetId;
          else if (ability === 'sageDiv') actions.sageDiv = targetId;
          else if (ability === 'trap') actions.trap = targetId;
          else if (ability === 'heal') actions.heal = targetId;
          else if (ability === 'bless') actions.bless = targetId;
          else if (ability === 'sorcery') actions.sorcery = targetId;
          else if (ability === 'frame') actions.frame = targetId;
          else if (ability === 'flee') actions.flee = targetId;
          else if (ability === 'gift') actions.gift = targetId;
          else if (ability === 'fakeDivine') actions.fakeDivine = targetId;
          else if (ability === 'weakDivine') actions.weakDivine = targetId;
        }
      } catch (e) {
        console.error('AI night action error:', e);
      }
    }

    return actions;
  }, [gameState, gameLogic]);

  const cancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  return {
    runAiStatements,
    getAiReactions,
    getAiVotes,
    getAiNightActions,
    cancel,
  };
}
