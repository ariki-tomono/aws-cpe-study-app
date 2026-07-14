# AWS Cloud Practitioner 学習アプリ

AWS Certified Cloud Practitioner (CLF-C02) 試験対策用のReact学習アプリです。  
[AWS Cloud Practitioner Essentials](https://skillbuilder.aws/learn/94T2BEN85A/aws-cloud-practitioner-essentials/8D79F3AVR7) の各Module Summaryを元に、間隔反復学習（SM-2アルゴリズム）で効率的に暗記できます。

## 機能

- **ダッシュボード** — Module別進捗率、今日の学習サマリー、連続学習日数
- **フラッシュカード** — SM-2アルゴリズムによる間隔反復学習。覚えた/曖昧/忘れたの3段階評価
- **クイズ** — 説明→サービス名、サービス名→説明の2形式。Module別フィルタ対応
- **模擬試験** — 全Moduleからランダム20問、10分制限の試験形式
- **学習分析** — 日別学習グラフ、Module別正答率レーダーチャート、苦手カードランキング

## 技術スタック

- Vite + React + TypeScript
- Tailwind CSS
- Zustand（状態管理 + localStorage永続化）
- Recharts（グラフ描画）
- React Router

## セットアップ

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

`dist/` フォルダに静的ファイルが生成されます。Vercel、GitHub Pages等にデプロイ可能です。

## 学習データ

- ブラウザのlocalStorageに保存されます
- 分析画面からリセット可能です
