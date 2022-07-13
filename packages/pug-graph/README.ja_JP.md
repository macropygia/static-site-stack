# @macropygia/pug-graph

[![npm version](https://img.shields.io/npm/v/@macropygia/pug-graph.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/pug-graph)
[![MIT](https://img.shields.io/npm/l/@macropygia/pug-graph?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pug](https://img.shields.io/badge/Pug-a86454?style=flat-square&logo=pug&logoColor=white)](https://pugjs.org/)

[English](README.md) | **日本語**

Pugの `include` と `extends` を解析して依存関係を取得する

- このパッケージは開発中です
    - パッチリリースを含め予告なく破壊的変更が行われる可能性があります
    - 変更点は [CHANGELOG](CHANGELOG.md) をご覧ください
- 実行前にPrettierの [@prettier/plugin-pug](https://www.npmjs.com/package/@prettier/plugin-pug) を使用してフォーマットすることを推奨
- 半角スペースのみインデントとして認識する

## インストール

```shell
npm install @macropygia/pug-graph
```

## 使用方法

```js
import fg from 'fast-glob'
import PugGraph from '@macropygia/pug-graph'

// 初期化
const graph = new PugGraph({ baseDir: 'src' })

// 追加
await graph.parse('src/foo.pug')

// 再帰的に追加
await graph.parse('src/foo.pug', { recursive: true })

// 更新
await graph.parse('src/foo.pug')

// 削除
graph.unlink('src/foo.pug')

// 複数ファイルの処理
const files = fg.sync('src/**/[^_]*.pug')
await Promise.all(
  files.map((file) =>
    graph.parse(file, { recursive: true })
  )
)

// 依存関係を取得
const fooDependsOn = graph.getImportedFiles('src/foo.pug')
const barIsImportedBy = graph.getImporters('src/templates/mixins/_bar.pug', {
  ignorePartial: true,
})

// 終了
graph.exit()
```

## API

### constructor(options)

| Parameter            | Type      | Default | Required |
| -------------------- | --------- | ------- | -------- |
| `options.baseDir`    | `string`  | `""`    | No       |
| `options.useAbsPath` | `boolean` | `false` | No       |

- `options.baseDir`
    - Pugの同名オプションと同一
- `options.useAbsPath`
    - 絶対パスを使用する

### parse(filepath, options)

| Parameter                   | Type      | Default | Required |
| --------------------------- | --------- | ------- | -------- |
| `filepath`                  | `string`  |         | Yes      |
| `options.insertOnly`        | `boolean` | `false` | No       |
| `options.recursive`         | `boolean` | `false` | No       |
| `options.updateDescendants` | `boolean` | `false` | No       |

- 非同期
- `options.insertOnly`
    - データベース上に存在する場合はスキップする
- `options.recursive`
    - 再帰的に実行する
    - データベース上に存在する子孫はスキップする
- `options.updateDescendants`
    - データベース上に存在する子孫も更新する

### getImportedFiles(filepath)

| Parameter  | Type     | Default | Required |
| ---------- | -------- | ------- | -------- |
| `filepath` | `string` |         | Yes      |

- Returns: `Set<string>`

### getImporters(filepath, ignorePartial)

| Parameter       | Type      | Default | Required |
| --------------- | --------- | ------- | -------- |
| `filepath`      | `string`  |         | Yes      |
| `ignorePartial` | `boolean` | `false` | No       |

- Returns: `Set<string>`

### unlink(filepath)

| Parameter  | Type     | Default | Required |
| ---------- | -------- | ------- | -------- |
| `filepath` | `string` |         | Yes      |

### getRawData()

- Returns: `object[]`
- データベースの全レコードのオブジェクト配列を返す

### exit()

- データベースを閉じて終了する
