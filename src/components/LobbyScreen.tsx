import { useState, useCallback } from 'react';
import type { GameConfig, ApiProvider } from '../types';
// @ts-ignore
import { ROLES, DEFAULT_PRESETS, ROLE_CATEGORIES, TEAM_INFO, validateComposition, getCompositionText } from '../data/roles.js';

interface Props {
  onStartGame: (config: GameConfig) => void;
  onBack: () => void;
}

export function LobbyScreen({ onStartGame, onBack }: Props) {
  const [playerName, setPlayerName] = useState('');
  const [playerCount, setPlayerCount] = useState(7);
  const [preset, setPreset] = useState<'standard' | 'advanced' | 'custom'>('standard');
  const [customComposition, setCustomComposition] = useState<Record<string, number>>({});
  const [apiProvider, setApiProvider] = useState<ApiProvider>('none');
  const [apiKey, setApiKey] = useState('');
  const [testStatus, setTestStatus] = useState<string>('');

  const getComposition = useCallback(() => {
    if (preset === 'custom') return customComposition;
    return DEFAULT_PRESETS[playerCount]?.composition || {};
  }, [preset, playerCount, customComposition]);

  const handleCountChange = (count: number) => {
    setPlayerCount(count);
    if (preset !== 'custom') {
      setCustomComposition(DEFAULT_PRESETS[count]?.composition || {});
    }
  };

  const handlePresetChange = (p: 'standard' | 'advanced' | 'custom') => {
    setPreset(p);
    if (p !== 'custom') {
      setCustomComposition(DEFAULT_PRESETS[playerCount]?.composition || {});
    }
  };

  const handleRoleCountChange = (roleId: string, delta: number) => {
    setCustomComposition(prev => {
      const next = { ...prev };
      const current = next[roleId] || 0;
      const newVal = Math.max(0, current + delta);
      if (newVal === 0) {
        delete next[roleId];
      } else {
        next[roleId] = newVal;
      }
      return next;
    });
  };

  const handleTestApi = async () => {
    if (!apiKey || apiProvider === 'none') return;
    setTestStatus('テスト中...');
    try {
      // @ts-ignore
      const { OpenRouterAI } = await import('../ai/openrouter.js');
      const ok = await OpenRouterAI.testConnection(apiKey, apiProvider);
      setTestStatus(ok ? '✓ 接続成功' : '✗ 接続失敗');
    } catch {
      setTestStatus('✗ エラー');
    }
  };

  const handleStart = () => {
    const name = playerName.trim() || 'プレイヤー';
    const comp = getComposition();
    const validation = validateComposition(comp);
    if (preset === 'custom' && !validation.isValid) {
      alert(validation.error || '構成が無効です');
      return;
    }
    onStartGame({
      playerName: name,
      playerCount,
      preset,
      composition: comp,
      apiProvider,
      apiKey,
    });
  };

  const comp = getComposition();
  const validation = preset === 'custom' ? validateComposition(comp) : { isValid: true, playerCount };

  // Group roles by category
  const rolesByCategory: Record<string, any[]> = {};
  ROLE_CATEGORIES.forEach((cat: string) => {
    const roles = Object.values(ROLES).filter((r: any) => r.category === cat);
    if (roles.length > 0) rolesByCategory[cat] = roles;
  });

  return (
    <div className="screen screen-lobby">
      <div className="lobby-container">
        <div className="lobby-header">
          <button className="btn btn-ghost" onClick={onBack}>&larr; 戻る</button>
          <h2>ロビー</h2>
        </div>

        <div className="lobby-section">
          <label className="lobby-label">プレイヤー名</label>
          <input
            type="text"
            className="input-field"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="名前を入力"
            maxLength={10}
          />
        </div>

        <div className="lobby-section">
          <label className="lobby-label">参加人数: {playerCount}人</label>
          <input
            type="range"
            min={5}
            max={20}
            value={playerCount}
            onChange={e => handleCountChange(Number(e.target.value))}
            className="range-slider"
          />
          <div className="range-labels">
            <span>5人</span><span>20人</span>
          </div>
        </div>

        <div className="lobby-section">
          <label className="lobby-label">役職プリセット</label>
          <div className="preset-buttons">
            {(['standard', 'advanced', 'custom'] as const).map(p => (
              <button
                key={p}
                className={`preset-btn ${preset === p ? 'active' : ''}`}
                onClick={() => handlePresetChange(p)}
              >
                {p === 'standard' ? 'スタンダード' : p === 'advanced' ? '上級' : 'カスタム'}
              </button>
            ))}
          </div>
        </div>

        {preset !== 'custom' && (
          <div className="composition-preview">
            <span className="comp-label">構成: </span>
            <span className="comp-text">{getCompositionText(comp)}</span>
          </div>
        )}

        {preset === 'custom' && (
          <div className="role-selector">
            {Object.entries(rolesByCategory).map(([category, roles]) => (
              <div key={category} className="role-section">
                <h4 className="team-header">{category}</h4>
                <div className="role-cards">
                  {(roles as any[]).map(role => (
                    <div
                      key={role.id}
                      className="role-card"
                      style={{ borderColor: role.color }}
                    >
                      <span className="role-icon">{role.icon}</span>
                      <span className="role-name" style={{ color: role.color }}>{role.name}</span>
                      <div className="role-controls">
                        <button className="role-btn" onClick={() => handleRoleCountChange(role.id, -1)}>−</button>
                        <span className="role-count">{customComposition[role.id] || 0}</span>
                        <button className="role-btn" onClick={() => handleRoleCountChange(role.id, 1)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="composition-summary">
              <span className={validation.isValid ? 'valid-icon' : 'invalid-icon'}>
                {validation.isValid ? '✓' : '✗'}
              </span>
              合計: {Object.values(customComposition).reduce((a: number, b: number) => a + b, 0)}人
              {!validation.isValid && <span className="error-text"> - {(validation as any).error}</span>}
            </div>
          </div>
        )}

        <div className="lobby-section">
          <label className="lobby-label">AI設定</label>
          <select
            className="input-field"
            value={apiProvider}
            onChange={e => setApiProvider(e.target.value as ApiProvider)}
          >
            <option value="none">なし（パターンAI）</option>
            <option value="groq">Groq</option>
            <option value="openrouter">OpenRouter</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Claude（Anthropic）</option>
          </select>
          {apiProvider !== 'none' && (
            <div className="api-key-row">
              <input
                type="password"
                className="input-field"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="APIキーを入力"
              />
              <button className="btn btn-small" onClick={handleTestApi}>テスト</button>
              {testStatus && <span className="test-status">{testStatus}</span>}
            </div>
          )}
        </div>

        <button
          className="btn btn-primary btn-large btn-start"
          onClick={handleStart}
          disabled={!playerName.trim() || (preset === 'custom' && !validation.isValid)}
        >
          ゲーム開始
        </button>
      </div>
    </div>
  );
}
