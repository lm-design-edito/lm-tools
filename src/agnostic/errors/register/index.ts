export namespace Register {
  export type RegisterEntry = {
    message: string
    detailsMaker: (...p: any[]) => any
  }

  export type Source<C extends string> = { [K in C]: RegisterEntry }

  export function makeSource<S extends Source<string>>(s: S): S { return s }

  export type RegisterKeys<S extends Source<string>> = keyof S

  export type Message<
    S extends Source<string>,
    Code extends RegisterKeys<S>
  > = S[Code]['message']

  export type DetailsMaker<
    S extends Source<string>,
    Code extends RegisterKeys<S>
  > = S[Code]['detailsMaker']

  export type DetailsMakerParams<
    S extends Source<string>,
    Code extends RegisterKeys<S>
  > = Parameters<DetailsMaker<S, Code>>

  export type Details<
    S extends Source<string>,
    Code extends RegisterKeys<S>
  > = ReturnType<DetailsMaker<S, Code>>

  export type ErrorData<
    S extends Source<string>,
    Code extends RegisterKeys<S>
  > = {
    code: Code
    message: Message<S, Code>,
    details: Details<S, Code>
  }

  export function from<S extends Source<string>> (source: S) {
    function getMessage<Code extends RegisterKeys<S>> (code: Code): Message<S, Code> {
      const message = source[code]!.message
      return message
    }

    function getDetailsMaker<Code extends RegisterKeys<S>> (code: Code): DetailsMaker<S, Code> {
      const maker = source[code]!.detailsMaker as DetailsMaker<S, Code>
      return maker
    }

    function getDetails<Code extends RegisterKeys<S>> (
      code: Code,
      ...params: DetailsMakerParams<S, Code>
    ): Details<S, Code> {
      const maker = getDetailsMaker(code) as undefined | ((...p: any[]) => any)
      const details = maker?.(...params)
      return details
    }

    function getErrorData<Code extends RegisterKeys<S>> (
      code: Code,
      ...params: DetailsMakerParams<S, Code>
    ): ErrorData<S, Code> {
      const message = getMessage(code)
      const details = getDetails(code, ...params)
      return { code, message, details }
    }

    class RegisteredError<Code extends RegisterKeys<S>> extends Error {
      code: Code
      details: Details<S, Code>
      constructor (code: Code, ...params: DetailsMakerParams<S, Code>) {
        const data = getErrorData(code, ...params)
        super(data.message)
        this.code = data.code
        this.details = data.details
      }
    }

    function getError<Code extends RegisterKeys<S>> (
      code: Code,
      ...params: DetailsMakerParams<S, Code>
    ): RegisteredError<Code> {
      return new RegisteredError(code, ...params)
    }

    return {
      getMessage,
      getDetailsMaker,
      getDetails,
      getErrorData,
      getError,
      source
    }
  }
}
