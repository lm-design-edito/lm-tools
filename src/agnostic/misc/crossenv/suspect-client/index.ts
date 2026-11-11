import { tryCatch } from '../../../errors/try-catch/index.js'
import { isRecord } from '../../../objects/is-record/index.js'
import { getPayload } from '../../outcome/index.js'
import type { MinimalNavigator } from '../types.js'
import * as Window from '../window/index.js'
import {
  BrowserBrandName,
  BrowserEngineName,
  Certainty,
  OperatingSystemName,
  type Client,
  type ClientEnvironment,
  type EngineProbes,
  type Suspicion,
  type UserAgentDataBrand
} from './types.js'

declare const GestureEvent: unknown
declare const chrome: unknown

/**
 * Suspects the operating system, rendering engine and brand of the current
 * client, each with the evidence that led to it.
 *
 * @param env - Overrides for the environment the suspicions are read from.
 * Omitted fields are read off the window handed by `crossenv/window`.
 * @returns A `Client` whose three fields are each a `Suspicion` or `null`.
 *
 * @remarks
 * Nothing here is a proof. Every axis rests on a self-declaration the client can
 * spoof or a feature test a future browser may answer differently, so a field is
 * `null` whenever no positive evidence was found — absence never promotes the
 * other branch. Use it for analytics, store links and known-bug workarounds;
 * when the question is whether something *works*, feature-detect it instead.
 *
 * @example
 * ```ts
 * const { operatingSystem } = suspectClient()
 * const isIos = operatingSystem?.value === OperatingSystemName.IOS
 * ```
 */
export function suspectClient (env?: Partial<ClientEnvironment>): Client {
  const environment: ClientEnvironment = { ...readClientEnvironment(), ...env }
  const operatingSystem = suspectOperatingSystem(environment)
  return {
    operatingSystem,
    browserEngine: suspectBrowserEngine(environment, operatingSystem),
    browserBrand: suspectBrowserBrand(environment)
  }
}

const appleVendor = 'Apple Computer, Inc.'

const operatingSystemPlatformStrings = new Map<string, OperatingSystemName>([
  ['android', OperatingSystemName.ANDROID],
  ['ios', OperatingSystemName.IOS],
  ['ipados', OperatingSystemName.IOS],
  ['macos', OperatingSystemName.MACOS],
  ['windows', OperatingSystemName.WINDOWS],
  ['linux', OperatingSystemName.LINUX],
  ['chrome os', OperatingSystemName.CHROMEOS],
  ['chromium os', OperatingSystemName.CHROMEOS]
])

// Android and ChromeOS both carry Linux's token, so they are tested before it.
const operatingSystemUserAgentTokens: Array<[RegExp, OperatingSystemName]> = [
  [/iPhone|iPod|iPad/iv, OperatingSystemName.IOS],
  [/Android/iv, OperatingSystemName.ANDROID],
  [/CrOS/v, OperatingSystemName.CHROMEOS],
  [/Windows NT/iv, OperatingSystemName.WINDOWS],
  [/Macintosh|Mac OS X/iv, OperatingSystemName.MACOS],
  [/X11|Linux/iv, OperatingSystemName.LINUX]
]

const engineProbeMarkers: Array<[keyof EngineProbes, BrowserEngineName, string]> = [
  ['mozAppearance', BrowserEngineName.GECKO, 'CSS.supports(-moz-appearance)'],
  ['gestureEvent', BrowserEngineName.WEBKIT, 'window.GestureEvent'],
  ['chromeNamespace', BrowserEngineName.BLINK, 'window.chrome']
]

// Blink carries AppleWebKit's token, so it is tested first. `Gecko/` and `rv:`
// are the real Gecko markers — « like Gecko » sits in every other engine's UA.
const browserEngineUserAgentTokens: Array<[RegExp, BrowserEngineName]> = [
  [/Gecko\/|rv:\d/v, BrowserEngineName.GECKO],
  [/Chrome\/|Chromium\/|Edg\//v, BrowserEngineName.BLINK],
  [/AppleWebKit\//v, BrowserEngineName.WEBKIT]
]

// The spec mandates a randomised decoy brand, so an exact match is never safe.
const greaseBrandPattern = /not[^a-z0-9]*a[^a-z0-9]*brand/iv

const browserBrandDataNames = new Map<string, BrowserBrandName>([
  ['google chrome', BrowserBrandName.CHROME],
  ['microsoft edge', BrowserBrandName.EDGE],
  ['opera', BrowserBrandName.OPERA],
  ['samsung internet', BrowserBrandName.SAMSUNG_INTERNET],
  ['duckduckgo', BrowserBrandName.DUCKDUCKGO]
])

// Every brand impersonates the ones before it, so the order is most specific
// first. Safari closes the list and demands its `Version/` pair: an in-app
// webview has neither token, and must stay unknown rather than read as Safari.
const browserBrandUserAgentTokens: Array<[RegExp, BrowserBrandName]> = [
  [/Edg(?:iOS|A)?\//v, BrowserBrandName.EDGE],
  [/OPR\/|OPiOS\//v, BrowserBrandName.OPERA],
  [/SamsungBrowser\//v, BrowserBrandName.SAMSUNG_INTERNET],
  [/DuckDuckGo\/|Ddg\//v, BrowserBrandName.DUCKDUCKGO],
  [/FxiOS\/|Firefox\//v, BrowserBrandName.FIREFOX],
  [/CriOS\/|Chrome\//v, BrowserBrandName.CHROME],
  [/Version\/[\d._]+ (?:Mobile\/\S+ )?Safari\//v, BrowserBrandName.SAFARI]
]

function suspectOperatingSystem (env: ClientEnvironment): Suspicion<OperatingSystemName> | null {
  const { userAgent, userAgentDataPlatform, maxTouchPoints } = env
  const declared = operatingSystemPlatformStrings.get(userAgentDataPlatform?.toLowerCase() ?? '')
  if (declared !== undefined) return {
    value: declared,
    certainty: Certainty.DECLARED,
    signals: [`userAgentData.platform=${userAgentDataPlatform ?? ''}`]
  }
  for (const [token, name] of operatingSystemUserAgentTokens) {
    if (!token.test(userAgent)) continue
    // iPadOS 13+ sends a desktop Macintosh UA, and no Mac has a touch screen.
    if (name === OperatingSystemName.MACOS && maxTouchPoints > 0) return {
      value: OperatingSystemName.IOS,
      certainty: Certainty.INFERRED,
      signals: [`userAgent~${token.source}`, `maxTouchPoints=${maxTouchPoints}`]
    }
    return { value: name, certainty: Certainty.PARSED, signals: [`userAgent~${token.source}`] }
  }
  return null
}

function suspectBrowserEngine (
  env: ClientEnvironment,
  operatingSystem: Suspicion<OperatingSystemName> | null
): Suspicion<BrowserEngineName> | null {
  const { userAgent, vendor, engineProbes } = env
  for (const [marker, name, signal] of engineProbeMarkers) {
    if (engineProbes[marker] === true) return { value: name, certainty: Certainty.PROBED, signals: [signal] }
  }
  if (vendor === appleVendor) return {
    value: BrowserEngineName.WEBKIT,
    certainty: Certainty.INFERRED,
    signals: [`navigator.vendor=${vendor}`]
  }
  // App Store policy made this a certainty; the DMA opened iOS to other engines.
  if (operatingSystem?.value === OperatingSystemName.IOS) return {
    value: BrowserEngineName.WEBKIT,
    certainty: Certainty.INFERRED,
    signals: [`operatingSystem=${OperatingSystemName.IOS}`]
  }
  for (const [token, name] of browserEngineUserAgentTokens) {
    if (token.test(userAgent)) return { value: name, certainty: Certainty.PARSED, signals: [`userAgent~${token.source}`] }
  }
  return null
}

function suspectBrowserBrand (env: ClientEnvironment): Suspicion<BrowserBrandName> | null {
  const { userAgent, userAgentDataBrands } = env
  for (const { brand } of userAgentDataBrands) {
    if (greaseBrandPattern.test(brand)) continue
    const declared = browserBrandDataNames.get(brand.toLowerCase())
    if (declared !== undefined) return {
      value: declared,
      certainty: Certainty.DECLARED,
      signals: [`userAgentData.brands~${brand}`]
    }
  }
  for (const [token, name] of browserBrandUserAgentTokens) {
    if (token.test(userAgent)) return { value: name, certainty: Certainty.PARSED, signals: [`userAgent~${token.source}`] }
  }
  return null
}

function readClientEnvironment (): ClientEnvironment {
  const navigator = readNavigator()
  return {
    userAgent: readNavigatorString(navigator, 'userAgent'),
    vendor: readNavigatorString(navigator, 'vendor'),
    maxTouchPoints: readMaxTouchPoints(navigator),
    userAgentDataPlatform: readUserAgentDataPlatform(navigator),
    userAgentDataBrands: readUserAgentDataBrands(navigator),
    engineProbes: readEngineProbes()
  }
}

function readNavigator (): MinimalNavigator | null {
  try {
    return Window.get().navigator ?? null
  } catch {
    return null
  }
}

function readNavigatorString (navigator: MinimalNavigator | null, key: 'userAgent' | 'vendor'): string {
  const value = navigator?.[key]
  return typeof value === 'string' ? value : ''
}

function readMaxTouchPoints (navigator: MinimalNavigator | null): number {
  const value = navigator?.maxTouchPoints
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function readUserAgentDataPlatform (navigator: MinimalNavigator | null): string | null {
  const platform = readUserAgentData(navigator)?.platform
  if (typeof platform !== 'string') return null
  return platform.length > 0 ? platform : null
}

function readUserAgentDataBrands (navigator: MinimalNavigator | null): UserAgentDataBrand[] {
  const brands = readUserAgentData(navigator)?.brands
  if (!Array.isArray(brands)) return []
  const entries: unknown[] = brands
  const returned: UserAgentDataBrand[] = []
  for (const entry of entries) {
    if (!isRecord(entry)) continue
    const { brand, version } = entry
    if (typeof brand !== 'string') continue
    returned.push({ brand, version: typeof version === 'string' ? version : '' })
  }
  return returned
}

// `userAgentData` is experimental and absent from MinimalNavigator, which holds
// identity fields only, so it is read through a runtime narrowing.
function readUserAgentData (navigator: MinimalNavigator | null): Record<string, unknown> | null {
  if (navigator === null || !isRecord(navigator)) return null
  const data = navigator.userAgentData
  return isRecord(data) ? data : null
}

function readEngineProbes (): EngineProbes {
  return {
    mozAppearance: getPayload(tryCatch(() => typeof CSS !== 'undefined' && CSS.supports('-moz-appearance', 'none')), null),
    gestureEvent: getPayload(tryCatch(() => typeof GestureEvent !== 'undefined'), null),
    chromeNamespace: getPayload(tryCatch(() => typeof chrome !== 'undefined'), null)
  }
}
