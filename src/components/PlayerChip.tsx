// @ts-ignore
import { ROLES } from '../data/roles.js';

interface Props {
  player: {
    id: string;
    name: string;
    role: string;
    isAlive: boolean;
    avatarColor: string;
    avatarBg: string;
    initial: string;
  };
  showRole?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function PlayerChip({ player, showRole, selected, onClick }: Props) {
  const role = ROLES[player.role];

  return (
    <div
      className={`player-chip ${!player.isAlive ? 'dead' : ''} ${selected ? 'selected' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="chip-avatar" style={{ background: player.avatarBg, color: player.avatarColor }}>
        {player.initial}
      </div>
      <div className="chip-info">
        <span className="chip-name">{player.name}</span>
        {showRole && role && (
          <span className="chip-role" style={{ color: role.color }}>
            {role.icon} {role.name}
          </span>
        )}
      </div>
      {!player.isAlive && <span className="chip-dead-badge">💀</span>}
    </div>
  );
}
