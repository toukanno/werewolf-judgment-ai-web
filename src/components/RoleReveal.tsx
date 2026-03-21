// @ts-ignore
import { ROLES, TEAM_INFO } from '../data/roles.js';

interface Props {
  roleId: string;
  onClose: () => void;
}

export function RoleReveal({ roleId, onClose }: Props) {
  const role = ROLES[roleId];
  if (!role) return null;

  const teamInfo = TEAM_INFO[role.team];

  return (
    <div className="role-overlay active" onClick={onClose}>
      <div className="role-reveal-card" onClick={e => e.stopPropagation()}>
        <div className="reveal-header">
          <h2>あなたの役職</h2>
        </div>
        <div className="reveal-body">
          <div className="role-icon">{role.icon}</div>
          <div className="role-name" style={{ color: role.color }}>{role.name}</div>
          <div className="team-name" style={{ color: teamInfo?.displayColor || '#aaa' }}>
            {teamInfo?.name || role.team}
          </div>
          <div className="role-description">{role.description}</div>
        </div>
        <div className="reveal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            了解
          </button>
        </div>
      </div>
    </div>
  );
}
