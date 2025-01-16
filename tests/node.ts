import { Arrays } from '~/agnostic/arrays'
import { Booleans } from '~/agnostic/booleans'
import { Css } from '~/agnostic/css'
import { Errors } from '~/agnostic/errors'
import { Html } from '~/agnostic/html'
import { Misc } from '~/agnostic/misc'
import { Numbers } from '~/agnostic/numbers'
import { Objects } from '~/agnostic/objects'
import { Optim } from '~/agnostic/optim'
import { Random } from '~/agnostic/random'
import { Regexps } from '~/agnostic/regexps'
import { Strings } from '~/agnostic/strings'
import { Time } from '~/agnostic/time'

import { Files } from '~/node/files'
import { Process } from '~/node/process'

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 *
 * ===== CONTENTS =====
 * 

 * Arrays.findDuplicates
 * Arrays.isArrayOf
 * Arrays.make
 * Arrays.randomPick
 * Arrays.randomPickMany

 * Booleans.falsyValues
 * Booleans.isFalsy
 * Booleans.isNotFalsy

 * Css.Bem.BEM
 * Css.Bem.bem
 * Css.Bem.getNamesArr

 * Css.niceColors
 * Css.generateNiceColor
 * Css.classNameRegex
 * Css.isValidClassName
 * Css.StylesSet
 * Css.StylesSetComp

 * Errors.Register
 * Errors.Register.from
 * Errors.Register.makeSource

 * Errors.unknownToString

 * Html.getNodeAncestors
 * Html.getPositionInsideParent

 * Html.HyperJson

 * Html.insertNode

 * Html.Placeholders.generateSentence
 * Html.Placeholders.generateSentences
 * Html.Placeholders.generateTitle
 * Html.Placeholders.generateIntertitle
 * Html.Placeholders.generateParagraph
 * Html.Placeholders.generateContentPage

 * Html.Sanitize.sanitize
 * Html.Sanitize.sanitizeElement
 * Html.selectorToElement
 * Html.stringToNodes

 * Misc.Assert.assert
 * Misc.Assert.assertVerbose

 * Misc.Cast.toArray
 * Misc.Cast.toBoolean
 * Misc.Cast.toError
 * Misc.Cast.toNull
 * Misc.Cast.toNumber
 * Misc.Cast.toNumberArr
 * Misc.Cast.toRecord
 * Misc.Cast.toString

 * Misc.Crawler.create

 * Misc.Crossenv.detectRuntime
 * Misc.Crossenv.Window.exists
 * Misc.Crossenv.Window.get
 * Misc.Crossenv.Window.set
 * Misc.Crossenv.Window.unset
 * Misc.Crossenv.Types.RuntimeName

 * Misc.Logs.Logger
 * Misc.Logs.makeTextBlock
 * Misc.Logs.styles
 * Misc.LoremIpsum.generateSentence
 * Misc.LoremIpsum.generateSentences
 * Misc.LoremIpsum.words

 * Misc.getCurrentDownlink
 * Misc.isConstructorFunction
 * Misc.isNotNullish
 * Misc.isNullish
 * Misc.nullishValues

 * Numbers.absoluteModulo
 * Numbers.clamp
 * Numbers.interpolate
 * Numbers.getHarmonic
 * Numbers.createScale
 * Numbers.round

 * Objects.deepGetProperty

 * Objects.Enums.isInEnum

 * Objects.flattenGetters
 * Objects.isObject
 * Objects.isNonNullObject
 * Objects.isRecord
 * Objects.recordFormat
 * Objects.recordMap

 * Objects.Validation.fromPartial

 * Optim.memoize
 * Optim.throttle
 * Optim.debounce

 * Random.random
 * Random.randomInt
 * Random.hexChars
 * Random.randomHexChar
 * Random.randomHash
 * Random.randomHashPattern
 * Random.randomUUID

 * Regexps.mergeFlags
 * Regexps.setFlags
 * Regexps.fromStart
 * Regexps.toEnd
 * Regexps.fromStartToEnd
 * Regexps.stringStartsWith
 * Regexps.stringEndsWith
 * Regexps.stringIs
 * Regexps.fromStrings
 * Regexps.escape

 * Strings.CharCodes.charCodeToB36
 * Strings.CharCodes.b36CharCodeToCharCode
 * Strings.CharCodes.charToCharCode
 * Strings.CharCodes.charToB36CharCode
 * Strings.CharCodes.charFromCharCode
 * Strings.CharCodes.charFromB36CharCode
 * Strings.CharCodes.toCharCodes
 * Strings.CharCodes.toB36CharCodes
 * Strings.CharCodes.fromCharCodes
 * Strings.CharCodes.fromB36CharCodes
 * Strings.CharCodes.serialize
 * Strings.CharCodes.deserialize
 * Strings.CharCodes.fromSerialized

 * Strings.matches
 * Strings.matchesSome
 * Strings.matchesEvery
 * Strings.normalizeIndent
 * Strings.replaceAll
 * Strings.toAlphanum
 * Strings.trimStart
 * Strings.trimEnd

 * Time.Duration.Duration
 * Time.Duration.milliseconds
 * Time.Duration.seconds
 * Time.Duration.minutes
 * Time.Duration.hours
 * Time.Duration.days
 * Time.Duration.weeks
 * Time.Duration.months
 * Time.Duration.years

 * Time.timeout

 * Time.Transitions.Ease
 * Time.Transitions.transition
 * Time.Transitions.easingFunctions
 * Time.Transitions.easings

 * Time.wait

 * Files.Subpaths.list
 * Files.isInDirectory
 * Files.readWrite

 * Process.beforeExit
 * Process.beforeForcedExit
 * Process.forceExitEvents
 * Process.onAllExits
 * Process.onExit

 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

const assert = Misc.Assert.assertVerbose

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 *
 * ARRAYS
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

await assert('Arrays.findDuplicates', new Map([
  ['Finding first', () => Arrays.findDuplicates([1, 1]).includes(1)],
  ['Finding second', () => Arrays.findDuplicates([1, 1, 2, 2]).includes(2)],
  ['Stopping at first', () => !Arrays.findDuplicates([1, 1, 2, 2], true).includes(2)],
  ['Finds correct nb of duplicates', () => Arrays.findDuplicates([1, 1, 2, 2, 3, 3, 3]).length === 3],
]))

await assert('Arrays.isArrayOf', () => {
  const input = [true, 2, 'string']
  const firstIsASuccess = Arrays.isArrayOf<Boolean | Number | String>(input, [Boolean, Number, String])
  const secondIsAFailure = Arrays.isArrayOf<Number>(input, Number) === false
  type RandomType = { prop: boolean }
  const randomTypeChecker = (item: unknown): item is RandomType => {
    if (!Objects.isObject(item) || item === null) return false
    if ('prop' in item && typeof item.prop === 'boolean') return true
    return false
  }
  const thirdIsASuccess = Arrays.isArrayOf<RandomType>([{ prop: true }], randomTypeChecker)
  const fourthIsAFailure = !Arrays.isArrayOf<RandomType>([{ prop: true }, { prop: 'string' }], randomTypeChecker)
  const fifthIsAFailure = !Arrays.isArrayOf<RandomType>([{ prop: true }, {}], randomTypeChecker)
  return firstIsASuccess
    && secondIsAFailure
    && thirdIsASuccess
    && fourthIsAFailure
    && fifthIsAFailure
})

await assert('Arrays.make', new Map([
  ['Correct filling', () => Arrays.make(Math.random, 100).every(item => typeof item === 'number')],
  ['Correct length', () => Arrays.make(Math.random, 100).length === 100]
]))

await assert('Arrays.randomPick', () => {
  try {
    const picked = Arrays.randomPick([1, 'truc', false])
    return picked === 1
      || picked === 'truc'
      || picked === false
  } catch (err) {
    console.error(err)
    return false
  }
})

await assert('Arrays.randomPickMany', () => {
  try {
    const pickedSelection = Arrays.randomPickMany(3, [1, 'truc', false])
    return pickedSelection.includes(1)
      && pickedSelection.includes('truc')
      && pickedSelection.includes(false)
  } catch (err) {
    console.error(err)
    return false
  }
})

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 *
 * BOOLEANS
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

await assert('Booleans.falsyValues', () => Booleans.falsyValues.every(val => val || 0 === 0))

await assert('Booleans.isFalsy', () => {
  return Booleans.isFalsy('')
    && !Booleans.isFalsy('test')
})

await assert('Booleans.isNotFalsy', () => {
  return Booleans.isNotFalsy('truc')
    && !Booleans.isNotFalsy(false)
})


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 *
 * CSS
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */




/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 *
 * STRINGS
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

await assert('Strings.trimStart', () => Strings.trimStart('   test   ') === 'test   ')
await assert('Strings.trimEnd', () => Strings.trimEnd('   test   ') === '   test')











// // import { HyperJson } from '~/agnostic/html/hyper-json'
// import { Logs } from '~/agnostic/misc/logs/index.js'
// import { JSDOM } from 'jsdom'

// console.log(Logs.styles.title('Node tests.'))

// const doc = new JSDOM('<doctype html><html><head></head><body></body></html>').window.document
// const elt = doc.createElement('div')
// elt.innerHTML = `<div>Je suis une div!!</div>`
// // console.log(new HyperJson.Tree(elt).evaluate())
// console.log('done.')
// process.exit(0)































// /* * * * * * * * * * * * * * * *
//  * Lorem Ipsum
//  * * * * * * * * * * * * * * * */

// // console.log(LoremIpsum.generateSentences(10, 4, 6))


// /* * * * * * * * * * * * * * * *
//  * Hyper Json
//  * * * * * * * * * * * * * * * */
// // new HyperJson.Tree({} as Element)








// /* * * * * * * * * * * * * * * *
//  * Crawler
//  * * * * * * * * * * * * * * * */
// // const crawler = WebCrawler.create({
// //   limit: 100,
// //   delayMs: () => 600 + Math.random() * 800,
// //   fetcher: async url => {
// //     const res = await fetch(url)
// //     return await res.text() as string | null
// //   },
// //   processor: (url, content, { push, flush }) => {
// //     console.log(Logs.styles.important(url))
// //     console.log('\n=====\n')
// //     console.log(content)
// //     console.log('\n=====\n')
// //     const links = (content ?? '').match(/http(s)?:\/\/\S+/igm)
// //     console.log('links')
// //     console.log(links)
// //     console.log('\n=====\n')
// //     push(...Array.from(links ?? []))
// //   }
// // })

// // crawler.crawl('https://fr.wikipedia.org/wiki/Sleaford_Mods')










// /* * * * * * * * * * * * * * * *
//  * Random
//  * * * * * * * * * * * * * * * */
// // console.log(rand.random(5))
// // console.log(rand.random(5, 10))
// // console.log(rand.random(10, 5))

// // console.log(rand.randomHashPattern([2, 3, 1, 2], ';'))

// /* * * * * * * * * * * * * * * *
//  * List subpaths
//  * * * * * * * * * * * * * * * */

// // console.time('listSubpaths')
// // const subpaths = await listSubpaths(process.cwd(), {
// //   directories: false,
// //   symlinks: false,
// //   files: true,
// //   hidden: false,
// //   filter: filePath => {
// //     if (filePath.includes('node_modules/')) return false
// //     return path.basename(filePath).match(/^index\.(js)$/) !== null
// //   }
// // })
// // console.timeEnd('listSubpaths')

// // console.log(subpaths)
