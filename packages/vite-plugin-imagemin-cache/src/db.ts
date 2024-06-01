import Loki from 'lokijs'

import type { CacheCollection, CacheDocument } from './types.js'

class CacheDb {
  #db: Loki
  #coll!: CacheCollection // constructor内で初期化されていると見なす
  #expireDuration: number // Seconds
  #countToExpire: number

  constructor(filename: string, expireDuration: number, countToExpire: number) {
    this.#db = new Loki(filename, {
      autoload: true,
      autoloadCallback: () => {
        this.#coll =
          <CacheCollection>this.#db.getCollection('cache') ||
          <CacheCollection>this.#db.addCollection('cache', {
            unique: ['fileName'],
            indices: ['fileName'],
          })
      },
      autosave: true,
      autosaveInterval: 4000,
    })
    this.#expireDuration = expireDuration
    this.#countToExpire = countToExpire
  }

  /**
   * カウントダウン
   */
  countdown() {
    this.#coll.updateWhere(
      () => true,
      (obj: CacheDocument) => {
        obj.expirationCountdown = obj.expirationCountdown - 1
        return obj
      },
    )
  }

  /**
   * 使用された静的アセットのカウントをリセットし最終処理日時を更新する
   *
   * @param targets - 相対パスのファイルリスト
   * @param now - 基準時刻
   */
  renewAsset(targets: Set<string>, now: number = new Date().getTime()) {
    this.#coll.updateWhere(
      (data: CacheDocument) => targets.has(data.fileName),
      (obj: CacheDocument) => {
        obj.expirationCountdown = this.#countToExpire
        obj.lastProcessed = now
        return obj
      },
    )
  }

  /**
   * DB上に存在しない静的アセットを追加する
   *
   * @param targets - 相対パスのファイルリスト
   * @param now - 基準時刻
   */
  insertAsset(targets: Set<string>, now: number = new Date().getTime()) {
    for (const fileName of targets) {
      if (this.#coll.findOne({ fileName })) continue
      this.#coll.insert({
        fileName,
        expirationCountdown: this.#countToExpire,
        lastProcessed: now,
      })
    }
  }

  /**
   * ファイル名のデータを返す
   *
   * @param fileName - 相対パス
   * @returns CRC32
   */
  getData(fileName: string): CacheDocument {
    return this.#coll.findOne({ fileName })
  }

  /**
   * 静的ファイルのカウントをリセットし最終処理日時を更新する
   * - 存在しなければ追加する
   *
   * @param fileName - 相対パス
   * @param checksum - CRC32
   * @param now - 基準時刻
   */
  upsertPublic(
    fileName: string,
    checksum: number,
    now: number = new Date().getTime(),
  ) {
    const result = this.#coll.findOne({ fileName })
    if (result) {
      this.#coll
        .chain()
        .find({ fileName })
        .update((obj: CacheDocument) => {
          obj.expirationCountdown = this.#countToExpire
          obj.lastProcessed = now
          obj.checksum = checksum
          return obj
        })
    } else {
      this.#coll.insert({
        fileName,
        expirationCountdown: this.#countToExpire,
        lastProcessed: now,
        checksum,
      })
    }
  }

  /**
   * 期限切れファイルを取得
   *
   * @param now - 基準時刻
   * @returns - 期限切れファイルの配列
   */
  getExpired(now: number = new Date().getTime()): CacheDocument[] {
    return this.#coll.find({
      expirationCountdown: { $lt: 1 },
      lastProcessed: { $lt: now - this.#expireDuration * 1000 },
    })
  }

  /**
   * 期限切れのキャッシュDBのエントリを削除
   *
   * @param now - 基準時刻
   */
  removeExpired(now: number = new Date().getTime()) {
    this.#coll.removeWhere((data: CacheDocument): boolean => {
      if (
        data.expirationCountdown < 1 &&
        data.lastProcessed < now - this.#expireDuration * 1000
      )
        return true
      return false
    })
  }

  /**
   * 接続終了
   */
  close() {
    this.#db.close()
  }
}

export { CacheDb }
