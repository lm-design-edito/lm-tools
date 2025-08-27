import sharp from 'sharp';
import { shuffle } from '../../../../../../../../../agnostic/arrays/shuffle';
import { clamp } from '../../../../../../../../../agnostic/numbers/clamp';
import { randomInt } from '../../../../../../../../../agnostic/random/random';
import { Transitions } from '../../../../../../../../../agnostic/time/transitions';
import { CreateTileBackground } from '../../../../../frame/backgrounds/create-tile-background';

type Coordinates = { 
    x: number, 
    y: number, 
    w: number, 
    h: number 
}

export const DEFAULT_CREATE_BACKGROUND_TILE_PARAMS: CreateTileBackground['params'] = {
    coverageRatio: 0.5,
    densityA: { min: 0, max: 0 },
    densityB: { min: 0, max: 0 },
    format: 'random',
    xEasing: "linear",
    yEasing: "linear"
}

export async function createTileBackground(
    background: CreateTileBackground, 
    dimensions: { widthPx: number, heightPx: number },
    imageCoordinates: Coordinates,
    colorPalette: [number, number, number][],
): Promise<sharp.OverlayOptions[]> {
    background = {
        ...background,
        params: {
            ...DEFAULT_CREATE_BACKGROUND_TILE_PARAMS,
            ...background.params 
        }
    }

    const tileCoordinatesList = getPackedTilesCoordinatesList(
        { 
            x: imageCoordinates.x, 
            y: imageCoordinates.y, 
            w: imageCoordinates.w, 
            h: imageCoordinates.h 
        },
        dimensions,
        background.params.coverageRatio,
        {
            A: background.params.densityA,
            B: background.params.densityB
        },
        { 
            X: background.params.xEasing, 
            Y: background.params.yEasing 
        },
        background.params.format
    );

    return createSharpOverlaysFromCoordinatesList(
        tileCoordinatesList,
        colorPalette
    );
}


function getPackedTilesCoordinatesList(
    coordinatesToAvoid: { x: number, y: number, w: number, h: number }, 
    dimensions: { widthPx: number, heightPx: number }, 
    tileCoverageRatio: number, 
    tileDensity: { A: { min: number, max: number }, B:  { min: number, max: number } }, 
    tileEasing: { 
        X: CreateTileBackground['params']['xEasing'], 
        Y: CreateTileBackground['params']['yEasing']
    },  
    tileFormat?: string
): Coordinates[] {
    const areaCoordinatesList: Coordinates[] = [];

    const baseFormat = {
        nbCells: 9,
        cellAvoidIndex: 4,
        nbRows: 3,
        nbColumns: 3,
    }
    
    /* We'll create tiles all around this positions to avoid */
    const positionsToAvoid = {
        top: Math.ceil(coordinatesToAvoid.y),
        bottom: Math.ceil(coordinatesToAvoid.y + coordinatesToAvoid.h),
        left:  Math.ceil(coordinatesToAvoid.x),
        right:  Math.ceil(coordinatesToAvoid.x + coordinatesToAvoid.w),
    }
    
    /* Considering our basis is a 3x3 grid, we need to calculate the coordinates of each cell */
    for (let i = 0; i < baseFormat.nbCells; i++) {
        if ( i === baseFormat.cellAvoidIndex ) { continue; }
        const middleColumn = i % baseFormat.nbColumns === 1;
        const rightColumn = i % baseFormat.nbColumns === 2;
        
        const topRow = i < baseFormat.nbRows;
        const middleRow = !topRow && i < (baseFormat.nbRows * 2);
        const bottomRow = !topRow && !middleRow;
        
        areaCoordinatesList[i] = { x: 0, y: 0, w: positionsToAvoid.left, h: positionsToAvoid.top};
        
        if (middleColumn) {
            areaCoordinatesList[i]!.x = positionsToAvoid.left;
            areaCoordinatesList[i]!.w = coordinatesToAvoid.w;
        } 
        
        if (rightColumn) {
            areaCoordinatesList[i]!.x = positionsToAvoid.right;
        } 
        
        if (middleRow) {
            areaCoordinatesList[i]!.y = positionsToAvoid.top;
            areaCoordinatesList[i]!.h = coordinatesToAvoid.h;
        }
        
        if (bottomRow) {
            areaCoordinatesList[i]!.y = positionsToAvoid.bottom;
            areaCoordinatesList[i]!.h = dimensions.heightPx - positionsToAvoid.bottom;
        }
    }

    /* We're shuffling to make sur we get different areas covered if necessary */
    const filteredAreaCoordinatesList: Coordinates[] = shuffle(areaCoordinatesList.filter((areaCoordinate) => areaCoordinate.w !== 0 && areaCoordinate.h !== 0)); 
    const subTiles: Coordinates[] = [];
    
    const nbAreas = filteredAreaCoordinatesList.length;
    const nbAreasToCover = Math.round(nbAreas * tileCoverageRatio  )
    
    /* Then if we required a bigger tileDensity, we must divide those areas into tiles */
    if (tileDensity.A.min > 1 || tileDensity.A.max > 1 ||tileDensity.B.min > 1 || tileDensity.B.max > 1) {
        filteredAreaCoordinatesList.forEach((areaCoordinates, index) => {
            if (index > nbAreasToCover) {
                subTiles.push(areaCoordinates);
                return; 
            }
            
            /* 1st step is to calculate the proportion each tile should take (creates a repartition) */
            const { nbRows, nbColumns } = getNbRowsAndColumnsForFormat(
                randomInt(tileDensity.A.min, tileDensity.A.max) || 0, 
                randomInt(tileDensity.B.min, tileDensity.B.max) || 0, 
                { widthPx: areaCoordinates.w, heightPx: areaCoordinates.h }, 
                tileFormat
            );
            const XEasingFunc =  (tileEasing.X && tileEasing.X in Transitions.easings ? Transitions.easings[tileEasing.X] : Transitions.easings.linear) || function (x: number) { return x; };
            const YEasingFunc = (tileEasing.Y in Transitions.easings ? Transitions.easings[tileEasing.Y] : Transitions.easings.linear)  || function (x: number) { return x; };

            const tiles: Array<{x: number, y: number}> = [];
            for (let i = 0; i < nbRows; i++) {
                for (let j = 0; j < nbColumns; j++) {
                    const columnI = j;
                    const rowI = i;
                    const x = Math.ceil(areaCoordinates.w * XEasingFunc(columnI / nbColumns));
                    const y = Math.ceil(areaCoordinates.h *  YEasingFunc(rowI / nbRows));
                    tiles.push({ 
                        x: areaCoordinates.x + x, 
                        y: areaCoordinates.y + y
                    });
                }
            }
            
            const nbTiles = tiles.length;
            tiles.forEach((subTileCoord, i) => {
                const tileNum = i + 1;
                const nextTileX = tileNum % nbColumns > 0 ? tiles[i + 1]: null;
                const nextTileY = i + nbColumns < nbTiles ? tiles[i + nbColumns]: null;
                
                const subTileBounds = {
                    x: nextTileX ? nextTileX.x : areaCoordinates.x + areaCoordinates.w,
                    y: nextTileY ? nextTileY.y : areaCoordinates.y + areaCoordinates.h,
                }
                
                subTiles.push({
                    x: subTileCoord.x,
                    y: subTileCoord.y,
                    w: subTileBounds.x - subTileCoord.x,
                    h: subTileBounds.y - subTileCoord.y
                });
            });
        });
    }
    
    /* Returning the coordinates of the tiles and clearing them to make sure we get valid coordinates */
    return (subTiles.length ? subTiles : filteredAreaCoordinatesList).map((tile) => ({
        w: clamp(tile.w, 0, dimensions.widthPx),
        h: clamp(tile.h, 0, dimensions.heightPx),
        x: clamp(tile.x, 0, dimensions.widthPx),
        y: clamp(tile.y, 0, dimensions.heightPx),
    })).filter((tile) => tile.w > 0 && tile.h > 0);
}

function getNbRowsAndColumnsForFormat(tileDensityA: number, tileDensityB: number, tileDimensions: { widthPx: number, heightPx: number }, tileFormat?: string) {
    switch (tileFormat) {
        case 'random':
        const random = Math.random() > Math.random();
        return {
            nbRows: random ? tileDensityA : tileDensityB,
            nbColumns: random ? tileDensityB : tileDensityA,
        }
        case 'portrait':
        return {
            nbRows: tileDensityA,
            nbColumns: tileDensityB,
        }
        case 'landscape':
        return {
            nbRows: tileDensityB,
            nbColumns: tileDensityA,
        }
        default:
        return {
            nbRows: tileDimensions.widthPx > tileDimensions.heightPx ? tileDensityA : tileDensityB,
            nbColumns: tileDimensions.widthPx > tileDimensions.heightPx ? tileDensityB : tileDensityA,
        }
    }
}


function createSharpOverlaysFromCoordinatesList(
    tileCoordinatesList: Coordinates[], 
    colorPalette: [number, number, number][],
): sharp.OverlayOptions[] {

    let usedColorsIndexes: number[] = [];
    const colorPaletteLength = colorPalette.length;

    const getRGBColor = () => {
        const getUnusedColorIndex = () => {
            const paletteIndex = randomInt(0, colorPaletteLength) || 0;
            resetUnusedColorIndexesIfNeeded();
    
            if (usedColorsIndexes.includes(paletteIndex)) {
                return getUnusedColorIndex();
            }
    
            usedColorsIndexes.push(paletteIndex);
            return paletteIndex;
        }
    
        const resetUnusedColorIndexesIfNeeded = () => {
            if (usedColorsIndexes.length !== colorPaletteLength) {
                return;
            }
            usedColorsIndexes = [];
        }

        const colorPaletteIndex = getUnusedColorIndex();
        const RGBColor = colorPalette[colorPaletteIndex];
        if (!RGBColor) {
            return [0, 0, 0]
        }
        return RGBColor;
    }

    return tileCoordinatesList.map((tileCoordinates) => {
        const RGBColor = getRGBColor();
        return {
            top: Math.floor(tileCoordinates.y),
            left: Math.floor(tileCoordinates.x),
            input: {
                create: {
                    width: Math.round(tileCoordinates.w),
                    height: Math.round(tileCoordinates.h),
                    channels: 4,
                    background: {
                        r: RGBColor[0],
                        g: RGBColor[1],
                        b: RGBColor[2],
                        alpha: 1
                    }
                }
            }
        };
    });
}
