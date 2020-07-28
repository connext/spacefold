import React, { useState, useEffect } from "react";
import * as connext from "@connext/client";
import { ColorfulLogger, stringify } from "@connext/utils";
import { getLocalStore } from "@connext/store";
import { constants, utils } from "ethers";
import Select from "react-select";
import axios from "axios";

import transferDisabledImage from "./images/transferDisabled.png";
import transferGif from "./images/transfer.gif";
import loadingGif from "./images/loading.gif";
import dropdownGif from "./images/dropdown.gif";
import mintingGif from "./images/minting.gif";
import ellipsisGif from "./images/ellipsis.gif";
import ethIcon from "./images/eth.png";
import moonIcon from "./images/moon.png";
import ethBackground from "./images/ethBackground.png";
import rinkebyBackground from "./images/rinkebyBackground.png";
import "./App.css";
import { getWallet } from "./wallet";

const { formatEther, parseEther } = utils;

const dotenv = require("dotenv");
dotenv.config();

const nodeUrl = "https://node.spacefold.io/";

const tokens = {
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
    tokenName: "TOKEN",
    tokenIcon: ethIcon,
    tokenBackground: ethBackground,
    tokenAddress: "0x4d4deb65DBC13dE6811095baba7064B41A72D9Db",
    chainId: 42,
    name: "Kovan",
    color: "#01C853",
    ethProviderUrl: `https://kovan.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
  },
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

const getRandom = (max) => Math.floor(Math.random() * max);
const randomSendTokenIndex = getRandom(Object.keys(tokens).length);
let randomMintTokenIndex = 0;
while (randomMintTokenIndex === randomSendTokenIndex) {
  randomMintTokenIndex = getRandom(Object.keys(tokens).length);
}

function App() {
  const [upstream, setUpstream] = useState(true);
  const [clients, setClients] = useState({});
  const [balances, setBalances] = useState({});
  const [mintTokens, setMintTokens] = useState([]);
  const [sendTokens, setSendTokens] = useState([]);
  const [activeMintToken, setActiveMintToken] = useState(randomSendTokenIndex);
  const [activeSendToken, setActiveSendToken] = useState(randomMintTokenIndex);
  const [tweetUrl, setTweetUrl] = useState("");
  const [showTweetInput, setShowTweetInput] = useState(false);
  const [mintStatus, setMintStatus] = useState(Status.READY);
  const [sendAddress, setSendAddress] = useState("");
  const [showSendInput, setShowSendInput] = useState(false);
  const [sendStatus, setSendStatus] = useState(Status.READY);
  const [transferStatus, setTransferStatus] = useState(Status.READY);
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
      for (const network of Object.values(tokens)) {
        try {
          console.log(`Creating client for network ${JSON.stringify(network)}`);
          const pk = getWallet(network.chainId).privateKey;
          const client = await connext.connect({
            nodeUrl,
            ethProviderUrl: network.ethProviderUrl,
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
          setMintStatus(Status.SUCCESS);
          setShowTweetInput(false);
          console.log("Transfer created, updated balances", updated);
        });
        t.client.on("CONDITIONAL_TRANSFER_UNLOCKED_EVENT", async (msg) => {
          const updated = await refreshBalances();
          setTransferStatus(Status.SUCCESS);
          setTimeout(() => setTransferStatus(Status.READY), 1000);
          console.log("Transfer unlocked, updated balances", updated);
        });
        t.client.on("WITHDRAWAL_CONFIRMED_EVENT", async (msg) => {
          const updated = await refreshBalances();
          setSendStatus(Status.SUCCESS);
          setShowSendInput(false);
          console.log("Withdrawal completed, updated balances", updated);
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
    // no exhaustive deps, we only want this to run on start
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setMintTokens((prevTokens) =>
      Object.values(tokens).map((network) => {
        const oldToken = prevTokens.find((t) => t.chainId === network.chainId);
        const newBalance = balances[network.chainId] || 0;
        return {
          ...network,
          balance: newBalance,
          oldBalance: oldToken
            ? Math.abs(newBalance - oldToken.balance) < 0.001
              ? oldToken.oldBalance
              : oldToken.balance
            : newBalance,
        };
      })
    );
    setSendTokens((prevTokens) =>
      Object.values(tokens).map((network) => {
        const oldToken = prevTokens.find((t) => t.chainId === network.chainId);
        const newBalance = balances[network.chainId] || 0;
        return {
          ...network,
          balance: newBalance,
          oldBalance: oldToken
            ? Math.abs(newBalance - oldToken.balance) < 0.001
              ? oldToken.oldBalance
              : oldToken.balance
            : newBalance,
        };
      })
    );
  }, [balances]);

  const changeMintToken = (option) => {
    const newTokenIndex = mintTokens.findIndex(
      (t) => t.chainId === option.value
    );
    setActiveMintToken(newTokenIndex);
    setUpstream(mintTokens[newTokenIndex].balance > 0);
    setMintStatus(Status.READY);
  };
  const changeSendToken = (option) => {
    const newTokenIndex = sendTokens.findIndex(
      (t) => t.chainId === option.value
    );
    setActiveSendToken(newTokenIndex);
    setUpstream(mintTokens[activeMintToken].balance > 0);
    setSendStatus(Status.READY);
  };

  const transfer = async () => {
    setTransferStatus(Status.IN_PROGRESS);
    const fromToken = upstream
      ? mintTokens[activeMintToken]
      : sendTokens[activeSendToken];
    const fromClient = clients[fromToken.chainId];

    const toToken = upstream
      ? sendTokens[activeSendToken]
      : mintTokens[activeMintToken];
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
  };

  const mint = async () => {
    const mintToken = mintTokens[activeMintToken];
    const assetId = mintToken.tokenAddress;
    const client = clients[mintToken.chainId];
    if (!client) {
      console.error(`Failed to find client for ${mintToken.chainId}`, clients);
      return;
    }
    setMintStatus(Status.IN_PROGRESS);
    const faucetUrl = `${process.env.REACT_APP_FAUCET_URL}/faucet`;
    const faucetData = {
      assetId,
      recipient: client.publicIdentifier,
      tweet: tweetUrl,
      chainId: mintToken.chainId,
    };
    try {
      console.log(
        `Making faucet request to ${faucetUrl}: ${stringify(
          faucetData,
          true,
          0
        )}`
      );
      const res = await axios.post(faucetUrl, faucetData);
      console.log(`Faucet response: ${JSON.stringify(res)}`);
    } catch (e) {
      console.error(
        `Error minting tokens: ${
          e.response ? JSON.stringify(e.response.data || {}) : e.message
        }`
      );
      setMintStatus(Status.ERROR);
    }
  };

  const send = async () => {
    const sendToken = sendTokens[activeSendToken];
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
      console.error(`Error sending tokens: ${e.stack}`);
      setSendStatus(Status.ERROR);
    }
  };

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
    !mintTokens[activeMintToken] ||
    sendTokens.length === 0 ||
    !sendTokens[activeSendToken] ||
    transferStatus === Status.IN_PROGRESS ||
    transferStatus === Status.SUCCESS ||
    (mintTokens[activeMintToken].balance <= 0.001 &&
      sendTokens[activeSendToken].balance <= 0.001);
  const totalBalance =
    mintTokens.reduce((bal, t) => bal + t.balance, 0) +
    sendTokens.reduce((bal, t) => bal + t.balance, 0);

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
          className="Github-Button"
          onClick={() =>
            (window.location.href = "https://github.com/connext/spacefold")
          }
        >
          <i className="fab fa-github Github-Icon"></i> GitHub
        </button>
        <button
          type="button"
          className="Discord-Button"
          onClick={() =>
            (window.location.href =
              "https://discord.com/channels/454734546869551114")
          }
        >
          <i className="fab fa-discord Discord-Icon"></i> Chat
        </button>
        <button
          type="button"
          className="About-Button"
          onClick={() => (window.location.href = "https://connext.network/")}
        >
          About
        </button>
      </div>
      {mintTokens.length > 0 && (
        <div
          className="Token Token-Left"
          style={{
            backgroundColor:
              mintTokens[activeMintToken].balance > 0
                ? mintTokens[activeMintToken].color
                : "#F4F5F7",
          }}
        >
          <div className="Card">
            <div className="Card-Header">
              <Select
                className="Token-Select"
                value={mintOptions[activeMintToken]}
                onChange={changeMintToken}
                styles={selectStyles}
                options={mintOptions.filter(
                  (opt) =>
                    opt.value !== mintTokens[activeMintToken].chainId &&
                    opt.value !== sendTokens[activeSendToken].chainId
                )}
                isSearchable={false}
                isDisabled={
                  transferStatus === Status.IN_PROGRESS ||
                  mintStatus === Status.IN_PROGRESS
                }
                components={{ DropdownIndicator }}
              />
            </div>
            {showTweetInput ? (
              <div className="Tweet-Body">
                <p className="Tweet-Instructions">
                  Please paste a public tweet containing your public identifier
                  to mint free tokens!{" "}
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
                    mintTokens[activeMintToken].name,
                    mintTokens[activeMintToken].tokenName
                  )}
                  target="popup"
                  onClick={() => {
                    window.open(
                      getTweetURL(
                        clients[mintTokens[activeMintToken].chainId]
                          ?.publicIdentifier,
                        mintTokens[activeMintToken].name,
                        mintTokens[activeMintToken].tokenName
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
                    <span style={{ color: "red" }}>Error minting tokens!</span>
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
                  onClick={mint}
                  disabled={mintStatus === Status.IN_PROGRESS}
                >
                  {mintStatus === Status.IN_PROGRESS ? (
                    <>
                      <img src={mintingGif} alt="gear" />
                      Minting
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
              <div className="Card-Body">
                <div className="Card-Token-Content">
                  <div className="Token-Balance">
                    <img
                      src={mintTokens[activeMintToken].tokenIcon}
                      alt="icon"
                    />
                    <div className="Toke-Balance-Numbers">
                      <p className="Token-Balance-Current">
                        {mintTokens[activeMintToken].balance}{" "}
                        <span className="Token-Name">
                          {mintTokens[activeMintToken].tokenName}
                        </span>
                      </p>
                      {mintStatus === Status.SUCCESS &&
                        Math.abs(
                          mintTokens[activeMintToken].balance -
                            mintTokens[activeMintToken].oldBalance
                        ) > 0 && (
                          <p className="Token-Balance-Change">
                            {mintTokens[activeMintToken].balance >
                            mintTokens[activeMintToken].oldBalance
                              ? "+"
                              : "-"}
                            {Math.abs(
                              mintTokens[activeMintToken].balance -
                                mintTokens[activeMintToken].oldBalance
                            )}{" "}
                            minted
                          </p>
                        )}
                    </div>
                  </div>
                  <img
                    className="Card-Image"
                    src={mintTokens[activeMintToken].tokenBackground}
                    alt=""
                  />
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
                      <i className="fas fa-check" />
                      Minted!
                    </>
                  ) : (
                    "Mint"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
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
          onClick={transfer}
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
      {sendTokens.length > 0 && (
        <div
          className="Token Token-Right"
          style={{
            backgroundColor:
              sendTokens[activeSendToken].balance > 0
                ? sendTokens[activeSendToken].color
                : "#F4F5F7",
          }}
        >
          <div className="Card">
            <div className="Card-Header">
              <Select
                className="Token-Select"
                value={sendOptions[activeSendToken]}
                onChange={changeSendToken}
                styles={selectStyles}
                options={sendOptions.filter(
                  (opt) =>
                    opt.value !== sendTokens[activeSendToken].chainId &&
                    opt.value !== mintTokens[activeMintToken].chainId
                )}
                isSearchable={false}
                isDisabled={
                  transferStatus === Status.IN_PROGRESS ||
                  sendStatus === Status.IN_PROGRESS
                }
                components={{ DropdownIndicator }}
              />
            </div>
            <div className="Card-Body">
              <div className="Card-Token-Content">
                <div className="Token-Balance">
                  <img src={sendTokens[activeSendToken].tokenIcon} alt="icon" />
                  <div className="Toke-Balance-Numbers">
                    <p className="Token-Balance-Current">
                      {sendTokens[activeSendToken].balance}{" "}
                      <span className="Token-Name">
                        {sendTokens[activeSendToken].tokenName}
                      </span>
                    </p>
                    {sendStatus === Status.SUCCESS &&
                      Math.abs(
                        sendTokens[activeSendToken].balance -
                          sendTokens[activeSendToken].oldBalance
                      ) > 0 && (
                        <p className="Token-Balance-Change">
                          {sendTokens[activeSendToken].balance >
                          sendTokens[activeSendToken].oldBalance
                            ? "+"
                            : "-"}
                          {Math.abs(
                            sendTokens[activeSendToken].balance -
                              sendTokens[activeSendToken].oldBalance
                          )}{" "}
                          sent
                        </p>
                      )}
                  </div>
                </div>
                <img
                  className="Card-Image"
                  src={sendTokens[activeSendToken].tokenBackground}
                  alt=""
                />
              </div>
              {showSendInput ? (
                <>
                  <p className="Tweet-Instructions">
                    Enter address to send funds to (double check which chain you
                    are sending from!){" "}
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
                    onClick={send}
                    disabled={
                      sendStatus === Status.IN_PROGRESS ||
                      sendTokens[activeSendToken].balance < 0.001
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
                    sendTokens[activeSendToken].balance < 0.001
                  }
                  onClick={() => setShowSendInput(!showSendInput)}
                >
                  {sendStatus === Status.SUCCESS ? (
                    <>
                      <i className="fas fa-check" />
                      Sent!
                    </>
                  ) : (
                    "Send"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <p
        className="Footer"
        onClick={() => (window.location.href = "https://connext.network/")}
      >
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
};

export default App;
