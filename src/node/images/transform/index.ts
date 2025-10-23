import sharp from 'sharp'
import { Outcome } from '../../../agnostic/misc/outcome'
import { unknownToString } from '../../../agnostic/errors/unknown-to-string'
import { blur, BlurOperationParams, isBlurOperationParams } from './operations/blur'
import { brighten, BrightenOperationParams, isBrightenOperationParams } from './operations/brighten'
import { extend, ExtendOperationParams, isExtendOperationParams } from './operations/extend'
import { extract, ExtractOperationParams, isExtractOperationParams } from './operations/extract'
import { flatten, FlattenOperationParams, isFlattenOperationParams } from './operations/flatten'
import { flip } from './operations/flip'
import { flop } from './operations/flop'
import { hue, HueOperationParams, isHueOperationParams } from './operations/hue'
import { level, LevelOperationParams, isLevelOperationParams } from './operations/level'
import { lighten, LightenOperationParams, isLightenOperationParams } from './operations/lighten'
import { normalize, NormalizeOperationParams, isNormalizeOperationParams } from './operations/normalize'
import { resize, ResizeOperationParams, isResizeOperationParams } from './operations/resize'
import { rotate, RotateOperationParams, isRotateOperationParams } from './operations/rotate'
import { saturate, SaturateOperationParams, isSaturateOperationParams } from './operations/saturate'
import { composite, CompositeOperationParams, isCompositeOperationParams } from './operations/composite'

export enum OpName {
  BLUR = 'blur',
  BRIGHTEN = 'brighten',
  COMPOSITE = 'composite',
  EXTEND = 'extend',
  EXTRACT = 'extract',
  FLATTEN = 'flatten',
  FLIP = 'flip',
  FLOP = 'flop',
  // [WIP] Frame ?
  HUE = 'hue',
  LEVEL = 'level',
  LIGHTEN = 'lighten',
  // Modulate will duplicate with hue, brighten, saturate and lighten
  NORMALIZE = 'normalize',
  RESIZE = 'resize',
  ROTATE = 'rotate',
  SATURATE = 'saturate'
  // No need for scale, since resize can do the same thing
}

export type BlurOperationDescriptor = { name: OpName.BLUR } & BlurOperationParams
export type BrightenOperationDescriptor = { name: OpName.BRIGHTEN } & BrightenOperationParams
export type ExtendOperationDescriptor = { name: OpName.EXTEND } & ExtendOperationParams
export type ExtractOperationDescriptor = { name: OpName.EXTRACT } & ExtractOperationParams
export type FlattenOperationDescriptor = { name: OpName.FLATTEN } & FlattenOperationParams
export type FlipOperationDescriptor = { name: OpName.FLIP }
export type FlopOperationDescriptor = { name: OpName.FLOP }
export type HueOperationDescriptor = { name: OpName.HUE } & HueOperationParams
export type LevelOperationDescriptor = { name: OpName.LEVEL } & LevelOperationParams
export type LightenOperationDescriptor = { name: OpName.LIGHTEN } & LightenOperationParams
export type NormalizeOperationDescriptor = { name: OpName.NORMALIZE } & NormalizeOperationParams
export type ResizeOperationDescriptor = { name: OpName.RESIZE } & ResizeOperationParams
export type RotateOperationDescriptor = { name: OpName.ROTATE } & RotateOperationParams
export type SaturateOperationDescriptor = { name: OpName.SATURATE } & SaturateOperationParams
export type CompositeOperationDescriptor = { name: OpName.COMPOSITE } & CompositeOperationParams

export type OperationDescriptor = BlurOperationDescriptor
  | BrightenOperationDescriptor
  | CompositeOperationDescriptor
  | ExtendOperationDescriptor
  | ExtractOperationDescriptor
  | FlattenOperationDescriptor
  | FlipOperationDescriptor
  | FlopOperationDescriptor
  | HueOperationDescriptor
  | LevelOperationDescriptor
  | LightenOperationDescriptor
  | NormalizeOperationDescriptor
  | ResizeOperationDescriptor
  | RotateOperationDescriptor
  | SaturateOperationDescriptor

export function isOperationDescriptor(obj: unknown): Outcome.Either<OperationDescriptor, string> {
  if (typeof obj !== 'object' || obj === null) return Outcome.makeFailure('Invalid operation descriptor')
  if (!('name' in obj) || typeof obj.name !== 'string') return Outcome.makeFailure('Field named \'name\' in operation descriptor is required and must be a string')
  const name = obj.name as OpName
  const validateOperation = (validatorFn: (obj: unknown) => any) => {
    const result = validatorFn(obj)
    if (result.success) return Outcome.makeSuccess({ name: obj.name, ...result.payload })
    return Outcome.makeFailure(result.error)
  }
  const validators = {
    [OpName.BLUR]: isBlurOperationParams,
    [OpName.BRIGHTEN]: isBrightenOperationParams,
    [OpName.EXTEND]: isExtendOperationParams,
    [OpName.EXTRACT]: isExtractOperationParams,
    [OpName.FLATTEN]: isFlattenOperationParams,
    [OpName.HUE]: isHueOperationParams,
    [OpName.LEVEL]: isLevelOperationParams,
    [OpName.LIGHTEN]: isLightenOperationParams,
    [OpName.NORMALIZE]: isNormalizeOperationParams,
    [OpName.RESIZE]: isResizeOperationParams,
    [OpName.ROTATE]: isRotateOperationParams,
    [OpName.SATURATE]: isSaturateOperationParams,
    [OpName.COMPOSITE]: isCompositeOperationParams,
  }
  const simpleOperations = new Set([OpName.FLIP, OpName.FLOP] as const)
  if (simpleOperations.has(name as any)) return Outcome.makeSuccess({ name: name as OpName.FLIP | OpName.FLOP })
  const validator = validators[name as keyof typeof validators]
  if (validator) return validateOperation(validator)
  return Outcome.makeFailure('Invalid operation descriptor')
}

export type TransformLimits = {
  timeoutMs?: number
  opTimeoutMs?: number
  width?: number
  height?: number
}

export enum TransformErrCodes {
  PROCESS_TIMEOUT = 'process-timeout',
  OP_TIMEOUT = 'op-timeout',
  WIDTH_LIMIT_EXCEEDED = 'width-limit-exceeded',
  HEIGHT_LIMIT_EXCEEDED = 'height-limit-exceeded',
  UNKNOWN_ERROR = 'unknown-error'
}

export type TransformErr = {
  code: TransformErrCodes,
  details: string
}

export async function transform(
  input: Buffer | { create: sharp.SharpOptions['create'] },
  operationsSequence: OperationDescriptor[],
  limits?: TransformLimits): Promise<Outcome.Either<sharp.Sharp, TransformErr>>
export async function transform (
  input: sharp.Sharp,
  operationsSequence: OperationDescriptor[],
  limits?: TransformLimits): Promise<Outcome.Either<sharp.Sharp, TransformErr>>
export async function transform (
  input: sharp.Sharp | Buffer | { create: sharp.SharpOptions['create'] },
  operationsSequence: OperationDescriptor[],
  limits?: TransformLimits): Promise<Outcome.Either<sharp.Sharp, TransformErr>> {
  if (typeof input === 'object' && 'create' in input && input.create !== null) {
    return transformSharpInstance(sharp(input), operationsSequence, limits)
  }
  if (Buffer.isBuffer(input)) return transformBuffer(input, operationsSequence, limits)
  return transformSharpInstance(input as sharp.Sharp, operationsSequence, limits)
}

async function transformSharpInstance (
  sharpInstance: sharp.Sharp,
  operationsSequence: OperationDescriptor[],
  limits?: TransformLimits
): Promise<Outcome.Either<sharp.Sharp, TransformErr>> {
  const start = Date.now()
  const deadline = limits?.timeoutMs ? start + limits.timeoutMs : undefined

  // Wrap op with per-operation timeout
  const runWithOpTimeout = async <T>(op: () => Promise<T>): Promise<T | TransformErrCodes.OP_TIMEOUT> => {
    if (!limits?.opTimeoutMs) return op()
    const opTimeout = new Promise<TransformErrCodes.OP_TIMEOUT>(resolve =>
      setTimeout(() => resolve(TransformErrCodes.OP_TIMEOUT), limits.opTimeoutMs)
    )
    return Promise.race([op(), opTimeout])
  }

  for (const operation of operationsSequence) {
    // Check global process timeout
    if (deadline !== undefined && Date.now() > deadline) return Outcome.makeFailure({
      code: TransformErrCodes.PROCESS_TIMEOUT,
      details: 'Process timed out'
    })
    let result: sharp.Sharp | TransformErrCodes.OP_TIMEOUT
    try {
      result = await runWithOpTimeout(async () => {
        switch (operation.name) {
          case OpName.BLUR: return blur(sharpInstance, operation)
          case OpName.BRIGHTEN: return brighten(sharpInstance, operation)
          case OpName.EXTEND: return extend(sharpInstance, operation)
          case OpName.EXTRACT: return extract(sharpInstance, operation)
          case OpName.FLATTEN: return flatten(sharpInstance, operation)
          case OpName.FLIP: return flip(sharpInstance)
          case OpName.FLOP: return flop(sharpInstance)
          case OpName.HUE: return hue(sharpInstance, operation)
          case OpName.LEVEL: return level(sharpInstance, operation)
          case OpName.LIGHTEN: return lighten(sharpInstance, operation)
          case OpName.NORMALIZE: return normalize(sharpInstance, operation)
          case OpName.RESIZE: return resize(sharpInstance, operation)
          case OpName.ROTATE: return rotate(sharpInstance, operation)
          case OpName.SATURATE: return saturate(sharpInstance, operation)
          case OpName.COMPOSITE: return composite(sharpInstance, operation)
          default: return sharpInstance
        }
      })
    } catch (err) {
      return Outcome.makeFailure({
        code: TransformErrCodes.UNKNOWN_ERROR,
        details: unknownToString(err)
      })
    }

    // Per-operation timeout handling
    if (result === TransformErrCodes.OP_TIMEOUT) return Outcome.makeFailure({
      code: TransformErrCodes.OP_TIMEOUT,
      details: 'Operation timed out'
    })
    else { sharpInstance = result }

    // Check width/height limits *only after operations that can change size*
    if (
      limits &&
      (operation.name === OpName.RESIZE ||
       operation.name === OpName.EXTEND ||
       operation.name === OpName.EXTRACT ||
       operation.name === OpName.ROTATE)
    ) {
      try {
        const meta = await sharpInstance.metadata()
        if (limits.width !== undefined && meta.width && meta.width > limits.width) {
          return Outcome.makeFailure({
            code: TransformErrCodes.WIDTH_LIMIT_EXCEEDED,
            details: `Image width exceeded the limit (${meta.width}px)`
          })
        }
        if (limits.height !== undefined && meta.height && meta.height > limits.height) {
          return Outcome.makeFailure({
            code: TransformErrCodes.HEIGHT_LIMIT_EXCEEDED,
            details: `Image height exceeded the limit (${meta.height}px)`
          })
        }
      } catch (err) {
        // metadata() can throw for invalid images
        return Outcome.makeFailure({
          code: TransformErrCodes.UNKNOWN_ERROR,
          details: `Failed to read metadata: ${unknownToString(err)}`
        })
      }
    }
  }
  return Outcome.makeSuccess(sharpInstance)
}

async function transformBuffer (
  fileBuffer: Buffer,
  operationsSequence: OperationDescriptor[],
  limits?: TransformLimits
): Promise<Outcome.Either<sharp.Sharp, TransformErr>> {
  const sharpInstance = sharp(fileBuffer)
  return transformSharpInstance(sharpInstance, operationsSequence, limits)
}
