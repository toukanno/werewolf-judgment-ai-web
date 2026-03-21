import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, GamePhase } from '../types';
import { useAI } from '../hooks/useAI';
import { ChatMessageBubble } from './ChatMessage';
import { VoteGrid } from './VoteGrid';
import { NightAction } from './NightAction';
import { RoleReveal } from './RoleReveal';
// @ts-ignore
import { ROLES, TEAM_INFO } from '../data/roles.js';

interface Props {
  game: any;
  onGameEnd: () => void;
}

export function GameScreen({ game, onGameEnd }: Props) {
  const { state, addMessage, addSystemMessage, setPhase, setDay, setAiSpeaking, setSpeakerIndex, setGameOver, showRoleReveal, showDeathEffect } = game;
  const { gameState, gameLogic } = state;

  const [inputText, setInputText] = useState('');
  const [humanSpoken, setHumanSpoken] = useState(false);
  const [voteTarget, setVoteTarget] = useState<string | null>(null);
  const [nightTarget, setNightTarget] = useState<string | null>(null);
  const [aiStatementsStarted, setAiStatementsStarted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<any>(null);

  const ai = useAI({
    gameState,
    gameLogic,
    addMessage,
    setAiSpeaking,
    setSpeakerIndex,
    addSystemMessage,
  });
  aiRef.current = ai;

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Start AI statements when day phase begins
  useEffect(() => {
    if (state.phase === 'day' && !aiStatementsStarted && !state.isGameOver && gameState) {
      setAiStatementsStarted(true);
      addSystemMessage(`【${state.day}日目 - 昼】議論の時間です`);
      aiRef.current.runAiStatements();
    }
  }, [state.phase, state.day, aiStatementsStarted, state.isGameOver, gameState, addSystemMessage]);

  // Is the human player alive?
  const human = gameState?.getHuman();
  const humanAlive = human?.isAlive ?? false;

  // Auto-advance when human is dead
  useEffect(() => {
    if (!gameState || state.isGameOver || humanAlive) return;

    if (state.phase === 'day' && !isProcessing) {
      // Dead human: auto-advance to vote after AI statements finish
      if (!state.isAiSpeaking && aiStatementsStarted) {
        const timer = setTimeout(() => {
          handleAdvanceToVote();
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [state.phase, humanAlive, state.isAiSpeaking, aiStatementsStarted, isProcessing, state.isGameOver]);

  useEffect(() => {
    if (!gameState || state.isGameOver || humanAlive) return;

    if (state.phase === 'vote' && !isProcessing) {
      // Dead human: auto-vote
      handleAutoVote();
    }
  }, [state.phase, humanAlive, isProcessing, state.isGameOver]);

  useEffect(() => {
    if (!gameState || state.isGameOver || humanAlive) return;

    if (state.phase === 'night' && !isProcessing) {
      // Dead human: auto-advance night
      handleNightConfirm();
    }
  }, [state.phase, humanAlive, isProcessing, state.isGameOver]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || !gameState) return;
    const h = gameState.getHuman();
    if (!h || !h.isAlive) return;

    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: h.id,
      senderName: h.name,
      content: inputText.trim(),
      isHuman: true,
      avatarColor: h.avatarColor,
      avatarBg: h.avatarBg,
      initial: h.initial,
      type: 'statement',
    };
    addMessage(msg);
    const text = inputText.trim();
    setInputText('');
    setHumanSpoken(true);

    await aiRef.current.getAiReactions(text);
  }, [inputText, gameState, addMessage]);

  const handleCO = useCallback(async (type: string) => {
    if (!gameState) return;
    const h = gameState.getHuman();
    if (!h || !h.isAlive) return;
    const role = ROLES[h.role];

    let coText = '';
    if (type === 'role') {
      coText = `【CO】${role?.name || '???'}です！`;
    } else if (type === 'seer') {
      coText = '【占いCO】占い師です！';
    } else if (type === 'medium') {
      coText = '【霊能CO】霊能者です！';
    }

    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: h.id,
      senderName: h.name,
      content: coText,
      isHuman: true,
      avatarColor: h.avatarColor,
      avatarBg: h.avatarBg,
      initial: h.initial,
      type: 'statement',
    };
    addMessage(msg);
    setHumanSpoken(true);
    await aiRef.current.getAiReactions(coText);
  }, [gameState, addMessage]);

  const handleAdvanceToVote = useCallback(() => {
    aiRef.current.cancel();
    setPhase('vote');
    setVoteTarget(null);
    addSystemMessage('【投票フェーズ】処刑する人を選んでください');
  }, [setPhase, addSystemMessage]);

  const handleAutoVote = useCallback(async () => {
    if (!gameState || !gameLogic) return;
    setIsProcessing(true);

    try {
      addSystemMessage('（あなたは死亡しているため、観戦中です）');

      const aiVotes = await aiRef.current.getAiVotes();
      const executed = gameLogic.tallyVotes(aiVotes);
      if (executed) {
        const executedPlayer = gameState.getPlayerById(executed);
        addSystemMessage(`投票の結果、${executedPlayer?.name || '???'}が処刑されました`);
        gameLogic.handleExecution(executed);
        gameState.save();
      }

      const winner = gameState.checkWinCondition();
      if (winner) {
        setGameOver(winner);
        setTimeout(onGameEnd, 1500);
        setIsProcessing(false);
        return;
      }

      setPhase('night');
      setNightTarget(null);
      addSystemMessage('【夜】');
    } catch (e) {
      console.error('Auto vote error:', e);
      addSystemMessage('エラーが発生しました。投票をスキップします。');
      setPhase('night');
    } finally {
      setIsProcessing(false);
    }
  }, [gameState, gameLogic, addMessage, addSystemMessage, setPhase, setGameOver, onGameEnd]);

  const handleVoteConfirm = useCallback(async () => {
    if (!voteTarget || !gameState || !gameLogic) return;
    setIsProcessing(true);

    try {
      const h = gameState.getHuman();
      const target = gameState.getPlayerById(voteTarget);
      addMessage({
        id: `msg_${Date.now()}`,
        sender: h.id,
        senderName: h.name,
        content: `${target?.name || '???'}に投票しました`,
        isHuman: true,
        avatarColor: h.avatarColor,
        avatarBg: h.avatarBg,
        initial: h.initial,
        type: 'vote',
      });

      const aiVotes = await aiRef.current.getAiVotes();
      const allVotes: Record<string, string> = { [h.id]: voteTarget, ...aiVotes };

      const executed = gameLogic.tallyVotes(allVotes);
      if (executed) {
        const executedPlayer = gameState.getPlayerById(executed);
        addSystemMessage(`投票の結果、${executedPlayer?.name || '???'}が処刑されました`);
        gameLogic.handleExecution(executed);
        gameState.save();
      }

      const winner = gameState.checkWinCondition();
      if (winner) {
        setGameOver(winner);
        setTimeout(onGameEnd, 1500);
        setIsProcessing(false);
        return;
      }

      setPhase('night');
      setNightTarget(null);
      addSystemMessage('【夜】能力を使用してください');
    } catch (e) {
      console.error('Vote error:', e);
      addSystemMessage('投票処理でエラーが発生しました。夜フェーズに進みます。');
      setPhase('night');
      setNightTarget(null);
    } finally {
      setIsProcessing(false);
    }
  }, [voteTarget, gameState, gameLogic, addMessage, addSystemMessage, setPhase, setGameOver, onGameEnd]);

  const handleNightConfirm = useCallback(async () => {
    if (!gameState || !gameLogic) return;
    setIsProcessing(true);

    try {
      const h = gameState.getHuman();
      const humanRole = ROLES[gameState.getEffectiveRole(h.id)];

      const actions: Record<string, string> = await aiRef.current.getAiNightActions();

      // Add human action only if alive and has ability
      if (h.isAlive && humanRole?.nightAction && nightTarget) {
        const ability = humanRole.ability;
        if (ability === 'divine') actions.divine = nightTarget;
        else if (ability === 'guard') actions.guard = nightTarget;
        else if (ability === 'attack') actions.attack = nightTarget;
        else if (ability === 'sageDiv') actions.sageDiv = nightTarget;
        else if (ability === 'trap') actions.trap = nightTarget;
        else if (ability === 'heal') actions.heal = nightTarget;
      }

      const result = gameLogic.resolveNight(actions);

      // Show results to human
      if (h.isAlive && result.divineTarget && humanRole?.ability === 'divine') {
        const targetPlayer = gameState.getPlayerById(result.divineTarget);
        addSystemMessage(`占い結果: ${targetPlayer?.name || '???'}は【${result.divineResult === 'werewolf' ? '人狼' : '村人'}】`);
      }

      if (h.isAlive && result.sageTarget && humanRole?.ability === 'sageDiv') {
        const targetPlayer = gameState.getPlayerById(result.sageTarget);
        const targetRole = ROLES[result.sageResult];
        addSystemMessage(`調査結果: ${targetPlayer?.name || '???'}の役職は【${targetRole?.name || '???'}】`);
      }

      if (h.isAlive && result.mediumResult && humanRole?.ability === 'mediumDive') {
        addSystemMessage(`霊能結果: ${result.mediumResult.name}は【${result.mediumResult.result === 'werewolf' ? '人狼' : '村人'}】`);
      }

      if (result.killed.length > 0) {
        result.killed.forEach((id: string) => {
          const p = gameState.getPlayerById(id);
          addSystemMessage(`${p?.name || '???'}が無残な姿で発見されました...`);
        });
      } else {
        addSystemMessage('昨晩は誰も襲撃されませんでした');
      }

      gameState.save();

      const winner = gameState.checkWinCondition();
      if (winner) {
        setGameOver(winner);
        setTimeout(onGameEnd, 1500);
        setIsProcessing(false);
        return;
      }

      // Advance to next day
      gameState.day += 1;
      gameState.phase = 'day';
      gameState.executedToday = null;
      setDay(gameState.day);
      setPhase('day');
      setAiStatementsStarted(false);
      setHumanSpoken(false);
    } catch (e) {
      console.error('Night error:', e);
      addSystemMessage('夜フェーズでエラーが発生しました。次の日に進みます。');
      gameState.day += 1;
      gameState.phase = 'day';
      gameState.executedToday = null;
      setDay(gameState.day);
      setPhase('day');
      setAiStatementsStarted(false);
      setHumanSpoken(false);
    } finally {
      setIsProcessing(false);
    }
  }, [gameState, gameLogic, nightTarget, addSystemMessage, setPhase, setDay, setGameOver, onGameEnd]);

  if (!gameState) return null;

  const humanRole = ROLES[gameState.getEffectiveRole(human?.id)];
  const alive = gameState.getAlive();
  const isNightPhase = state.phase === 'night';
  const humanHasNightAction = humanRole?.nightAction && humanAlive;

  return (
    <div className={`screen screen-game ${isNightPhase ? 'night' : ''}`}>
      {/* Role Reveal Overlay */}
      {state.showRoleReveal && state.humanRole && (
        <RoleReveal roleId={state.humanRole} onClose={() => showRoleReveal(false)} />
      )}

      {/* Header */}
      <div className="game-header">
        <div className="header-left">
          <span className="day-badge">{state.day}日目</span>
          <span className={`phase-badge ${state.phase}`}>
            {state.phase === 'day' ? '☀ 昼' : state.phase === 'vote' ? '🗳 投票' : '🌙 夜'}
          </span>
        </div>
        <div className="header-right">
          {!humanAlive && <span className="dead-badge">💀 観戦中</span>}
          <span className="role-badge" style={{ color: humanRole?.color }}>
            {humanRole?.icon} {humanRole?.name}
          </span>
        </div>
      </div>

      {/* Player List */}
      <div className="player-bar">
        {gameState.players.map((p: any) => (
          <div
            key={p.id}
            className={`player-mini ${!p.isAlive ? 'dead' : ''} ${p.isHuman ? 'is-human' : ''}`}
            title={p.name}
          >
            <div className="mini-avatar" style={{ background: p.avatarBg, color: p.avatarColor }}>
              {p.isAlive ? p.initial : '💀'}
            </div>
            <span className="mini-name">{p.name}</span>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="chat-area" ref={chatContainerRef}>
        {state.messages.map((msg: ChatMessage) => (
          <ChatMessageBubble key={msg.id} {...msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Action Area */}
      <div className="action-area">
        {state.phase === 'day' && !state.isGameOver && humanAlive && (
          <>
            <div className="input-row">
              <input
                type="text"
                className="chat-input"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="発言を入力..."
                disabled={isProcessing}
              />
              <button className="btn btn-send" onClick={handleSendMessage} disabled={isProcessing || !inputText.trim()}>
                送信
              </button>
            </div>
            <div className="action-buttons">
              <button className="btn btn-co" onClick={() => handleCO('role')} disabled={isProcessing}>
                CO
              </button>
              <button className="btn btn-advance" onClick={handleAdvanceToVote} disabled={isProcessing}>
                投票に進む →
              </button>
            </div>
          </>
        )}

        {state.phase === 'day' && !state.isGameOver && !humanAlive && (
          <div className="night-skip">
            <p>あなたは死亡しています。観戦中...</p>
          </div>
        )}

        {state.phase === 'vote' && !state.isGameOver && humanAlive && (
          <VoteGrid
            targets={alive.filter((p: any) => p.id !== human?.id).map((p: any) => ({
              id: p.id,
              name: p.name,
              avatarColor: p.avatarColor,
              avatarBg: p.avatarBg,
              initial: p.initial,
            }))}
            selectedId={voteTarget}
            onSelect={setVoteTarget}
            onConfirm={handleVoteConfirm}
            disabled={isProcessing}
          />
        )}

        {state.phase === 'vote' && !state.isGameOver && !humanAlive && (
          <div className="night-skip">
            <p>投票中... 観戦しています</p>
          </div>
        )}

        {state.phase === 'night' && !state.isGameOver && humanAlive && (
          humanHasNightAction ? (
            <NightAction
              role={gameState.getEffectiveRole(human.id)}
              targets={alive.filter((p: any) => p.id !== human?.id).map((p: any) => ({
                id: p.id,
                name: p.name,
                avatarColor: p.avatarColor,
                avatarBg: p.avatarBg,
                initial: p.initial,
              }))}
              selectedId={nightTarget}
              onSelect={setNightTarget}
              onConfirm={handleNightConfirm}
            />
          ) : (
            <div className="night-skip">
              <p>あなたの役職には夜のアクションがありません</p>
              <button className="btn btn-primary" onClick={handleNightConfirm} disabled={isProcessing}>
                朝を待つ
              </button>
            </div>
          )
        )}

        {state.phase === 'night' && !state.isGameOver && !humanAlive && (
          <div className="night-skip">
            <p>夜が明けるのを待っています...</p>
          </div>
        )}
      </div>
    </div>
  );
}
