import React, { useState, useEffect } from "react";
import * as connext from "@connext/client";
import { ColorfulLogger } from "@connext/utils";
import { getLocalStore } from "@connext/store";
import { constants, utils } from "ethers";
import Select from "react-select";
import axios from "axios";

import transferDisabledImage from './images/transferDisabled.png';
import transferGif from './images/transfer.gif';
import loadingGif from './images/loading.gif';
import dropdownGif from './images/dropdown.gif';
import mintingGif from './images/minting.gif';
import ellipsisGif from './images/ellipsis.gif';
import ethIcon from "./images/eth.png";
import moonIcon from "./images/moon.png";
import ethBackground from "./images/ethBackground.png";
import kovanBackground from "./images/kovanBackground.png";
import rinkebyBackground from "./images/rinkebyBackground.png";
import "./App.css";
import { getWallet } from "./wallet";
import { select } from "async";

const { formatEther, parseEther } = utils;

const dotenv = require("dotenv");
dotenv.config();

const nodeUrl = "https://node.spacefold.io/";

const networks = {
  // 1: { name: "Mainnet", chainId: 1 },
  4: { name: "Rinkeby", chainId: 4, color: '#EFC45C' },
  5: { name: "Goerli", chainId: 5, color: '#0091F2' },
  42: { name: "Kovan", chainId: 42, color: '#01C853' },
  // 1337: { name: "Ganache", chainId: 1337 },
  // 1338: { name: "Buidler", chainId: 1338 },
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
    tokenBackground: rinkebyBackground,
    tokenAddress: "0x50C94BeCAd95bEe21aF226dc799365Ee6B134459",
    chainId: 4,
    name: "Rinkeby",
  },
  5: {
    tokenName: "Eth",
    tokenIcon: ethIcon,
    tokenBackground: ethBackground,
    tokenAddress: constants.AddressZero,
    chainId: 5,
    name: "Goerli",
  },
  42: {
    tokenName: "Token",
    tokenIcon: ethIcon,
    tokenBackground: kovanBackground,
    tokenAddress: "0x4d4deb65DBC13dE6811095baba7064B41A72D9Db",
    chainId: 42,
    name: "Kovan",
  },
};

const MINT_CHAIN_ID = 4;

const getTweetURL = (publicIdentifier, chainName) =>
  "https://twitter.com/intent/tweet?text=" +
  encodeURIComponent(
    `Minting SPACE tokens for channel ${publicIdentifier} https://spacefold.io on ${chainName}! By @ConnextNetwork`
  );

const MintStatus = {
  READY: 0,
  MINTING: 1,
  ERROR: 2,
};

function App() {
  const [clients, setClients] = useState({});
  const [balances, setBalances] = useState({});
  const [mintTokens, setMintTokens] = useState([]);
  const [sendTokens, setSendTokens] = useState([]);
  const [activeMintToken, setActiveMintToken] = useState(0);
  const [activeSendToken, setActiveSendToken] = useState(0);
  const [tweetUrl, setTweetUrl] = useState("");
  const [showTweetInput, setShowTweetInput] = useState(false);
  const [mintStatus, setMintStatus] = useState(MintStatus.READY);
  const [initializing, setInitializing] = useState(true);

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
            } with balance: ${channel[client.signerAddress]}`
          );
          console.log(
            `True balance for ${client.chainId}: ${formatEther(
              channel[client.signerAddress]
            )}`
          );

          setClients({ ...clients, [client.chainId]: client });
          setBalances({
            ...balances,
            [client.chainId]: formatEther(channel[client.signerAddress]),
          });

          clientsArr.map((clientInfo) =>
            clientInfo.client.requestCollateral(tokens[clientInfo.chainId])
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

      clientsArr.map((clientInfo) =>
        clientInfo.client.requestCollateral(tokens[clientInfo.chainId])
      );
      setInitializing(false);
    }
    initClients();
  }, []);

  useEffect(() => {
    const mintTokens = [
      {
        ...networks[MINT_CHAIN_ID],
        ...tokens[MINT_CHAIN_ID],
        balance: balances[MINT_CHAIN_ID] || 0,
      },
    ];
    const sendTokens = Object.values(networks)
      .map((network) => {
        return {
          ...network,
          ...tokens[network.chainId],
          balance: balances[network.chainId] || 0,
        };
      })
      .filter((sendToken) => sendToken.chainId !== MINT_CHAIN_ID);
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
      amount: parseEther(balances[fromToken.chainId]),
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
    setMintStatus(MintStatus.MINTING);
    const faucetUrl = `${process.env.REACT_APP_FAUCET_URL}/faucet`;
    const faucetData = {
      assetId,
      recipient: client.publicIdentifier,
      tweet: tweetUrl,
    };
    try {
      console.log(
        `Making faucet request to ${faucetUrl}: ${JSON.stringify(faucetData)}`
      );
      const res = await axios.post(faucetUrl, faucetData);
      console.log(`Faucet response: ${JSON.stringify(res)}`);
      setMintStatus(MintStatus.READY);
      setShowTweetInput(false);
    } catch (e) {
      console.error(
        `Error minting tokens: ${
          e.response ? JSON.stringify(e.response.data || {}) : e.message
        }`
      );
      setMintStatus(MintStatus.ERROR);
    }
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

  const controlStyles = {
    padding: "0 56px",
    background: "#DEEBFF",
    border: "none",
    boxShadow: "none",
    cursor: 'pointer',
  };
  const menuStyles = {
    margin: 0,
  };
  const selectStyles = {
    control: (base) => ({
      ...base,
      ...controlStyles,
    }),
    valueContainer: (base) => ({
      ...base,
      paddingLeft: 0,
    }),
    menu: (base) => ({
      ...base,
      ...menuStyles,
    }),
    option: (base) => ({
      ...base,
      backgroundColor: '#FFFFFF',
      color: '#505D68',
      padding: '19px 56px',
      textAlign: 'left',
      cursor: 'pointer',
    }),
    indicatorSeparator: (base) => ({
      width: 0,
    }),
  };
  const transferDisabled = mintTokens.length === 0 || !mintTokens[activeMintToken] || Math.abs(mintTokens[activeMintToken].balance) <= 0.001;

  return (
    <div className="App">
      <div className={initializing ? "Loading" : "Loading Loading-fadeout"}>
        <div className="Loading-Circle">
          <img src={loadingGif} alt="loading" />
        </div>
      </div>
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
        <div
          className="Token Token-Left"
          style={{
            backgroundColor: mintTokens[activeMintToken].balance > 0
              ? mintTokens[activeMintToken].color
              : '#F4F5F7',
          }}
        >
          <div className="Card">
            <div className="Card-Header">
              <Select
                className="Token-Select"
                value={mintOptions[activeMintToken]}
                onChange={changeMintToken}
                styles={selectStyles}
                options={mintOptions}
                isSearchable={false}
                components={{ DropdownIndicator }}
              />
            </div>
            {showTweetInput
              ? (
                <div className="Tweet-Body">
                  <p className="Tweet-Instructions">
                    Please paste a public tweet containing your public
                    identifier to mint free tokens!{" "}
                  </p>
                  <p className="Tweet-Identifier">
                    {
                      clients[mintTokens[activeMintToken].chainId]
                        ?.publicIdentifier
                    }
                  </p>
                  <a
                    className="Tweet-Action"
                    href={getTweetURL(
                      clients[mintTokens[activeMintToken].chainId]
                        ?.publicIdentifier,
                      mintTokens[activeMintToken].name
                    )}
                    target="popup"
                    onClick={() => {
                      window.open(
                        getTweetURL(
                          clients[mintTokens[activeMintToken].chainId]
                            ?.publicIdentifier,
                          mintTokens[activeMintToken].name
                        ),
                        "popup",
                        "width=600,height=600"
                      );
                      return false;
                    }}
                  >
                    Tweet Now!
                  </a>
                  <input
                    className="Tweet-URL-Input"
                    placeholder="Enter Tweet URL"
                    type="text"
                    name="tweet"
                    onChange={(event) => setTweetUrl(event.target.value)}
                  />
                  <div style={{ paddingBottom: "10px" }} />
                  {mintStatus === MintStatus.ERROR && (
                    <>
                      <span style={{ color: "red" }}>
                        Error minting tokens!
                      </span>
                      <div style={{ paddingBottom: "10px" }} />
                    </>
                  )}
                  <button
                    type="button"
                    className={mintStatus === MintStatus.MINTING ? "Minting-Button" : "Mint-Button"}
                    onClick={mint}
                    disabled={mintStatus === MintStatus.MINTING}
                  >
                    {
                      mintStatus === MintStatus.MINTING
                        ? (
                          <>
                            <img src={mintingGif} alt="gear" />
                            Minting
                            <img className="Ellipsis-Gif" src={ellipsisGif} alt="ellipsis" />
                          </>
                        )
                        : "Confirm Mint"
                    }
                  </button>
                  <p className="Cancel-Tweet" onClick={() => setShowTweetInput(false)}>Cancel</p>
                </div>
              )
              : (
                <div className="Card-Body">
                  <div className="Card-Token-Content">
                    <p className="Token-Balance">
                      <img src={mintTokens[activeMintToken].tokenIcon} alt="icon" />
                      {mintTokens[activeMintToken].balance}{" "}
                      <span className="Token-Name">
                        {mintTokens[activeMintToken].tokenName}
                      </span>
                    </p>
                    <img
                      className="Card-Image"
                      src={mintTokens[activeMintToken].tokenBackground}
                      alt=""
                    />
                  </div>
                  <button
                    type="button"
                    className="Mint-Button"
                    onClick={() => setShowTweetInput(!showTweetInput)}
                  >
                    Mint
                  </button>
                </div>
              )}
          </div>
        </div>
      )}
      <button
        type="button"
        className="Swap-Button"
        onClick={transfer}
        disabled={transferDisabled}
      >
        TRANSFER
        <img src={transferDisabled ? transferDisabledImage : transferGif} alt="transfer" />
      </button>
      {sendTokens.length > 0 && (
        <div
          className="Token Token-Right"
          style={{
            backgroundColor: sendTokens[activeSendToken].balance > 0
              ? sendTokens[activeSendToken].color
              : '#F4F5F7',
          }}
        >
          <div className="Card">
            <div className="Card-Header">
              <Select
                className="Token-Select"
                value={sendOptions[activeSendToken]}
                onChange={changeSendToken}
                styles={selectStyles}
                options={sendOptions}
                isSearchable={false}
                components={{  DropdownIndicator }}
              />
            </div>
            <div className="Card-Body">
              <div className="Card-Token-Content">
                <p className="Token-Balance">
                  <img src={sendTokens[activeSendToken].tokenIcon} alt="icon" />
                  {sendTokens[activeSendToken].balance}{" "}
                  <span className="Token-Name">
                    {sendTokens[activeSendToken].tokenName}
                  </span>
                </p>
                <img
                  className="Card-Image"
                  src={sendTokens[activeSendToken].tokenBackground}
                  alt=""
                />
              </div>
              <button
                type="button"
                className="Send-Button"
                onClick={send}
                disabled={sendTokens[activeSendToken].balance <= 0.001}
              >
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

const DropdownIndicator = ({ selectProps }) => {
  return (
    <img
      className={
        selectProps && selectProps.menuIsOpen
          ? "Dropdown-Indicator Dropdown-Indicator-Open"
          : "Dropdown-Indicator"
      }
      src={dropdownGif}
      alt="dropdownIndicator"
    />
  );
}

export default App;
