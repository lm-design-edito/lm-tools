import { Readable } from 'node:stream'
import Client, { TransferOptions } from 'ssh2-sftp-client'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'

export type UploadOptions = TransferOptions & {
  ensureDir?: boolean /* defaults to true */
  overwrite?: boolean   /* defaults to false */
}

/**
 * Uploads a file stream to a specified SFTP server.
 *
 * This function uploads the provided file stream to the given SFTP server at the specified target path.
 * The upload process can be customized using optional upload options.
 * If the `ensureDir` option is true, it ensures that the target directory exists before uploading.
 * If the `overwrite` option is false and a file already exists at the target path, the upload is aborted.
 *
 * @param {Client} sftp - The ssh2-sftp-client instance used to interact with the SFTP server. 
 * @param {string} targetPath - The target path where the file will be stored on the SFTP server.
 * @param {Readable} fileStream - The file content to be uploaded.
 * @param {UploadOptions} [options] - Optional settings for configuring the upload process.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an Outcome.Either.
 * - On success: Outcome.makeSuccess(true) indicating the upload was successful.
 * - On failure: Outcome.makeFailure(errStr) with an error message if the upload fails.
 */
export async function upload (
  sftp: Client,
  targetPath: string,
  fileStream: Readable,
  options?: UploadOptions 
): Promise<Outcome.Either<true, string>> {
  const {
    ensureDir = true,
    overwrite = false
  } = options ?? {}
  try {
    const exists = await sftp.exists(targetPath)
    if (exists && !overwrite) return Outcome.makeFailure(`File already exists at ${targetPath}.`)
    if (ensureDir) {
      const dirPath = targetPath.substring(0, targetPath.lastIndexOf('/'))
      await sftp.mkdir(dirPath, true)
    }
    await sftp.put(fileStream, targetPath, options)
    return Outcome.makeSuccess(true)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
