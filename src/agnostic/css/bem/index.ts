import { isNonNullObject } from 'agnostic/objects/is-object/index.js'
import { isFalsy } from '../../booleans/is-falsy/index.js'
import { isValidClassName } from '../is-valid-css-class-name/index.js'

export function getNamesArr (arg: any): string[] {
  const returned: string[] = []
  if (typeof arg === 'string') {
    arg.trim().split(/\s+/gm).forEach(name => { if (isValidClassName(name)) returned.push(name) })
  } else if (Array.isArray(arg)) {
    arg.forEach(elt => returned.push(...getNamesArr(elt)))
  } else if (isNonNullObject(arg)) {
    Object.entries(arg).forEach(([key, val]) => {
      if (!isFalsy(val)) returned.push(...getNamesArr(key))
    })
  }
  return returned
}

export interface Block {
  name: string
  modifiers: string[]
}

export class BEM {
  constructor () {
    this.findBlockByName = this.findBlockByName.bind(this)
    this.addBlock = this.addBlock.bind(this)
    this.addElement = this.addElement.bind(this)
    this.addModifier = this.addModifier.bind(this)
    this.copy = this.copy.bind(this)
    this.block = this.block.bind(this)
    this.element = this.element.bind(this)
    this.modifier = this.modifier.bind(this)
    this.blk = this.blk.bind(this)
    this.elt = this.elt.bind(this)
    this.mod = this.mod.bind(this)
    this.cp = this.cp.bind(this)
    this.addSingleBlock = this.addSingleBlock.bind(this)
    this.addSingleElement = this.addSingleElement.bind(this)
    this.addSingleModifier = this.addSingleModifier.bind(this)
    this.setCurrentBlockByName = this.setCurrentBlockByName.bind(this)
    this.createBlockByName = this.createBlockByName.bind(this)
    this.getCurrentBlock = this.getCurrentBlock.bind(this)
  }

  addBlock (blockNameArg: any): this {
    const blocksNames = getNamesArr(blockNameArg)
    blocksNames.forEach(this.addSingleBlock.bind(this))
    return this
  }

  addElement (elementNameArg: any): this {
    const elementsNames = getNamesArr(elementNameArg)
    elementsNames.forEach(this.addSingleElement.bind(this))
    return this
  }

  addModifier (modifierNameArg: any): this {
    const currentBlock = this.getCurrentBlock()
    if (currentBlock === undefined) return this
    const modifiersNames = getNamesArr(modifierNameArg)
    modifiersNames.forEach(this.addSingleModifier.bind(this))
    return this
  }

  copy (): BEM {
    const copy = new BEM()
    this.blocks.forEach(block => {
      copy.addBlock(block.name)
      block.modifiers.forEach(copy.addModifier.bind(copy))
    })
    return copy
  }

  block (blockNameArg: any): BEM { return this.copy().addBlock(blockNameArg) }
  element (elementNameArg: any): BEM { return this.copy().addElement(elementNameArg) }
  modifier (modifierNameArg: any): BEM { return this.copy().addModifier(modifierNameArg) }
  blk (blockNameArg: any): BEM { return this.block(blockNameArg) }
  elt (elementNameArg: any): BEM { return this.element(elementNameArg) }
  mod (modifierNameArg: any): BEM { return this.modifier(modifierNameArg) }
  cp (): BEM { return this.copy() }

  get value (): string {
    return this.blocks.map(block => {
      return [block.name, ...block.modifiers.map(modifier => {
        return `${block.name}_${modifier}`
      })].join(' ')
    }).join(' ')
  }

  get val (): string { return this.value }

  private blocks: Block[] = []

  private findBlockByName (name: string): Block | undefined {
    return this.blocks.find(block => block.name === name)
  }

  private addSingleBlock (blockName: string): this {
    if (this.findBlockByName(blockName) !== undefined) {
      this.setCurrentBlockByName(blockName)
    } else {
      const block = this.createBlockByName(blockName)
      this.blocks.push(block)
    }
    return this
  }

  private addSingleElement (elementName: string): this {
    const currentBlock = this.getCurrentBlock()
    if (currentBlock === undefined) this.addBlock(elementName)
    else { currentBlock.name = currentBlock.name + '__' + elementName }
    return this
  }

  private addSingleModifier (modifierName: string): this {
    const currentBlock = this.getCurrentBlock()
    if (currentBlock !== undefined) {
      currentBlock.modifiers.push(modifierName)
    }
    return this
  }

  private setCurrentBlockByName (blockName: string): this {
    const block = this.findBlockByName(blockName)
    if (block !== undefined) {
      const blockPos = this.blocks.indexOf(block)
      this.blocks = [
        ...this.blocks.slice(0, blockPos),
        ...this.blocks.slice(blockPos + 1),
        block
      ]
    }
    return this
  }

  private createBlockByName (blockName: string): Block {
    return { name: blockName, modifiers: [] }
  }

  private getCurrentBlock (): Block | undefined {
    return this.blocks.slice(-1)[0]
  }
}

export function bem (blockNameArg: any): BEM {
  const bem = new BEM()
  if (blockNameArg instanceof BEM) return blockNameArg.copy()
  return bem.addBlock(blockNameArg)
}
