import React, { useState, useEffect } from "react";
import * as connext from "@connext/client";
import { ColorfulLogger } from "@connext/utils";
import { getLocalStore } from "@connext/store";
import { constants, utils } from "ethers";
import Select from "react-select";
import axios from "axios";

import ethIcon from "./images/eth.png";
import brickIcon from "./images/brick.png";
import moonIcon from "./images/moon.png";
import ethBackground from "./images/ethBackground.png";
import brickBackground from "./images/brickBackground.png";
import moonBackground from "./images/moonBackground.png";
import "./App.css";
import { getWallet } from "./wallet";

const { formatEther, parseEther } = utils;

const dotenv = require("dotenv");
dotenv.config();

const nodeUrl = "https://node.spacefold.io/";

const networks = {
  // 1: { name: "Mainnet", chainId: 1 },
  4: { name: "Rinkeby", chainId: 4 },
  // 5: { name: "Goerli", chainId: 5 },
  42: { name: "Kovan", chainId: 42 },
  // 1337: { name: "Ganache", chainId: 1337 },
  // 1338: { name: "Buidler", chainId: 1338 },
};

const _tokens = {
  1: { tokenName: "ETH", tokenAddress: constants.AddressZero },
  4: {
    tokenName: "MOON",
    tokenAddress: "0x50C94BeCAd95bEe21aF226dc799365Ee6B134459", // rinkeby
    name: "Rinkeby",
    chainId: 4,
  },
  42: {
    tokenName: "BRICK",
    tokenAddress: "0x4d4deb65DBC13dE6811095baba7064B41A72D9Db", // kovan
  },
  5: { name: "Goerli", chainId: 5 },
};

const tokens = {
  1: {
    tokenName: "Eth",
    tokenIcon: ethIcon,
    tokenBackground: ethBackground,
    tokenAddress: constants.AddressZero,
  },
  4: {
    tokenName: "Moon",
    tokenIcon: moonIcon,
    tokenBackground: moonBackground,
    tokenAddress: "0x50C94BeCAd95bEe21aF226dc799365Ee6B134459",
    chainId: 4,
    name: "Rinkeby",
  },
  42: {
    tokenName: "Brick",
    tokenIcon: brickIcon,
    tokenBackground: brickBackground,
    tokenAddress: "0x4d4deb65DBC13dE6811095baba7064B41A72D9Db",
    chainId: 42,
    name: "Kovan",
  },
};

function App() {
  const [clients, setClients] = useState({});
  const [balances, setBalances] = useState({});
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
      const _balances = {};
      for (const network of Object.values(networks)) {
        try {
          console.log(`Creating client for network ${JSON.stringify(network)}`);
          const pk = getWallet(network.chainId).privateKey;
          const client = await connext.connect({
            nodeUrl,
            ethProviderUrl: `https://${network.name.toLowerCase()}.infura.io/v3/${
              process.env.REACT_APP_INFURA_ID
            }`,
            signer: getWallet(network.chainId).privateKey,
            loggerService: new ColorfulLogger(
              network.chainId.toString(),
              4,
              false,
              network.chainId
            ),
            store: getLocalStore({
              prefix: `INDRA_CLIENT_${pk.substring(0, 10).toUpperCase()}`,
            }),
            logLevel: 4,
          });
          clientsArr.push({ chainId: network.chainId, client });
          const channel = await client.getFreeBalance(
            tokens[network.chainId].tokenAddress
          );
          _balances[network.chainId] = formatEther(
            channel[client.signerAddress]
          );
          console.log(
            `Created client for network ${JSON.stringify(network)}: ${
              client.publicIdentifier
            }`
          );
        } catch (e) {
          console.error(
            `Failed to create client on ${network.chainId}. Error:`,
            e.message
          );
        }
      }

      // Helper to refresh all client balances on transfer events
      const refreshBalances = async () => {
        const _balances = {};
        for (const t of clientsArr) {
          const token = tokens[t.chainId];
          const channel = await t.client.getFreeBalance(token.tokenAddress);
          _balances[t.chainId] = formatEther(channel[t.client.signerAddress]);
        }
        setBalances(_balances);
        return _balances;
      };

      const _clients = {};
      clientsArr.forEach((t) => {
        t.client.on("CONDITIONAL_TRANSFER_CREATED_EVENT", async (msg) => {
          const updated = await refreshBalances();
          console.log("Transfer created, updated balances", updated);
        });
        t.client.on("CONDITIONAL_TRANSFER_UNLOCKED_EVENT", async (msg) => {
          const updated = await refreshBalances();
          console.log("Transfer unlocked unlocked, updated balances", updated);
        });
        _clients[t.chainId] = t.client;
      });
      setClients(_clients);
      setBalances(_balances);
    }
    initClients();
  }, []);

  useEffect(() => {
    const mintTokens = [
      {
        ...networks[4],
        ...tokens[4],
        balance: balances[networks[4].chainId],
      },
    ];
    const sendTokens = [
      {
        ...networks[42],
        ...tokens[42],
        balance: balances[networks[42].chainId],
      },
    ];
    setMintTokens(mintTokens);
    setSendTokens(sendTokens);
  }, [balances]);

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

    const params = {
      assetId: fromToken.tokenAddress,
      amount: parseEther("0.001"),
      recipient: toClient.publicIdentifier,
      meta: {
        receiverAssetId: toToken.tokenAddress,
        receiverChainId: toToken.chainId,
      },
    };
    console.log(`Transferring with params ${JSON.stringify(params)}`);
    const res = await fromClient.transfer(params);
    console.log(`Transfer complete: ${JSON.stringify(res)}`);
  };

  const mint = async () => {
    const mintToken = mintTokens[activeMintToken];
    const assetId = mintToken.tokenAddress;
    const client = clients[mintToken.chainId];
    if (!client) {
      console.error(`Failed to find client for ${mintToken.chainId}`, clients);
      return;
    }
    const faucetUrl = `${process.env.REACT_APP_FAUCET_URL}/faucet`;
    const faucetData = {
      assetId,
      recipient: client.publicIdentifier,
      tweet: "devmode",
    };
    console.log(
      `Making faucet request to ${faucetUrl}: ${JSON.stringify(faucetData)}`
    );
    const res = await axios.post(faucetUrl, faucetData);
    console.log(`Faucet response: ${JSON.stringify(res)}`);
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
      {mintTokens.length > 0 && (
        <div className="Token Token-Left">
          <div className="Card">
            <div className="Card-Header">
              <Select
                className="Token-Select"
                value={mintOptions[activeMintToken]}
                onChange={changeMintToken}
                styles={{
                  control: (base) => ({
                    ...base,
                    border: "none",
                    boxShadow: "none",
                  }),
                  indicatorSeparator: (base) => ({
                    width: 0,
                  }),
                }}
                options={mintOptions}
              />
            </div>
            <div className="Card-Body">
              <img
                className="Card-Background"
                src={mintTokens[activeMintToken].tokenBackground}
                alt=""
              />
              <p className="Token-Balance">
                <img src={mintTokens[activeMintToken].tokenIcon} alt="icon" />
                {mintTokens[activeMintToken].balance}{" "}
                <span className="Token-Name">
                  {mintTokens[activeMintToken].tokenName}
                </span>
              </p>
              <button type="button" className="Mint-Button" onClick={mint}>
                Mint
              </button>
            </div>
          </div>
        </div>
      )}
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
      {sendTokens.length > 0 && (
        <div className="Token Token-Right">
          <div className="Card">
            <div className="Card-Header">
              <Select
                className="Token-Select"
                value={sendOptions[activeSendToken]}
                onChange={changeSendToken}
                styles={{
                  control: (base) => ({
                    ...base,
                    border: "none",
                    boxShadow: "none",
                  }),
                  indicatorSeparator: (base) => ({
                    width: 0,
                  }),
                }}
                options={sendOptions}
              />
            </div>
            <div className="Card-Body">
              <img
                className="Card-Background"
                src={sendTokens[activeSendToken].tokenBackground}
                alt=""
              />
              <p className="Token-Balance">
                <img src={sendTokens[activeSendToken].tokenIcon} alt="icon" />
                {sendTokens[activeSendToken].balance}{" "}
                <span className="Token-Name">
                  {sendTokens[activeSendToken].tokenName}
                </span>
              </p>
              <button type="button" className="Send-Button" onClick={send}>
                Send {sendTokens[activeSendToken].tokenName}
              </button>
            </div>
          </div>
        </div>
      )}
      <p className="Footer">
        Made with <i className="fas fa-heart Heart-Icon"></i> by Connext
      </p>
    </div>
  );
}

export default App;
