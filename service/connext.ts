import { ethers } from "ethers";
import { BrowserNode } from "@connext/vector-browser-node";
import pino from "pino";
import {
  getPublicKeyFromPublicIdentifier,
  encrypt,
  createlockHash,
} from "@connext/vector-utils";
import { TransferNames, FullChannelState } from "@connext/vector-types";
import { IMAGE_PATH, STATUS, ENVIRONMENT, ENV, TOKEN } from "../constants";

declare global {
  interface Window {
    ethereum: any;
  }
}

export default class Connext {
  connextClient: BrowserNode;
  channel: any;
  config: any;
  provider: any;
  signer: any;

  counterparty: string =
    "vector7tbbTxQp8ppEQUgPsbGiTrVdapLdU5dH7zTbVuXRf1M4CEBU9Q";

  //constructor
  constructor() {}

  // Create methods
  async connectNode() {
    // const iframeSrc = "https://wallet.connext.network";
    const iframeSrc = "http://localhost:3030";
    console.log("Connect Node");
    if (!this.connextClient) {
      this.connextClient = await BrowserNode.connect({
        iframeSrc,
        logger: pino(),
      });
    }

    await this.connextClient.getConfig().then((res) => {
      console.log("GET CONFIG: ", res[0]);
      this.config = res[0];
    });

    ENVIRONMENT.findIndex(async (t) => {
      const channelState = await this.getChannelByParticipants(
        this.config.publicIdentifier,
        this.counterparty,
        t.chainId
      );
      console.log(channelState);

      // if (!this.channel) {
      //   console.log("Setup Sec channel");
      //   this.setupChannel(this.counterparty, this.chainId_2);
      // }
    });
  }
  async getChannelByParticipants(publicIdentifier, counterparty, chainId) {
    const channelState: any = await this.connextClient
      .getStateChannelByParticipants({
        publicIdentifier: publicIdentifier,
        counterparty: counterparty,
        chainId: chainId,
      })
      .then((res) => {
        console.log(`GetChannelByParticipants for Chain: ${chainId} :`, res);
      });
    return channelState;
  }

  async setupChannel(aliceIdentifier: string, chainId: number) {
    console.log("Setup channel req");
    const setupRes = await this.connextClient.setup({
      counterpartyIdentifier: aliceIdentifier,
      chainId: chainId,
      timeout: "100000",
    });
    console.log("After Setup channel req");
    if (setupRes.isError) {
      console.error(setupRes.getError());
    } else {
      console.log(setupRes.getValue());
      this.channel = setupRes.getValue() as FullChannelState;
    }
  }

  async connectMetamask() {
    if (typeof window !== "undefined") {
      window.ethereum
        .enable()
        .then(
          (this.provider = new ethers.providers.Web3Provider(window.ethereum))
        );
      // The Metamask plugin also allows signing transactions to
      // send ether and pay to change state within the blockchain.
      // For this, you need the account signer...
      this.signer = this.provider.getSigner();
    }
  }

  async deposit(chainId: number, amount: string) {
    const channelState = await this.getChannelByParticipants(
      this.config.publicIdentifier,
      this.counterparty,
      chainId
    );
    const tx = this.signer.sendTransaction({
      to: channelState.channelAddress,
      value: ethers.utils.parseEther(amount),
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
    const channelState = await this.getChannelByParticipants(
      this.config.publicIdentifier,
      this.counterparty,
      chainId
    );
    const requestRes = await this.connextClient.conditionalTransfer({
      type: TransferNames.HashlockTransfer,
      channelAddress: channelState.channelAddress,
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
    const channelState = await this.getChannelByParticipants(
      this.config.publicIdentifier,
      this.counterparty,
      chainId
    );
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
  // checkChannel(chainId: number) {
  //   return this.channnel.has(chainId);
  // }

  // // Getter Methods
  // getChannel(chainId: number) {
  //   return this.channnel.get(chainId);
  // }
}
