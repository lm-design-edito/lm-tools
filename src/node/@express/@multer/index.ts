import { Request, Response, RequestHandler } from 'express'
import multer from 'multer'
import { Outcome } from '../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../agnostic/errors/unknown-to-string/index.js'

export type WithMulterModeOptions = { mode: 'none' | 'any' }
  | { mode: 'single', fieldName: string }
  | { mode: 'array', fieldName: string, maxCount?: number }
  | { mode: 'fields', fields: multer.Field[] }

export type WithMulterOptions = multer.Options & WithMulterModeOptions

export type WithMulterError = {
  code: multer.MulterError['code'] | 'UNKNOWN',
  message: string,
  field?: string
}

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
