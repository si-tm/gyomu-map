# 業務マップ AI活用共有サイト

部内の業務マップをベースに、AI活用のアイデアをメンバー全員で共有・蓄積するWebサイトです。

## 画面イメージ

```
               │ 1 管理/計画 │ 2 受付/確認 │ 3 作業依頼/調整 │ 4 実作業 │ 5 報告/分析 │
───────────────┼─────────────┼─────────────┼─────────────────┼──────────┼─────────────┤
  多摩監視     │  業務名...  │             │                 │          │             │
               │  💬1 ✨5   │             │                 │          │             │
───────────────┼─────────────┼─────────────┼─────────────────┼──────────┼─────────────┤
  業務調査     │             │             │                 │          │             │
───────────────┼─────────────┼─────────────┼─────────────────┼──────────┼─────────────┤
  運用作業     │             │             │                 │          │             │
───────────────┼─────────────┼─────────────┼─────────────────┼──────────┼─────────────┤
  内部業務     │  業務名...  │             │                 │          │             │
               │  💬2 ✨9   │             │                 │          │             │
```

セルをクリックすると詳細モーダルが開き、以下の操作ができます。

- 💡 / 👍 / ⭐ **リアクション** — 共感したアイデアに反応
- 💬 **コメント投稿** — AI活用のアイデアや気づきを書き込む
- 📎 **ファイル添付** — HTML・PDF・Excelなどの手順書をアップロード

---

## 技術スタック

| 用途 | 技術 |
|------|------|
| フロントエンド | Next.js 15 + TypeScript + Tailwind CSS |
| ホスティング | S3 + CloudFront |
| バックエンドAPI | AWS Lambda (Node.js 20) + API Gateway (HTTP API) |
| データベース | DynamoDB (コメント・リアクション) |
| ファイル保存 | S3 |
| インフラ管理 | CloudFormation |
| 開発環境 | Dev Container (Node.js 20 + AWS CLI) |

---

## ローカル開発

### 前提条件

- Docker Desktop（Dev Container 使用時）
- または Node.js 20+

### セットアップ

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

### ビルド

```bash
npm run build
# out/ ディレクトリに静的ファイルが生成されます
```

---

## データの編集方法

業務マップのデータは `src/data/businessMap.json` で管理しています。
PowerPointのデータをこのファイルに反映することで画面に反映されます。

### セルIDの命名規則

```
{行ID}__{列ID}
```

| 行ID | 業務種類 |
|------|---------|
| `tama-kanshi` | 多摩監視 |
| `gyomu-chosa` | 業務調査 |
| `unyo-sagyo` | 運用作業 |
| `naibu-gyomu` | 内部業務 |

| 列ID | 作業種類 |
|------|---------|
| `kanri-keikaku` | 1 管理/計画 |
| `uketsuke-kakunin` | 2 受付/確認 |
| `irai-chosei` | 3 作業依頼/調整 |
| `jissagyo` | 4 実作業 |
| `hokoku-bunseki` | 5 報告/分析 |

### セルデータの例

```json
{
  "cells": {
    "tama-kanshi__kanri-keikaku": {
      "tasks": [
        { "id": "t1", "label": "監視計画の策定・更新" }
      ],
      "comments": [],
      "attachments": [],
      "reactions": { "idea": 0, "good": 0, "want": 0 }
    }
  }
}
```

---

## AWSへのデプロイ

### 1. インフラ構築（初回のみ）

```bash
aws cloudformation deploy \
  --template-file infrastructure/cloudformation/template.yaml \
  --stack-name gyomu-map \
  --capabilities CAPABILITY_NAMED_IAM \
  --region ap-northeast-1
```

デプロイ後、スタックのOutputsからURLとバケット名を確認します。

```bash
aws cloudformation describe-stacks \
  --stack-name gyomu-map \
  --query "Stacks[0].Outputs" \
  --output table
```

### 2. フロントエンドのデプロイ

```bash
npm run build
aws s3 sync out/ s3://<WebsiteBucketName>/
aws cloudfront create-invalidation \
  --distribution-id <CloudFrontId> \
  --paths "/*"
```

### 3. Teams タブへの追加

1. 対象のTeamsチャンネルを開く
2. タブの「+」ボタン →「Web サイト」を選択
3. URL に `WebsiteURL` の値を貼り付けて保存

---

## コスト目安

80人規模の社内利用を想定した概算です。

| サービス | 月額目安 |
|---------|---------|
| S3（ホスティング） | ~$0 |
| CloudFront | ~$0–1 |
| Lambda + API Gateway | ~$0（無料枠内） |
| DynamoDB（オンデマンド） | ~$0–1 |
| S3（ファイルアップロード） | ~$0–1 |
| **合計** | **$1–5 程度** |

---

## ディレクトリ構成

```
.
├── .devcontainer/
│   └── devcontainer.json          # Dev Container 設定
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── BusinessMap.tsx        # マトリックスグリッド
│   │   └── CellModal.tsx          # セル詳細モーダル
│   ├── data/
│   │   └── businessMap.json       # ★ 業務マップデータ（ここを編集）
│   └── types/
│       └── index.ts
└── infrastructure/
    └── cloudformation/
        └── template.yaml          # AWS インフラ定義
```

---

## 今後の予定（Phase 2）

- [ ] コメント・リアクションのDynamoDB永続化（Lambda API実装）
- [ ] ファイルアップロードのS3連携
- [ ] businessMap.jsonの管理画面（PowerPointからの変換ツール）
