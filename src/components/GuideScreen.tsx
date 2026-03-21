interface Props {
  onBack: () => void;
}

export function GuideScreen({ onBack }: Props) {
  return (
    <div className="screen screen-guide">
      <div className="guide-page">
        <h1>🔑 AI設定ガイド</h1>
        <p className="guide-subtitle">人狼ジャッジメントAI — APIキー設定の説明</p>

        <section className="guide-section">
          <h2>🎮 APIキーなしの場合</h2>
          <p>APIキーを入力しない場合は、プログラムベースのAIが自動的に動きます。</p>
          <div className="guide-highlight">登録不要で今すぐ遊べます。AIは性格に基づいた自然な発言をします。</div>
          <p>まずはAPIキーなしで遊んでみて、もっと高度なAIの発言が欲しくなったらAPIキーを設定してみてください。</p>
        </section>

        <section className="guide-section">
          <h2>⚡ Groq APIキーの取得手順 <span className="badge-free">完全無料</span></h2>
          <p>Groqは高速なAI推論サービスで、完全無料で利用できます。クレジットカード登録も不要です。</p>
          <div className="guide-step">
            <span className="step-num">1</span>
            <span className="step-text">
              <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">https://console.groq.com</a> にアクセスします。
            </span>
          </div>
          <div className="guide-step">
            <span className="step-num">2</span>
            <span className="step-text">Googleアカウント等でサインアップします（無料）。メールアドレスでも登録できます。</span>
          </div>
          <div className="guide-step">
            <span className="step-num">3</span>
            <span className="step-text">ログイン後、左メニューの「API Keys」ページに移動し、「Create API Key」ボタンでキーを生成します。</span>
          </div>
          <div className="guide-step">
            <span className="step-num">4</span>
            <span className="step-text">生成されたキー（gsk_...で始まる文字列）をコピーして、ゲームの設定画面のAPIキー欄に貼り付けます。</span>
          </div>
          <div className="guide-highlight">Groqは完全無料で、クレジットカード登録不要です。レート制限はありますが、通常のゲームプレイには十分です。</div>
        </section>

        <section className="guide-section">
          <h2>🤖 OpenRouter APIキーの場合 <span className="badge-paid">従量課金</span></h2>
          <p>OpenRouterは複数のAIモデル（Claude, GPT-4等）にアクセスできるサービスです。</p>
          <div className="guide-step">
            <span className="step-num">1</span>
            <span className="step-text">
              <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">https://openrouter.ai</a> にアクセスし、アカウントを作成します。
            </span>
          </div>
          <div className="guide-step">
            <span className="step-num">2</span>
            <span className="step-text">クレジットを購入し（最低$5から）、APIキーを生成します。</span>
          </div>
          <div className="guide-step">
            <span className="step-num">3</span>
            <span className="step-text">キー（sk-or-v1-...で始まる文字列）をゲームの設定画面に入力します。</span>
          </div>
          <p className="guide-warning">⚠ OpenRouterは従量課金のため、使用量にご注意ください。1ゲームあたり数円〜数十円程度です。</p>
        </section>

        <section className="guide-section">
          <h2>🔓 OpenAI APIキーの場合 <span className="badge-paid">従量課金</span></h2>
          <p>OpenAIのAPIを直接利用する場合です。</p>
          <div className="guide-step">
            <span className="step-num">1</span>
            <span className="step-text">
              <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">https://platform.openai.com</a> でアカウントを作成します。
            </span>
          </div>
          <div className="guide-step">
            <span className="step-num">2</span>
            <span className="step-text">API Keysページでキーを生成し、ゲーム設定画面に入力します。</span>
          </div>
        </section>

        <button className="btn btn-ghost guide-back" onClick={onBack}>← ゲームに戻る</button>
      </div>
    </div>
  );
}
