import { Wallet } from "ethers"


export const ETH_STANDARD_PATH = "m/44'/60'/0'/0";
export const MNEMONIC_KEY = "MNEMONIC_PHRASE"


export function getPath(index) {
  return `${ETH_STANDARD_PATH}/${index}`;
}

export function getMnemonic() {
  let mnemonic = localStorage.getItem(MNEMONIC_KEY)
  if (!mnemonic) {
    mnemonic = Wallet.createRandom().mnemonic.phrase
    localStorage.setItem(MNEMONIC_KEY, mnemonic)
  }
  return mnemonic
}

export function getWallet(index) {
  return Wallet.fromMnemonic(getMnemonic(), getPath(index))
}


