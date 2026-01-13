// sftp/stat.ts
import SftpClient from 'ssh2-sftp-client'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'

export interface Stat {
  size?: number
  modifiedAt?: Date
  mode?: number          // POSIX mode bits
  uid?: number
  gid?: number
  raw: SftpClient.FileStats
}

/**
 * Retrieves metadata for a file on an SFTP server.
 *
 * @param {SftpClient} sftp – ssh2-sftp-client.
 * @param {string} path     – Remote file path.
 * @returns {Promise<Outcome.Either<Stat, string>>}
 */
export async function stat (
  sftp: SftpClient,
  path: string
): Promise<Outcome.Either<Stat, string>> {
  try {
    const info = await sftp.stat(path) // throws if not found
    return Outcome.makeSuccess({
      size: info.size,
      modifiedAt: info.modifyTime ? new Date(info.modifyTime * 1000) : undefined,
      mode: info.mode,
      uid: info.uid,
      gid: info.gid,
      raw: info
    })
  } catch (err: any) {
    if (err.code === 2 || err.code === 'ENOENT') {
      return Outcome.makeFailure(`File not found: ${path}`)
    }
    return Outcome.makeFailure(unknownToString(err))
  }
}
