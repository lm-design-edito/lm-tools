import { HSLToRGB } from "../hsl-to-rgb";
import { RGBToHSL } from "../rgb-to-hsl";

export function lightenColor (color: [number, number, number], intensity: number = 20): [number, number, number] {
    const [h, s, l] = RGBToHSL(color);
    const rgb = HSLToRGB([h, s, Math.min(100, l + intensity)]);
    return rgb;
}

export function setColorLuminance(color: [number, number, number], intensity: number = 20): [number, number, number] {
    const [h, s] = RGBToHSL(color);
    const rgb = HSLToRGB([h, s, Math.min(100, intensity)]);
    return rgb; 
}
