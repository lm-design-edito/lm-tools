/**
 * Operating system families this module can name.
 *
 * iPhone and iPad both resolve to `IOS`: they share an engine constraint, an app
 * store and a bug surface, and a caller asking « is this iOS » means both.
 */
export enum OperatingSystemName {
  IOS = 'iOS',
  ANDROID = 'Android',
  MACOS = 'macOS',
  WINDOWS = 'Windows',
  LINUX = 'Linux',
  CHROMEOS = 'ChromeOS'
}

/**
 * Browser engines this module can name. Dead engines (EdgeHTML, Trident) are
 * deliberately absent.
 */
export enum BrowserEngineName {
  BLINK = 'Blink',
  WEBKIT = 'WebKit',
  GECKO = 'Gecko'
}

/**
 * Browser brands this module can name.
 *
 * `Chromium` is not one of them: every Blink browser lists it, so an unrecognised
 * Blink browser is reported as unknown rather than as Chrome.
 */
export enum BrowserBrandName {
  CHROME = 'Chrome',
  SAFARI = 'Safari',
  FIREFOX = 'Firefox',
  EDGE = 'Edge',
  OPERA = 'Opera',
  SAMSUNG_INTERNET = 'Samsung Internet',
  DUCKDUCKGO = 'DuckDuckGo'
}

/**
 * How a value was reached, strongest first.
 *
 * - `PROBED`   : a feature test the runtime answered
 * - `DECLARED` : a structured self-report, `navigator.userAgentData`
 * - `PARSED`   : a token found in the user agent string
 * - `INFERRED` : deduced from another axis, or from a corroborating signal
 */
export enum Certainty {
  PROBED = 'probed',
  DECLARED = 'declared',
  PARSED = 'parsed',
  INFERRED = 'inferred'
}

/**
 * A value, how much it can be trusted, and what led to it.
 *
 * @template T - The vocabulary the value belongs to.
 * @property value - The suspected value.
 * @property certainty - How the value was reached.
 * @property signals - The evidence behind it, meant to be logged when a verdict
 * is surprising in the field.
 */
export type Suspicion<T> = {
  value: T
  certainty: Certainty
  signals: string[]
}

/**
 * What a client can be suspected of being. A `null` field means no positive
 * evidence was found — never that the absent value was ruled out.
 *
 * @property operatingSystem - The OS family.
 * @property browserEngine - The rendering engine.
 * @property browserBrand - The browser's commercial name.
 */
export type Client = {
  operatingSystem: Suspicion<OperatingSystemName> | null
  browserEngine: Suspicion<BrowserEngineName> | null
  browserBrand: Suspicion<BrowserBrandName> | null
}

/**
 * Engine markers, each exclusive to one engine. `null` means the probe could not
 * run at all, which is not the same as a negative answer.
 *
 * @property mozAppearance - A Gecko-only CSS property.
 * @property gestureEvent - A WebKit-only event constructor.
 * @property chromeNamespace - A Blink-only global.
 */
export type EngineProbes = {
  mozAppearance: boolean | null
  gestureEvent: boolean | null
  chromeNamespace: boolean | null
}

/**
 * One entry of `navigator.userAgentData.brands`.
 *
 * @property brand - The brand's name, possibly a GREASE decoy.
 * @property version - Its major version, as a string.
 */
export type UserAgentDataBrand = {
  brand: string
  version: string
}

/**
 * Everything the suspicions are computed from, snapshotted so that the logic
 * stays pure and testable outside a browser.
 *
 * @property userAgent - The client's self-declaration. Spoofable, never a proof.
 * @property vendor - Deprecated, but still the cheapest WebKit signal.
 * @property maxTouchPoints - Tells an iPad from a Mac, both of which claim macOS.
 * @property userAgentDataPlatform - The low-entropy platform hint, Blink only.
 * @property userAgentDataBrands - The brand list, Blink only, GREASE included.
 * @property engineProbes - Feature tests that cannot go through an injected window.
 */
export type ClientEnvironment = {
  userAgent: string
  vendor: string
  maxTouchPoints: number
  userAgentDataPlatform: string | null
  userAgentDataBrands: UserAgentDataBrand[]
  engineProbes: EngineProbes
}
