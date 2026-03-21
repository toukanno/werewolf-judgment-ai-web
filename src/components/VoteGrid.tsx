interface VoteTarget {
  id: string;
  name: string;
  avatarColor: string;
  avatarBg: string;
  initial: string;
}

interface Props {
  targets: VoteTarget[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onConfirm: () => void;
  disabled?: boolean;
}

export function VoteGrid({ targets, selectedId, onSelect, onConfirm, disabled }: Props) {
  return (
    <div className="vote-container">
      <h3 className="vote-title">投票先を選んでください</h3>
      <div className="vote-grid">
        {targets.map(t => (
          <button
            key={t.id}
            className={`vote-btn ${selectedId === t.id ? 'selected' : ''}`}
            onClick={() => onSelect(t.id)}
            disabled={disabled}
          >
            <div className="vote-avatar" style={{ background: t.avatarBg, color: t.avatarColor }}>
              {t.initial}
            </div>
            <span className="vote-name">{t.name}</span>
          </button>
        ))}
      </div>
      <button
        className="btn btn-primary btn-confirm"
        onClick={onConfirm}
        disabled={!selectedId || disabled}
      >
        決定
      </button>
    </div>
  );
}
