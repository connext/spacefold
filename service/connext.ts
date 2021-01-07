import { ethers, providers } from "ethers";
import { AddressZero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import { BrowserNode } from "@connext/vector-browser-node";
import { TestToken } from "@connext/vector-contracts";
import {
  DEFAULT_CHANNEL_TIMEOUT,
  DEFAULT_TRANSFER_TIMEOUT,
  ConditionalTransferCreatedPayload,
  FullChannelState,
  TransferNames,
} from "@connext/vector-types";
import { createlockHash, getRandomBytes32 } from "@connext/vector-utils";
import { ENVIRONMENT } from "../constants";

declare global {
  interface Window {
    ethereum: any;
  }
}

const chainConfig = process.env.NEXT_PUBLIC_CHAIN_PROVIDERS;
export const chainProviders = JSON.parse(chainConfig!);

class Connext {
  connextClient: BrowserNode;
  config: {
    publicIdentifier: string;
    signerAddress: string;
    index: number;
  };
  provider: providers.Web3Provider;
  signer: providers.JsonRpcSigner;

  counterparty = "vector7tbbTxQp8ppEQUgPsbGiTrVdapLdU5dH7zTbVuXRf1M4CEBU9Q";
  // counterparty = "vector8Uz1BdpA9hV5uTm6QUv5jj1PsUyCH8m8ciA94voCzsxVmrBRor"; // local

  // Create methods
  async connectNode() {
    const iframeSrc = "https://wallet.connext.network";
    const supportedChains: number[] = [];
    ENVIRONMENT.map(async (t) => {
      supportedChains.push(t.chainId);
    });
    const routerPublicIdentifier: string = this.counterparty;

    console.log("Connect Node");
    if (!this.connextClient) {
      try {
        const client = new BrowserNode({
          iframeSrc,
          supportedChains,
          routerPublicIdentifier,
          chainProviders,
        });
        await client.init();
        this.connextClient = client;
      } catch (e) {
        console.error(e);
        throw new Error(`connecting to iframe: ${e}`);
      }
      console.log("connection success");
    }

    const configRes = await this.connextClient.getConfig();
    if (!configRes[0])
      throw new Error(`Error getConfig: node connection failed`);

    console.log("GET CONFIG: ", configRes[0]);
    this.config = configRes[0];
  }

  async updateChannel(channelAddress: string): Promise<FullChannelState> {
    const res = await this.connextClient.getStateChannel({ channelAddress });
    if (res.isError) {
      throw new Error(`Error getting state channel ${res.getError()}`);
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
    if (res.isError) {
      throw new Error(
        `Error getting state channel by participants ${res.getError()}`
      );
    }
    channelState = res.getValue();
    return channelState;
  }

  async connectMetamask(chainId: number) {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Web3 browser is required");
      throw new Error("No Web3 detected");
    }
    try {
      await window.ethereum.enable();
    } catch (e) {
      throw new Error(`Error connecting to Metamask: ${e}`);
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    if (network.chainId !== chainId) {
      throw new Error(`Please switch to chainId ${chainId} and try again`);
    }
    this.provider = provider;
    this.signer = this.provider.getSigner();
  }

  // TODO: get user on chain balance
  // async getOnChainBalance(chainId: number) {

  //   let customHttpProvider = new ethers.providers.JsonRpcProvider(url);
  // }

  async basicSanitation(params: {
    value?: string;
    fromChainId?: number;
    fromAssetId?: string;
    toChainId?: number;
    toAssetId?: string;
    withdrawalAddress?: string;
  }) {
    if (!this.connextClient) {
      throw new Error("iframe Connection failed");
    }

    if (!this.config) {
      throw new Error("Node Connection failed");
    }

    if (!this.config.publicIdentifier) {
      throw new Error("user publicIdentifier missing");
    }

    if (params.value) {
      if (ethers.utils.parseEther(params.value).isZero()) {
        throw new Error("Value can't be zero");
      }
    }

    if (params.withdrawalAddress) {
      if (!ethers.utils.isAddress(params.withdrawalAddress)) {
        throw new Error("Invalid Recipient Address");
      }
    }
    console.log("Valid params");
  }

  async deposit(chainId: number, assetId: string, amount: string) {
    await this.basicSanitation({
      fromChainId: chainId,
      fromAssetId: assetId,
      value: amount,
    });

    const channelState = await this.getChannelByParticipants(
      this.config.publicIdentifier,
      this.counterparty,
      chainId
    );

    await this.connectMetamask(chainId);
    const value = ethers.utils.parseEther(amount);

    let tx;
    try {
      tx =
        assetId === AddressZero
          ? await this.signer.sendTransaction({
              value,
              to: channelState.channelAddress,
            })
          : await new Contract(assetId, TestToken.abi, this.signer).transfer(
              channelState.channelAddress,
              value
            );
      const NUM_CONFIRMATIONS = 1;
      console.log(
        `Deposit sent on ${await this.signer.getChainId()}, tx: ${
          tx.hash
        }, waiting for ${NUM_CONFIRMATIONS} confirmations`
      );
      await tx.wait(NUM_CONFIRMATIONS); // NUM_CONFIRMATIONS confirmations just in case
    } catch (e) {
      console.error(e);
      throw new Error(`Deposit onChain: ${e}`);
    }
    console.log(`Deposit tx received, reconciling deposit`);

    await this.reconcileDeposit(channelState.channelAddress, assetId);
    await this.updateChannel(channelState.channelAddress);

    let url: string;
    ENVIRONMENT.findIndex((t) => {
      if (t.chainId === chainId) {
        url = t.blockchainExplorerURL;
      }
    });
    const link = `${url}${tx.hash}`;
    const message = "Deposit successful";
    return { message, link };
  }

  async reconcileDeposit(channelAddress: string, assetId: string) {
    const depositRes = await this.connextClient.reconcileDeposit({
      channelAddress: channelAddress,
      assetId,
    });
    if (depositRes.isError) {
      throw new Error(`Error reconciling deposit: ${depositRes.getError()}`);
    }
    console.log(`Deposit reconciled: ${JSON.stringify(depositRes.getValue())}`);
  }

  async transfer(
    senderChainId: number,
    senderAssetId: string,
    value: string,
    recipientChainId: number,
    recipientAssetId: string
  ) {
    await this.basicSanitation({
      fromChainId: senderChainId,
      fromAssetId: senderAssetId,
      toChainId: recipientChainId,
      toAssetId: recipientAssetId,
      value: value,
    });

    const recipient = this.config.publicIdentifier;
    const preImage = getRandomBytes32();
    const amount = ethers.utils.parseEther(value);

    const senderChannelState = await this.getChannelByParticipants(
      this.config.publicIdentifier,
      this.counterparty,
      senderChainId
    );
    const receiverChannelState = await this.getChannelByParticipants(
      this.config.publicIdentifier,
      this.counterparty,
      recipientChainId
    );
    console.log(
      `Sending ${value} from ${senderChannelState.channelAddress} to ${receiverChannelState.channelAddress} using preImage ${preImage}`
    );

    const event: Promise<ConditionalTransferCreatedPayload> = new Promise(
      (res) => {
        this.connextClient.on("CONDITIONAL_TRANSFER_CREATED", (payload) => {
          if (payload.channelAddress !== receiverChannelState.channelAddress) {
            return;
          }
          console.log(`Received CONDITIONAL_TRANSFER_CREATED event: `, payload);
          res(payload);
        });
      }
    );
    const transferRes = await this.connextClient.conditionalTransfer({
      type: TransferNames.HashlockTransfer,
      channelAddress: senderChannelState.channelAddress,
      assetId: senderAssetId,
      amount: amount.toString(),
      recipient,
      recipientChainId: recipientChainId,
      recipientAssetId: recipientAssetId,
      details: {
        lockHash: createlockHash(preImage),
        expiry: "0",
      },
      timeout: DEFAULT_TRANSFER_TIMEOUT.toString(),
      meta: {},
    });
    if (transferRes.isError) {
      throw new Error(`Error transferring: ${transferRes.getError()}`);
    }

    console.log(
      `Transfer from for chain: ${senderChainId} to chain ${recipientChainId} :`,
      transferRes.getValue()
    );
    const receivedTransfer = await event;
    console.log(
      `Received transfer ${JSON.stringify(
        receivedTransfer.transfer
      )}, resolving...`
    );
    const resolveRes = await this.connextClient.resolveTransfer({
      channelAddress: receiverChannelState.channelAddress,
      transferResolver: {
        preImage: preImage,
      },
      transferId: receivedTransfer.transfer.transferId,
    });
    if (resolveRes.isError) {
      throw new Error(`Error resolving transfer: ${resolveRes.getError()}`);
    }

    console.log(`successfuly resolved transfer:, `, resolveRes.getValue());
    await this.updateChannel(senderChannelState.channelAddress);
    await this.updateChannel(receiverChannelState.channelAddress);

    return `Successful transfer from chain: ${senderChainId} to chain ${recipientChainId}`;
  }

  async withdraw(
    recipientChainId: number,
    receiverAssetId: string,
    receiverAddress: string,
    value: string
  ) {
    await this.basicSanitation({
      toChainId: recipientChainId,
      toAssetId: receiverAssetId,
      value: value,
      withdrawalAddress: receiverAddress,
    });

    const amount = ethers.utils.parseEther(value).toString();

    const channelState = await this.getChannelByParticipants(
      this.config.publicIdentifier,
      this.counterparty,
      recipientChainId
    );

    const requestRes = await this.connextClient.withdraw({
      channelAddress: channelState.channelAddress,
      assetId: receiverAssetId,
      amount,
      recipient: receiverAddress,
    });
    if (requestRes.isError) {
      throw new Error(`Error withdrawing: ${requestRes.getError()}`);
    }
    console.log(`successfuly withdraw: `, requestRes.getValue());

    await this.updateChannel(channelState.channelAddress);

    let url: string;
    ENVIRONMENT.findIndex((t) => {
      if (t.chainId === recipientChainId) {
        url = t.blockchainExplorerURL;
      }
    });

    const link = `${url}${requestRes.getValue().transactionHash}`;
    const message = "Successful Withdrawl";
    return { message, link };
  }

  async crossTransfer(
    value: string,
    senderChainId: number,
    senderAssetId: string,
    recipientChainId: number,
    recipientAssetId: string,
    withdrawalAddress: string
  ) {
    await this.basicSanitation({
      fromChainId: senderChainId,
      fromAssetId: senderAssetId,
      toChainId: recipientChainId,
      toAssetId: recipientAssetId,
      value: value,
      withdrawalAddress: withdrawalAddress,
    });

    const amount = ethers.utils.parseEther(value).toString();
    const crossChainTransferId = getRandomBytes32();

    const params = {
      amount,
      fromChainId: senderChainId,
      fromAssetId: senderAssetId,
      toChainId: recipientChainId,
      toAssetId: recipientAssetId,
      reconcileDeposit: false,
      withdrawalAddress: withdrawalAddress,
      meta: { crossChainTransferId },
    };

    let result;
    try {
      result = await this.connextClient.crossChainTransfer(params);
    } catch (e) {
      throw new Error(`${e}`);
    }
    console.log("CrossChain transfer is successful");
    let url: string;
    ENVIRONMENT.findIndex((t) => {
      if (t.chainId === recipientChainId) {
        url = t.blockchainExplorerURL;
      }
    });

    const link = `${url}${result.withdrawalTx}`;
    const message = "Successful cross chain transfer";
    return { message, link };
  }

  async send(
    senderChainId: number,
    senderAssetId: string,
    recipientChainId: number,
    receiverAssetId: string,
    receiverAddress: string,
    amount: string
  ) {
    await this.deposit(senderChainId, senderAssetId, amount);
    await this.transfer(
      senderChainId,
      senderAssetId,
      amount,
      recipientChainId,
      receiverAssetId
    );
    await this.withdraw(
      recipientChainId,
      receiverAssetId,
      receiverAddress,
      amount
    );
    console.log("Successfuly Sent");
  }

  /* ------------------------------------------------------------ */
  // functions below are not being used

  async checkAndSetupChannel() {
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

  async setupChannel(aliceIdentifier: string, chainId: number) {
    const setupRes = await this.connextClient.setup({
      counterpartyIdentifier: aliceIdentifier,
      chainId: chainId,
      timeout: DEFAULT_CHANNEL_TIMEOUT.toString(),
    });
    if (setupRes.isError) {
      console.error(`Error setting up channel: ${setupRes.getError()}`);
      return;
    }
    console.log(`Setup Channel for Chain: ${chainId} :`, setupRes.getValue());
  }
}

export const connext = new Connext();
