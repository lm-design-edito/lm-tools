import { describe, it, expect } from 'vitest'
import { suspectClient } from './index.js'
import {
  BrowserBrandName,
  BrowserEngineName,
  Certainty,
  OperatingSystemName
} from './types.js'

const iphoneSafari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
const iosWebview = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
const ipadDesktopUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
const androidChrome = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36'
const chromeOsChrome = 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
const windowsFirefox = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0'
const windowsEdge = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'
const androidSamsung = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36'
const androidWebview = 'Mozilla/5.0 (Linux; Android 16; SM-A166B Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/156.0.8078.47 Mobile Safari/537.36'

describe('suspectClient', () => {
  describe('operating system', () => {
    it('parses iOS from an iPhone user agent', () => {
      expect(suspectClient({ userAgent: iphoneSafari }).operatingSystem).toMatchObject({
        value: OperatingSystemName.IOS,
        certainty: Certainty.PARSED
      })
    })

    it('infers iOS from an iPad sending a desktop Macintosh user agent', () => {
      expect(suspectClient({ userAgent: ipadDesktopUserAgent, maxTouchPoints: 5 }).operatingSystem).toMatchObject({
        value: OperatingSystemName.IOS,
        certainty: Certainty.INFERRED
      })
    })

    it('keeps macOS for the same user agent without a touch screen', () => {
      expect(suspectClient({ userAgent: ipadDesktopUserAgent, maxTouchPoints: 0 }).operatingSystem).toMatchObject({
        value: OperatingSystemName.MACOS,
        certainty: Certainty.PARSED
      })
    })

    it('prefers Android over the Linux token its user agent also carries', () => {
      expect(suspectClient({ userAgent: androidChrome }).operatingSystem?.value).toBe(OperatingSystemName.ANDROID)
    })

    it('prefers ChromeOS over the X11 token its user agent also carries', () => {
      expect(suspectClient({ userAgent: chromeOsChrome }).operatingSystem?.value).toBe(OperatingSystemName.CHROMEOS)
    })

    it('takes the declared platform over the user agent', () => {
      expect(suspectClient({
        userAgent: androidChrome,
        userAgentDataPlatform: 'Windows'
      }).operatingSystem).toMatchObject({
        value: OperatingSystemName.WINDOWS,
        certainty: Certainty.DECLARED
      })
    })

    it('falls back to the user agent when the declared platform is unknown', () => {
      expect(suspectClient({
        userAgent: androidChrome,
        userAgentDataPlatform: 'Unknown'
      }).operatingSystem).toMatchObject({
        value: OperatingSystemName.ANDROID,
        certainty: Certainty.PARSED
      })
    })

    it('reports null rather than a guess when nothing names an OS', () => {
      expect(suspectClient({ userAgent: 'Mozilla/5.0' }).operatingSystem).toBeNull()
    })
  })

  describe('browser engine', () => {
    it('reports a probed engine before anything else', () => {
      expect(suspectClient({
        userAgent: androidChrome,
        engineProbes: { mozAppearance: true, gestureEvent: null, chromeNamespace: true }
      }).browserEngine).toMatchObject({
        value: BrowserEngineName.GECKO,
        certainty: Certainty.PROBED
      })
    })

    it('infers WebKit from the Apple vendor string', () => {
      expect(suspectClient({
        userAgent: 'Mozilla/5.0',
        vendor: 'Apple Computer, Inc.'
      }).browserEngine).toMatchObject({
        value: BrowserEngineName.WEBKIT,
        certainty: Certainty.INFERRED
      })
    })

    it('infers WebKit on iOS, whatever the brand', () => {
      expect(suspectClient({ userAgent: iosWebview }).browserEngine).toMatchObject({
        value: BrowserEngineName.WEBKIT,
        certainty: Certainty.INFERRED
      })
    })

    it('parses Gecko from its own token, not from « like Gecko »', () => {
      expect(suspectClient({ userAgent: windowsFirefox }).browserEngine).toMatchObject({
        value: BrowserEngineName.GECKO,
        certainty: Certainty.PARSED
      })
      expect(suspectClient({ userAgent: androidChrome }).browserEngine?.value).toBe(BrowserEngineName.BLINK)
    })

    it('prefers Blink over the AppleWebKit token its user agent also carries', () => {
      expect(suspectClient({ userAgent: windowsEdge }).browserEngine?.value).toBe(BrowserEngineName.BLINK)
    })

    it('reports null when no engine marker is present', () => {
      expect(suspectClient({ userAgent: 'Mozilla/5.0' }).browserEngine).toBeNull()
    })
  })

  describe('browser brand', () => {
    it('leaves an in-app WebKit webview unknown rather than calling it Safari', () => {
      const client = suspectClient({ userAgent: iosWebview })
      expect(client.browserBrand).toBeNull()
      expect(client.operatingSystem?.value).toBe(OperatingSystemName.IOS)
    })

    it('parses Safari only when the Version pair is there', () => {
      expect(suspectClient({ userAgent: iphoneSafari }).browserBrand).toMatchObject({
        value: BrowserBrandName.SAFARI,
        certainty: Certainty.PARSED
      })
    })

    it('parses Edge, Samsung and Firefox before the Chrome token they carry', () => {
      expect(suspectClient({ userAgent: windowsEdge }).browserBrand?.value).toBe(BrowserBrandName.EDGE)
      expect(suspectClient({ userAgent: androidSamsung }).browserBrand?.value).toBe(BrowserBrandName.SAMSUNG_INTERNET)
      expect(suspectClient({ userAgent: windowsFirefox }).browserBrand?.value).toBe(BrowserBrandName.FIREFOX)
    })

    it('parses Chrome when no more specific brand claims the user agent', () => {
      expect(suspectClient({ userAgent: androidChrome }).browserBrand?.value).toBe(BrowserBrandName.CHROME)
    })

    it('parses the wv token as Android WebView, before the Chrome token beside it', () => {
      expect(suspectClient({ userAgent: androidWebview }).browserBrand).toMatchObject({
        value: BrowserBrandName.ANDROID_WEBVIEW,
        certainty: Certainty.PARSED
      })
    })

    it('still names the operating system of an Android webview', () => {
      expect(suspectClient({ userAgent: androidWebview }).operatingSystem?.value).toBe(OperatingSystemName.ANDROID)
    })

    it('takes a declared brand, skipping the GREASE decoy and Chromium', () => {
      expect(suspectClient({
        userAgent: androidChrome,
        userAgentDataBrands: [
          { brand: 'Not)A;Brand', version: '99' },
          { brand: 'Chromium', version: '131' },
          { brand: 'Microsoft Edge', version: '131' }
        ]
      }).browserBrand).toMatchObject({
        value: BrowserBrandName.EDGE,
        certainty: Certainty.DECLARED
      })
    })

    it('falls back to the user agent when the brand list names nothing known', () => {
      expect(suspectClient({
        userAgent: androidChrome,
        userAgentDataBrands: [
          { brand: 'Not_A Brand', version: '99' },
          { brand: 'Chromium', version: '131' }
        ]
      }).browserBrand).toMatchObject({
        value: BrowserBrandName.CHROME,
        certainty: Certainty.PARSED
      })
    })

    it('reports null when nothing names a brand', () => {
      expect(suspectClient({ userAgent: 'Mozilla/5.0' }).browserBrand).toBeNull()
    })
  })

  describe('outside a browser', () => {
    it('returns three null fields rather than throwing', () => {
      expect(suspectClient()).toMatchObject({
        operatingSystem: null,
        browserEngine: null,
        browserBrand: null
      })
    })
  })

  describe('signals', () => {
    it('carries the evidence behind an inferred verdict', () => {
      const { operatingSystem } = suspectClient({ userAgent: ipadDesktopUserAgent, maxTouchPoints: 5 })
      expect(operatingSystem?.signals).toContain('maxTouchPoints=5')
    })
  })
})
