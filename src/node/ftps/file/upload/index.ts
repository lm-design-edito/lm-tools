import { Readable } from 'node:stream'
import { Client, UploadOptions as BasicFtpUploadOptions } from 'basic-ftp'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'

export type UploadOptions = BasicFtpUploadOptions & { 
  ensureDir?: boolean /* defaults to true */
  overwrite?: boolean /* defaults to false */
}

/**
 * Uploads a file stream to a specified FTP server.
 *
 * This function uploads the provided file stream to the given FTP server at the specified target path.
 * The upload process can be customized using optional upload options.
 * If the `ensureDir` option is true, it ensures that the target directory exists before uploading.
 * If the `overwrite` option is false, it prevents overwriting an existing file.
 *
 * @param {Client} ftpClient - The basic-ftp client instance used to interact with the FTP server.
 * @param {string} targetPath - The target path where the file will be stored on the FTP server.
 * @param {Readable} fileStream - The file content to be uploaded.
 * @param {UploadOptions} [options] - Optional settings for configuring the upload process.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an Outcome.Either.
 * - On success: Outcome.makeSuccess(true) indicating the upload was successful.
 * - On failure: Outcome.makeFailure(errStr) with an error message if the upload fails.
 */
export async function upload (
  ftpClient: Client,
  targetPath: string,
  fileStream: Readable,
  options?: UploadOptions
): Promise<Outcome.Either<true, string>> {
  const {
    ensureDir = true,
    overwrite = false
  } = options ?? {}
  try {
    if (ensureDir) {
      const dirPath = targetPath.substring(0, targetPath.lastIndexOf('/'))
      await ftpClient.ensureDir(dirPath)
    }
    let fileExists = false
    try {
      await ftpClient.size(targetPath)
      fileExists = true
    } catch {
      fileExists = false
    }
    if (fileExists && !overwrite) { return Outcome.makeFailure(`File already exists at ${targetPath}.`) }
    await ftpClient.uploadFrom(fileStream, targetPath, options)
    return Outcome.makeSuccess(true)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
