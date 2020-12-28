import { Wallet } from "ethers";

export const ETH_STANDARD_PATH = "m/44'/60'/0'/0";
export const MNEMONIC_KEY = "MNEMONICS";

export function getPath(index) {
  return `${ETH_STANDARD_PATH}/${index}`;
}

export function getMnemonic(chainId) {
  const mnemonics = JSON.parse(localStorage.getItem(MNEMONIC_KEY) || "{}");
  if (!mnemonics[chainId]) {
    mnemonics[chainId] = Wallet.createRandom().mnemonic.phrase;
    localStorage.setItem(MNEMONIC_KEY, JSON.stringify(mnemonics));
  }
  return mnemonics[chainId];
}

export function getWallet(chainId) {
  return Wallet.fromMnemonic(getMnemonic(chainId.toString()));
}
