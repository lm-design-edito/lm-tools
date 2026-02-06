import type Client from 'ssh2-sftp-client'
import * as Outcome from '../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string/index.js'

/**
 * Lists all direct children files under a given directory on an SFTP server.
 *
 * This function returns only the immediate files (not recursive) under the specified directory.
 *
 * @param {Client} sftp - The ssh2-sftp-client instance used to interact with the SFTP server.
 * @param {string} directoryPath - The directory path to list files under.
 * @returns {Promise<Outcome.Either<string[], string>>} Returns either a success with an array of file paths, or a failure with an error message.
 */
export async function list (
  sftp: Client,
  directoryPath: string
): Promise<Outcome.Either<string[], string>> {
  try {
    const list = await sftp.list(directoryPath)
    const files = list
      .filter(entry => entry.type === '-')
      .map(entry => (directoryPath.endsWith('/') ? directoryPath + entry.name : directoryPath + '/' + entry.name))
    return Outcome.makeSuccess(files)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
