import puppeteer from 'puppeteer'
import { minutes } from '../../src/agnostic/time/duration/index.js'
import { timeout } from '../../src/agnostic/time/timeout/index.js'

const PORT = process.env.PORT || '3000'

async function run () {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  page.on('console', message => console.log(message.text()))
  try {
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' })
  } catch (error) {
    console.error('Error during headless browser test:', error)
  } finally {
    await browser.close()
  }
}

try {
  await timeout(minutes(1).toMs(), run)
  process.exit(0)
} catch (error) {
  process.exit(1)
}
