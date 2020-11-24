// import { utils } from "ethers";
// import { BrowserNode } from "@connext/vector-browser-node";
// import pino from "pino";
// import { stringify, getRandomBytes32 } from "@connext/vector-utils";
// import axios from "axios";

// import { Wallet } from "./utils";

// // const dotenv = require("dotenv");
// // dotenv.config();

// const iframeSrc = "https://node.spacefold.io";

// export async function initClients(
//   tokens,
//   onMintSucceeded,
//   onTransferSucceeded,
//   onWithdrawSucceeded,
//   onBalanceRefresh,
//   onWithdrawFailed
// ) {
//   const clientsAndBalances = await Promise.all(
//     Object.values(tokens).map(async (token) => {
//       try {
//         console.log(
//           `Creating client for token ${JSON.stringify({
//             name: token.name,
//             tokenName: token.tokenName,
//             chainId: token.chainId,
//           })}`
//         );
//         const pk = Wallet.getWallet(token.chainId).privateKey;
//         const client = await BrowserNode.connect({
//           iframeSrc,
//           logger: pino(),
//         });
//         const freeBalance = await client.getFreeBalance(token.tokenAddress);
//         console.log(
//           `Created client for token ${JSON.stringify(token)}: ${
//             client.publicIdentifier
//           } with balance: ${freeBalance[client.signerAddress]}`
//         );

//         const refreshBalances = async (client) => {
//           const token = tokens[client.chainId];
//           const channel = await client.getFreeBalance(token.tokenAddress);
//           onBalanceRefresh(client.chainId, channel[client.signerAddress]);
//           return channel[client.signerAddress];
//         };

//         client.on("CONDITIONAL_TRANSFER_CREATED_EVENT", async (msg) => {
//           const updated = await refreshBalances(client);
//           console.log("Transfer created, updated balances", updated);
//         });
//         client.on("CONDITIONAL_TRANSFER_UNLOCKED_EVENT", async (msg) => {
//           const updated = await refreshBalances(client);
//           console.log("Transfer unlocked, updated balances", updated);
//           if (msg.recipient === client.publicIdentifier) {
//             onMintSucceeded();
//           } else {
//             onTransferSucceeded();
//           }
//         });
//         client.on("WITHDRAWAL_CONFIRMED_EVENT", async (msg) => {
//           const updated = await refreshBalances(client);
//           console.log("Withdrawal completed, updated balances", updated);
//           onWithdrawSucceeded();
//         });
//         client.on("WITHDRAWAL_FAILED_EVENT", async (msg) => {
//           console.error("WITHDRAWAL_FAILED_EVENT: ", msg);
//           const updated = await refreshBalances(client);
//           console.error("Withdrawal failed, updated balances", updated);
//           onWithdrawFailed();
//         });

//         return { client, freeBalance };
//       } catch (e) {
//         throw new Error(
//           `Failed to create client on ${token.chainId}: ${e.message}`
//         );
//       }
//     })
//   );
//   const clients = clientsAndBalances.reduce((c, entry) => {
//     if (entry) {
//       c[entry.client.chainId] = entry.client;
//     }
//     return c;
//   }, {});
//   const balances = clientsAndBalances.reduce((b, entry) => {
//     if (entry) {
//       b[entry.client.chainId] = utils.formatEther(
//         entry.freeBalance[entry.client.signerAddress]
//       );
//     }
//     return b;
//   }, {});
//   return { clients, balances };
// }

// export async function collateralize(clients, tokens) {
//   await Promise.all(
//     Object.values(clients).map(async (client) => {
//       const token = tokens[client.chainId];
//       const tx = await client.requestCollateral(token.tokenAddress);
//       if (!tx) {
//         return;
//       }
//       console.log(`Sent collateralization tx: ${tx.hash}`);
//       await client.ethProvider.waitForTransaction(tx.hash);
//       console.log(`Transaction mined: ${tx.hash}`);
//     })
//   );
// }

// export async function mint(mintToken, clients, tweetUrl) {
//   const assetId = mintToken.tokenAddress;
//   const client = clients[mintToken.chainId];
//   if (!client) {
//     throw new Error(`Failed to find client for ${mintToken.chainId}`);
//   }
//   const faucetUrl = `${process.env.REACT_APP_FAUCET_URL}/faucet`;
//   const faucetData = {
//     assetId,
//     recipient: client.publicIdentifier,
//     tweet: tweetUrl,
//     chainId: mintToken.chainId,
//   };
//   try {
//     console.log(
//       `Making faucet request to ${faucetUrl}: ${stringify(faucetData, true, 0)}`
//     );
//     const res = await axios.post(faucetUrl, faucetData);
//     console.log(`Faucet response: ${JSON.stringify(res)}`);
//   } catch (e) {
//     throw new Error(
//       `Minting failed: ${e.response ? e.response.data?.message : e.message}`
//     );
//   }
// }

// export async function transfer(fromToken, toToken, clients, balances) {
//   const fromClient = clients[fromToken.chainId];
//   const toClient = clients[toToken.chainId];

//   try {
//     const params = {
//       amount: utils.parseEther(balances[fromToken.chainId]),
//       assetId: fromToken.tokenAddress,
//       conditionType: "OnlineLinkedTransferApp",
//       recipient: toClient.publicIdentifier,
//       preImage: getRandomBytes32(),
//       paymentId: getRandomBytes32(),
//       meta: {
//         receiverAssetId: toToken.tokenAddress,
//         receiverChainId: toToken.chainId,
//       },
//     };
//     console.log(`Transferring with params ${stringify(params, true, 0)}`);
//     const res = await fromClient.conditionalTransfer(params);
//     console.log(`Transfer complete: ${stringify(res, true, 0)}`);
//   } catch (e) {
//     throw new Error(`Folding failed: ${e.stack}`);
//   }
// }

// export async function send(sendToken, sendAddress, clients) {
//   const sendClient = clients[sendToken.chainId];
//   try {
//     const withdrawParams = {
//       amount: utils.parseEther(sendToken.balance),
//       assetId: sendToken.tokenAddress,
//       recipient: sendAddress,
//     };
//     console.log(`Sending tokens: ${JSON.stringify(withdrawParams)}`);
//     const res = await sendClient.withdraw(withdrawParams);
//     console.log(`Withdraw response: ${JSON.stringify(res)}`);
//     return res.transaction.hash;
//   } catch (e) {
//     throw new Error(`Sending failed: ${e.stack}`);
//   }
// }
