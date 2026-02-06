/**
 * Represents an attribute filtering rule for sanitization.
 *
 * - `attributeName`: The attribute name to match, either as a string or a RegExp.
 * - `attributeValues` (optional): Array of allowed or forbidden values for the attribute,
 *   each being a string or a RegExp. If omitted, all values are affected.
 */
export type AttributeNameValPair = {
  attributeName: string | RegExp
  attributeValues?: Array<string | RegExp>
}

/**
 * Configuration options for HTML sanitization.
 *
 * - `inputFreeTransform` (optional): Function applied to input HTML string before sanitization.
 * - `keepComments` (optional): Whether to preserve comment nodes. Default is `false`.
 * - `allowedTags` (optional): Array of allowed tag names. `'*'` allows all tags.
 * - `forbiddenTags` (optional): Array of forbidden tag names. `'*'` forbids all tags.
 * - `allowedAttributes` (optional): Object mapping tag names to allowed attributes (`AttributeNameValPair` arrays).
 * - `forbiddenAttributes` (optional): Object mapping tag names to forbidden attributes (`AttributeNameValPair` arrays).
 * - `depth` (optional): Maximum recursion depth for nested elements. Default is 20.
 * - `verbose` (optional): Enables console warnings for forbidden elements/attributes. Default is `false`.
 */
export type SanitizeHtmlOptions = {
  inputFreeTransform?: (input: string) => string
  keepComments?: boolean
  allowedTags?: string[]
  forbiddenTags?: string[]
  allowedAttributes?: Record<string, AttributeNameValPair[]>
  forbiddenAttributes?: Record<string, AttributeNameValPair[]>
  depth?: number
  verbose?: boolean
}
