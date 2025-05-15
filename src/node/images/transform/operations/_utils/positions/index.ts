import { Positions, Position } from "../../../_utils/positions";

export function getNewPositions(
    inputDimensions: { widthPx: number, heightPx: number }, 
    outputDimensions: { widthPx: number, heightPx: number }, 
    positions?: Positions
) {
    const outputPositions = {
        x: 0,
        y: 0
    };

    if (positions === undefined) {
        return outputPositions;
    }
    if (positions.top) {
        outputPositions.y = calcPosition(positions.top, outputDimensions.heightPx);
    }

    if (positions.bottom) {
        outputPositions.y = outputDimensions.heightPx - (calcPosition(positions.bottom, outputDimensions.heightPx) + inputDimensions.heightPx);
    }

    if (positions.left) {
        outputPositions.x = calcPosition(positions.left, outputDimensions.widthPx);
    }

    if (positions.right) {
        outputPositions.x = outputDimensions.widthPx - (calcPosition(positions.right, outputDimensions.widthPx) + inputDimensions.widthPx);
    }

    if (positions.translateX) {
        outputPositions.x = outputPositions.x + calcPosition(positions.translateX, inputDimensions.widthPx);
    }
    if (positions.translateY) {
        outputPositions.y = outputPositions.y + calcPosition(positions.translateY, inputDimensions.heightPx);
    }

    /* This prevent input from going outside of output which would trigger a sharp error */

    const boundX = outputPositions.x + inputDimensions.widthPx;
    if (boundX > outputDimensions.widthPx) {
        outputPositions.x = outputPositions.x - (boundX - outputDimensions.widthPx);
    }

    const boundY = outputPositions.y + inputDimensions.heightPx;
    if (boundY > outputDimensions.heightPx) {
        outputPositions.y = outputPositions.y - (boundY - outputDimensions.heightPx);
    }

    outputPositions.x = Math.max(outputPositions.x, 0);
    outputPositions.y = Math.max(outputPositions.y, 0);

    return outputPositions;
}

export function calcPosition(position: Position, frameDimensionPx: number) {
    const interpretedPosition = interpretPosition(position);
    if (interpretedPosition.unit === '%') {
        return Math.round(frameDimensionPx * (interpretedPosition.value / 100));
    }
    return interpretedPosition.value;
}

export function interpretPosition(position: Position) {
    const interpretedPosition = {
        value: 0,
        unit: 'px'
    };

    if (typeof position === 'number') {
        interpretedPosition.value = position;
    }

    if (typeof position === 'string') {
        const matchedPosition = position.replace(/\s+/g, '').match(/(-\d+|\d+)([%]|[px])?/);
        if (matchedPosition) {
            if (matchedPosition[1]) {
                interpretedPosition.value = Number(matchedPosition[1]);
            }
            if (matchedPosition[2]) {
                interpretedPosition.unit = matchedPosition[2];
            }
        }
    }

    return interpretedPosition;
}
