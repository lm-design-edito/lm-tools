import { FrameOperationParams } from "../../../frame";
import sharp from "sharp";
import { createLineBackground } from "./backgrounds/create-line-background";
import { createColorPalette } from "./create-color-palette";
import { clamp } from "../../../../../../../agnostic/numbers/clamp";
import { createTileBackground } from "./backgrounds/create-tile-background";
import { getRelativePxPositionsInWrapperFor } from "../positions";

export async function frame(
  imageSharp: sharp.Sharp,
  params: FrameOperationParams
): Promise<sharp.Sharp> {
    const imageMetadata = await imageSharp.metadata()
    const imageDimensions = {
      widthPx: imageMetadata.width ?? 0,
      heightPx: imageMetadata.height ?? 0
    }

    /* Handles scale inside frame */
    const scaledImage = scaleImageToFrame(
        imageSharp,
        imageDimensions,
        params.dimensions,
        params.imageScale
    );
    imageSharp = scaledImage.sharpInstance;
    imageDimensions.widthPx = scaledImage.widthPx;
    imageDimensions.heightPx = scaledImage.heightPx;

    const defaultBackgroundColorCreate = getDefaultBackgroundColor(params.background);

    const imagePositions = getRelativePxPositionsInWrapperFor(imageDimensions, params.dimensions, params.positions);

    const backgroundOverlays = await getBackgroundOverlays(
        {
            sharp: imageSharp,
            dimensions: imageDimensions
        },
        params.background, 
        params.dimensions,
        {
            x: imagePositions.x,
            y: imagePositions.y,
            w: imageDimensions.widthPx,
            h: imageDimensions.heightPx
        }
    );
      
    const composition = [
        ...backgroundOverlays,
        {
            input: await imageSharp.toFormat('png').png({ quality: 100 }).toBuffer(), /* Make sure we work with the best quality of our file */
            left: imagePositions.x,
            top: imagePositions.y,
        }
    ];

    /* To ensure that our new sharp composition has no format error later, we must set its format */
    const frameSharpInstance =  sharp({
        create: {
            background: defaultBackgroundColorCreate,
            width: params.dimensions.widthPx,
            height: params.dimensions.heightPx,
            channels: 4 
        }
    }).ensureAlpha(0).composite(composition).png({ quality: 100 }); /* Make sure we work with the best quality of our file */

    return frameSharpInstance;
}

const scaleImageToFrame = (imageSharp: sharp.Sharp, imageDimensions: { widthPx: number, heightPx: number }, frameDimensions: { widthPx: number, heightPx: number}, imageScale?: { xRatio?: number, yRatio?: number}) => {
     const scale = {
        xRatio: 1,
        yRatio: 1
    };
    const frameZoneDimensions = {
        widthPx: frameDimensions.widthPx,
        heightPx: frameDimensions.heightPx,
    }
    
    if (imageScale) {
        frameZoneDimensions.widthPx = frameDimensions.widthPx * (imageScale.xRatio || 1);
        frameZoneDimensions.heightPx = frameDimensions.heightPx * (imageScale.yRatio || 1);
    } 

    const containedRatiosPercents = getContainedRatios(
        imageDimensions.widthPx,
        imageDimensions.heightPx,
        frameZoneDimensions.widthPx,
        frameZoneDimensions.heightPx
    );

    if (imageScale || (!imageScale && imageDimensions.widthPx < frameDimensions.widthPx && imageDimensions.heightPx < frameDimensions.heightPx)) {
        scale.xRatio = containedRatiosPercents.xPercent;
        scale.yRatio = containedRatiosPercents.yPercent;
    }

    if (scale.xRatio !== 1 || scale.yRatio !== 1) {
        imageDimensions.widthPx = clamp(Math.round(imageDimensions.widthPx * scale.xRatio), 0, frameDimensions.widthPx);
        imageDimensions.heightPx = clamp(Math.round(imageDimensions.heightPx * scale.yRatio), 0, frameDimensions.heightPx);

        imageSharp = imageSharp.resize({
            width: imageDimensions.widthPx,
            height: imageDimensions.heightPx,
            fit: sharp.fit.inside,
            position: 'center',
            fastShrinkOnLoad: false
        });
    }
    return {
        sharpInstance: imageSharp,
        widthPx: imageDimensions.widthPx,
        heightPx: imageDimensions.heightPx
    }
}

const getDefaultBackgroundColor = (background: FrameOperationParams['background']) => {
    if (background && (typeof background === 'object' && 'r' in background)) {
        return {
            r: background.r || 255,
            g: background.g || 255,
            b: background.b || 255,
            alpha: background.alpha || 0    
        };
    }
    return { r: 255, g: 255, b: 255, alpha: 0 }
}

const getBackgroundOverlays = (
    imageInput: {
        sharp: sharp.Sharp,
        dimensions: {
            widthPx: number,
            heightPx: number
        }
    }, 
    background: FrameOperationParams['background'], 
    dimensions: FrameOperationParams['dimensions'],
    imageCoordinates: {
        x: number,
        y: number,
        w: number,
        h: number
    }
): Promise<sharp.OverlayOptions[]> => {
    const backgroundOverlays: sharp.OverlayOptions[] = [];
    return new Promise(async (resolve, reject) => {
        if (!background || 
            typeof background !== 'object' || 
            typeof background === 'object' && !('type' in background)
        ) {
            resolve(backgroundOverlays);
            return;
        }

        const imageBuffer = await imageInput.sharp.raw().toBuffer();
        const nbImageChannels = (await imageInput.sharp.metadata()).channels || 3;
        const colorPalette = createColorPalette(
            {
                buffer: imageBuffer,
                nbChannels: nbImageChannels,
                dimensions: imageInput.dimensions
            },
            background.colorPalette
        );

        switch (background.type) {
            case 'line':
                return resolve(createLineBackground(background, dimensions, colorPalette));
            case 'tile':
                return resolve(createTileBackground(background, dimensions, imageCoordinates, colorPalette));
            default:
                resolve(backgroundOverlays);
        }
        reject(new Error('Unknown background type'));
    });
}


export function getContainedRatios(widthPx: number, heightPx: number, wrapperWidthPx: number, wrapperHeightPx: number, withoutReduction?: boolean) {
    if (withoutReduction && widthPx <= wrapperWidthPx && heightPx <= wrapperHeightPx) {
        return { xPercent: 100, yPercent: 100 };
    }

    const wrapperRatio = wrapperWidthPx / wrapperHeightPx;
    const imgRatio = widthPx / heightPx;
    const containRatio = clamp((imgRatio > wrapperRatio ? wrapperWidthPx / widthPx : wrapperHeightPx / heightPx), 0, 100);
    
    return {
        xPercent: containRatio,
        yPercent: containRatio
    }
}