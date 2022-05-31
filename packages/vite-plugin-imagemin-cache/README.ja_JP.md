# @macropygia/vite-plugin-imagemin-cache

[English](README.md) | **日本語**

バンドル・静的ファイルに対してimageminを実行するViteプラグイン（永続化キャッシュつき）

## Usage

```js
import { defineConfig } from 'vite'
import vitePluginImageminCache from '@macropygia/vite-plugin-imagemin-cache'

export default defineConfig({
  plugins: [
    vitePluginImageminCache(),
  ],
})
```

## 標準設定

```js
vitePluginImageminCache(
  {
    cacheDir: 'node_modules/.imagemin',
    expireDuration: 864000, // 10日
    countToExpire: 10,
    concurrency: os.cpus().length,
    plugins: {} // 設定が空の場合は標準設定で動作
  }
),
```

## Imageminプラグイン設定記述例

```js
vitePluginImageminCache(
  {
    plugins: {
      pngquant: { speed: 3, quality: [0.3, 0.5] },
      optipng: { optimizationLevel: 3 },
      mozjpeg: { quality: 60 },
      svgo: { plugins: [ ... ] },
      webp: false, // 使用しない場合
    }
  }
),
```

## キャッシュの自動削除

以下の条件を両方満たしたキャッシュファイルは自動的に削除される

- 直近の `countToExpire` 回のビルドで使用されていない
- 最後に使用してから `expireDuration` 秒以上経過している
