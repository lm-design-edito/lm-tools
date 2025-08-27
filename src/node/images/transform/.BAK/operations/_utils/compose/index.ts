import { ComposeOperationParams } from "../../../../transform/compose";
import sharp from "sharp";
import { getRelativePxPositionsInWrapperFor } from "../positions";

export async function compose(
  imageSharp: sharp.Sharp,
  params: ComposeOperationParams
): Promise<sharp.Sharp> {
  const imageMetadata = await imageSharp.metadata();
  const imageDimensions = {
    widthPx: imageMetadata.width || 0,
    heightPx: imageMetadata.height || 0,
  };

  /* Create a new Sharp */
  const backgroundColor = params.background || { r: 0, g: 0, b: 0, alpha: 0 };
  const composition: sharp.OverlayOptions[] = [
    {
      input: await imageSharp.toFormat("png").toBuffer(),
      left: 0,
      top: 0,
    },
  ];
  for (const image of params.images) {
    const overlay: sharp.OverlayOptions = {
      input: Buffer.from([]),
      top: 0,
      left: 0,
      ...("blend" in image ? { blend: image.blend } : {}),
      ...("tile" in image ? { tile: image.tile } : {}),
    };
    const overlayDimensions = {
      widthPx:
        image &&
        "dimensions" in image &&
        image.dimensions &&
        image.dimensions.widthPx
          ? image.dimensions.widthPx
          : imageDimensions.widthPx,
      heightPx:
        image &&
        "dimensions" in image &&
        image.dimensions &&
        image.dimensions.heightPx
          ? image.dimensions.heightPx
          : imageDimensions.heightPx,
    };

    const overlayPositions = getRelativePxPositionsInWrapperFor(
      overlayDimensions,
      imageDimensions,
      image.positions
    );

    overlay.top = overlayPositions.y || 0;
    overlay.left = overlayPositions.x || 0;

    if (Buffer.isBuffer(image.input)) {
      const imageToResize = sharp(image.input);
      imageToResize.resize({
        width: overlayDimensions.widthPx,
        height: overlayDimensions.heightPx,
        fit: "inside",
        withoutEnlargement: true,
      });
      const resizedInput = await imageToResize
        .toFormat("png")
        .png({ quality: 100 })
        .toBuffer();
      if (resizedInput) {
        overlay.input = resizedInput;
      }
    } 
    else {
      if ("mode" in image.input) {
        switch (image.input.mode) {
          case "fill":
            overlay.input = {
              create: {
                background: image.input.background,
                channels: image.input.nbChannels || 3,
                width: overlayDimensions.widthPx,
                height: overlayDimensions.heightPx,
              },
            };
            break;
          case "gradient":
            overlay.input = Buffer.from(`<svg viewBox="0 0 ${
              overlayDimensions.widthPx
            } ${
              overlayDimensions.heightPx
            }" xmlns="http://www.w3.org/2000/svg"  xmlns:xlink="http://www.w3.org/1999/xlink" width="${
              overlayDimensions.widthPx
            }" height="${overlayDimensions.heightPx}">
              <defs>
                <linearGradient id="myGradient" gradientTransform="rotate(${
                  image.input.angleDeg
                })">
                ${image.input.colorStops
                  .map(
                    (colorStop) =>
                      `<stop offset="${
                        colorStop.offsetPercent
                      }%" stop-color="${getColorAsString(colorStop.color)}" />`
                  )
                  .join(" ")}
                </linearGradient>
              </defs>
              <rect  x="0" y="0" width="100%" height="100%" fill="url('#myGradient')"></rect>
            </svg>`);
            break;
        }
      }
    }
    composition.push(overlay);
  }

  const newComposedSharp = sharp({
    create: {
      background: backgroundColor,
      width: imageDimensions.widthPx,
      height: imageDimensions.heightPx,
      channels: 4,
    },
  })
  .toFormat("png")
  .composite(composition)
  .png({ quality: 100 });

  return newComposedSharp;
}

const getColorAsString = (color: sharp.Color) => {
  if (typeof color === "string") {
    return color;
  }
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${
    color.alpha !== undefined ? color.alpha : 1
  })`;
};
