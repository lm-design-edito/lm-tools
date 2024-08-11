import { Errors } from '~/agnostic/errors'
import { Crossenv } from '~/agnostic/misc/crossenv'

export enum Codes {
  NO_DOCUMENT = 'no-window-document-on-runtime',
  NO_DOCUMENT_PLEASE_PROVIDE = 'no-window-document-on-runtime-please-provide'
}

export const register = new Errors.Register({
  [Codes.NO_DOCUMENT]:                {
    message: `Runtime '${Crossenv.detectRuntime()}' does not provide a Document object, cannot complete.`
  },
  [Codes.NO_DOCUMENT_PLEASE_PROVIDE]: {
    message: `Please provide a Document object since none are found on runtime '${Crossenv.detectRuntime()}'`,
    makeDetails: (tips?: string) => tips
  }
})