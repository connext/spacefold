import React, { useState, useEffect, useRef } from "react";
import { IMAGE_PATH, STATUS, MINIMUM_BALANCE } from "../constants";

export default function Card() {
  const [mintStatus, setMintStatus] = useState(STATUS.READY);
  const [mintErrorMessage, setMintErrorMessage] = useState("");
  const [sendStatus, setSendStatus] = useState(STATUS.READY);
  const [sendErrorMessage, setSendErrorMessage] = useState("");
  const [transferStatus, setTransferStatus] = useState(STATUS.READY);
  const [transferErrorMessage, setTransferErrorMessage] = useState("");
  
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

  const transferDirection =
    activeSendToken === null
      ? null
      : activeSendToken.balance < MINIMUM_BALANCE
      ? "right"
      : "left";

  const transferDisabled =
    activeMintToken === null ||
    activeSendToken === null ||
    transferStatus === STATUS.IN_PROGRESS ||
    transferStatus === STATUS.SUCCESS ||
    mintStatus === STATUS.IN_PROGRESS ||
    sendStatus === STATUS.IN_PROGRESS ||
    (activeMintToken.balance <= MINIMUM_BALANCE &&
      activeSendToken.balance <= MINIMUM_BALANCE); // not enough tokens to transfer, in either direction

  return (
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
              // await transfer(
              //   transferDirection === "right"
              //     ? activeMintToken
              //     : activeSendToken,
              //   transferDirection === "left"
              //     ? activeMintToken
              //     : activeSendToken,
              //   clients,
              //   balances
              // );
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
                src={
                  transferDisabled
                    ? `${IMAGE_PATH.status.transferDisabled}`
                    : `${IMAGE_PATH.gifs.transfer}`
                }
                alt="fold"
              />
            </>
          )}
        </button>
      )}
    </div>
  );
}
