import sharp from "sharp"
import { setColorSaturation, saturateColor } from '../../../../../../../../../agnostic/colors/saturate-color'
import { setColorLuminance, lightenColor } from '../../../../../../../../../agnostic/colors/lighten-color'
import { complementColor } from '../../../../../../../../../agnostic/colors/complement-color'
import { CreateLineBackground, ColorTransformation } from '../../../../../frame/backgrounds/create-line-background'

export async function createLineBackground(
    background: CreateLineBackground, 
    dimensions: { widthPx: number, heightPx: number },
    palette: [number, number, number][],
): Promise<sharp.OverlayOptions[]> {
    /* Dividing zones into N* Lines */
    const lineDimensions = {
        widthPx: dimensions.widthPx,
        heightPx: Math.round(dimensions.heightPx / background.params.nbLines) 
    }
    const sharpOverlays: sharp.OverlayOptions[] = []

    const maxPaletteLength = palette.length;
    const selectedColorIndex = background.params.colors.selectColorPaletteIndex === 'first' ? 0 : background.params.colors.selectColorPaletteIndex === 'last' ? palette.length - 1 : background.params.colors.selectColorPaletteIndex

    for (let i = 0; i < background.params.nbLines; i++) {
        const indexPalette = Math.min(Math.max(0, selectedColorIndex), maxPaletteLength);
        const RGBColor = palette[indexPalette] || [0, 0, 0]

        const primaryRGBColor = applyColorTransformations(RGBColor, background.params.colors.primaryTransformations)
        const secondaryRGBColor = applyColorTransformations(RGBColor, background.params.colors.secondaryTransformations)

        const outputRGBColor = i % 2 === 0 ? primaryRGBColor : secondaryRGBColor

        const topPx = Math.min(lineDimensions.heightPx * i,  dimensions.heightPx)
    
        sharpOverlays.push({
            input: {
                create: {
                    width: lineDimensions.widthPx,
                    height: i === background.params.nbLines - 1 ? dimensions.heightPx - topPx : lineDimensions.heightPx,
                    channels: 4,
                    background: { r: outputRGBColor[0], g: outputRGBColor[1], b: outputRGBColor[2], alpha: 1 }
                },
            },
            left: 0,
            top: topPx
        })
    }

    return sharpOverlays
}

function applyColorTransformations(RGBColor: [number, number, number], transformations: ColorTransformation[]) {
    transformations.forEach((transformation) => {
        RGBColor = transformColor(RGBColor, transformation)
    })
    return RGBColor
}

function transformColor(RGBColor: [number, number, number], transformation: ColorTransformation) {
    switch (transformation.type) {
        case 'saturate':
            return transformation.intensityMode === 'add' ? saturateColor(RGBColor, transformation.intensity) : setColorSaturation(RGBColor, transformation.intensity);
        case 'lighten':
            return transformation.intensityMode === 'add' ? lightenColor(RGBColor, transformation.intensity) : setColorLuminance(RGBColor, transformation.intensity);
        case 'complement':
            return complementColor(RGBColor);
    }
}