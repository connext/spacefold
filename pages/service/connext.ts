import { ethers } from "ethers";
import { BrowserNode } from "@connext/vector-browser-node";
import pino from "pino";
import {
  getPublicKeyFromPublicIdentifier,
  encrypt,
  createlockHash,
} from "@connext/vector-utils";
import { TransferNames } from "@connext/vector-types";

export default class Connext {
  connextClient: any;
  channnel: any;
  provider: any;
  signer: any;

  //constructor

  constructor() {
    this.channnel = new Map();
    this.connectNode();
  }

  // Create methods
  async connectNode() {
    this.connextClient = await BrowserNode.connect({
      logger: pino(),
    });
  }

  async setupChannel(aliceIdentifier: string, chainId: number) {
    const setupRes = await this.connextClient.setup({
      counterpartyIdentifier: aliceIdentifier,
      chainId: chainId,
      timeout: "100000",
    });
    if (setupRes.isError) {
      console.error(setupRes.getError());
    } else {
      console.log(setupRes.getValue());
      this.channnel.set(chainId, setupRes.getValue());
    }
  }

  async connectMetamask() {
    if (typeof window !== "undefined") {
      await window.ethereum.enable();
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      // The Metamask plugin also allows signing transactions to
      // send ether and pay to change state within the blockchain.
      // For this, you need the account signer...
      this.signer = this.provider.getSigner();
    }
  }

  async deposit(chainId: number) {
    if (!this.checkChannel(chainId)) {
      console.log(`Channel doesn't exist for ${chainId}`);
      return;
    }
    const channelState = this.getChannel(chainId);
    const tx = this.signer.sendTransaction({
      to: channelState.channelAddress,
      value: ethers.utils.parseEther("1.0"),
    });
    console.log(tx);
  }

  async transfer(
    assetId: string,
    amount: string,
    recipient: string,
    preImage: string,
    chainId: number
  ) {
    const submittedMeta: { encryptedPreImage?: string } = {};
    if (recipient) {
      const recipientPublicKey = getPublicKeyFromPublicIdentifier(recipient);
      const encryptedPreImage = await encrypt(preImage, recipientPublicKey);
      submittedMeta.encryptedPreImage = encryptedPreImage;
    }
    const channelState = this.getChannel(chainId);

    const requestRes = await this.connextClient.conditionalTransfer({
      type: TransferNames.HashlockTransfer,
      channnel: channelState.channelAddress,
      recipientChainId: chainId,
      assetId,
      amount,
      recipient,
      details: {
        lockHash: createlockHash(preImage),
        expiry: "0",
      },
      timeout: "100000",
      meta: submittedMeta,
    });
    if (requestRes.isError) {
      console.error("Error transferring", requestRes.getError());
    }
  }

  async withdraw(
    assetId: string,
    amount: string,
    recipient: string,
    chainId: number
  ) {
    const channelState = this.getChannel(chainId);
    const requestRes = await this.connextClient.withdraw({
      channelAddress: channelState.channelAddress,
      assetId,
      amount,
      recipient,
    });
    if (requestRes.isError) {
      console.error("Error withdrawing", requestRes.getError());
    }
  }

  async transferAndWithdraw(
    assetId: string,
    amount: string,
    recipient: string,
    preImage: string,
    chainId: number
  ) {
    await this.transfer(assetId, amount, recipient, preImage, chainId);
    // const value = ethers.utils.parseEther("0.5");
    await this.withdraw(assetId, amount, recipient, chainId);
  }

  // verify Methods
  checkChannel(chainId: number) {
    return this.channnel.has(chainId);
  }

  // Getter Methods
  getChannel(chainId: number) {
    return this.channnel.get(chainId);
  }

  // Delete all entries
  deleteDB() {
    this.channnel.clear();
  }
}
