# rakus

## テトリス - Browser-based Tetris Game

ブラウザで動作するテトリスゲームです。

### 遊び方 (How to Play)

1. `index.html` をブラウザで開いてください
2. キーボードで操作します：
   - ← → : ピースを左右に移動
   - ↓ : ピースを高速落下
   - ↑ : ピースを回転
   - Space : ゲームを一時停止/再開

### 機能 (Features)

- 7種類のテトリスピース（I, O, T, S, Z, J, L）
- スコア、ライン数、レベルの表示
- 次のピースのプレビュー
- ライン消去によるレベルアップ
- ゲームオーバー時の再開機能
- レスポンシブデザイン（モバイル対応）

### ファイル構成 (File Structure)

- `index.html` - メインのHTMLファイル
- `style.css` - ゲームのスタイルシート
- `script.js` - ゲームロジックのJavaScript

### 実行方法 (How to Run)

直接ブラウザで `index.html` を開くか、HTTPサーバーを起動してください：

```bash
python3 -m http.server 8000
# または
npx serve .
```

その後、ブラウザで `http://localhost:8000` にアクセスしてください。