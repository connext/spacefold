import React, { useState, useEffect, useRef } from "react";
import { constants, utils } from "ethers";
import Select from "react-select";

import loadingGif from "./images/loading.gif";
import transferDisabledImage from "./images/transferDisabled.png";
import transferGif from "./images/transfer.gif";
import dropdownGif from "./images/dropdown.gif";
import spinningGearGif from "./images/spinningGear.gif";
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

import { initClients, mint, transfer, send } from "./actions";

import "./App.css";

import Loading from "./components/Loading";

const MINIMUM_BALANCE = 0.001;

const Status = {
  READY: 0,
  IN_PROGRESS: 1,
  ERROR: 2,
  SUCCESS: 3,
};

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
    blockchainExplorerURL: "https://rinkeby.etherscan.io/tx/{TRANSACTION_HASH}",
  },
  // 5: {
  //   tokenName: "ETH",
  //   tokenIcon: ethIcon,
  //   tokenBackground: ethBackground,
  //   tokenAddress: constants.AddressZero,
  //   chainId: 5,
  //   name: "Goerli",
  //   color: "#0091F2",
  //   ethProviderUrl: `https://goerli.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
  //   blockchainExplorerURL: "https://goerli.etherscan.io/tx/{TRANSACTION_HASH}",
  // },
  42: {
    tokenName: "BRICK",
    tokenIcon: brickIcon,
    tokenBackground: brickBackground,
    tokenAddress: "0x4d4deb65DBC13dE6811095baba7064B41A72D9Db",
    chainId: 42,
    name: "Kovan",
    color: "#5b32a2",
    ethProviderUrl: `https://kovan.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
    blockchainExplorerURL: "https://kovan.etherscan.io/tx/{TRANSACTION_HASH}",
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
    blockchainExplorerURL:
      "https://blockscout.com/etc/mainnet/tx/{TRANSACTION_HASH}/token_transfers",
  },
  100: {
    tokenName: "xBRICKS",
    tokenIcon: brickIcon,
    tokenBackground: xDaiBackground,
    tokenAddress: "0xf502A7897a49A9daFa5542203746Bad6C6E86c11",
    chainId: 100,
    name: "xDAI",
    color: "#01C853",
    ethProviderUrl: `https://xdai.poanetwork.dev`,
    blockchainExplorerURL:
      "https://blockscout.com/poa/xdai/tx/{TRANSACTION_HASH}/token_transfers",
  },
  80001: {
    tokenName: "mTOKEN",
    tokenIcon: ethIcon,
    tokenBackground: maticBackground,
    tokenAddress: "0xf502A7897a49A9daFa5542203746Bad6C6E86c11",
    chainId: 80001,
    name: "Matic",
    color: "#2b6def",
    ethProviderUrl: `https://rpc-mumbai.matic.today`,
    blockchainExplorerURL:
      "https://mumbai-explorer.matic.today/tx/{TRANSACTION_HASH}/token_transfers",
  },
  346750: {
    tokenName: "sTOKEN",
    tokenIcon: ethIcon,
    tokenBackground: skaleBackground,
    tokenAddress: "0xf502A7897a49A9daFa5542203746Bad6C6E86c11",
    chainId: 346750,
    name: "SKALE",
    color: "#000000",
    ethProviderUrl: `https://dev-testnet-v1-1.skalelabs.com`,
    blockchainExplorerURL: null,
  },
};

const getTweetURL = (publicIdentifier, chainName, tokenName) =>
  "https://twitter.com/intent/tweet?text=" +
  encodeURIComponent(
    `Minting ${tokenName} tokens for channel ${publicIdentifier} https://spacefold.io on ${chainName}! By @ConnextNetwork`
  );

function App() {
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
  const [sendTransactionURL, setSendTransactionURL] = useState(null);
  const [transferStatus, setTransferStatus] = useState(Status.READY);
  const [initializing, setInitializing] = useState(true);
  const [leftSelectHeight, setLeftSelectHeight] = useState(0);
  const [rightSelectHeight, setRightSelectHeight] = useState(0);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  useEffect(() => {
    function onMintSucceeded() {
      setMintStatus(Status.SUCCESS);
      setShowTweetInput(false);
    }

    function onTransferSucceeded() {
      setTransferStatus(Status.SUCCESS);
      setTimeout(() => setTransferStatus(Status.READY), 1000);
    }

    function onWithdrawSucceeded() {
      setSendStatus(Status.SUCCESS);
      setShowSendInput(false);
    }

    function onBalanceRefresh(chainId, newBalance) {
      setBalances((prevBalances) => ({
        ...prevBalances,
        [chainId]: utils.formatEther(newBalance),
      }));
    }

    async function init() {
      try {
        const { clients, balances } = await initClients(
          TOKENS,
          onMintSucceeded,
          onTransferSucceeded,
          onWithdrawSucceeded,
          onBalanceRefresh
        );
        setClients(clients);
        setBalances(balances);
        setInitializing(false);
        setLeftSelectHeight(
          leftCardRef.current ? leftCardRef.current.clientHeight : 0
        );
        setRightSelectHeight(
          rightCardRef.current ? rightCardRef.current.clientHeight : 0
        );
      } catch (e) {
        console.error(e.message);
      }
    }
    init();
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
      const existingIndex = mintTokens.findIndex(
        (t) => t.balance > 0 && t.tokenName !== "MOON"
      );
      if (existingIndex === -1) {
        // select a random non-MOON token initially
        let tokenIndex = null;
        while (
          tokenIndex === null ||
          mintTokens[tokenIndex].tokenName === "MOON"
        ) {
          tokenIndex = Math.floor(Math.random() * mintTokens.length);
        }
        setActiveMintTokenIndex(tokenIndex);
      } else {
        setActiveMintTokenIndex(existingIndex);
      }
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

  const activeMintToken =
    activeMintTokenIndex === null ? null : mintTokens[activeMintTokenIndex];
  const activeSendToken =
    activeSendTokenIndex === null ? null : sendTokens[activeSendTokenIndex];

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
    activeMintToken === null ||
    activeSendToken === null || // no tokens selected
    transferStatus === Status.IN_PROGRESS ||
    transferStatus === Status.SUCCESS || // transfer occurring or occurred
    mintStatus === Status.IN_PROGRESS || // minting occurring
    sendStatus === Status.IN_PROGRESS || // sending occurring
    (activeMintToken.balance <= MINIMUM_BALANCE &&
      activeSendToken.balance <= MINIMUM_BALANCE); // not enough tokens to transfer, in either direction
  const transferDirection =
    activeSendToken === null
      ? null
      : activeSendToken.balance < MINIMUM_BALANCE
      ? "right"
      : "left";

  return (
    <div className="App">
      <Loading initializing={initializing} />
      <div className="More-Buttons">
        <a href="https://github.com/connext/spacefold" target="_blank">
          <i className="fab fa-github Github-Icon"></i> GitHub
        </a>
        <a
          href="https://discord.com/channels/454734546869551114"
          target="_blank"
        >
          <i className="fab fa-discord Discord-Icon"></i> Chat
        </a>
        <a href="https://connext.network/" target="_blank">
          <i className="fa fa-info About-Icon"></i> About
        </a>
      </div>
      {activeMintToken !== null && activeSendToken !== null && (
        <>
          <div
            className="Token Token-Left"
            style={{
              backgroundColor:
                activeMintToken.balance > 0 ? activeMintToken.color : "#F4F5F7",
            }}
          >
            <div className="Card">
              <div className="Card-Header">
                <Select
                  className="Token-Select"
                  value={{
                    label: activeMintToken.name,
                    value: activeMintToken.chainId,
                  }}
                  onChange={(option) => {
                    const newTokenIndex = mintTokens.findIndex(
                      (t) => t.chainId === option.value
                    );
                    setActiveMintTokenIndex(newTokenIndex);
                    setMintStatus(Status.READY);
                  }}
                  styles={selectStyles}
                  options={mintTokens
                    .map((t) => ({ label: t.name, value: t.chainId }))
                    .filter(
                      (opt) =>
                        opt.value !== activeMintToken.chainId &&
                        opt.value !== activeSendToken.chainId
                    )}
                  isSearchable={false}
                  isDisabled={
                    transferStatus === Status.IN_PROGRESS ||
                    mintStatus === Status.IN_PROGRESS ||
                    activeMintToken.balance > 0
                  }
                  components={{ DropdownIndicator }}
                  maxMenuHeight={leftSelectHeight}
                />
              </div>
              {showTweetInput ? (
                <div className="Tweet-Body" ref={leftCardRef}>
                  <p className="Instructions">
                    Please paste a public tweet containing your public
                    identifier to mint free tokens!
                  </p>
                  <p className="Identifier">
                    {clients[activeMintToken.chainId]?.publicIdentifier}
                  </p>
                  <a
                    className="Action"
                    href={getTweetURL(
                      clients[activeMintToken.chainId]?.publicIdentifier,
                      activeMintToken.name,
                      activeMintToken.tokenName
                    )}
                    target="popup"
                    onClick={() => {
                      window.open(
                        getTweetURL(
                          clients[activeMintToken.chainId]?.publicIdentifier,
                          activeMintToken.name,
                          activeMintToken.tokenName
                        ),
                        "popup",
                        "width=600,height=600"
                      );
                      setMintStatus(Status.READY);
                    }}
                  >
                    Tweet Now!
                  </a>
                  <input
                    className="URL-Input"
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
                        await mint(activeMintToken, clients, tweetUrl);
                      } catch (e) {
                        console.error(e.message);
                        setMintStatus(Status.ERROR);
                      }
                    }}
                    disabled={mintStatus === Status.IN_PROGRESS}
                  >
                    {mintStatus === Status.IN_PROGRESS ? (
                      <>
                        <img src={spinningGearGif} alt="gear" /> Minting{" "}
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
                  {mintStatus !== Status.IN_PROGRESS && (
                    <p
                      className="Cancel"
                      onClick={() => setShowTweetInput(false)}
                    >
                      Cancel
                    </p>
                  )}
                </div>
              ) : (
                <div className="Card-Body" ref={leftCardRef}>
                  <div className="Card-Token-Content">
                    <div className="Token-Balance">
                      <img src={activeMintToken.tokenIcon} alt="icon" />
                      <div className="Toke-Balance-Numbers">
                        <p className="Token-Balance-Current">
                          {activeMintToken.balance}&nbsp;
                          <span className="Token-Name">
                            {activeMintToken.tokenName}
                          </span>
                        </p>
                        <p
                          style={{
                            visibility:
                              transferStatus === Status.SUCCESS &&
                              activeMintToken.balance !==
                                activeMintToken.oldBalance
                                ? "visible"
                                : "hidden",
                          }}
                          className="Token-Balance-Change"
                        >
                          {activeMintToken.balance > activeMintToken.oldBalance
                            ? "+"
                            : "-"}
                          {Math.abs(
                            activeMintToken.balance - activeMintToken.oldBalance
                          )}
                          &nbsp;
                          {activeMintToken.balance > activeMintToken.oldBalance
                            ? "minted"
                            : "folded"}
                        </p>
                      </div>
                    </div>
                    <div
                      className="Card-Image"
                      style={{
                        backgroundImage: `url(${activeMintToken.tokenBackground})`,
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
                      transferStatus === Status.IN_PROGRESS ||
                      mintTokens.some((t) => t.balance > 0) ||
                      sendTokens.some((t) => t.balance > 0)
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
              className={`Swap-Button${
                transferDirection === "right" ? "" : " Flip-Image"
              }${transferStatus === Status.SUCCESS ? " Transfer-Success" : ""}`}
              onClick={async () => {
                setTransferStatus(Status.IN_PROGRESS);
                await transfer(
                  transferDirection === "right"
                    ? activeMintToken
                    : activeSendToken,
                  transferDirection === "left"
                    ? activeMintToken
                    : activeSendToken,
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
                activeSendToken.balance > 0 ? activeSendToken.color : "#F4F5F7",
            }}
          >
            <div className="Card">
              <div className="Card-Header">
                <Select
                  className="Token-Select"
                  value={{
                    label: activeSendToken.name,
                    value: activeSendToken.chainId,
                  }}
                  onChange={(option) => {
                    const newTokenIndex = sendTokens.findIndex(
                      (t) => t.chainId === option.value
                    );
                    setActiveSendTokenIndex(newTokenIndex);
                    setSendStatus(Status.READY);
                  }}
                  styles={selectStyles}
                  options={sendTokens
                    .map((t) => ({ label: t.name, value: t.chainId }))
                    .filter(
                      (o) =>
                        o.value !== activeSendToken.chainId &&
                        o.value !== activeMintToken.chainId
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
                    <img src={activeSendToken.tokenIcon} alt="icon" />
                    <div className="Toke-Balance-Numbers">
                      <p className="Token-Balance-Current">
                        {activeSendToken.balance}&nbsp;
                        <span className="Token-Name">
                          {activeSendToken.tokenName}
                        </span>
                      </p>
                      <p
                        style={{
                          visibility:
                            transferStatus === Status.SUCCESS &&
                            activeSendToken.balance !==
                              activeSendToken.oldBalance
                              ? "visible"
                              : "hidden",
                        }}
                        className="Token-Balance-Change"
                      >
                        {activeSendToken.balance > activeSendToken.oldBalance
                          ? "+"
                          : "-"}
                        {Math.abs(
                          activeSendToken.balance - activeSendToken.oldBalance
                        )}
                        &nbsp;sent
                      </p>
                    </div>
                  </div>
                  <div
                    className="Card-Image"
                    style={{
                      backgroundImage: `url(${activeSendToken.tokenBackground})`,
                    }}
                  ></div>
                </div>
                {showSendInput ? (
                  <>
                    <p className="Instructions">
                      Enter address to send funds to (double check which chain
                      you are sending from!)&nbsp;
                    </p>
                    <input
                      className="URL-Input"
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
                          const transactionHash = await send(
                            activeSendToken,
                            sendAddress,
                            clients
                          );
                          if (activeSendToken.blockchainExplorerURL !== null) {
                            setSendTransactionURL(
                              activeSendToken.blockchainExplorerURL.replace(
                                "{TRANSACTION_HASH}",
                                transactionHash
                              )
                            );
                          } else {
                            setSendTransactionURL("");
                          }
                        } catch (e) {
                          console.error(e.message);
                          setSendStatus(Status.ERROR);
                        }
                      }}
                      disabled={
                        sendStatus === Status.IN_PROGRESS ||
                        activeSendToken.balance < MINIMUM_BALANCE
                      }
                    >
                      {sendStatus === Status.IN_PROGRESS ? (
                        <>
                          <img src={spinningGearGif} alt="gear" /> Sending{" "}
                          <img
                            className="Ellipsis-Gif"
                            src={ellipsisGif}
                            alt="ellipsis"
                          />
                        </>
                      ) : (
                        <>Confirm Send</>
                      )}
                    </button>
                    <p
                      className="Cancel"
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
                      activeSendToken.balance < MINIMUM_BALANCE
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
                {sendTransactionURL !== null &&
                  (sendTransactionURL === "" ? (
                    "Broadcasted transaction"
                  ) : (
                    <a
                      href={sendTransactionURL}
                      rel="noreferrer noopener"
                      target="_blank"
                      className="Send-Transaction-URL"
                    >
                      View transaction
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
      <a className="Footer" href="https://connext.network/" target="_blank">
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
