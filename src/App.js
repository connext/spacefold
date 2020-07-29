import React, { useState, useEffect, useRef } from "react";
import * as connext from "@connext/client";
import { ColorfulLogger, stringify } from "@connext/utils";
import { getLocalStore } from "@connext/store";
import { constants, utils } from "ethers";
import Select from "react-select";
import axios from "axios";

import loadingGif from "./images/loading.gif";
import transferDisabledImage from "./images/transferDisabled.png";
import transferGif from "./images/transfer.gif";
import dropdownGif from "./images/dropdown.gif";
import mintingGif from "./images/minting.gif";
import ellipsisGif from "./images/ellipsis.gif";
import ethIcon from "./images/eth.png";
import moonIcon from "./images/moon.png";
import brickIcon from "./images/brick.png";
import ethBackground from "./images/ethBackground.png";
import rinkebyBackground from "./images/rinkebyBackground.png";
import brickBackground from "./images/brickBackground.png";
import skaleBackground from "./images/skaleBackground.png";
import xDaiBackground from "./images/xDaiBackground.png";
import maticBackground from "./images/maticBackground.png";

import "./App.css";

import Loading from "./components/Loading";
import { getWallet } from "./wallet";

const { formatEther, parseEther } = utils;

const dotenv = require("dotenv");
dotenv.config();

const nodeUrl = "https://node.spacefold.io/";

const MINIMUM_BALANCE = 0.001;

const TOKENS = {
  4: {
    tokenName: "MOON",
    tokenIcon: moonIcon,
    tokenBackground: rinkebyBackground,
    tokenAddress: "0x50C94BeCAd95bEe21aF226dc799365Ee6B134459",
    chainId: 4,
    name: "Rinkeby",
    color: "#EFC45C",
    ethProviderUrl: `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
  },
  5: {
    tokenName: "ETH",
    tokenIcon: ethIcon,
    tokenBackground: ethBackground,
    tokenAddress: constants.AddressZero,
    chainId: 5,
    name: "Goerli",
    color: "#0091F2",
    ethProviderUrl: `https://goerli.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
  },
  42: {
    tokenName: "BRICK",
    tokenIcon: brickIcon,
    tokenBackground: brickBackground,
    tokenAddress: "0x4d4deb65DBC13dE6811095baba7064B41A72D9Db",
    chainId: 42,
    name: "Kovan",
    color: "#5b32a2",
    ethProviderUrl: `https://kovan.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
  },
  61: {
    tokenName: "TOKEN",
    tokenIcon: ethIcon,
    tokenBackground: ethBackground,
    tokenAddress: "0xf502A7897a49A9daFa5542203746Bad6C6E86c11",
    chainId: 61,
    name: "ETC",
    color: "#01C853",
    ethProviderUrl: `https://www.ethercluster.com/etc`,
  },
  // 100: {
  //   tokenName: "xBRICKS",
  //   tokenIcon: brickIcon,
  //   tokenBackground: xDaiBackground,
  //   tokenAddress: "0xf502A7897a49A9daFa5542203746Bad6C6E86c11",
  //   chainId: 100,
  //   name: "xDAI",
  //   color: "#01C853",
  //   ethProviderUrl: `https://xdai.poanetwork.dev`,
  // },
  // 80001: {
  //   tokenName: "mTOKEN",
  //   tokenIcon: ethIcon,
  //   tokenBackground: maticBackground,
  //   tokenAddress: "0xf502A7897a49A9daFa5542203746Bad6C6E86c11",
  //   chainId: 80001,
  //   name: "Matic",
  //   color: "#2b6def",
  //   ethProviderUrl: `https://rpc-mumbai.matic.today`,
  // },
  // 346750: {
  //   tokenName: "sTOKEN",
  //   tokenIcon: ethIcon,
  //   tokenBackground: skaleBackground,
  //   tokenAddress: "0xf502A7897a49A9daFa5542203746Bad6C6E86c11",
  //   chainId: 346750,
  //   name: "SKALE",
  //   color: "#000000",
  //   ethProviderUrl: `https://dev-testnet-v1-1.skalelabs.com`,
  // },
};

const getTweetURL = (publicIdentifier, chainName, tokenName) =>
  "https://twitter.com/intent/tweet?text=" +
  encodeURIComponent(
    `Minting ${tokenName} tokens for channel ${publicIdentifier} https://spacefold.io on ${chainName}! By @ConnextNetwork`
  );

const Status = {
  READY: 0,
  IN_PROGRESS: 1,
  ERROR: 2,
  SUCCESS: 3,
};

async function mint(mintToken, clients, tweetUrl) {
  const assetId = mintToken.tokenAddress;
  const client = clients[mintToken.chainId];
  if (!client) {
    throw new Error(`Failed to find client for ${mintToken.chainId}`);
  }
  const faucetUrl = `${process.env.REACT_APP_FAUCET_URL}/faucet`;
  const faucetData = {
    assetId,
    recipient: client.publicIdentifier,
    tweet: tweetUrl,
    chainId: mintToken.chainId,
  };
  try {
    console.log(
      `Making faucet request to ${faucetUrl}: ${stringify(faucetData, true, 0)}`
    );
    const res = await axios.post(faucetUrl, faucetData);
    console.log(`Faucet response: ${JSON.stringify(res)}`);
  } catch (e) {
    throw new Error(
      `Error minting tokens: ${
        e.response ? JSON.stringify(e.response.data || {}) : e.message
      }`
    );
  }
}

async function transfer(fromToken, toToken, clients, balances) {
  const fromClient = clients[fromToken.chainId];
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
  console.log(`Transferring with params ${stringify(params, true, 0)}`);
  const res = await fromClient.transfer(params);
  console.log(`Transfer complete: ${stringify(res, true, 0)}`);
}

async function send(sendToken, sendAddress, clients) {
  const sendClient = clients[sendToken.chainId];
  try {
    const withdrawParams = {
      amount: parseEther(sendToken.balance),
      assetId: sendToken.tokenAddress,
      recipient: sendAddress,
    };
    console.log(`Sending tokens: ${JSON.stringify(withdrawParams)}`);
    const res = await sendClient.withdraw(withdrawParams);
    console.log(`Withdraw response: ${JSON.stringify(res)}`);
  } catch (e) {
    throw new Error(`Error sending tokens: ${e.stack}`);
  }
}

function App() {
  const [upstream, setUpstream] = useState(true);
  const [clients, setClients] = useState({});
  const [balances, setBalances] = useState({});
  const [mintTokens, setMintTokens] = useState([]);
  const [sendTokens, setSendTokens] = useState([]);
  const [activeMintTokenIndex, setActiveMintTokenIndex] = useState(null);
  const [activeSendTokenIndex, setActiveSendTokenIndex] = useState(null);
  const [tweetUrl, setTweetUrl] = useState("");
  const [showTweetInput, setShowTweetInput] = useState(false);
  const [mintStatus, setMintStatus] = useState(Status.READY);
  const [sendAddress, setSendAddress] = useState("");
  const [showSendInput, setShowSendInput] = useState(false);
  const [sendStatus, setSendStatus] = useState(Status.READY);
  const [transferStatus, setTransferStatus] = useState(Status.READY);
  const [initializing, setInitializing] = useState(true);
  const [leftSelectHeight, setLeftSelectHeight] = useState(0);
  const [rightSelectHeight, setRightSelectHeight] = useState(0);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

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
      const clientsAndBalances = await Promise.all(
        Object.values(TOKENS).map(async (network) => {
          try {
            console.log(
              `Creating client for network ${JSON.stringify(network)}`
            );
            const pk = getWallet(network.chainId).privateKey;
            const client = await connext.connect({
              nodeUrl,
              ethProviderUrl: network.ethProviderUrl,
              signer: getWallet(network.chainId).privateKey,
              loggerService: new ColorfulLogger(
                network.chainId.toString(),
                3,
                false,
                network.chainId
              ),
              store: getLocalStore({
                prefix: `INDRA_CLIENT_${pk.substring(0, 10).toUpperCase()}`,
              }),
              logLevel: 3,
            });
            const freeBalance = await client.getFreeBalance(
              TOKENS[network.chainId].tokenAddress
            );
            console.log(
              `Created client for network ${JSON.stringify(network)}: ${
                client.publicIdentifier
              } with balance: ${freeBalance[client.signerAddress]}`
            );

            client.requestCollateral(TOKENS[client.chainId]);

            const refreshBalances = async (client) => {
              const token = TOKENS[client.chainId];
              const channel = await client.getFreeBalance(token.tokenAddress);
              setBalances((prevBalances) => {
                return {
                  ...prevBalances,
                  [client.chainId]: formatEther(channel[client.signerAddress]),
                };
              });
            };

            client.on("CONDITIONAL_TRANSFER_CREATED_EVENT", async (msg) => {
              const updated = await refreshBalances(client);
              setMintStatus(Status.SUCCESS);
              setUpstream(
                sendTokens[activeSendTokenIndex]?.balance ?? 0 < MINIMUM_BALANCE
              );
              setTimeout(() => setMintStatus(Status.READY), 1000);
              setShowTweetInput(false);
              console.log("Transfer created, updated balances", updated);
            });
            client.on("CONDITIONAL_TRANSFER_UNLOCKED_EVENT", async (msg) => {
              const updated = await refreshBalances(client);
              setTransferStatus(Status.SUCCESS);
              setUpstream(
                sendTokens[activeSendTokenIndex]?.balance ?? 0 < MINIMUM_BALANCE
              );
              setTimeout(() => setTransferStatus(Status.READY), 1000);
              console.log("Transfer unlocked, updated balances", updated);
            });
            client.on("WITHDRAWAL_CONFIRMED_EVENT", async (msg) => {
              const updated = await refreshBalances(client);
              setSendStatus(Status.SUCCESS);
              setUpstream(
                sendTokens[activeSendTokenIndex]?.balance ?? 0 < MINIMUM_BALANCE
              );
              setShowSendInput(false);
              console.log("Withdrawal completed, updated balances", updated);
            });

            return { client, freeBalance };
          } catch (e) {
            console.error(
              `Failed to create client on ${network.chainId}. Error:`,
              e.message
            );
          }
        })
      );
      setClients(
        clientsAndBalances.reduce((c, entry) => {
          if (entry) {
            c[entry.client.chainId] = entry.client;
          }
          return c;
        }, {})
      );
      setBalances(
        clientsAndBalances.reduce((b, entry) => {
          if (entry) {
            b[entry.client.chainId] = formatEther(
              entry.freeBalance[entry.client.signerAddress]
            );
          }
          return b;
        }, {})
      );

      setInitializing(false);
      setLeftSelectHeight(
        leftCardRef.current ? leftCardRef.current.clientHeight : 0
      );
      setRightSelectHeight(
        rightCardRef.current ? rightCardRef.current.clientHeight : 0
      );
    }
    initClients();
    // no exhaustive deps, we only want this to run on start
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // window resize setup
  useEffect(() => {
    function changeSelectHeight() {
      setLeftSelectHeight(
        leftCardRef.current ? leftCardRef.current.clientHeight : 0
      );
      setRightSelectHeight(
        rightCardRef.current ? rightCardRef.current.clientHeight : 0
      );
    }
    changeSelectHeight();
    window.addEventListener("resize", changeSelectHeight);
    return () => window.removeEventListener("resize", changeSelectHeight);
  }, []);

  // set up mintTokens and sendTokens based on balances retrieved from the network
  useEffect(() => {
    setMintTokens((prevTokens) =>
      Object.values(TOKENS).map((token) => {
        const oldToken = prevTokens.find((t) => t.chainId === token.chainId);
        const newBalance = balances[token.chainId] || 0;
        return {
          ...token,
          balance: newBalance,
          oldBalance: oldToken
            ? Math.abs(newBalance - oldToken.balance) < MINIMUM_BALANCE
              ? oldToken.oldBalance
              : oldToken.balance
            : newBalance,
        };
      })
    );
    setSendTokens((prevTokens) =>
      Object.values(TOKENS).map((token) => {
        const oldToken = prevTokens.find((t) => t.chainId === token.chainId);
        const newBalance = balances[token.chainId] || 0;
        return {
          ...token,
          balance: newBalance,
          oldBalance: oldToken
            ? Math.abs(newBalance - oldToken.balance) < MINIMUM_BALANCE
              ? oldToken.oldBalance
              : oldToken.balance
            : newBalance,
        };
      })
    );
  }, [balances]);

  // select initially active mint and send tokens
  useEffect(() => {
    if (activeMintTokenIndex === null && mintTokens.length > 0) {
      // select a random non-MOON token initially
      let tokenIndex = null;
      while (
        tokenIndex === null ||
        mintTokens[tokenIndex].tokenName === "MOON"
      ) {
        tokenIndex = Math.floor(Math.random() * mintTokens.length);
      }
      setActiveMintTokenIndex(tokenIndex);
    }
  }, [mintTokens, activeMintTokenIndex]);
  useEffect(() => {
    if (activeSendTokenIndex === null && sendTokens.length > 0) {
      // select MOON token initially
      setActiveSendTokenIndex(
        sendTokens.findIndex((t) => t.tokenName === "MOON")
      );
    }
  }, [sendTokens, activeSendTokenIndex]);

  const controlStyles = {
    padding: "0 56px",
    background: "#DEEBFF",
    border: "none",
    boxShadow: "none",
    cursor: "pointer",
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
      backgroundColor: "#FFFFFF",
      color: "#505D68",
      padding: "19px 56px",
      textAlign: "left",
      cursor: "pointer",
    }),
    indicatorSeparator: (base) => ({
      width: 0,
    }),
  };
  const transferDisabled =
    mintTokens.length === 0 ||
    !mintTokens[activeMintTokenIndex] ||
    sendTokens.length === 0 ||
    !sendTokens[activeSendTokenIndex] ||
    transferStatus === Status.IN_PROGRESS ||
    transferStatus === Status.SUCCESS ||
    (mintTokens[activeMintTokenIndex].balance <= MINIMUM_BALANCE &&
      sendTokens[activeSendTokenIndex].balance <= MINIMUM_BALANCE);
  const totalBalance =
    mintTokens.reduce((bal, t) => bal + t.balance, 0) +
    sendTokens.reduce((bal, t) => bal + t.balance, 0);

  return (
    <div className="App">
      <Loading initializing={initializing} />
      <div className="More-Buttons">
        <a href="https://github.com/connext/spacefold">
          <i className="fab fa-github Github-Icon"></i> GitHub
        </a>
        <a href="https://discord.com/channels/454734546869551114">
          <i className="fab fa-discord Discord-Icon"></i> Chat
        </a>
        <a href="https://connext.network/">
          <i className="fa fa-info About-Icon"></i> About
        </a>
      </div>
      {activeMintTokenIndex !== null && activeSendTokenIndex !== null && (
        <>
          <div
            className="Token Token-Left"
            style={{
              backgroundColor:
                mintTokens[activeMintTokenIndex].balance > 0
                  ? mintTokens[activeMintTokenIndex].color
                  : "#F4F5F7",
            }}
          >
            <div className="Card">
              <div className="Card-Header">
                <Select
                  className="Token-Select"
                  value={mintOptions[activeMintTokenIndex]}
                  onChange={(option) => {
                    const newTokenIndex = mintTokens.findIndex(
                      (t) => t.chainId === option.value
                    );
                    setActiveMintTokenIndex(newTokenIndex);
                    setUpstream(
                      sendTokens[activeSendTokenIndex].balance < MINIMUM_BALANCE
                    );
                    setMintStatus(Status.READY);
                  }}
                  styles={selectStyles}
                  options={mintOptions.filter(
                    (opt) =>
                      opt.value !== mintTokens[activeMintTokenIndex].chainId &&
                      opt.value !== sendTokens[activeSendTokenIndex].chainId
                  )}
                  isSearchable={false}
                  isDisabled={
                    transferStatus === Status.IN_PROGRESS ||
                    mintStatus === Status.IN_PROGRESS ||
                    mintTokens[activeMintTokenIndex].balance > 0
                  }
                  components={{ DropdownIndicator }}
                  maxMenuHeight={leftSelectHeight}
                />
              </div>
              {showTweetInput ? (
                <div className="Tweet-Body" ref={leftCardRef}>
                  <p className="Tweet-Instructions">
                    Please paste a public tweet containing your public
                    identifier to mint free tokens!
                  </p>
                  <p className="Tweet-Identifier">
                    {
                      clients[mintTokens[activeMintTokenIndex].chainId]
                        ?.publicIdentifier
                    }
                  </p>
                  <a
                    className="Tweet-Action"
                    href={getTweetURL(
                      clients[mintTokens[activeMintTokenIndex].chainId]
                        ?.publicIdentifier,
                      mintTokens[activeMintTokenIndex].name,
                      mintTokens[activeMintTokenIndex].tokenName
                    )}
                    target="popup"
                    onClick={() => {
                      window.open(
                        getTweetURL(
                          clients[mintTokens[activeMintTokenIndex].chainId]
                            ?.publicIdentifier,
                          mintTokens[activeMintTokenIndex].name,
                          mintTokens[activeMintTokenIndex].tokenName
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
                  {mintStatus === Status.ERROR && (
                    <>
                      <span style={{ color: "red" }}>
                        Error minting tokens!
                      </span>
                      <div style={{ paddingBottom: "10px" }} />
                    </>
                  )}
                  <button
                    type="button"
                    className={
                      mintStatus === Status.IN_PROGRESS
                        ? "Minting-Button"
                        : "Mint-Button"
                    }
                    onClick={async () => {
                      setMintStatus(Status.IN_PROGRESS);
                      try {
                        await mint(
                          mintTokens[activeMintTokenIndex],
                          clients,
                          tweetUrl
                        );
                      } catch (e) {
                        console.error(e.message);
                        setMintStatus(Status.ERROR);
                      }
                    }}
                    disabled={mintStatus === Status.IN_PROGRESS}
                  >
                    {mintStatus === Status.IN_PROGRESS ? (
                      <>
                        <img src={mintingGif} alt="gear" /> Minting{" "}
                        <img
                          className="Ellipsis-Gif"
                          src={ellipsisGif}
                          alt="ellipsis"
                        />
                      </>
                    ) : (
                      "Confirm Mint"
                    )}
                  </button>
                  <p
                    className="Cancel-Tweet"
                    onClick={() => setShowTweetInput(false)}
                  >
                    Cancel
                  </p>
                </div>
              ) : (
                <div className="Card-Body" ref={leftCardRef}>
                  <div className="Card-Token-Content">
                    <div className="Token-Balance">
                      <img
                        src={mintTokens[activeMintTokenIndex].tokenIcon}
                        alt="icon"
                      />
                      <div className="Toke-Balance-Numbers">
                        <p className="Token-Balance-Current">
                          {mintTokens[activeMintTokenIndex].balance}&nbsp;
                          <span className="Token-Name">
                            {mintTokens[activeMintTokenIndex].tokenName}
                          </span>
                        </p>
                        {mintStatus === Status.SUCCESS &&
                          Math.abs(
                            mintTokens[activeMintTokenIndex].balance -
                              mintTokens[activeMintTokenIndex].oldBalance
                          ) > 0 && (
                            <p className="Token-Balance-Change">
                              {mintTokens[activeMintTokenIndex].balance >
                              mintTokens[activeMintTokenIndex].oldBalance
                                ? "+"
                                : "-"}
                              {Math.abs(
                                mintTokens[activeMintTokenIndex].balance -
                                  mintTokens[activeMintTokenIndex].oldBalance
                              )}{" "}
                              {mintTokens[activeMintTokenIndex].balance >
                              mintTokens[activeMintTokenIndex].oldBalance
                                ? "minted"
                                : "folded"}
                            </p>
                          )}
                      </div>
                    </div>
                    <div
                      className="Card-Image"
                      style={{
                        backgroundImage: `url(${mintTokens[activeMintTokenIndex].tokenBackground})`,
                      }}
                    ></div>
                  </div>
                  <button
                    type="button"
                    className={`Mint-Button ${
                      mintStatus === Status.SUCCESS ? "Mint-Success" : ""
                    }`}
                    onClick={() => setShowTweetInput(!showTweetInput)}
                    disabled={
                      mintStatus === Status.IN_PROGRESS ||
                      mintStatus === Status.SUCCESS ||
                      totalBalance > 0
                    }
                  >
                    {mintStatus === Status.SUCCESS ? (
                      <>
                        <i className="fas fa-check" /> Minted!
                      </>
                    ) : (
                      "Mint"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
          {transferStatus === Status.IN_PROGRESS ? (
            <div className="Transferring-Circle">
              <img src={loadingGif} alt="transferring" />
            </div>
          ) : (
            <button
              type="button"
              className={`Swap-Button${upstream ? "" : " Flip-Image"}${
                transferStatus === Status.SUCCESS ? " Transfer-Success" : ""
              }`}
              onClick={async () => {
                setTransferStatus(Status.IN_PROGRESS);
                await transfer(
                  upstream
                    ? mintTokens[activeMintTokenIndex]
                    : sendTokens[activeSendTokenIndex],
                  upstream
                    ? sendTokens[activeSendTokenIndex]
                    : mintTokens[activeMintTokenIndex],
                  clients,
                  balances
                );
              }}
              disabled={transferDisabled}
            >
              {transferStatus === Status.SUCCESS ? "SUCCESS!" : "FOLD"}
              {transferStatus === Status.SUCCESS ? (
                <i className="fas fa-check" />
              ) : (
                <img
                  src={transferDisabled ? transferDisabledImage : transferGif}
                  alt="fold"
                />
              )}
            </button>
          )}
          <div
            className="Token Token-Right"
            style={{
              backgroundColor:
                sendTokens[activeSendTokenIndex].balance > 0
                  ? sendTokens[activeSendTokenIndex].color
                  : "#F4F5F7",
            }}
          >
            <div className="Card">
              <div className="Card-Header">
                <Select
                  className="Token-Select"
                  value={sendOptions[activeSendTokenIndex]}
                  onChange={(option) => {
                    const newTokenIndex = sendTokens.findIndex(
                      (t) => t.chainId === option.value
                    );
                    setActiveSendTokenIndex(newTokenIndex);
                    setUpstream(
                      sendTokens[newTokenIndex].balance < MINIMUM_BALANCE
                    );
                    setSendStatus(Status.READY);
                  }}
                  styles={selectStyles}
                  options={sendOptions.filter(
                    (opt) =>
                      opt.value !== sendTokens[activeSendTokenIndex].chainId &&
                      opt.value !== mintTokens[activeMintTokenIndex].chainId
                  )}
                  isSearchable={false}
                  isDisabled={
                    transferStatus === Status.IN_PROGRESS ||
                    sendStatus === Status.IN_PROGRESS
                  }
                  components={{ DropdownIndicator }}
                  maxMenuHeight={rightSelectHeight}
                />
              </div>
              <div className="Card-Body" ref={rightCardRef}>
                <div className="Card-Token-Content">
                  <div className="Token-Balance">
                    <img
                      src={sendTokens[activeSendTokenIndex].tokenIcon}
                      alt="icon"
                    />
                    <div className="Toke-Balance-Numbers">
                      <p className="Token-Balance-Current">
                        {sendTokens[activeSendTokenIndex].balance}{" "}
                        <span className="Token-Name">
                          {sendTokens[activeSendTokenIndex].tokenName}
                        </span>
                      </p>
                      {sendStatus === Status.SUCCESS &&
                        Math.abs(
                          sendTokens[activeSendTokenIndex].balance -
                            sendTokens[activeSendTokenIndex].oldBalance
                        ) > 0 && (
                          <p className="Token-Balance-Change">
                            {sendTokens[activeSendTokenIndex].balance >
                            sendTokens[activeSendTokenIndex].oldBalance
                              ? "+"
                              : "-"}
                            {Math.abs(
                              sendTokens[activeSendTokenIndex].balance -
                                sendTokens[activeSendTokenIndex].oldBalance
                            )}{" "}
                            sent
                          </p>
                        )}
                    </div>
                  </div>
                  <div
                    className="Card-Image"
                    style={{
                      backgroundImage: `url(${sendTokens[activeSendTokenIndex].tokenBackground})`,
                    }}
                  ></div>
                </div>
                {showSendInput ? (
                  <>
                    <p className="Tweet-Instructions">
                      Enter address to send funds to (double check which chain
                      you are sending from!){" "}
                    </p>
                    <input
                      className="Tweet-URL-Input"
                      placeholder="Enter Address"
                      type="text"
                      name="send-address"
                      onChange={(event) => setSendAddress(event.target.value)}
                    />
                    <div style={{ paddingBottom: "10px" }} />
                    {sendStatus === Status.ERROR && (
                      <>
                        <span style={{ color: "red" }}>Error sending :(</span>
                        <div style={{ paddingBottom: "10px" }} />
                      </>
                    )}
                    <button
                      type="button"
                      className={
                        sendStatus === Status.IN_PROGRESS
                          ? "Sending-Button"
                          : "Send-Button"
                      }
                      onClick={async () => {
                        setSendStatus(Status.IN_PROGRESS);
                        try {
                          await send(
                            sendTokens[activeSendTokenIndex],
                            sendAddress,
                            clients
                          );
                        } catch (e) {
                          console.error(e.message);
                          setSendStatus(Status.ERROR);
                        }
                      }}
                      disabled={
                        sendStatus === Status.IN_PROGRESS ||
                        sendTokens[activeSendTokenIndex].balance <
                          MINIMUM_BALANCE
                      }
                    >
                      {sendStatus === Status.IN_PROGRESS ? (
                        <>
                          <img src={mintingGif} alt="gear" />
                          Sending
                          <img
                            className="Ellipsis-Gif"
                            src={ellipsisGif}
                            alt="ellipsis"
                          />
                        </>
                      ) : (
                        "Confirm Send"
                      )}
                    </button>
                    <p
                      className="Cancel-Tweet"
                      onClick={() => setShowSendInput(false)}
                    >
                      Cancel
                    </p>
                  </>
                ) : (
                  <button
                    type="button"
                    className={`Send-Button ${
                      sendStatus === Status.SUCCESS ? "Send-Success" : ""
                    }`}
                    disabled={
                      sendStatus === Status.SUCCESS ||
                      sendTokens[activeSendTokenIndex].balance < MINIMUM_BALANCE
                    }
                    onClick={() => setShowSendInput(!showSendInput)}
                  >
                    {sendStatus === Status.SUCCESS ? (
                      <>
                        <i className="fas fa-check" /> Sent!
                      </>
                    ) : (
                      "Send"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      <a className="Footer" href="https://connext.network/">
        Made with <i className="fas fa-heart Heart-Icon"></i> by Connext
      </a>
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
};

export default App;
