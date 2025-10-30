import BEMClass from './BEM.js'
import getNamesArrFunc from './getNamesArr.js'

export namespace Bem {
  export const BEM = BEMClass

  export function bem (blockNameArg: any): BEMClass {
    const bem = new BEMClass()
    if (blockNameArg instanceof BEMClass) return blockNameArg.copy()
    return bem.addBlock(blockNameArg)
  }

  export const getNamesArr = getNamesArrFunc
}
