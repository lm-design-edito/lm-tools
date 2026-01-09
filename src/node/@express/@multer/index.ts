import { Request, Response, RequestHandler } from 'express'
import multer from 'multer'
import { Outcome } from '../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../agnostic/errors/unknown-to-string/index.js'

export type WithMulterModeOptions = {
  /** No file uploads allowed. */
  mode: 'none' | 'any'
} | {
  /** Upload a single file. */
  mode: 'single',
  /** The name of the form field containing the file. */
  fieldName: string
} | {
  /** Upload multiple files from the same field. */
  mode: 'array',
  /** The name of the form field containing the files. */
  fieldName: string,
  /** Maximum number of files allowed. */
  maxCount?: number
} | {
  /** Upload files from multiple fields. */
  mode: 'fields',
  /** Array of field configurations. */
  fields: multer.Field[]
}

/** Multer configuration options combined with upload mode settings. */
export type WithMulterOptions = multer.Options & WithMulterModeOptions

export type WithMulterError = {
  /** Error code from multer or 'UNKNOWN' for non-multer errors. */
  code: multer.MulterError['code'] | 'UNKNOWN',
  /** Human-readable error message. */
  message: string,
  /** The form field name that caused the error, if applicable. */
  field?: string
}

/**
 * Applies multer middleware to an Express request/response pair.
 *
 * The function creates a multer instance based on the provided options and
 * applies the appropriate middleware based on the upload mode. Errors are
 * captured and returned as a structured `WithMulterError` object.
 *
 * @param {Request} req                    - The Express request object.
 * @param {Response} res                   - The Express response object.
 * @param {WithMulterOptions} options      - Multer configuration and upload mode.
 * @param {multer.StorageEngine} [options.storage] - Storage engine (defaults to memory).
 * @param {multer.Options['limits']} [options.limits] - File size and count limits.
 * @param {multer.Options['fileFilter']} [options.fileFilter] - File filter function.
 * @param {'none'|'any'|'single'|'array'|'fields'} options.mode - Upload mode.
 * @param {string} [options.fieldName]     - Field name (required for 'single' and 'array' modes).
 * @param {number} [options.maxCount]      - Max file count (for 'array' mode).
 * @param {multer.Field[]} [options.fields] - Field configurations (for 'fields' mode).
 * @returns {Promise<Outcome.Either<true, WithMulterError>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(error)` with structured error details.
 */
export async function useMulterMiddleware (
  req: Request,
  res: Response,
  options: WithMulterOptions
): Promise<Outcome.Either<true, WithMulterError>> {
  const { storage, limits, fileFilter } = options
  const uploader = multer({
    storage: storage ?? multer.memoryStorage(),
    limits,
    fileFilter
  })
  let middleware: RequestHandler
  if (options.mode === 'none') { middleware = uploader.none() }
  else if (options.mode === 'single') { middleware = uploader.single(options.fieldName) }
  else if (options.mode === 'array') { middleware = uploader.array(options.fieldName, options.maxCount) }
  else if (options.mode === 'fields') { middleware = uploader.fields(options.fields) }
  else { middleware = uploader.any() }
  return await new Promise<Outcome.Either<true, WithMulterError>>(resolve => middleware(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) return resolve(Outcome.makeFailure({
      code: err.code,
      message: err.message,
      field: err.field
    }))
    return resolve(err !== undefined
      ? Outcome.makeFailure({
        code: 'UNKNOWN',
        message: unknownToString(err)
      })
      : Outcome.makeSuccess(true)
    )
  }))
}
