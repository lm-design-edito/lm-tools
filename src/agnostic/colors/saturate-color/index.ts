import { HSLToRGB } from "../hsl-to-rgb";
import { RGBToHSL } from "../rgb-to-hsl";

export function saturateColor(color: [number, number, number], intensity: number = 20): [number, number, number] {  
    const [h, s, l] = RGBToHSL(color);
    const rgb = HSLToRGB([h, Math.min(100, s + intensity), l]);
    return rgb;
}

export function setColorSaturation(color: [number, number, number], intensity: number = 20): [number, number, number] {
    const [h, s, l] = RGBToHSL(color);
    const rgb = HSLToRGB([h, Math.min(100, intensity), l]);
    return rgb;
}
