import zod from 'zod'
import sharp from 'sharp'
import { Outcome } from '../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'
import { OperationNames } from './_utils/operation-names'

import { blurSchema, BlurOperation } from './blur'
import { brightenSchema, BrightenOperation } from './brighten'
import { composeSchema, ComposeOperation } from './compose'
import { extendSchema, ExtendOperation } from './extend'
import { extractSchema, ExtractOperation } from './extract'
import { flattenSchema, FlattenOperation } from './flatten'
import { flipSchema, FlipOperation } from './flip'
import { flopSchema, FlopOperation } from './flop'
import { hueRotateSchema, HueRotateOperation } from './hue-rotate'
import { lightenSchema, LightenOperation } from './lighten'
import { lineateLevelsSchema, LineateLevelsOperation } from './lineate-levels'
import { modulateSchema, ModulateOperation } from './modulate'
import { normalizeSchema, NormalizeOperation } from './normalize'
import { resizeSchema, ResizeOperation } from './resize'
import { rotateSchema, RotateOperation } from './rotate'
import { saturateSchema, SaturateOperation } from './saturate'
import { scaleSchema, ScaleOperation } from './scale'
import { frameSchema, FrameOperation } from './frame'

import { scale } from './operations/_utils/scale'
import { frame } from './operations/_utils/frame'
import { compose } from './operations/_utils/compose'

export type Operation = 
  | BlurOperation
  | BrightenOperation
  | ComposeOperation
  | ExtendOperation
  | ExtractOperation
  | FlattenOperation
  | FlipOperation
  | FlopOperation
  | FrameOperation
  | HueRotateOperation
  | LightenOperation
  | LineateLevelsOperation
  | ModulateOperation
  | NormalizeOperation
  | ResizeOperation
  | RotateOperation
  | SaturateOperation
  | ScaleOperation;
  
const operationSchema = zod.union([
  // areaComposeSchema,
  blurSchema,
  brightenSchema,
  composeSchema,
  extendSchema,
  extractSchema,
  flattenSchema,
  flipSchema,
  flopSchema,
  frameSchema,
  hueRotateSchema,
  lightenSchema,
  lineateLevelsSchema,
  modulateSchema,
  normalizeSchema,
  resizeSchema,
  rotateSchema,
  saturateSchema,
  scaleSchema
])

export function isOperation (operation: unknown): Outcome.Either<Operation, string> {
  try { return Outcome.makeSuccess(operationSchema.parse(operation)) }
  catch (err) { return Outcome.makeFailure(unknownToString(err)) }
}

export async function transform (
  imageBuffer: Buffer,
  operations: Operation[],
  checkValidOperations?: boolean // Temp
): Promise<Buffer> {
  let sharpInstance = sharp(imageBuffer)
  const needsValidation = checkValidOperations ?? false
  for (const operation of operations) {
    const _isOperation = isOperation(operation);
    if (!needsValidation || _isOperation.success) {
      console.log('Images:Transform:Operation:Start', operation.name);
        // A new sharp Instance might be returned by some operations (most of the time composite) so we must reassign it
        sharpInstance = await apply(sharpInstance, operation)
  
      console.log('Images:Transform:Operation:Done', operation.name);
    }
  }
  return sharpInstance.toBuffer()
}


/* Utilities */

/* Operations */

export async function apply (
  sharpInstance: sharp.Sharp,
  operation: Operation
): Promise<sharp.Sharp> {
  switch(operation.name) {
    case OperationNames.Blur: return sharpInstance.blur(operation.params.sigma)
    case OperationNames.Brighten: return sharpInstance.blur(operation.params)
    case OperationNames.Compose: return compose(sharpInstance, operation.params)
    case OperationNames.Extend: return sharpInstance.extend(operation.params)
    case OperationNames.Extract: return sharpInstance.extract(operation.params)
    case OperationNames.Flip: return sharpInstance.flip(operation.params.flip)
    case OperationNames.Flop: return sharpInstance.flop(operation.params.flop)
    case OperationNames.Frame: return frame(sharpInstance, operation.params);
    case OperationNames.Flatten: return sharpInstance.flatten(operation.params)
    case OperationNames.HueRotate: return sharpInstance.modulate({ hue: operation.params })
    case OperationNames.Lighten: return sharpInstance.modulate({ lightness: operation.params })
    case OperationNames.LineateLevels: return sharpInstance.linear(operation.params.multiplier, operation.params.offset)
    case OperationNames.Modulate: return sharpInstance.modulate(operation.params)
    case OperationNames.Normalize: return sharpInstance.normalize(operation.params)
    case OperationNames.Resize: return sharpInstance.resize(operation.params)
    case OperationNames.Rotate: return sharpInstance.rotate(operation.params.angle)
    case OperationNames.Saturate: return sharpInstance.modulate({ saturation: operation.params})
    case OperationNames.Scale: return scale(sharpInstance, operation.params)
    default: return sharpInstance 
  }
}