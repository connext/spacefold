import { ethers, providers } from "ethers";
import { BrowserNode } from "@connext/vector-browser-node";
import pino from "pino";
import {
  getPublicKeyFromPublicIdentifier,
  encrypt,
  createlockHash,
  getRandomBytes32,
} from "@connext/vector-utils";
import {
  ConditionalTransferCreatedPayload,
  FullChannelState,
  TransferNames,
} from "@connext/vector-types";
import { ENVIRONMENT } from "../constants";

declare global {
  interface Window {
    ethereum: any;
  }
}

export default class Connext {
  connextClient: BrowserNode;
  config: {
    publicIdentifier: string;
    signerAddress: string;
    index: number;
  };
  provider: providers.Web3Provider;
  signer: providers.JsonRpcSigner;

  counterparty: string =
    "vector7tbbTxQp8ppEQUgPsbGiTrVdapLdU5dH7zTbVuXRf1M4CEBU9Q";

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

    const configRes = await this.connextClient.getConfig();
    console.log("GET CONFIG: ", configRes[0]);
    this.config = configRes[0];

    ENVIRONMENT.map(async (t) => {
      let channelState = await this.getChannelByParticipants(
        this.config.publicIdentifier,
        this.counterparty,
        t.chainId
      );

      if (!channelState) {
        try {
          console.log(
            `No channel detected for chainId ${t.chainId}, setting up channel...`
          );
          await this.setupChannel(this.counterparty, t.chainId);
          channelState = await this.getChannelByParticipants(
            this.config.publicIdentifier,
            this.counterparty,
            t.chainId
          );
        } catch (e) {
          console.error(`Error setting up channel for chainId ${t.chainId}`);
        }
      }
      console.log(`Channel for chainId ${t.chainId}: `, channelState);
    });
  }

  async updateChannel(channelAddress: string): Promise<FullChannelState> {
    const res = await this.connextClient.getStateChannel({ channelAddress });
    if (res.isError) {
      console.error("Error getting state channel", res.getError());
      return;
    }
    const channel = res.getValue();
    console.log("Updated channel:", channel);
    return channel;
  }

  async getChannelByParticipants(
    publicIdentifier: string,
    counterparty: string,
    chainId: number
  ): Promise<FullChannelState> {
    let channelState: any;
    const res = await this.connextClient!.getStateChannelByParticipants({
      publicIdentifier: publicIdentifier,
      counterparty: counterparty,
      chainId: chainId,
    });
    channelState = res.getValue();
    return channelState;
  }

  async setupChannel(aliceIdentifier: string, chainId: number) {
    const setupRes = await this.connextClient.setup({
      counterpartyIdentifier: aliceIdentifier,
      chainId: chainId,
      timeout: "100000",
    });
    if (setupRes.isError) {
      console.error(`Error setting up channel: ${setupRes.getError()}`);
      return;
    }
    console.log(`Setup Channel for Chain: ${chainId} :`, setupRes.getValue());
  }

  async connectMetamask(chainId: number) {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Web3 browser is required");
      throw new Error("No Web3 detected");
    }
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    if (network.chainId !== chainId) {
      alert(`Please switch to chainId ${chainId} and try again`);
      return;
    }
    this.provider = provider;
    // The Metamask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    this.signer = this.provider.getSigner();
  }

  async deposit(chainId: number, assetId: string, amount: string) {
    await this.connectMetamask(chainId);
    const channelState = await this.getChannelByParticipants(
      this.config.publicIdentifier,
      this.counterparty,
      chainId
    );
    const response = await this.signer.sendTransaction({
      to: channelState.channelAddress,
      value: ethers.utils.parseEther(amount),
    });
    const NUM_CONFIRMATIONS = 2;
    console.log(
      `Deposit sent, tx: ${response.hash}, waiting for ${NUM_CONFIRMATIONS} confirmations`
    );
    await response.wait(NUM_CONFIRMATIONS); // NUM_CONFIRMATIONS confirmations just in case
    console.log(`Deposit tx received, reconciling deposit`);
    await this.reconcileDeposit(channelState.channelAddress, assetId);
    await this.updateChannel(channelState.channelAddress);
  }

  async reconcileDeposit(channelAddress: string, assetId: string) {
    const depositRes = await this.connextClient.reconcileDeposit({
      channelAddress: channelAddress,
      assetId,
    });
    if (depositRes.isError) {
      console.error("Error reconciling deposit", depositRes.getError());
      return;
    }
    console.log(`Deposit reconciled: ${depositRes.getValue()}`);
  }

  async transfer(
    senderChainId: number,
    assetId: string,
    value: string,
    receiverChainId: number
  ) {
    const recipient = this.config.publicIdentifier;
    if (!recipient) {
      throw new Error("Cannot transfer without node connection");
    }
    const preImage = getRandomBytes32();
    const amount = ethers.utils.parseEther(value).toString();

    const senderChannelState = await this.getChannelByParticipants(
      this.config.publicIdentifier,
      this.counterparty,
      senderChainId
    );
    const receiverChannelState = await this.getChannelByParticipants(
      this.config.publicIdentifier,
      this.counterparty,
      receiverChainId
    );
    console.log(
      `Sending ${value} from ${senderChannelState.channelAddress} to ${receiverChannelState.channelAddress} using preImage ${preImage}`
    );

    const event: Promise<ConditionalTransferCreatedPayload> = new Promise(
      (res) => {
        this.connextClient.once("CONDITIONAL_TRANSFER_CREATED", (payload) => {
          if (payload.channelAddress !== receiverChannelState.channelAddress) {
            return;
          }
          console.log(
            `Received CONDITIONAL_TRANSFER_CREATED event: ${payload}`
          );
          res(payload);
        });
      }
    );
    const transferRes = await this.connextClient.conditionalTransfer({
      type: TransferNames.HashlockTransfer,
      channelAddress: senderChannelState.channelAddress,
      recipientChainId: receiverChainId,
      assetId,
      amount,
      recipient,
      details: {
        lockHash: createlockHash(preImage),
        expiry: "0",
      },
      timeout: "100000",
      meta: {},
    });
    if (transferRes.isError) {
      console.error("Error transferring", transferRes.getError());
      return;
    }

    console.log(
      `Transfer from for chain: ${senderChainId} to chain ${receiverChainId} :`,
      transferRes.getValue()
    );
    const receivedTransfer = await event;
    console.log(`Received transfer ${receivedTransfer.transfer}, resolving...`);
    const resolveRes = await this.connextClient.resolveTransfer({
      channelAddress: receiverChannelState.channelAddress,
      transferResolver: {
        preImage: preImage,
      },
      transferId: receivedTransfer.transfer.transferId,
    });

    if (resolveRes.isError) {
      console.error("Error resolving transfer", resolveRes.getError());
    }
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

  async send(
    senderChainId: number,
    assetId: string,
    amount: string,
    receiverChainId: number
  ) {
    await this.deposit(senderChainId, assetId, amount);
    await this.transfer(senderChainId, assetId, amount, receiverChainId);
    console.log("Successful desposit and transfer");
  }
}
