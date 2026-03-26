interface Props {
  onStart: () => void;
  onGuide: () => void;
}

export function TitleScreen({ onStart, onGuide }: Props) {
  return (
    <div className="screen screen-title">
      <div className="title-container">
        <div className="title-frame">
          <div className="title-logo">🐺</div>
          <h1 className="title-text">人狼<span className="title-ai">AI</span></h1>
          <p className="title-sub">ブラウザで遊べる AI 人狼ゲーム</p>
        </div>
        <div className="title-actions">
          <button className="btn btn-primary btn-large" onClick={onStart}>
            ゲームを始める
          </button>
          <button className="btn btn-ghost" onClick={onGuide}>
            🔑 AI設定ガイド
          </button>
        </div>
        <div className="title-footer">
          <p>5〜20人村対応 ・ API不要でプレイ可能</p>
        </div>
      </div>
    </div>
  );
}
