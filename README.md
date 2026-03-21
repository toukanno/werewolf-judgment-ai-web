# 人狼ジャッジメントAI Web

人狼ジャッジメント風の雰囲気で遊べる、ブラウザ完結型の人狼ゲームです。プレイヤー 1 人と複数の AI が同じ村に入り、昼の議論・投票・夜の能力行使を繰り返して勝敗を決めます。フレームワークやビルド工程は不要で、`public/index.html` をそのまま配信すれば動作します。

**デモ:** https://werewolf-judgment-ai-web.vercel.app

## 特徴

- **ブラウザだけで動作する静的 Web アプリ**
  - HTML / CSS / Vanilla JS のみで構成されています。
  - npm 依存やビルドステップはありません。
- **5〜20 人村に対応**
  - 人数に応じた標準編成を用意しています。
  - ロビーで人数変更・役職プリセット選択・カスタム編成が可能です。
- **API キーなしでも遊べる**
  - 未設定時は `MockAI` によるオフライン風の AI が動作します。
  - API キーを設定すると OpenRouter 経由の AI 発言・行動に切り替えられます。
- **ゲーム途中からの再開に対応**
  - ゲーム状態は `localStorage` に保存され、次回アクセス時に復帰できます。
- **補助ドキュメント付き**
  - `public/guide.html` に API キー設定ガイドがあります。
  - `docs/` に設計メモやテスト分析があります。
- **おまけユーティリティを同梱**
  - `src/ai/image-prompt-builder.js` に画像生成向けプロンプトビルダーがあります。

## 現在の実装内容

### ゲームフロー

1. **タイトル画面**
2. **ロビー画面**
   - 参加人数（5〜20 人）
   - 役職プリセット（スタンダード / 上級 / カスタム）
   - プレイヤー名入力
   - API キー入力（任意）
3. **ゲーム画面**
   - 昼フェーズの議論
   - 投票と処刑
   - 夜フェーズの能力行使
4. **結果画面**
   - 勝利陣営表示
   - 生存 / 死亡状態の確認

### 実装済みの主な要素

- AI プレイヤーの発言生成
- AI / プレイヤーの投票処理
- 夜の占い・護衛・襲撃などの処理
- 勝敗判定
- 役職に応じた一部特殊処理
- ログ表示と途中再開
- 簡易 Markdown 表示

## 技術スタック

| レイヤー | 内容 |
| --- | --- |
| フロントエンド | HTML / CSS / Vanilla JS |
| AI API | OpenRouter（ユーザー入力の API キーを利用） |
| フォールバック AI | MockAI |
| 永続化 | localStorage |
| デプロイ | Vercel などの静的ホスティング |

## ディレクトリ構成

```text
public/
  index.html      # アプリ本体
  style.css       # UI スタイル
  app.js          # ゲーム進行制御
  guide.html      # API キー設定ガイド
src/
  ai/
    mock.js
    openrouter.js
    image-prompt-builder.js
  data/
    players.js
    players.json
    roles.js
    roles.json
  game/
    logic.js
    state.js
  ui/
    game-ui.js
    screens.js
test/
  game-test.js
  image-prompt-builder-test.js
docs/
  plan.md
  test-coverage-analysis.md
```

## ローカルでの起動方法

ビルドは不要です。以下のどちらかで確認できます。

### 1. 直接ブラウザで開く

```bash
open public/index.html
```

### 2. ローカル HTTP サーバーで開く（推奨）

```bash
python3 -m http.server 8080
```

その後、次の URL にアクセスしてください。

```text
http://localhost:8080/public/index.html
```

## AI 利用について

### API キーなし

- そのままゲームを開始できます。
- 組み込みの `MockAI` が発言・投票・夜行動を担当します。

### API キーあり

- ロビー画面の API キー欄に入力します。
- 接続テストボタンで簡易確認ができます。
- 現在の OpenRouter モデル既定値は `anthropic/claude-sonnet-4` です。
- API エラー時は自動で `MockAI` にフォールバックします。

詳しい手順は `public/guide.html` を参照してください。

## Markdown 表示

ゲーム中のメッセージ欄は簡易 Markdown 表示に対応しています。使用できる主な記法は次の通りです。

- 見出し: `#` / `##` / `###`
- 強調: `**太字**` / `*斜体*`
- コード: `` `code` ``
- リスト: `- item`
- 引用: `> quote`
- リンク: `[label](https://example.com)`

## テスト

Node.js があれば、次のコマンドで基本チェックを実行できます。

```bash
node test/game-test.js
node test/image-prompt-builder-test.js
```

### テスト内容

- プレイヤー初期化
- 役職配分
- 勝敗判定
- 投票集計
- 夜処理
- MockAI の応答
- 画像プロンプトビルダー出力

## 画像生成プロンプトビルダー

`src/ai/image-prompt-builder.js` には、短い日本語要望から画像生成向けの整形済みプロンプトを出力する補助機能があります。

```bash
node -e "const b=require('./src/ai/image-prompt-builder'); console.log(b.build('可愛い雰囲気の女性キャラ'))"
```

出力形式は以下の固定構成です。

- Main Prompt (EN)
- Negative Prompt (EN)
- Intent Summary (JP)
- Variations（3種）

## デプロイ

このリポジトリは静的アプリとして配信できます。Vercel 用の設定は `vercel.json` に含まれています。

## ライセンス

MIT

## License

MIT

## Development Rules

- [AGENTS.md](./AGENTS.md) — Sub-agent configuration for Claude Code / Codex
- Commits must pass CI before merging to main
- Use feature branches + pull requests for all changes
