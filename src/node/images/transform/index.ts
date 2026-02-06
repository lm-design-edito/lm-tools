import type sharp from 'sharp'
import * as Outcome from '../../../agnostic/misc/outcome/index.js'
import { unknownToString } from '../../../agnostic/errors/unknown-to-string/index.js'
import { isNonNullObject } from '../../../agnostic/objects/is-object/index.js'
import {
  OpName,
  type OperationDescriptor,
  type TransformLimits,
  type TransformErr,
  TransformErrCodes,
  type ImageLike
} from '../types.js'
import { toSharpInstance } from '../utils/index.js'

import { blur, isBlurOperationParams } from './operations/blur/index.js'
import { brighten, isBrightenOperationParams } from './operations/brighten/index.js'
import { extend, isExtendOperationParams } from './operations/extend/index.js'
import { extract, isExtractOperationParams } from './operations/extract/index.js'
import { flatten, isFlattenOperationParams } from './operations/flatten/index.js'
import { flip } from './operations/flip/index.js'
import { flop } from './operations/flop/index.js'
import { hue, isHueOperationParams } from './operations/hue/index.js'
import { level, isLevelOperationParams } from './operations/level/index.js'
import { lighten, isLightenOperationParams } from './operations/lighten/index.js'
import { normalize, isNormalizeOperationParams } from './operations/normalize/index.js'
import { overlay, isOverlayOperationParams } from './operations/overlay/index.js'
import { resize, isResizeOperationParams } from './operations/resize/index.js'
import { rotate, isRotateOperationParams } from './operations/rotate/index.js'
import { saturate, isSaturateOperationParams } from './operations/saturate/index.js'

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
  [OpName.OVERLAY]: isOverlayOperationParams,
  [OpName.RESIZE]: isResizeOperationParams,
  [OpName.ROTATE]: isRotateOperationParams,
  [OpName.SATURATE]: isSaturateOperationParams
}

/**
 * Validates and checks if an object is a valid operation descriptor.
 *
 * @param obj - The object to validate.
 * @returns
 * - On success:  `Outcome.makeSuccess(descriptor)` with the validated operation descriptor.
 * - On failure:  `Outcome.makeFailure(errStr)` describing the validation error.
 */
export function isOperationDescriptor (obj: unknown): Outcome.Either<OperationDescriptor, string> {
  if (!isNonNullObject(obj)) return Outcome.makeFailure('Invalid operation descriptor')
  if (!('name' in obj) || typeof obj.name !== 'string') return Outcome.makeFailure('Field named \'name\' in operation descriptor is required and must be a string')
  const name = obj.name as OpName
  const validateOperation = (validatorFn: typeof validators[keyof typeof validators]): Outcome.Either<any, any> => {
    const result = validatorFn(obj)
    if (result.success) return Outcome.makeSuccess({
      name: obj.name,
      ...result.payload
    })
    return Outcome.makeFailure(result.error)
  }
  const simpleOperations = new Set([OpName.FLIP, OpName.FLOP] as const)
  if (simpleOperations.has(name as OpName.FLIP | OpName.FLOP)) return Outcome.makeSuccess({
    name: name as OpName.FLIP | OpName.FLOP
  })
  const validator = validators[name as keyof typeof validators]
  if (validator !== undefined) return validateOperation(validator)
  return Outcome.makeFailure('Invalid operation descriptor')
}

/**
 * Applies a sequence of transformations to an image.
 *
 * The function processes operations in order, applying each transformation to the image.
 * Supports timeout limits for both individual operations and the entire process, as well
 * as dimension limits to prevent excessive memory usage.
 *
 * @param input - The image to transform. Can be a Sharp instance, Buffer, CreateOptions, or file path.
 * @param operationsSequence - Array of operation descriptors to apply in sequence.
 * @param [limits] - Optional limits for timeouts and dimensions. See `TransformLimits` for details.
 * @returns
 * - On success:  `Outcome.makeSuccess(sharpInstance)` with the transformed Sharp instance.
 * - On failure:  `Outcome.makeFailure(error)` with error code and details.
 */
export async function transform (
  input: ImageLike,
  operationsSequence: OperationDescriptor[],
  limits?: TransformLimits
): Promise<Outcome.Either<sharp.Sharp, TransformErr>> {
  let sharpInstance = await toSharpInstance(input)
  const start = Date.now()
  const deadline = limits?.timeoutMs !== undefined
    ? start + limits.timeoutMs
    : undefined

  // Wrap op with per-operation timeout
  const runWithOpTimeout = async <T>(op: () => Promise<T>): Promise<T | TransformErrCodes.OP_TIMEOUT> => {
    return limits?.opTimeoutMs === undefined
      ? await op()
      : await Promise.race([op(), new Promise<TransformErrCodes.OP_TIMEOUT>(
        resolve => setTimeout(
          () => resolve(TransformErrCodes.OP_TIMEOUT),
          limits.opTimeoutMs
        )
      )])
  }

  for (const operation of operationsSequence) {
    // Process timeout check
    if (deadline !== undefined
      && Date.now() > deadline) return Outcome.makeFailure({
      code: TransformErrCodes.PROCESS_TIMEOUT,
      details: 'Process timed out'
    })

    // Apply transformation
    let result: sharp.Sharp | TransformErrCodes.OP_TIMEOUT
    try {
      result = await runWithOpTimeout(async () => {
        switch (operation.name) {
          case OpName.BLUR: return await blur(sharpInstance, operation)
          case OpName.BRIGHTEN: return await brighten(sharpInstance, operation)
          case OpName.EXTEND: return await extend(sharpInstance, operation)
          case OpName.EXTRACT: return await extract(sharpInstance, operation)
          case OpName.FLATTEN: return await flatten(sharpInstance, operation)
          case OpName.FLIP: return await flip(sharpInstance)
          case OpName.FLOP: return await flop(sharpInstance)
          case OpName.HUE: return await hue(sharpInstance, operation)
          case OpName.LEVEL: return await level(sharpInstance, operation)
          case OpName.LIGHTEN: return await lighten(sharpInstance, operation)
          case OpName.NORMALIZE: return await normalize(sharpInstance, operation)
          case OpName.OVERLAY: return await overlay(sharpInstance, operation)
          case OpName.RESIZE: return await resize(sharpInstance, operation)
          case OpName.ROTATE: return await rotate(sharpInstance, operation)
          case OpName.SATURATE: return await saturate(sharpInstance, operation)
          default: return sharpInstance
        }
      })
    } catch (err) {
      return Outcome.makeFailure({
        code: TransformErrCodes.UNKNOWN_ERROR,
        details: unknownToString(err)
      })
    }

    // Operation timeout check
    if (result === TransformErrCodes.OP_TIMEOUT) return Outcome.makeFailure({
      code: TransformErrCodes.OP_TIMEOUT,
      details: 'Operation timed out'
    })
    else { sharpInstance = result }

    // Limits checks
    if (limits === undefined) continue
    if (operation.name === OpName.RESIZE
      || operation.name === OpName.EXTEND
      || operation.name === OpName.EXTRACT
      || operation.name === OpName.ROTATE) {
      try {
        const meta = await sharpInstance.metadata() // can throw
        if (limits.width !== undefined
          && meta.width > limits.width) return Outcome.makeFailure({
          code: TransformErrCodes.WIDTH_LIMIT_EXCEEDED,
          details: `Image width exceeded the limit (${meta.width}px)`
        })
        if (limits.height !== undefined
          && meta.height > limits.height) return Outcome.makeFailure({
          code: TransformErrCodes.HEIGHT_LIMIT_EXCEEDED,
          details: `Image height exceeded the limit (${meta.height}px)`
        })
      } catch (err) {
        return Outcome.makeFailure({
          code: TransformErrCodes.UNKNOWN_ERROR,
          details: `Failed to read metadata: ${unknownToString(err)}`
        })
      }
    }
  }
  return Outcome.makeSuccess(sharpInstance)
}
