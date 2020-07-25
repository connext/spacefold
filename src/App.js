import axios from "axios";
import React, { useState, useEffect } from "react";
import * as connext from "@connext/client";
import { constants, BigNumber } from "ethers";
import Select from "react-select";

import "./App.css";
import { getWallet } from "./wallet";
import { parseEther, formatEther } from "ethers/lib/utils";
const dotenv = require("dotenv");
dotenv.config();

const nodeUrl = "https://node.spacefold.io/";
// const nodeUrl = "http://localhost:8080";

const networks = {
  // 1: { name: "Mainnet", chainId: 1 },
  4: { name: "Rinkeby", chainId: 4 },
  // 5: { name: "Goerli", chainId: 5 },
  42: { name: "Kovan", chainId: 42 },
  // 1337: { name: "Ganache", chainId: 1337 },
  // 1338: { name: "Buidler", chainId: 1338 },
};

const tokens = {
  eth: { tokenName: "ETH", tokenAddress: constants.AddressZero },
  moon: {
    tokenName: "MOON",
    tokenAddress: "0x50C94BeCAd95bEe21aF226dc799365Ee6B134459", // rinkeby
  },
  brick: {
    tokenName: "BRICK",
    tokenAddress: "0x4d4deb65DBC13dE6811095baba7064B41A72D9Db", // kovan
  },
};

function App() {
  const [clients, setClients] = useState({});
  const [tweets, setTweets] = useState({});
  const [mintTokens, setMintTokens] = useState([]);
  const [sendTokens, setSendTokens] = useState([]);
  const [activeMintToken, setActiveMintToken] = useState(0);
  const [activeSendToken, setActiveSendToken] = useState(0);

  const mintOptions = mintTokens.map((t) => ({
    label: t.name,
    value: t.chainId,
  }));
  const sendOptions = sendTokens.map((t) => ({
    label: t.name,
    value: t.chainId,
  }));

  useEffect(() => {
    async function initClients() {
      const clientsArr = [];
      for (const network of Object.values(networks)) {
        try {
          const client = await connext.connect({
            nodeUrl,
            ethProviderUrl: `https://${network.name.toLowerCase()}.infura.io/v3/${
              process.env.REACT_APP_INFURA_ID
            }`,
            signer: getWallet(network.chainId).privateKey,
            logLevel: 2,
          });
          clientsArr.push({ chainId: network.chainId, client });
        } catch (e) {
          console.warn(`Failed to create client on ${network.chainId}`);
        }
      }
      const _tweets = {};
      const _clients = {};
      clientsArr.forEach((t) => {
        _clients[t.chainId] = t.client;
        _tweets[t.publicIdentifier] = undefined;
      });
      setClients(_clients);
      setTweets(_tweets);
      console.error("set _clients", _clients);
    }
    initClients();
  }, []);

  useEffect(() => {
    const updateTokenBalance = async () => {
      const mintClient = clients[networks[4].chainId];
      const mintBal = !!mintClient
        ? (await mintClient.getFreeBalance(tokens.moon.tokenAddress))[
            mintClient.signerAddress
          ]
        : BigNumber.from(0);
      const mintTokens = [
        { ...networks[4], ...tokens.moon, balance: formatEther(mintBal) },
      ];

      const sendClient = clients[networks[42].chainId];
      const sendBal = !!sendClient
        ? (await sendClient.getFreeBalance(tokens.brick.tokenAddress))[
            sendClient.signerAddress
          ]
        : BigNumber.from(0);
      const sendTokens = [
        { ...networks[42], ...tokens.brick, balance: formatEther(sendBal) },
      ];
      setMintTokens(mintTokens);
      setSendTokens(sendTokens);
    };
    updateTokenBalance();
  }, [clients]);

  const changeMintToken = (option) => {
    const newTokenIndex = mintTokens.findIndex(
      (t) => t.chainId === option.value
    );
    setActiveMintToken(newTokenIndex);
  };
  const changeSendToken = (option) => {
    const newTokenIndex = sendTokens.findIndex(
      (t) => t.chainId === option.value
    );
    setActiveSendToken(newTokenIndex);
  };

  const transfer = async () => {
    const fromToken = mintTokens[activeMintToken];
    const fromClient = clients[fromToken.chainId];

    const toToken = sendTokens[activeSendToken];
    const toClient = clients[toToken.chainId];
    console.error(
      "recipient pre transfer balance",
      (await toClient.getFreeBalance(toToken.tokenAddress))[
        toClient.signerAddress
      ].toString()
    );

    const params = {
      assetId: fromToken.tokenAddress,
      amount: parseEther(fromToken.balance.toString()),
      recipient: toClient.publicIdentifier,
      meta: {
        receiverAssetId: toToken.tokenAddress,
        receiverChainId: toToken.chainId,
      },
    };
    console.warn("*** calling transfer with params", params);
    await fromClient.transfer(params);
    toClient.once("CONDITIONAL_TRANSFER_UNLOCKED_EVENT", async (data) => {
      console.error("got conditional transfer unlocked event", data);
      console.error(
        "recipient post transfer balance",
        (await toClient.getFreeBalance(toToken.tokenAddress))[
          toClient.signerAddress
        ].toString()
      );
    });
  };

  const mint = async () => {
    const mintToken = mintTokens[activeMintToken];
    const assetId = mintToken.tokenAddress;
    const client = clients[mintToken.chainId];
    if (!client) {
      console.error(`Failed to find client for ${mintToken.chainId}`, clients);
      return;
    }
    console.error(
      "pre faucet balance",
      (await client.getFreeBalance(assetId))[client.signerAddress].toString()
    );
    console.log("faucet url", `${process.env.REACT_APP_FAUCET_URL}/faucet`);
    const res = await axios.post(`${process.env.REACT_APP_FAUCET_URL}/faucet`, {
      assetId,
      recipient: client.publicIdentifier,
      tweet: "devmode",
    });
    console.log("res", res);
    client.once("CONDITIONAL_TRANSFER_UNLOCKED_EVENT", async (data) => {
      console.error("got conditional transfer unlocked event", data);
      console.error(
        "post faucet balance",
        (await client.getFreeBalance(assetId))[client.signerAddress].toString()
      );
    });
  };

  const send = async (address) => {
    const sendToken = sendTokens[activeSendToken];
    const sendClient = clients[sendToken.chainId];

    await sendClient.withdraw({
      amount: sendToken.balance,
      assetId: sendToken.tokenAddress,
      recipient: address,
    });
  };

  return (
    <div className="App">
      <div className="More-Buttons">
        <button
          type="button"
          className="Discord-Button"
          onClick={() =>
            (window.location.href =
              "https://discord.com/channels/454734546869551114")
          }
        >
          <i className="fab fa-discord"></i>
        </button>
        <button
          type="button"
          className="About-Button"
          onClick={() => (window.location.href = "https://connext.network/")}
        >
          <i className="fas fa-info-circle"></i>
        </button>
      </div>
      <div className="Token Token-Left">
        <div className="Card">
          <Select
            className="Token-Select"
            value={mintOptions[activeMintToken]}
            onChange={changeMintToken}
            options={mintOptions}
          />
          <p className="Token-Balance">
            {mintTokens.length > 0 && mintTokens[activeMintToken].balance}{" "}
            <span className="Token-Name">
              {mintTokens.length > 0 && mintTokens[activeMintToken].tokenName}
            </span>
          </p>
          <button type="button" className="Mint-Button" onClick={mint}>
            MINT
          </button>
        </div>
      </div>
      <button type="button" className="Swap-Button" onClick={transfer}>
        TRANSFER
        <span className="Swap-Arrows">
          <i className="fas fa-chevron-right"></i>
          <i className="fas fa-chevron-right"></i>
          <i className="fas fa-chevron-right"></i>
          <i className="fas fa-chevron-right"></i>
          <i className="fas fa-chevron-right"></i>
        </span>
      </button>
      <div className="Token Token-Right">
        <div className="Card">
          <Select
            className="Token-Select"
            value={sendOptions[activeSendToken]}
            onChange={changeSendToken}
            options={sendOptions}
          />
          <p className="Token-Balance">
            {sendTokens.length > 0 && sendTokens[activeSendToken].balance}{" "}
            <span className="Token-Name">
              {sendTokens.length > 0 && sendTokens[activeSendToken].tokenName}
            </span>
          </p>
          <button type="button" className="Send-Button" onClick={send}>
            SEND{" "}
            {sendTokens.length > 0 && sendTokens[activeSendToken].tokenName}
          </button>
        </div>
      </div>
      <p className="Footer">
        Made with <i className="fas fa-heart Heart-Icon"></i> by Connext
      </p>
    </div>
  );
}

export default App;
