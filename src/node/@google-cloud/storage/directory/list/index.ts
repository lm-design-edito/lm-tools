import { type Bucket, type FileOptions } from '@google-cloud/storage'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'

export type ListOptions = {
  fileOptions?: FileOptions
}

/**
 * Lists all direct children file paths under a given directory prefix in a GCS bucket.
 *
 * This function returns only the immediate files (not recursive) under the specified directory prefix.
 *
 * @param bucket - The GCS bucket to list files from.
 * @param directoryPath - The directory prefix to list files under.
 * @param [options] - Optional configuration for the listing.
 * @param [options.fileOptions] - Additional options for file retrieval.
 * @returns Returns either a success with an array of file paths, or a failure with an error message.
 */
export async function list (
  bucket: Bucket,
  directoryPath: string,
  options?: ListOptions
): Promise<Outcome.Either<string[], string>> {
  const { fileOptions } = options ?? {}
  try {
    const prefix = directoryPath.endsWith('/') ? directoryPath : `${directoryPath}/`
    const [files] = await bucket.getFiles({
      prefix,
      delimiter: '/',
      ...fileOptions
    })
    const paths = files.map(file => file.name)
    return Outcome.makeSuccess(paths)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
