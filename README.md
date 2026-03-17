# werewolf-judgment-ai-web

人狼ジャッジメント風の AI 対戦 Web アプリ。ブラウザだけで遊べる人狼ゲームです。

## 概要

- プレイヤー（あなた）と AI が同じ村で人狼ゲームを行う
- ユーザーが自分の API キーを入力し、AI プレイヤーの思考に利用する
- 昼の議論・投票、夜の能力行使を繰り返し、村人陣営 or 人狼陣営の勝利を目指す
- 人狼ジャッジメントの役職・ルールをベースにしたオリジナル実装（5〜20人村対応）

## 想定機能

### MVP（最小構成）
- ロビー画面（参加人数・役職構成の選択）
- API キー入力 UI
- ゲーム画面（昼フェーズ / 夜フェーズ）
- AI プレイヤーの発言・投票
- 投票処理と処刑
- 夜の能力行使（占い・護衛・襲撃）
- 勝敗判定
- 結果画面

### 将来拡張
- 追加役職（狂人、霊能者、狐 など）
- 複数 AI モデル対応
- 戦績記録
- リプレイ機能

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | HTML / CSS / Vanilla JS（ビルド不要） |
| AI API | OpenRouter（ユーザーが API キーを入力） |
| デプロイ | 静的ホスティング（GitHub Pages / Vercel） |
| データ | JSON（役職・ルール定義） |

## 画面構成（案）

```
[トップ画面]  →  [ロビー画面]  →  [ゲーム画面]  →  [結果画面]
                  ├ 人数選択          ├ 昼フェーズ
                  ├ 役職構成          │  ├ 議論
                  └ APIキー入力       │  └ 投票
                                     └ 夜フェーズ
                                        ├ 占い
                                        ├ 護衛
                                        └ 襲撃
```

## 実装ステップ

1. リポジトリ初期化・設計ドキュメント整備
2. 役職・ルールのデータ定義
3. 基本 UI（トップ・ロビー・ゲーム・結果画面）
4. ゲーム進行ロジック（フェーズ管理・投票・勝敗判定）
5. AI 応答処理（OpenRouter API 連携）
6. 統合テスト・バランス調整

## デモ

https://werewolf-judgment-ai-web.vercel.app

## 起動方法

```bash
# 方法1: ブラウザで直接開く
open public/index.html

# 方法2: HTTPサーバー経由（推奨）
python3 -m http.server 8080
# → http://localhost:8080/public/index.html にアクセス
```


## 画像生成プロンプトビルダー

`src/ai/image-prompt-builder.js` に、短い要望から画像生成モデル向けの完成プロンプトを生成するユーティリティを追加しています。

```bash
node -e "const b=require('./src/ai/image-prompt-builder'); console.log(b.build('可愛い雰囲気の女性キャラ'))"
```

出力は以下の固定形式です。
- Main Prompt (EN)
- Negative Prompt (EN)
- Intent Summary (JP)
- Variations (3種)

## テスト

```bash
node test/game-test.js
```

ゲームロジック（状態管理・勝敗判定・投票・夜処理・MockAI）の22項目を自動検証します。

## ライセンス

MIT
