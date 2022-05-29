import { createReadStream } from 'fs'
import path from 'path'

import Loki from 'lokijs'

export interface UserSettings {
  baseDir: string
  // persistent?: boolean | string
  // indentChar?: string
  useAbsPath?: boolean
  // formatBeforeParse?: boolean
  verbose?: boolean
  // ignoreError?: boolean
}

export interface Settings {
  baseDir: string
  // persistent: boolean | string
  // indentChar: string
  useAbsPath: boolean
  // formatBeforeParse: boolean
  verbose: boolean
  // ignoreError?: boolean
}

export interface DepsRecord {
  path: string
  deps: string[]
}

export interface ParseLinesAccumulator {
  deps: Set<string>
  commentPrefix: string | null
  row: number
}

export interface CommentRegExpMatchArray {
  groups: {
    indent: string
  }
}

export interface ExternalRegExpMatchArray {
  groups: {
    type: string
    path: string
  }
}

export interface DepsResult extends LokiObj {
  path: string
  deps: string[]
}

/**
 * paserFile用設定
 *
 * @param recursive - 再帰的に解析するかどうか
 * @param insertOnly - 新規追加時のみ記録する
 */
export interface ParseSettigs {
  recursive: boolean
  insertOnly: boolean
}

/**
 * Default settings
 */
const defaultSettings: Settings = {
  baseDir: '',
  // persistent: false,
  // indentChar: ' ',
  useAbsPath: false,
  // formatBeforeParse: false,
  verbose: false,
  // ignoreError: false,
}

/**
 * @beta
 */
class PugGraph {
  /* eslint-disable @typescript-eslint/lines-between-class-members */
  #settings: Settings
  #db: Loki
  #deps: Loki.Collection

  // コメント検出用RegExp
  // - indentグループ: 行頭から連続した0個以上の半角スペース
  #reFindComment = /^(?<indent> *)\/\//

  // 外部ファイル読込(extends/include)検出用RegExp
  // - typeグループ: 行頭から0個以上のホワイトスペースを挟んで出現した `extends` または `include`
  // - pathグループ: typeグループの後に1個以上のホワイトスペースを挟んで出現した
  //                 1文字以上の連続したホワイトスペース以外の文字列
  #reFindExternal = /^\s*(?<type>extends|include)\s+(?<path>\S+)/
  /* eslint-enable */

  /**
   * Creates an instance of PugGraph.
   *
   * @param userSettings - ユーザ設定
   */
  constructor(userSettings: UserSettings) {
    const settings: Settings = {
      ...defaultSettings,
      ...userSettings,
    }
    this.#settings = settings
    /*
    if (settings.persistent) {
      const dbFilename =
        typeof settings.persistent === 'string'
          ? settings.persistent
          : 'PugGraph.db'
      this.#db = new Loki(dbFilename, {
        autoload: true,
        autoloadCallback: () => {
          this.#deps =
            this.#db.getCollection('PugGraph') ||
            this.#db.addCollection('PugGraph', {
              unique: ['path'],
              indices: ['path'],
            })
        },
        autosave: true,
        autosaveInterval: 4000,
      })
      return
    }
    */
    this.#db = new Loki('PugGraph.db')
    this.#deps = this.#db.addCollection('PugGraph', {
      unique: ['path'],
      indices: ['path'],
    })
  }

  /**
   * DBにファイルのレコードが存在するかどうか
   *
   * @param filepath - cwdからの相対パスまたは絶対パス
   * @returns レコードの存否
   */
  #existsRecord(filepath: string): boolean {
    if (this.#deps.findOne({ path: filepath })) return true
    return false
  }

  /**
   * DBの依存関係を更新
   * - 存在しなければファイルのレコードを追加
   *
   * @param filepath - cwdからの相対パスまたは絶対パス
   * @param deps - include/extendsで読み込んでいるファイルのSet
   * @param insertOnly - 新規追加のみ許可する
   */
  #upsertDeps(filepath: string, deps: Set<string>, insertOnly = false) {
    const newDeps: string[] = Array.from(deps)
    if (this.#deps.findOne({ path: filepath })) {
      if (insertOnly) return
      // Insert
      this.#deps
        .chain()
        .find({ path: filepath })
        .update((item: DepsRecord) => {
          item.deps = newDeps
        })
      // 更新不要だったらfalseを返したい
    } else {
      // Update
      this.#deps.insert({
        path: filepath,
        deps: newDeps,
      })
    }
  }

  /**
   * DBからファイルのレコードを削除
   *
   * @param filepath - cwdからの相対パスまたは絶対パス
   */
  unlink(filepath: string) {
    this.#deps.chain().find({ path: filepath }).remove()
  }

  /**
   * ファイルをストリームで読み込みながらn行ずつ出力
   *
   * @param filepath - cwdからの相対パスまたは絶対パス
   * @param sliceSize - 一度に処理に回す最大行数
   * @param encoding - 文字コード
   * @param linefeed - 改行コード
   * @returns include/extendsで読み込んでいるファイルのSet
   */
  async #parsePug(
    filepath: string,
    sliceSize = 100,
    encoding: BufferEncoding = 'utf8',
    linefeed = '\n'
  ): Promise<Set<string>> {
    const readStream = createReadStream(filepath, { encoding })
    // 未処理文字列バッファ
    let buffer = ''
    // ループバック初期化
    const accumulator: ParseLinesAccumulator = {
      deps: new Set(),
      commentPrefix: null,
      row: 0,
    }
    // ループ
    for await (const chunk of readStream) {
      buffer += chunk
      const lines = buffer.split(linefeed)
      buffer = lines.pop()! // 末尾の半端をbufferに書き戻す
      while (lines.length) {
        // コメント判定のために順序の保証が必要
        Object.assign(
          accumulator,
          this.#parseLines(filepath, lines.splice(0, sliceSize), accumulator)
        )
      }
    }
    return accumulator.deps
  }

  /**
   * n行ずつパース
   *
   * @param filepath - cwdからの相対パスまたは絶対パス
   * @param lines - ストリームから渡された1行毎の文字列の配列
   * @param accumulator - アキュムレータ
   * @returns 再帰処理用にアキュムレータを返す
   */
  #parseLines(
    filepath: string,
    lines: string[],
    accumulator: ParseLinesAccumulator
  ): ParseLinesAccumulator {
    // ループバック展開
    const { deps } = accumulator
    let { commentPrefix, row } = accumulator

    // 1行ずつ処理
    for (const line of lines) {
      row += 1
      // コメント内ならコメント継続判定を行う
      if (commentPrefix !== null && !line.startsWith(commentPrefix))
        commentPrefix = null

      // コメント外ならコメント開始判定
      const matchComment = <CommentRegExpMatchArray | null>(
        line.match(this.#reFindComment)
      )

      // コメント開始時
      // - 次行以降、行頭からの連続した半角スペースが
      // - コメント開始判定時の数より多ければコメント継続と判定する
      if (matchComment) commentPrefix = `${matchComment.groups.indent} `

      // コメント外ならextends/includeを探す
      if (commentPrefix === null) {
        const matchExternal = <ExternalRegExpMatchArray | null>(
          line.match(this.#reFindExternal)
        )
        if (matchExternal) {
          // 後方参照でファイル名取得
          // - 拡張子がなければPugとして扱う
          const pathOnPug =
            path.extname(matchExternal.groups.path) === ''
              ? `${matchExternal.groups.path}.pug`
              : matchExternal.groups.path
          // baseDir起点のパスに変換
          const joinedPath = pathOnPug.startsWith('/')
            ? path.join(this.#settings.baseDir, pathOnPug).replace(/\\/g, '/')
            : path.join(path.dirname(filepath), pathOnPug).replace(/\\/g, '/')
          // 依存ファイルに追加
          if (this.#settings.useAbsPath) deps.add(path.resolve(joinedPath))
          else deps.add(joinedPath)

          if (this.#settings.verbose) console.log(row, joinedPath)
        } else if (this.#settings.verbose) {
          console.log(row)
        }
      } else if (this.#settings.verbose) {
        console.log(row, 'commented out')
      }
    }
    return { deps, commentPrefix, row }
  }

  /**
   * Pugをパースして依存関係を更新する
   *
   * @param filepath - cwdからの相対パスまたは絶対パス
   * @param settings - 設定
   * @public
   */
  async parse(
    filepath: string,
    settings: Partial<ParseSettigs> = {
      recursive: false,
      insertOnly: false,
    }
  ) {
    // HTMLやSVGを読み込んで更に依存関係が続いている場合もあるが
    // 現時点ではパーサを組み込んでいないためスキップ
    if (path.extname(filepath) !== '.pug') return

    // 依存関係取得
    const deps = await this.#parsePug(filepath)

    // 依存関係を更新または登録
    this.#upsertDeps(filepath, deps, settings.insertOnly)

    // recursiveがtrueかつ依存関係が存在していれば再帰的に処理する
    // - 通常全てのファイルは更新時に個別にparseすればよいので
    //   このロジックは初回処理時のみ使用される想定
    if (settings.recursive && deps.size) {
      await Promise.all(
        // 既にDBに登録されていればスキップ
        Array.from(deps).map((dep) =>
          this.#existsRecord(dep) ? null : this.parse(dep, settings)
        )
      )
    }
  }

  /**
   * 当該ファイル"が"依存しているファイルの一覧を取得（再帰処理）
   * - 旧名: getDependencies
   *
   * @param filepath - cwdからの相対パスまたは絶対パス
   * @param  importedFiles - 再帰処理用
   * @returns 依存ファイルのSet
   */
  getImportedFiles(
    filepath: string,
    importedFiles: Set<string> = new Set()
  ): Set<string> {
    const result: DepsResult | null = this.#deps.findOne({ path: filepath })
    if (result && result.deps.length > 0) {
      for (const dep of result.deps) {
        importedFiles.add(dep)
        this.getImportedFiles(dep, importedFiles)
      }
    }
    return importedFiles
  }

  /**
   * 当該ファイル"に"依存しているファイルの一覧を取得（再帰処理）
   * - `ignorePartial = true` で「当該ファイル更新時に再コンパイルすべきファイルの一覧」を得られる
   * - 旧名: getDependents
   *
   * @param filepath - cwdからの相対パスまたは絶対パス
   * @param ignorePartial - パーシャルを無視するかどうか
   * @param importers - 再帰処理用
   * @returns 被依存ファイルのSet
   */
  getImporters(
    filepath: string,
    ignorePartial = true,
    importers: Set<string> = new Set()
  ): Set<string> {
    const result: DepsRecord[] = this.#deps.find({
      deps: { $contains: filepath },
    })
    if (result) {
      for (const record of result) {
        if (!(ignorePartial && path.basename(record.path).startsWith('_')))
          importers.add(record.path)
        this.getImporters(record.path, ignorePartial, importers)
      }
    }
    return importers
  }

  /**
   * DBの全内容を出力（デバッグ用）
   *
   * @returns DBのdump
   */
  getRawData(): DepsResult[] {
    return this.#deps.chain().find().data()
  }

  /**
   * 終了
   * - 永続化実装時用にリザーブ
   */
  exit() {
    this.#db.close()
  }
}

export { PugGraph as default }
