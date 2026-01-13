// ftp/stat.ts
import { Client as FtpClient, FileInfo } from 'basic-ftp'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'

export interface Stat {
  size?: number
  modifiedAt?: Date
  permissions?: string        // e.g. "-rw-r--r--"
  raw: FileInfo
}

/**
 * Retrieves metadata for a single file on an FTP server by listing its parent
 * directory and matching the entry.
 *
 * @param {FtpClient} ftp – basic‑ftp client.
 * @param {string} path  – Remote file path.
 * @returns {Promise<Outcome.Either<Stat, string>>}
 */
export async function stat (
  ftp: FtpClient,
  path: string
): Promise<Outcome.Either<Stat, string>> {
  try {
    const slash = path.lastIndexOf('/')
    const dir   = slash === -1 ? '.' : path.slice(0, slash) || '/'
    const name  = slash === -1 ? path : path.slice(slash + 1)

    const list  = await ftp.list(dir)
    const entry = list.find(e => e.name === name && e.isFile)

    if (!entry) return Outcome.makeFailure(`File not found: ${path}`)

    return Outcome.makeSuccess({
      size: entry.size,
      modifiedAt: entry.modifiedAt ?? undefined,
      permissions: entry.rawModifiedAt ? entry.rawModifiedAt.toString() : undefined,
      raw: entry
    })
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
