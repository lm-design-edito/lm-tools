import sharp from 'sharp'
import { Outcome } from '../../../agnostic/misc/outcome'
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

export enum OpName {
  BLUR = 'blur',
  BRIGHTEN = 'brighten',
  // [WIP] Compose ?
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

export type OperationDescriptor = BlurOperationDescriptor
  | BrightenOperationDescriptor
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
  }
  const simpleOperations = new Set([OpName.FLIP, OpName.FLOP] as const)
  if (simpleOperations.has(name as any)) return Outcome.makeSuccess({ name: name as OpName.FLIP | OpName.FLOP })
  const validator = validators[name as keyof typeof validators]
  if (validator) return validateOperation(validator)
  return Outcome.makeFailure('Invalid operation descriptor')
}

export async function transform (input: Buffer, operationsSequence: OperationDescriptor[]): Promise<sharp.Sharp>
export async function transform (input: sharp.Sharp, operationsSequence: OperationDescriptor[]): Promise<sharp.Sharp>
export async function transform (input: sharp.Sharp | Buffer, operationsSequence: OperationDescriptor[]): Promise<sharp.Sharp> {
  if (Buffer.isBuffer(input)) return transformBuffer(input, operationsSequence)
  return transformSharpInstance(input, operationsSequence)
}

async function transformSharpInstance (
  sharpInstance: sharp.Sharp,
  operationsSequence: OperationDescriptor[]
): Promise<sharp.Sharp> {
  for (const operation of operationsSequence) {
    switch (operation.name) {
      case OpName.BLUR: sharpInstance = await blur(sharpInstance, operation); break;
      case OpName.BRIGHTEN: sharpInstance = await brighten(sharpInstance, operation); break;
      case OpName.EXTEND: sharpInstance = await extend(sharpInstance, operation); break;
      case OpName.EXTRACT: sharpInstance = await extract(sharpInstance, operation); break;
      case OpName.FLATTEN: sharpInstance = await flatten(sharpInstance, operation); break;
      case OpName.FLIP: sharpInstance = await flip(sharpInstance); break;
      case OpName.FLOP: sharpInstance = await flop(sharpInstance); break;
      case OpName.HUE: sharpInstance = await hue(sharpInstance, operation); break;
      case OpName.LEVEL: sharpInstance = await level(sharpInstance, operation); break;
      case OpName.LIGHTEN: sharpInstance = await lighten(sharpInstance, operation); break;
      case OpName.NORMALIZE: sharpInstance = await normalize(sharpInstance, operation); break;
      case OpName.RESIZE: sharpInstance = await resize(sharpInstance, operation); break;
      case OpName.ROTATE: sharpInstance = await rotate(sharpInstance, operation); break;
      case OpName.SATURATE: sharpInstance = await saturate(sharpInstance, operation); break;
      default: sharpInstance = sharpInstance;
    }
  }
  return sharpInstance
}

async function transformBuffer (
  fileBuffer: Buffer,
  operationsSequence: OperationDescriptor[]
): Promise<sharp.Sharp> {
  const sharpInstance = sharp(fileBuffer)
  return transformSharpInstance(sharpInstance, operationsSequence)
}
