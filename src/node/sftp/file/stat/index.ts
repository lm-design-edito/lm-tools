// sftp/stat.ts
import type SftpClient from 'ssh2-sftp-client'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'
import { deepGetProperty } from 'agnostic/objects/deep-get-property/index.js'

export interface Stat {
  size?: number
  modifiedAt?: Date
  mode?: number // POSIX mode bits
  uid?: number
  gid?: number
  raw: SftpClient.FileStats
}

/**
 * Retrieves metadata for a file on an SFTP server.
 *
 * @param sftp – ssh2-sftp-client.
 * @param path     – Remote file path.
 * @returns
 */
export async function stat (
  sftp: SftpClient,
  path: string
): Promise<Outcome.Either<Stat, string>> {
  try {
    const info = await sftp.stat(path) // throws if not found
    return Outcome.makeSuccess({
      size: info.size,
      modifiedAt: new Date(info.modifyTime * 1000),
      mode: info.mode,
      uid: info.uid,
      gid: info.gid,
      raw: info
    })
  } catch (err: unknown) {
    const code = deepGetProperty(err, 'code')
    if (code === 2 || code === 'ENOENT') return Outcome.makeFailure(`File not found: ${path}`)
    return Outcome.makeFailure(unknownToString(err))
  }
}
