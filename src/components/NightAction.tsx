// @ts-ignore
import { ROLES } from '../data/roles.js';

interface Target {
  id: string;
  name: string;
  avatarColor: string;
  avatarBg: string;
  initial: string;
}

interface Props {
  role: string;
  targets: Target[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onConfirm: () => void;
}

export function NightAction({ role, targets, selectedId, onSelect, onConfirm }: Props) {
  const roleData = ROLES[role];
  if (!roleData || !roleData.nightAction) return null;

  const getActionLabel = () => {
    const ability = roleData.ability;
    if (ability === 'divine') return '占い先を選んでください';
    if (ability === 'guard') return '護衛先を選んでください';
    if (ability === 'attack') return '襲撃先を選んでください';
    if (ability === 'trap') return '罠を仕掛ける先を選んでください';
    if (ability === 'heal') return '治療する相手を選んでください';
    if (ability === 'sageDiv') return '調査先を選んでください';
    return `${roleData.name}の行動先を選んでください`;
  };

  return (
    <div className="night-action-container">
      <h3>{getActionLabel()}</h3>
      <div className="target-grid">
        {targets.map(t => (
          <button
            key={t.id}
            className={`target-btn ${selectedId === t.id ? 'selected' : ''}`}
            onClick={() => onSelect(t.id)}
          >
            <div className="target-avatar" style={{ background: t.avatarBg, color: t.avatarColor }}>
              {t.initial}
            </div>
            <span className="target-name">{t.name}</span>
          </button>
        ))}
      </div>
      <button
        className="btn btn-primary btn-confirm"
        onClick={onConfirm}
        disabled={!selectedId}
      >
        決定
      </button>
    </div>
  );
}
