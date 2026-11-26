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

---

## The original `README.md`, verbatim

Kept whole, in the French it was written in, because the sections above are a reading of
it and a reading loses what it did not think to keep. Everything below this line is the
2023 file as it stood, install instructions and all.

# La nouvelle Marche du Monde

## Install

```bash
> cd anywhere/you/like
> git clone https://github.com/lm-maxfab/marche-du-monde.git
> cd marche-du-monde
> npm i
```
 
## Start
```bash
> npm start
# triggers:
# npm run watch (watches changes inside src/index.ts and bundles to dist/index.js)
# npm run serve (starts a http server on port 40404 from project's root dir)

```

## Usage
- Create a new html page inside `tests/`, create a `<script type="module"></script>`
- `npm start` and go to `http://localhost:40404/tests/<your-page>.html`
- Do what you want to do inside `src/`
- `import { anything } from dist/index.js` inside your test page and test anything you want

## File structure

### Pour info
Je laisse des `/* [WIP] */` à tous les endroits où il y a encore des choses à faire, histoire de pas en oublier en chemin, et si on travaille à plusieurs dans ce projet ça peut permettre à chacun de savoir ce qui reste à faire.

### `src/index.ts`
- Exporte la fonction principale de la lib : `nouvelleMarcheDuMonde` (ou nouveau nom à trouver)
- Exporte toutes les "sous-fonctions" utilisées par `nouvelleMarcheDuMonde`

Le détail de comment fonctionne `nouvelleMarcheDuMonde` :
- reçoit une chaine de caractères et un objet d'options en input
- met à l'abri les chaines de caractères échappées à l'intérieur (`{ escape } from src/escape/index.ts`)
- parse cet input "tokenisé" comme du markdown (donc retourne un élément HTML) (`src/parse-markdown/index.ts`)
- passe dans chaque branche de cet élément HTML (`src/replace-in-node/index.ts`), et :
  - remplace les textes un par un, en fonction d'un objet d'options passé en paramètres (`src/replacers/index.ts`)
  - remet à leur place les bouts de texte échappés (`{ unescape } from src/escape/index.ts`)
- en fonction de ce qui est demandé dans l'objet d'options, retourne le tout sous forme de :
  - texte ([`Node.textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)),
  - ou de [`NodeList`](https://developer.mozilla.org/en-US/docs/Web/API/NodeList) (on ne retourne pas l'élément parent qu'a produit parseMarkdown, mais ses enfants, parce qu'un input `"texte simple"` serait retourné en tant que `<div>texte simple</div>`)

### `src/escape/index.ts`

**`escape` :**
```
input = 'un texte \avec\ des zones \protégées\'
=> 
tokenized = 'un texte ESCAPED-0 des zones ESCAPED-1'
escaped = ['avec', 'protégées']

Il faudra trouver le bon token pour échapper (\ va nous poser problème je pense),
et pour les tokens de remplacement, peut-être quelque chose de plus farfelu que ESCAPED-<position>
```

**`unescape` :**
```
input = ('un texte ESCAPED-0 des zones ESCAPED-1', ['avec', 'protégées'])
output = 'un texte avec des zones protégées'
```

### `src/parse-markdown/index.ts`

Librairie à trouver, ou à faire maison, à voir

### `src/replace-in-node/index.ts`

Fonction qui reçoit un objet [`Node`](https://developer.mozilla.org/en-US/docs/Web/API/Node), et :
  - si `node.nodeType === Node.TEXT_NODE` : remplace et retourne son contenu texte (via `src/replacers/index.ts`)
  - si `node.nodeType === Node.ELEMENT_NODE` : la fonction s'appelle elle même sur tous les Node enfants
  - dans tous les autres cas, retourne l'input tel quel

### `src/replacers/index.ts`

Fonction qui prend un input texte et un objet d'options, et applique une série de remplacements dans l'input, en fonction de si l'objet d'options l'autorise ou non. La liste des fonctions de remplacements (guillemets français, anglais, allemands, insécables en fonction de la ponctuation, formattage des nombres, etc...) est à construire, chacune est indépendante et elles sont toutes assemblées et séquencées par `replacer`, exporté par `src/replacers/index.ts`
