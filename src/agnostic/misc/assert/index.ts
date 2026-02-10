import { unknownToString } from '../../errors/unknown-to-string/index.js'
import * as Outcome from '../outcome/index.js'

// [WIP] maybe get rid of this homemade assert lib and rely on jset or playwright

type Assertion = (() => boolean) | (() => Promise<boolean>) | boolean

function makeSuccess (label: string): void {
  const formattedLabel = label.split('\n').join('\n  ')
  console.info(`✅ SUCCESS:\n  ${formattedLabel}`)
}

function makeFailure (label: string): undefined {
  const formattedLabel = label.split('\n').join('\n  ')
  throw new Error(`🚫 FAILURE:\n  ${formattedLabel}`)
}

/**
 * @deprecated
 */
export async function assert (
  label: string,
  assertion: Assertion | Assertion[] | Map<string, Assertion> | Record<string, Assertion>
): Promise<Outcome.Either<string, string>> {
  // Assertion is boolean ?
  if (typeof assertion === 'boolean') return assertion
    ? Outcome.makeSuccess(label)
    : Outcome.makeFailure(label)

  // Assertion is function ?
  else if (typeof assertion === 'function') {
    try {
      const result = await assertion()
      if (!result) return Outcome.makeFailure(label)
      else return Outcome.makeSuccess(label)
    } catch (err) {
      const errStr = unknownToString(err)
      return Outcome.makeFailure(`${label} / ${errStr}`)
    }

  // Then assertion is Array, Map or Record
  } else {
    let assertions: Array<[string, Assertion]>
    if (Array.isArray(assertion)) { assertions = [...assertion].map((a, p) => [`${p}`, a] as [string, Assertion]) } else if (assertion instanceof Map) { assertions = Array.from(assertion) } else { assertions = Object.entries(assertion) }
    const allAsserted = await Promise.all(assertions.map(async ([innerLabel, innerAssertion]) => {
      const fullLabel = `${label} / ${innerLabel}`
      const asserted = assert(fullLabel, innerAssertion)
      return await asserted
    }))
    const allSuccess = allAsserted.every((asserted): asserted is Outcome.Success<string> => asserted.success)
    if (allSuccess) return Outcome.makeSuccess(allAsserted.map(e => e.payload).join('\n'))
    const failures = allAsserted.filter((asserted): asserted is Outcome.Failure<string> => !asserted.success)
    const failuresStr = failures.map(failure => failure.error).join('\n  ')
    return Outcome.makeFailure(failuresStr)
  }
}

export async function assertVerbose (
  label: string,
  assertion: Assertion | Assertion[] | Map<string, Assertion>
): Promise<undefined | Outcome.Success<string>> {
  const asserted = await assert(label, assertion)
  if (asserted?.success) {
    makeSuccess(asserted.payload)
    return asserted
  }
  return makeFailure(asserted.error)
}
