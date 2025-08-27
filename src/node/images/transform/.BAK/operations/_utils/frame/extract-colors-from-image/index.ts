import quantize from 'quantize';

export function getPixel (
    buffer: Buffer<ArrayBufferLike>, 
    x: number,
    y: number, 
    width: number, 
    nbChannels: number
): [number, number, number] {
    /* 
        In a buffer each pixel is stored as (considering 3 channels) : 
        x=0, y=0 = buffer[0], buffer[1], buffer[2]
        x=1, y=0 = buffer[3], buffer[4], buffer[5]
        x=2, y=0 = buffer[6], buffer[7], buffer[8]
    */

    /* Knowing this, we calculate the index in the data buffer matching this pixel */
    const index = nbChannels * (width * y + x); 
    const r =  buffer[index] || 0;
    const g =  buffer[index + 1] || 0;
    const b =  buffer[index + 2] || 0;

    return [r, g, b];
}

export function getPixels (
    buffer: Buffer<ArrayBufferLike>, 
    widthPx: number, 
    heightPx: number, 
    nbChannels: number = 3
) 
{
    const pixels: [number, number, number][] = []; 

    /* We loop through each pixel in X + Y to get the RGB matching the pixel */
    for (let i = 0; i < widthPx; i++) {
        for (let j = 0; j < heightPx; j++) {
            const pixel = getPixel(buffer, i, j, widthPx, nbChannels);
            pixels.push(pixel);
        }
    } 
    return pixels;
}

export function extractColorsFromImage(
    image: {
        buffer: Buffer<ArrayBufferLike>,
        dimensions: { 
            widthPx: number, 
            heightPx: number 
        },
        nbChannels: number
    },
    nbColors: number
): [number, number, number][] {
    
    /* Retrieve each pixel of image */
    const pixels = getPixels(
        image.buffer, 
        image.dimensions.widthPx, 
        image.dimensions.heightPx, 
        image.nbChannels
    );

    /* Uses quantization to calc palette */
    nbColors = Math.max(1, nbColors < 5 ? nbColors - 1 : nbColors);
    const colorMap = quantize(pixels, nbColors);

    return colorMap ? colorMap.palette() : [];
}