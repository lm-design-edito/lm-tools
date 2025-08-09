import { Logs } from '../src/agnostic/misc/logs'
import { HyperJson } from '../src/agnostic/html/hyper-json'

console.log(Logs.styles.title('Browser tests.'))

const source1 = document.createElement('record')
const source2 = document.createElement('string')
const source3 = document.createElement('number')
source1.innerHTML = `<number>7</number>
<div _key="prop-1">
  Valeur de prop-1
</div>
<div _key="prop-1" _action="append" attr="lol">
  Valeur de prop-1 appended
</div>`
source2.innerHTML = `<div _key="prop-1" _action="prepend" attr="lol">
  Valeur de prop-1 prepended
</div>
<number>6</number>
<div _key="prop-1" _action="append" attr="lol">
  Valeur de prop-1 appended 2 fois
</div>`
source3.innerHTML = `<div _key="prop-1" _action="prepend" attr2x="lol">
  Valeur de prop-1 prepended 2 fois
</div>
<number>5</number>
<div _key="prop-1" _action="append">
  Valeur de prop-1 appended 3 fois
</div>`

HyperJson.Tree

const merged = HyperJson.Utils.Tree.mergeNodes([source1, source2, source3])
console.log(merged)
const tree = new HyperJson.Tree.Tree(merged, null, null)
console.log(tree.evaluate())
// const merged = HyperJson.Tree.mergeRootElements(source1, source2, source3)
// const subpaths = HyperJson.Tree.getElementSubpaths(merged)
// Array.from(subpaths).map(([subpath, data]) => {
//   console.log(subpath, data)
// })

// const root = document.createElement('div')
// root.innerHTML = `<string>
//   <toRecord></toRecord>
//   <array _name="prop-1">
//     <string>Référencé</string>
//   </array>
//   <ref _name="prop-2">/prop-1/0</ref>
//   <toString></toString>
// </string>`

// const elt = root.firstElementChild as Element
// const tree = new HyperJson.Tree(elt, HyperJson.Transformers.defaultGeneratorsMap)
// const val = tree.evaluate()

// console.log('=====')
// console.log(val)
// tree.printPerfCounters()

console.log('done.')
