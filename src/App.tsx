import { useState, useCallback } from 'react';
import type { Screen, GameConfig } from './types';
import { useGameState } from './hooks/useGameState';
import { TitleScreen } from './components/TitleScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { GuideScreen } from './components/GuideScreen';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const game = useGameState();

  const handleStartGame = useCallback((config: GameConfig) => {
    game.initGame(config);
    setScreen('game');
  }, [game]);

  const handleGameEnd = useCallback(() => {
    setScreen('result');
  }, []);

  const handleRestart = useCallback(() => {
    game.reset();
    setScreen('lobby');
  }, [game]);

  const handleBackToTitle = useCallback(() => {
    game.reset();
    setScreen('title');
  }, [game]);

  return (
    <div className="app">
      {screen === 'title' && (
        <TitleScreen onStart={() => setScreen('lobby')} onGuide={() => setScreen('guide')} />
      )}
      {screen === 'lobby' && (
        <LobbyScreen onStartGame={handleStartGame} onBack={() => setScreen('title')} />
      )}
      {screen === 'game' && (
        <GameScreen game={game} onGameEnd={handleGameEnd} />
      )}
      {screen === 'result' && (
        <ResultScreen
          game={game}
          onRestart={handleRestart}
          onBackToTitle={handleBackToTitle}
        />
      )}
      {screen === 'guide' && (
        <GuideScreen onBack={() => setScreen('title')} />
      )}
    </div>
  );
}
