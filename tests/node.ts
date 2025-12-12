import { Arrays } from '~/agnostic/arrays'
import { Booleans } from '~/agnostic/booleans'
import { Css } from '~/agnostic/css'
import { Errors } from '~/agnostic/errors'
import { Html } from '~/agnostic/html'
import * as Misc from '~/agnostic/misc'
import { Numbers } from '~/agnostic/numbers'
import { Objects } from '~/agnostic/objects'
import { Optim } from '~/agnostic/optim'
import { Random } from '~/agnostic/random'
import { Regexps } from '~/agnostic/regexps'
import { Strings } from '~/agnostic/strings'
import { Time } from '~/agnostic/time'
import { Window } from '~/agnostic/misc/crossenv/window'
import { JSDOM } from 'jsdom'

import * as Files from '~/node/files'
import * as Process from '~/node/process'

import { parse, stringify } from '~/agnostic/html/hyper-json/smart-tags/coalesced/hjstringify'
import { deepSetProperty } from '~/agnostic/html/hyper-json/smart-tags/coalesced/setproperty'

try {
  const dom = new JSDOM(`<!DOCTYPE html><html></html>`)
  Window.set(dom.window)
  const { document } = Window.get()
  const hjValue: Html.HyperJson.Types.Tree.RestingValue = {
    elt: document.createElement('div'),
    nodelist: document.createDocumentFragment().childNodes as NodeListOf<Element | Text>,
    str: 'just a string',
    array: [
      document.createElement('div'),
      document.createTextNode('just a text node'),
      document.createDocumentFragment().childNodes as NodeListOf<Element | Text>
    ]
  }

  const stringified = stringify(hjValue)
  console.log(stringified)
  console.log('———————————\n\n')
  const parsed = parse(stringified)
  console.log(parsed)
  console.log('———————————\n\n')



  const theDiv = document.createElement('div')
  theDiv.innerHTML = '<p>initial</p>'
  const toDeepSet = {
    prop1: 'str',
    prop2: 2,
    prop3: {
      a: null,
      b: [theDiv]
    }
  }
  console.log('!!!', toDeepSet.prop3.b[0]!.innerHTML)
  const deepSet = deepSetProperty(toDeepSet, 'prop3.b.0.0', document.createElement('p'))
  console.log('!!!', (deepSet as any).prop3.b[0].innerHTML)
  console.log('---', toDeepSet)
  console.log('---', deepSet)

} catch (err) {
  console.log(err)
  process.exit(1)
}


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

 * Time.Dates.formatDate

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
  // [WIP] split into multiple named assertions
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

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 *
 * TIME
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

await assert('Time.Dates.formatDate', new Map([
  ['Fr: 2023/01/01 - 21:12:16', () => Time.Dates.formatDate(
    new Date(2023, 0, 1, 21, 12, 16),
    '{{DD}} {{D}} {{dd}} {{d}} {{MM}} {{M}} {{MMMM}} {{MMM}} {{YYYY}} {{YY}} {{HH}} {{H}} {{hh}} {{h}} {{mm}} {{m}} {{ss}} {{s}} {{A}} {{a}} {{th}}',
    'fr'
  ) === '01 1 dimanche dim. 01 1 janvier janv. 2023 23 21 21 09 9 12 12 16 16 PM pm er'],

  ['Fr: 2023/01/02 - 21:12:16', () => Time.Dates.formatDate(
    new Date(2023, 0, 2, 21, 12, 16),
    '{{DD}} {{D}} {{dd}} {{d}} {{MM}} {{M}} {{MMMM}} {{MMM}} {{YYYY}} {{YY}} {{HH}} {{H}} {{hh}} {{h}} {{mm}} {{m}} {{ss}} {{s}} {{A}} {{a}} {{th}}',
    'fr'
  ) === '02 2 lundi lun. 01 1 janvier janv. 2023 23 21 21 09 9 12 12 16 16 PM pm '],

  ['En: 2023/01/01 - 21:12:16', () => Time.Dates.formatDate(
    new Date(2023, 0, 1, 21, 12, 16),
    '{{DD}} {{D}} {{dd}} {{d}} {{MM}} {{M}} {{MMMM}} {{MMM}} {{YYYY}} {{YY}} {{HH}} {{H}} {{hh}} {{h}} {{mm}} {{m}} {{ss}} {{s}} {{A}} {{a}} {{th}}',
    'en'
  ) === '01 1 Sunday Sun 01 1 January Jan 2023 23 21 21 09 9 12 12 16 16 PM pm st'],

  ['En: 2023/01/02 - 21:12:16', () => Time.Dates.formatDate(
    new Date(2023, 0, 2, 21, 12, 16),
    '{{DD}} {{D}} {{dd}} {{d}} {{MM}} {{M}} {{MMMM}} {{MMM}} {{YYYY}} {{YY}} {{HH}} {{H}} {{hh}} {{h}} {{mm}} {{m}} {{ss}} {{s}} {{A}} {{a}} {{th}}',
    'en'
  ) === '02 2 Monday Mon 01 1 January Jan 2023 23 21 21 09 9 12 12 16 16 PM pm nd'],

  ['En: 2023/01/03 - 21:12:16', () => Time.Dates.formatDate(
    new Date(2023, 0, 3, 21, 12, 16),
    '{{DD}} {{D}} {{dd}} {{d}} {{MM}} {{M}} {{MMMM}} {{MMM}} {{YYYY}} {{YY}} {{HH}} {{H}} {{hh}} {{h}} {{mm}} {{m}} {{ss}} {{s}} {{A}} {{a}} {{th}}',
    'en'
  ) === '03 3 Tuesday Tue 01 1 January Jan 2023 23 21 21 09 9 12 12 16 16 PM pm rd'],

  ['En: 2023/01/04 - 21:12:16', () => Time.Dates.formatDate(
    new Date(2023, 0, 4, 21, 12, 16),
    '{{DD}} {{D}} {{dd}} {{d}} {{MM}} {{M}} {{MMMM}} {{MMM}} {{YYYY}} {{YY}} {{HH}} {{H}} {{hh}} {{h}} {{mm}} {{m}} {{ss}} {{s}} {{A}} {{a}} {{th}}',
    'en'
  ) === '04 4 Wednesday Wed 01 1 January Jan 2023 23 21 21 09 9 12 12 16 16 PM pm th'],

  ['En: 2023/01/11 - 21:12:16', () => Time.Dates.formatDate(
    new Date(2023, 0, 11, 21, 12, 16),
    '{{DD}} {{D}} {{dd}} {{d}} {{MM}} {{M}} {{MMMM}} {{MMM}} {{YYYY}} {{YY}} {{HH}} {{H}} {{hh}} {{h}} {{mm}} {{m}} {{ss}} {{s}} {{A}} {{a}} {{th}}',
    'en'
  ) === '11 11 Wednesday Wed 01 1 January Jan 2023 23 21 21 09 9 12 12 16 16 PM pm th'],

  ['En: 2023/01/31 - 21:12:16', () => Time.Dates.formatDate(
    new Date(2023, 0, 31, 21, 12, 16),
    '{{DD}} {{D}} {{dd}} {{d}} {{MM}} {{M}} {{MMMM}} {{MMM}} {{YYYY}} {{YY}} {{HH}} {{H}} {{hh}} {{h}} {{mm}} {{m}} {{ss}} {{s}} {{A}} {{a}} {{th}}',
    'en'
  ) === '31 31 Tuesday Tue 01 1 January Jan 2023 23 21 21 09 9 12 12 16 16 PM pm st']
]))





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
