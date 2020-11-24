import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { IMAGE_PATH, STATUS, MINIMUM_BALANCE } from "../constants";

export default function Card() {
  const [showTweetInput, setShowTweetInput] = useState(false);
  const [mintStatus, setMintStatus] = useState(STATUS.READY);
  const [clients, setClients] = useState({});
  const [sendTokens, setSendTokens] = useState([]);
  const [activeSendTokenIndex, setActiveSendTokenIndex] = useState(null);
  const [mintErrorMessage, setMintErrorMessage] = useState("");
  const [sendAddress, setSendAddress] = useState("");
  const [showSendInput, setShowSendInput] = useState(false);
  const [sendStatus, setSendStatus] = useState(STATUS.READY);
  const [sendErrorMessage, setSendErrorMessage] = useState("");
  const [sendTransactionURL, setSendTransactionURL] = useState(null);
  const [transferStatus, setTransferStatus] = useState(STATUS.READY);
  const [transferErrorMessage, setTransferErrorMessage] = useState("");
  const [leftSelectHeight, setLeftSelectHeight] = useState(0);
  const [rightSelectHeight, setRightSelectHeight] = useState(0);
  const rightCardRef = useRef(null);
  const leftCardRef = useRef(null);

  const activeMintToken = {
    balance: 1,
    color: "#F4F5F7",
    name: "bla",
    chainId: 42,
    tokenIcon: IMAGE_PATH.icon.eth,
    tokenName: "ETH",
    oldBalance: 23,
    tokenBackground: IMAGE_PATH.background.rinkeby,
    blockchainExplorerURL: "",
  };
  const activeSendToken = {
    balance: 1,
    color: "#F4F5F7",
    name: "bla",
    chainId: 42,
    tokenIcon: IMAGE_PATH.icon.eth,
    tokenName: "ETH",
    oldBalance: 23,
    tokenBackground: IMAGE_PATH.background.rinkeby,
    blockchainExplorerURL: "",
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

  return (
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
            // styles={selectStyles}
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
                      activeSendToken.balance !== activeSendToken.oldBalance
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
                Enter address to send funds to (double check which chain you are
                sending from!)&nbsp;
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
                  // try {
                  //   const transactionHash = await send(
                  //     activeSendToken,
                  //     sendAddress,
                  //     clients
                  //   );
                  //   if (activeSendToken.blockchainExplorerURL !== null) {
                  //     setSendTransactionURL(
                  //       activeSendToken.blockchainExplorerURL.replace(
                  //         "{TRANSACTION_HASH}",
                  //         transactionHash
                  //       )
                  //     );
                  //   } else {
                  //     setSendTransactionURL("");
                  //   }
                  // } catch (e) {
                  //   console.error(e.message);
                  //   setSendStatus(STATUS.ERROR);
                  //   setSendErrorMessage(e.message);
                  // }
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
              <p className="Cancel" onClick={() => setShowSendInput(false)}>
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
