import { ethers } from "ethers";
import { BrowserNode } from "@connext/vector-browser-node";
import pino from "pino";
import {
  getPublicKeyFromPublicIdentifier,
  encrypt,
  createlockHash,
  getRandomBytes32,
} from "@connext/vector-utils";
import { TransferNames } from "@connext/vector-types";
import { ENVIRONMENT } from "../constants";

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
    const iframeSrc = "https://wallet.connext.network";
    // const iframeSrc = "http://localhost:3030";
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

    ENVIRONMENT.map(async (t) => {
      const channelState = await this.getChannelByParticipants(
        this.config.publicIdentifier,
        this.counterparty,
        t.chainId
      );
      console.log(channelState);

      if (!channelState) {
        this.setupChannel(this.counterparty, t.chainId);
      }
    });
  }

  async updateChannel(channelAddress: string) {
    const res = await this.connextClient.getStateChannel({ channelAddress });
    if (res.isError) {
      console.error("Error getting state channel", res.getError());
    } else {
      console.log("Updated channel:", res.getValue());
    }
  }

  async getChannelByParticipants(publicIdentifier, counterparty, chainId) {
    let channelState;
    await this.connextClient!.getStateChannelByParticipants({
      publicIdentifier: publicIdentifier,
      counterparty: counterparty,
      chainId: chainId,
    }).then((res) => {
      console.log(`GetChannelByParticipants for Chain: ${chainId} :`, res);
      channelState = res.getValue();
    });
    return channelState;
  }

  async setupChannel(aliceIdentifier: string, chainId: number) {
    await this.connextClient
      .setup({
        counterpartyIdentifier: aliceIdentifier,
        chainId: chainId,
        timeout: "100000",
      })
      .then((res) => {
        console.log(`Setup Channel for Chain: ${chainId} :`, res);
        if (res.isError) {
          console.error(res.getError());
        } else {
          console.log(res.getValue());
        }
      });
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

  async deposit(chainId: number, assetId: string, amount: string) {
    await this.connectMetamask();
    const channelState = await this.getChannelByParticipants(
      this.config.publicIdentifier,
      this.counterparty,
      chainId
    );
    await this.signer
      .sendTransaction({
        to: channelState.channelAddress,
        value: ethers.utils.parseEther(amount),
      })
      .then((res) => {
        console.log(
          `deposit to ${channelState.channelAddress} at Chain: ${chainId} :`,
          res
        );
        this.provider.waitForTransaction(res.hash).then(async () => {
          await this.reconcileDeposit(channelState.channelAddress, assetId);
        });
      });
  }

  async reconcileDeposit(channelAddress: string, assetId: string) {
    const depositRes = await this.connextClient.reconcileDeposit({
      channelAddress: channelAddress,
      assetId,
    });
    if (depositRes.isError) {
      console.error("Error depositing", depositRes.getError());
    }
  }

  async transfer(chainId: number, assetId: string, value: string) {
    const recipient = this.config.publicIdentifier;
    const preImage = getRandomBytes32();
    const amount = ethers.utils.parseEther(value).toString();

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
    await this.connextClient
      .conditionalTransfer({
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
      })
      .then(async (res) => {
        console.log(`Setup Channel for Chain: ${chainId} :`, res);
        if (res.isError) {
          console.error("Error transferring", res.getError());
        } else {
          console.log(res.getValue());
          const transferState = res.getValue();
          await this.connextClient
            .resolveTransfer({
              channelAddress: transferState.channelAddress,
              transferResolver: {
                preImage: preImage,
              },
              transferId: transferState.transferId,
            })
            .then(async (requestRes) => {
              if (requestRes.isError) {
                console.error(
                  "Error resolving transfer",
                  requestRes.getError()
                );
              }
            });
        }
      });
  }

  async withdraw(
    chainId: number,
    assetId: string,
    recipient: string,
    value: string
  ) {
    const amount = ethers.utils.parseEther(value).toString();

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

  async send(chainId: number, assetId: string, amount: string) {
    return await this.deposit(chainId, assetId, amount)
      .then(async () => await this.transfer(chainId, assetId, amount))
      .then(() => console.log("Successful desposit and transfer"));
  }
}
