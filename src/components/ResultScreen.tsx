// @ts-ignore
import { ROLES, TEAM_INFO } from '../data/roles.js';

interface Props {
  game: any;
  onRestart: () => void;
  onBackToTitle: () => void;
}

export function ResultScreen({ game, onRestart, onBackToTitle }: Props) {
  const { state } = game;
  const { gameState, winner } = state;

  if (!gameState) return null;

  const winnerTeamInfo = TEAM_INFO[winner] || { name: winner || '???', displayColor: '#aaa' };

  const getWinnerLabel = () => {
    if (winner === 'village') return '村人陣営の勝利！';
    if (winner === 'werewolf') return '人狼陣営の勝利！';
    if (winner === 'fox') return '妖狐の勝利！';
    if (winner === 'lover') return '恋人たちの勝利！';
    if (winner === 'zombie') return 'ゾンビ陣営の勝利！';
    return `${winnerTeamInfo.name}の勝利！`;
  };

  const human = gameState.getHuman();
  const humanRole = ROLES[human?.role];
  const humanTeam = humanRole?.team;
  const isHumanWin = humanTeam === winner;

  return (
    <div className="screen screen-result">
      <div className="result-container">
        <div className="result-banner" style={{ borderColor: winnerTeamInfo.displayColor }}>
          <h1 className="result-title" style={{ color: winnerTeamInfo.displayColor }}>
            {getWinnerLabel()}
          </h1>
          <p className={`result-subtitle ${isHumanWin ? 'win' : 'lose'}`}>
            {isHumanWin ? '🎉 あなたの勝利！' : '💀 あなたの敗北...'}
          </p>
        </div>

        <div className="result-players">
          <h3>全プレイヤー</h3>
          <div className="result-grid">
            {gameState.players.map((p: any) => {
              const role = ROLES[p.role];
              const teamInfo = TEAM_INFO[role?.team];
              return (
                <div key={p.id} className={`result-card ${!p.isAlive ? 'dead' : ''}`}>
                  <div className="result-avatar" style={{ background: p.avatarBg, color: p.avatarColor }}>
                    {p.initial}
                  </div>
                  <div className="result-info">
                    <span className="result-name">{p.name}{p.isHuman ? ' (あなた)' : ''}</span>
                    <span className="result-role" style={{ color: role?.color }}>
                      {role?.icon} {role?.name}
                    </span>
                    <span className="result-team" style={{ color: teamInfo?.displayColor }}>
                      {teamInfo?.name}
                    </span>
                  </div>
                  <span className="result-status">
                    {p.isAlive ? '生存' : '死亡'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="result-actions">
          <button className="btn btn-primary btn-large" onClick={onRestart}>
            もう一度
          </button>
          <button className="btn btn-ghost btn-large" onClick={onBackToTitle}>
            タイトルへ
          </button>
        </div>
      </div>
    </div>
  );
}
