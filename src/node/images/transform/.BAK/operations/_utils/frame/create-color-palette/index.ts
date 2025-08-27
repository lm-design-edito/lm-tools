import { complementColor } from "../../../../../../../../agnostic/colors/complement-color";
import { lightenColor } from "../../../../../../../../agnostic/colors/lighten-color";
import { saturateColor } from "../../../../../../../../agnostic/colors/saturate-color";
import { clamp } from "../../../../../../../../agnostic/numbers/clamp";
import { shuffle } from "../../../../../../../../agnostic/arrays/shuffle";
import { FrameCreateBackground } from "../../../../frame";
import { extractColorsFromImage } from "../extract-colors-from-image";

export type DensifyPaletteType = ('default' | 'default-lighten' | 'default-saturate' | 'complementary' | 'complementary-lighten' | 'complementary-saturate')[];

/* @todo : ajouter une gestion de manipulation de colors ? */ 
export function densifyPalette(
    RGBColors: [number, number, number][],
    types?: DensifyPaletteType,
    ligthenIntensity?: number,
    saturateIntensity?: number
) {
    const densifiedPalette = [];
    const complementaryRGBColors = RGBColors.map((color) => complementColor(color));

    if (!types) {
        return RGBColors;
    }

    if (types.includes('default')) {
        densifiedPalette.push(...RGBColors);
    }

    if (types.includes('default-lighten')) {
        densifiedPalette.push(...RGBColors.map((RGBColor) => lightenColor(RGBColor, ligthenIntensity || 0)))
    }

    if (types.includes('default-saturate')) {
        densifiedPalette.push(...RGBColors.map((RGBColor) => saturateColor(RGBColor, saturateIntensity)))
    }

    if (types.includes('complementary')) {
        densifiedPalette.push(...complementaryRGBColors)
    }

    if (types.includes('complementary-lighten')) {
        densifiedPalette.push(...complementaryRGBColors.map((RGBColor) => lightenColor(RGBColor, ligthenIntensity || 0)))
    }

    if (types.includes('complementary-saturate')) {
       densifiedPalette.push(...RGBColors.map((RGBColor) => saturateColor(RGBColor, saturateIntensity)))
    }

    return densifiedPalette;
}

// Create color palette
export function createColorPalette(
    image: {
        buffer: Buffer<ArrayBufferLike>,
        nbChannels: number,
        dimensions: {
            widthPx: number,
            heightPx: number
        }
    },
    createPalette?: FrameCreateBackground['colorPalette']
): [number, number, number][] {
    if (!createPalette) {
        return [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];
    }

    const colorPalette = [];

    if ('extract' in createPalette && createPalette.extract) {
        colorPalette.push(
            ...extractColorsFromImage(
                {
                    buffer: image.buffer,
                    dimensions: image.dimensions,
                    nbChannels: image.nbChannels
                },
                createPalette.extract.nbColor
            )
        );
    }

    if ('use' in createPalette && createPalette.use) {
        colorPalette.push(...createPalette.use.RGBColors);
    }

    if ('densify' in createPalette && createPalette.densify) {
        colorPalette.push(
            ...densifyPalette(
                colorPalette,
                createPalette.densify.types,
                createPalette.densify.ligthenIntensity,
                createPalette.densify.saturateIntensity,
            )
        )
    }

    if ('compose' in createPalette && createPalette.compose) {
        if ('nbColor' in createPalette.compose) {
            const maxNbColor = createPalette.compose.nbColor ? clamp(createPalette.compose.nbColor, 0, colorPalette.length) : colorPalette.length;
            colorPalette.splice(0, maxNbColor);
        } 

        if ('mix' in createPalette.compose) {
            return shuffle(colorPalette);
        }
    }
    return colorPalette;
}