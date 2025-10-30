import {
  Bucket,
  FileOptions,
  GetFileMetadataOptions as GCSGetFileMetadataOptions,
  FileMetadata
} from '@google-cloud/storage'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'
import { Outcome } from '../../../../../agnostic/misc/outcome/index.js'

export type GetMetadataOptions = {
  fileOptions?: FileOptions
  getFileMetadataOptions?: GCSGetFileMetadataOptions
}

/**
 * Retrieves the metadata of a file from a specified Google Cloud Storage bucket.
 *
 * This function fetches the metadata for a file located at `sourcePath` in the given bucket. 
 * It can be customized using optional `fileOptions` and `getFileMetadataOptions` to control the retrieval behavior.
 *
 * @param {Bucket} bucket - The Google Cloud Storage bucket object containing the file whose metadata is being retrieved.
 * @param {string} sourcePath - The path of the file whose metadata is to be fetched.
 * @param {GetMetadataOptions} [options] - Optional configuration options for the file metadata retrieval.
 * @returns {Promise<Outcome.Either<FileMetadata, string>>} A promise that resolves to an `Outcome.Either`.
 * - On success: `Outcome.makeSuccess(metadata)` containing the file's metadata.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the metadata retrieval fails.
 *
 * @throws {Error} Throws an error if the metadata retrieval operation fails (e.g., file not found, insufficient permissions, etc.).
 */
export async function getMetadata (
  bucket: Bucket,
  sourcePath: string,
  options?: GetMetadataOptions
): Promise<Outcome.Either<FileMetadata, string>> {
  const { fileOptions, getFileMetadataOptions } = options ?? {}
  try {
    const file = bucket.file(sourcePath, fileOptions)
    const [metadata] = await file.getMetadata(getFileMetadataOptions)
    return Outcome.makeSuccess(metadata)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
