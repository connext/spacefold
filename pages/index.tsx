import Head from "next/head";
import { Loading, Navbar, Footer } from "../components";
import React, { useState, useEffect, useRef } from "react";
import { utils } from "ethers";
import Select from "react-select";

// import { initClients, mint, transfer, send, collateralize } from "./actions";
import {
  TOKENS,
  IMAGE_PATH,
  LOCAL_STORAGE_VERSION,
  STATUS,
  MINIMUM_BALANCE,
} from "../constants";

// if (typeof window !== "undefined") {
//   if (
//     !window.localStorage.getItem("VERSION") ||
//     window.localStorage.getItem("VERSION") !== LOCAL_STORAGE_VERSION
//   ) {
//     window.localStorage.clear();
//     window.localStorage.setItem("VERSION", LOCAL_STORAGE_VERSION);
//     window.location.reload();
//   }
// }

// const getTweetURL = (publicIdentifier, chainName, tokenName) =>
//   "https://twitter.com/intent/tweet?text=" +
//   encodeURIComponent(
//     `Minting ${tokenName} tokens for channel ${publicIdentifier} https://spacefold.io on ${chainName}! By @ConnextNetwork`
//   );

export default function Home() {
  const [clients, setClients] = useState({});
  const [balances, setBalances] = useState({});
  const [mintTokens, setMintTokens] = useState([]);
  const [sendTokens, setSendTokens] = useState([]);
  const [activeMintTokenIndex, setActiveMintTokenIndex] = useState(null);
  const [activeSendTokenIndex, setActiveSendTokenIndex] = useState(null);
  const [tweetUrl, setTweetUrl] = useState("");
  const [showTweetInput, setShowTweetInput] = useState(false);
  const [mintStatus, setMintStatus] = useState(STATUS.READY);
  const [mintErrorMessage, setMintErrorMessage] = useState("");
  const [sendAddress, setSendAddress] = useState("");
  const [showSendInput, setShowSendInput] = useState(false);
  const [sendStatus, setSendStatus] = useState(STATUS.READY);
  const [sendErrorMessage, setSendErrorMessage] = useState("");
  const [sendTransactionURL, setSendTransactionURL] = useState(null);
  const [transferStatus, setTransferStatus] = useState(STATUS.READY);
  const [transferErrorMessage, setTransferErrorMessage] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [collateralizing, setCollateralizing] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [leftSelectHeight, setLeftSelectHeight] = useState(0);
  const [rightSelectHeight, setRightSelectHeight] = useState(0);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  useEffect(() => {
    function onMintSucceeded() {
      setMintStatus(STATUS.SUCCESS);
      setTimeout(() => setMintStatus(STATUS.READY), 2000);
      setShowTweetInput(false);
      setSendTransactionURL(null); //reset send transaction url after successful mint
    }

    function onTransferSucceeded() {
      setTransferStatus(STATUS.SUCCESS);
      setTimeout(() => setTransferStatus(STATUS.READY), 2000);
    }

    function onWithdrawSucceeded() {
      setSendStatus(STATUS.SUCCESS);
      setTimeout(() => setSendStatus(STATUS.READY), 2000);
      setShowSendInput(false);
    }

    function onWithdrawFailed() {
      setSendStatus(STATUS.ERROR);
    }

    function onBalanceRefresh(chainId, newBalance) {
      setBalances((prevBalances) => ({
        ...prevBalances,
        [chainId]: utils.formatEther(newBalance),
      }));
    }

    async function init() {
      try {
        // disable app while upgrading
        const { clients, balances } = await initClients(
          TOKENS,
          onMintSucceeded,
          onTransferSucceeded,
          onWithdrawSucceeded,
          onBalanceRefresh,
          onWithdrawFailed
        );
        setClients(clients);
        setBalances(balances);
        setInitializing(false);
        setLeftSelectHeight(leftCardRef.current?.clientHeight ?? 0);
        setRightSelectHeight(rightCardRef.current?.clientHeight ?? 0);
        await collateralize(clients, TOKENS);
        setCollateralizing(false);
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
    if (initializing) {
      return; // balances aren't fully up to date yet, don't show anything
    }
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
    activeMintTokenIndex === null
      ? mintTokens.length > 0
        ? mintTokens[0]
        : null
      : mintTokens[activeMintTokenIndex];
  const activeSendToken =
    activeSendTokenIndex === null
      ? mintTokens.length > 1
        ? mintTokens[1]
        : null
      : sendTokens[activeSendTokenIndex];
  const tokensWereAlreadyMinted =
    mintTokens.some((t) => t.balance > 0) ||
    sendTokens.some((t) => t.balance > 0);
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
  const leftSelectDisabled =
    activeMintToken === null ||
    transferStatus === STATUS.IN_PROGRESS ||
    mintStatus === STATUS.IN_PROGRESS ||
    activeMintToken.balance > 0;
  const rightSelectDisabled =
    activeSendToken === null ||
    transferStatus === STATUS.IN_PROGRESS ||
    sendStatus === STATUS.IN_PROGRESS;
  const transferDisabled =
    activeMintToken === null ||
    activeSendToken === null ||
    transferStatus === STATUS.IN_PROGRESS ||
    transferStatus === STATUS.SUCCESS ||
    mintStatus === STATUS.IN_PROGRESS ||
    sendStatus === STATUS.IN_PROGRESS ||
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
      {/* <Loading initializing={initializing} message={loadingMessage} /> */}
      <Navbar />
      {activeMintToken !== null && activeSendToken !== null && (
        <div className="Main-Content">
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
                    setMintStatus(STATUS.READY);
                    setMintErrorMessage("");
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
                  isDisabled={leftSelectDisabled}
                  components={{
                    DropdownIndicator: leftSelectDisabled
                      ? DisabledDropdownIndicator
                      : DropdownIndicator,
                  }}
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
                      setMintStatus(STATUS.READY);
                      setMintErrorMessage("");
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
                  {mintStatus === STATUS.ERROR && (
                    <div style={{ paddingBottom: "10px", color: "red" }}>
                      Error: {mintErrorMessage}
                    </div>
                  )}
                  <button
                    type="button"
                    className={
                      mintStatus === STATUS.IN_PROGRESS
                        ? "Minting-Button"
                        : "Mint-Button"
                    }
                    onClick={async () => {
                      setMintStatus(STATUS.IN_PROGRESS);
                      setMintErrorMessage("");
                      setSendErrorMessage("");
                      setTransferErrorMessage("");
                      try {
                        await mint(activeMintToken, clients, tweetUrl);
                      } catch (e) {
                        setMintStatus(STATUS.ERROR);
                        setMintErrorMessage(e.message);
                        console.error(e.message);
                      }
                    }}
                    disabled={
                      collateralizing && mintStatus === STATUS.IN_PROGRESS
                    }
                  >
                    {mintStatus === STATUS.IN_PROGRESS ? (
                      <>
                        <img src={IMAGE_PATH.gifs.spinningGear} alt="gear" />{" "}
                        Minting&nbsp;
                        <img
                          className="Ellipsis-Gif"
                          src={IMAGE_PATH.gifs.ellipsis}
                          alt="ellipsis"
                        />
                      </>
                    ) : (
                      "Confirm Mint"
                    )}
                  </button>
                  {mintStatus !== STATUS.IN_PROGRESS && (
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
                              (transferStatus === STATUS.SUCCESS ||
                                mintStatus === STATUS.SUCCESS) &&
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
                          {mintStatus === STATUS.SUCCESS ? "minted" : "folded"}
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
                      mintStatus === STATUS.SUCCESS ? "Mint-Success" : ""
                    }`}
                    onClick={() => setShowTweetInput(!showTweetInput)}
                    disabled={
                      mintStatus === STATUS.IN_PROGRESS ||
                      transferStatus === STATUS.IN_PROGRESS ||
                      tokensWereAlreadyMinted
                    }
                  >
                    {mintStatus === STATUS.SUCCESS ? (
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
          <div className="Middle-Button-Container">
            {transferStatus === STATUS.IN_PROGRESS ? (
              <div className="Transferring-Circle">
                <img src={IMAGE_PATH.gifs.loading} alt="transferring" />
              </div>
            ) : (
              <button
                type="button"
                className={`Swap-Button${
                  transferDirection === "right" ? "" : " Flip-Image"
                }${
                  transferStatus === STATUS.SUCCESS
                    ? " Transfer-Success"
                    : transferStatus === STATUS.ERROR
                    ? " Transfer-Error"
                    : ""
                }`}
                title={transferErrorMessage}
                onClick={async () => {
                  setTransferStatus(STATUS.IN_PROGRESS);
                  setMintErrorMessage("");
                  setSendErrorMessage("");
                  setTransferErrorMessage("");
                  try {
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
                  } catch (e) {
                    console.error("Error folding: ", e);
                    setTransferStatus(STATUS.ERROR);
                    setTransferErrorMessage(e.message);
                    setTimeout(() => setTransferStatus(STATUS.READY), 2000);
                  }
                }}
                disabled={transferDisabled}
              >
                {transferStatus === STATUS.SUCCESS ? (
                  <>
                    SUCCESS! <i className="fas fa-check" />
                  </>
                ) : transferStatus === STATUS.ERROR ? (
                  <>
                    ERROR <i className="fas fa-exclamation" />
                  </>
                ) : (
                  <>
                    FOLD{" "}
                    <img
                      src={ transferDisabled ? `${IMAGE_PATH.status.transferDisabled}` : `${IMAGE_PATH.gifs.transfer}`}
                      alt="fold"
                    />
                  </>
                )}
              </button>
            )}
          </div>
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
                    setSendStatus(STATUS.READY);
                    setSendErrorMessage("");
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
                  isDisabled={rightSelectDisabled}
                  components={{
                    DropdownIndicator: rightSelectDisabled
                      ? DisabledDropdownIndicator
                      : DropdownIndicator,
                  }}
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
                            (transferStatus === STATUS.SUCCESS ||
                              sendStatus === STATUS.SUCCESS) &&
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
                        &nbsp;
                        {sendStatus === STATUS.SUCCESS ? "sent" : "folded"}
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
                    {sendStatus === STATUS.ERROR && (
                      <div style={{ paddingBottom: "10px", color: "red" }}>
                        Error: {sendErrorMessage}
                      </div>
                    )}
                    <button
                      type="button"
                      className={
                        sendStatus === STATUS.IN_PROGRESS
                          ? "Sending-Button"
                          : "Send-Button"
                      }
                      onClick={async () => {
                        setSendStatus(STATUS.IN_PROGRESS);
                        setMintErrorMessage("");
                        setSendErrorMessage("");
                        setTransferErrorMessage("");
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
                          setSendStatus(STATUS.ERROR);
                          setSendErrorMessage(e.message);
                        }
                      }}
                      disabled={
                        sendStatus === STATUS.IN_PROGRESS ||
                        activeSendToken.balance < MINIMUM_BALANCE
                      }
                    >
                      {sendStatus === STATUS.IN_PROGRESS ? (
                        <>
                          <img src={IMAGE_PATH.gifs.spinningGear} alt="gear" />{" "}
                          Sending&nbsp;
                          <img
                            className="Ellipsis-Gif"
                            src={IMAGE_PATH.gifs.ellipsis}
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
                      sendStatus === STATUS.SUCCESS ? "Send-Success" : ""
                    }`}
                    disabled={
                      sendStatus === STATUS.SUCCESS ||
                      activeSendToken.balance < MINIMUM_BALANCE
                    }
                    onClick={() => setShowSendInput(!showSendInput)}
                  >
                    {sendStatus === STATUS.SUCCESS ? (
                      <>
                        <i className="fas fa-check" /> Sent!
                      </>
                    ) : (
                      "Send onchain"
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
        </div>
      )}
      <Footer />
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
      src={IMAGE_PATH.gifs.dropdown}
      alt="dropdownIndicator"
    />
  );
};

const DisabledDropdownIndicator = ({ selectProps }) => {
  return (
    <img
      className={
        selectProps && selectProps.menuIsOpen
          ? "Dropdown-Indicator Dropdown-Indicator-Open"
          : "Dropdown-Indicator"
      }
      src={IMAGE_PATH.status.dropdownDisabled}
      alt="dropdownIndicator"
    />
  );
};
