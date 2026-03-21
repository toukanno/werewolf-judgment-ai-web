# 人狼ジャッジメントAI Web

人狼ジャッジメント風の雰囲気で遊べる、ブラウザ完結型の人狼ゲームです。プレイヤー1人と複数のAIが同じ村に入り、昼の議論・投票・夜の能力行使を繰り返して勝敗を決めます。

**デモ:** https://werewolf-judgment-ai-web.vercel.app

## 特徴

- **React + TypeScript + Vite で構築**
- **121役職対応** — 市民陣営・人狼陣営・妖狐陣営・恋人陣営・ゾンビ陣営・悪魔陣営・その他
- **5〜20人村対応** — 人数に応じた標準編成＋カスタム編成
- **4つのAIプロバイダ対応** — Groq（無料）/ OpenRouter / OpenAI / Claude（Anthropic）
- **APIキーなしでも遊べる** — MockAIによるオフラインプレイ
- **LINE風チャットUI** — AI発言が1〜2秒間隔で流れる
- **人狼ジャッジメント風ダークテーマ** — 黒背景＋金色フレーム＋赤アクセント
- **ゲーム途中からの再開** — localStorage に自動保存

## 技術スタック

| レイヤー | 内容 |
| --- | --- |
| フロントエンド | React 19 + TypeScript + Vite |
| スタイル | CSS Custom Properties（ダークテーマ）+ M PLUS Rounded 1c |
| AI API | Groq / OpenRouter / OpenAI / Anthropic Claude |
| フォールバック | MockAI（パターンベース） |
| 永続化 | localStorage |
| デプロイ | Vercel（`npm run build` → `dist/`） |

## ローカル起動

```bash
npm install
npm run dev
```

http://localhost:5173/ でアクセス。

## ビルド

```bash
npm run build     # TypeScript チェック + Vite ビルド → dist/
npm run preview   # ビルド結果をローカルで確認
```

## テスト

```bash
npm test          # 33アサーション
```

## ディレクトリ構成

```
index.html                # Vite エントリポイント
vite.config.ts            # Vite 設定
tsconfig.json             # TypeScript 設定
vercel.json               # Vercel デプロイ設定
public/
  favicon.svg             # ファビコン
  og-image.png            # OGP画像
src/
  main.tsx                # React エントリ
  App.tsx                 # 画面ルーティング（title/lobby/game/result/guide）
  App.css                 # ダークテーマCSS
  types/index.ts          # 型定義
  global.d.ts             # JSモジュール型宣言
  components/
    TitleScreen.tsx        # タイトル画面
    LobbyScreen.tsx        # ロビー（人数・役職・API設定）
    GameScreen.tsx         # ゲーム本体（昼/投票/夜）
    ResultScreen.tsx       # 結果画面
    GuideScreen.tsx        # AI設定ガイド
    ChatMessage.tsx        # LINE風吹き出し
    VoteGrid.tsx           # 3列投票グリッド
    NightAction.tsx        # 夜アクションUI
    RoleReveal.tsx         # 役職公開演出
    PlayerChip.tsx         # プレイヤー表示
  hooks/
    useGameState.ts        # ゲーム状態管理（useReducer）
    useAI.ts               # AI発言/投票/夜行動オーケストレーション
  ai/
    openrouter.js          # マルチプロバイダAPIクライアント
    mock.js                # オフラインAI
    image-prompt-builder.js
  game/
    state.js               # GameState（プレイヤー・フェーズ・永続化）
    logic.js               # GameLogic（投票・夜解決・役職相互作用）
  data/
    roles.js               # 121役職定義 + プリセット
    players.js             # 19人のAIプレイヤープロフィール
test/
  game-test.cjs            # ヘッドレステスト（33アサーション）
docs/
  plan.md                  # 設計メモ
```

## AI設定

| プロバイダ | 料金 | 備考 |
| --- | --- | --- |
| なし | 無料 | MockAI（パターンベース）が動作 |
| Groq | 無料 | カード登録不要。高速 |
| OpenRouter | 従量課金 | 複数モデル対応 |
| OpenAI | 従量課金 | GPT-3.5-turbo |
| Claude（Anthropic） | 従量課金 | Claude Sonnet 4。高品質な日本語 |

ロビー画面のコンボボックスで選択し、APIキーを入力。エラー時は自動でMockAIにフォールバック。

## ライセンス

MIT
