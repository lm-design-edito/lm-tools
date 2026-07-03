import {
  type Bucket,
  type FileOptions,
  type CopyOptions,
  type DeleteFileOptions as GCSDeleteFileOptions
} from '@google-cloud/storage'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string/index.js'
import * as Outcome from '../../../../../agnostic/misc/outcome/index.js'

export type MoveOptions = {
  /** Options applied when obtaining `bucket.file(...)` handles. */
  fileOptions?: FileOptions
  /** Extra parameters forwarded to the internal `copy` call. */
  copyOptions?: CopyOptions
  /** Extra parameters forwarded to the internal `delete` call. */
  deleteOptions?: GCSDeleteFileOptions
  /**
   * If **false** (default) and `targetPath` already exists, the move aborts
   * with an error.
   * @default false
   */
  overwrite?: boolean
}

/**
 * Moves a file from one location to another within a Google Cloud Storage bucket.
 *
 * The function copies the object at `sourcePath` to `targetPath` and, on
 * successful copy, deletes the original. If `overwrite` is **false** and the
 * destination already exists, the operation aborts.
 *
 * @param   bucket      - The Google Cloud Storage bucket.
 * @param   sourcePath  - The path of the source object.
 * @param   targetPath  - The destination path.
 * @param [options] - Optional configuration.
 * @param   [options.fileOptions]   - Options for file handles.
 * @param   [options.copyOptions]   - Extra options for `copy`.
 * @param [options.deleteOptions] - Extra options for `delete`.
 * @param      [options.overwrite=false] - Whether to overwrite an existing destination.
 * @returns
 * - Success: `Outcome.makeSuccess(true)` if the move succeeds.
 * - Failure: `Outcome.makeFailure(errStr)` if the move fails.
 */
export async function move (
  bucket: Bucket,
  sourcePath: string,
  targetPath: string,
  options?: MoveOptions
): Promise<Outcome.Either<true, string>> {
  const {
    fileOptions,
    copyOptions,
    deleteOptions,
    overwrite = false
  } = options ?? {}

  try {
    const srcFile = bucket.file(sourcePath, fileOptions)
    const destFile = bucket.file(targetPath, fileOptions)

    if (!overwrite) {
      const [exists] = await destFile.exists()
      if (exists) {
        return Outcome.makeFailure(`Object already exists at ${targetPath}.`)
      }
    }

    await srcFile.copy(destFile, copyOptions)
    await srcFile.delete(deleteOptions)

    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
