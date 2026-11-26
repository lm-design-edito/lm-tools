# Marche du Monde — typographic text formatting

Carried over from `lm-maxfab/marche-du-monde` before that repository was archived. Six
commits, October 2023, 102 lines, and one function actually written. Nothing here is
built: this is the design, plus the code that existed, so the archive can be forgotten.

## The intention

One function taking a string and an options object, returning text or nodes, which
applies typographic rules — French quotes, non-breaking spaces, number formatting — to
the text of a fragment without touching its markup, and without touching the spans the
author asked to leave alone.

## The pipeline

1. **Escape** the protected spans out of the input, into a token plus a side array.
2. **Parse** what is left as markdown, which yields an element.
3. **Walk** that element and hand every text node to the replacers.
4. **Replace**, one rule at a time, each rule switchable through the options.
5. **Unescape**, putting the protected spans back.
6. **Return** `textContent`, or `childNodes` — the children, never the wrapper the parse
   produced, because an input of `texte simple` would otherwise come back as
   `<div>texte simple</div>`.

## The escape protocol

```
escape('un texte \avec\ des zones \protégées\')
// => { tokenized: 'un texte ESCAPED-0 des zones ESCAPED-1',
//      escaped: ['avec', 'protégées'] }
```

Two things the author flagged and did not solve: `\` is a poor delimiter, and
`ESCAPED-<position>` is a token an author could plausibly type, so both want something
less guessable.

## The replacers, none of them written

French, English and German quotes; non-breaking spaces driven by the punctuation around
them; number formatting. Each one independent, all of them sequenced by a single
`replacer` which reads the options and skips what is turned off.

## The one piece of code

`replaceInNode`, the tree walk. It is not `agnostic/html/replace-in-element`, which
applies an explicit `Map` of node to replacement; this one transforms every text node
through a callback:

```ts
export default function replaceInNode (node: Node, replacer: (input: string) => string): Node {
  if (node.nodeType === Node.TEXT_NODE) {
    const content = node.textContent ?? ''
    const replaced = replacer(content)
    const returned = document.createTextNode(replaced)
    node.parentNode?.replaceChild(returned, node)
    return returned
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element
    const children = [...element.childNodes]
    const replacedChildren = children.map(node => replaceInNode(node, replacer))
    element.replaceChildren(...replacedChildren)
    return element
  }
  return node
}
```

`escape` and `unescape` returned their input untouched, `parseMarkdown` was
`div.innerHTML = input` with no markdown involved, and `replaceGuillemets` returned its
input. None of it is reproduced here.

## What has to be decided before any of this earns a module

**Where the line falls between a language rule and a house rule.** French quotes and
non-breaking spaces are French, not Le Monde: they belong somewhere generic, next to the
other string tools. What earns `@lemonde` is the house style where it departs from the
general rule. Deciding that first is what keeps `@lemonde` from becoming the place French
things go.
