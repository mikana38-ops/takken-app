# 宅建 一問一答 (Vite + PWA)

## セットアップ

```bash
npm install
```

## 開発サーバー

```bash
npm run dev
```

## 本番ビルド

```bash
npm run build
```

## ビルド確認

```bash
npm run preview
```

## スマホで使う

1. `npm run build` 後に `npm run preview -- --host` で同一LAN公開
2. スマホで `http://PCのIP:4173` にアクセス
3. ブラウザの「ホーム画面に追加」を実行

## 補足

- 既存の `takken-ox-171 (2).jsx` を `src/App.jsx` から読み込んでいます。
- `window.storage` が無い環境では `localStorage` を使うフォールバックを `src/main.jsx` に入れています。
