/**
 * Supported duration types (long form).
 */
export type DurationType = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
  
/**
 * Supported duration types (short form aliases).
 */
export type DurationTypeShort = 'ms' | 's' | 'sec' | 'min' | 'm' | 'h' | 'd' | 'w' | 'mo' | 'mth' | 'y'

/**
 * Represents a duration in a specific unit and allows conversion to other units.
 */
export class Duration {
  value: number
  type: DurationType
  
  /**
   * Creates a new Duration instance.
   *
   * @param value - The numeric value of the duration.
   * @param type - The unit of the duration, either long or short form.
   */
  constructor (value: number, type: DurationType | DurationTypeShort) {
    this.toMilliseconds = this.toMilliseconds.bind(this)
    this.toMs = this.toMs.bind(this)
    this.toSeconds = this.toSeconds.bind(this)
    this.toMinutes = this.toMinutes.bind(this)
    this.toHours = this.toHours.bind(this)
    this.toDays = this.toDays.bind(this)
    this.toWeeks = this.toWeeks.bind(this)
    this.toMonths = this.toMonths.bind(this)
    this.toYear = this.toYear.bind(this)
    this.value = value
    if (type === 'ms' || type === 'milliseconds') { this.type = 'milliseconds' }
    else if (type === 's' || type === 'sec' || type === 'seconds') { this.type = 'seconds' }
    else if (type === 'm' || type === 'min' || type === 'minutes') { this.type = 'minutes' }
    else if (type === 'h' || type === 'hours') { this.type = 'hours' }
    else if (type === 'd' || type === 'days') { this.type = 'days' }
    else if (type === 'w' || type === 'weeks') { this.type = 'weeks' }
    else if (type === 'mo' || type === 'mth' || type === 'months') { this.type = 'months' }
    else if (type === 'y' || type === 'years') { this.type = 'years' }
    else { this.type = 'milliseconds' } // defaults to milliseconds
  }

  toMilliseconds = this.toMs
  toMs (): number {
    if (this.type === 'milliseconds') return this.value
    if (this.type === 'seconds') return this.value * 1000
    if (this.type === 'minutes') return this.value * 1000 * 60
    if (this.type === 'hours') return this.value * 1000 * 60 * 60
    if (this.type === 'days') return this.value * 1000 * 60 * 60 * 24
    if (this.type === 'weeks') return this.value * 1000 * 60 * 60 * 24 * 7
    if (this.type === 'months') return this.value * 1000 * 60 * 60 * 24 * 30
    if (this.type === 'years') return this.value * 1000 * 60 * 60 * 24 * 365
    return this.value // defaults to milliseconds
  }

  toSeconds (): number { return this.toMs() / 1000 }
  toMinutes (): number { return this.toMs() / (1000 * 60) }
  toHours (): number { return this.toMs() / (1000 * 60 * 60) }
  toDays (): number { return this.toMs() / (1000 * 60 * 60 * 24) }
  toWeeks (): number { return this.toMs() / (1000 * 60 * 60 * 24 * 7) }
  toMonths (): number { return this.toMs() / (1000 * 60 * 60 * 24 * 30) }
  toYear (): number { return this.toMs() / (1000 * 60 * 60 * 24 * 365) }
}

export function milliseconds (value: number): Duration { return new Duration(value, 'milliseconds') }
export function seconds (value: number): Duration { return new Duration(value, 'seconds') }
export function minutes (value: number): Duration { return new Duration(value, 'minutes') }
export function hours (value: number): Duration { return new Duration(value, 'hours') }
export function days (value: number): Duration { return new Duration(value, 'days') }
export function weeks (value: number): Duration { return new Duration(value, 'weeks') }
export function months (value: number): Duration { return new Duration(value, 'months') }
export function years (value: number): Duration { return new Duration(value, 'years') }
