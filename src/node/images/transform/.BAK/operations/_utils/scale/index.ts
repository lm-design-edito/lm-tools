import { ScaleOperationParams } from "../../../scale";
import sharp from "sharp";

export async function scale (
  imageSharp: sharp.Sharp,
  params: ScaleOperationParams
): Promise<sharp.Sharp> {
    const imageMetadata = await imageSharp.metadata()
    const imageDimensions = {
      width: imageMetadata.width ?? 0,
      height: imageMetadata.height ?? 0
    }

    const xRatio = 'xRatio' in params && params.xRatio !== undefined ? params.xRatio : 1;
    const yRatio = 'yRatio' in params  && params.yRatio !== undefined ? params.yRatio : 1;
    const background = 'background' in params  && params.background !== undefined ? params.background : { r: 0, g: 0, b: 0, alpha: 0 };
    return imageSharp.resize({
      width: Math.floor(imageDimensions.width * xRatio ),
      height: Math.floor(imageDimensions.width * yRatio),
      fit: sharp.fit.contain,
      background
    })
}