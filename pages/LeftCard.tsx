import React, { useState, useRef } from "react";
import Select from "react-select";
import { IMAGE_PATH, STATUS } from "../constants";

export default function Card() {
  const [showTweetInput, setShowTweetInput] = useState(false);
  const [mintStatus, setMintStatus] = useState(STATUS.READY);
  const [transferStatus, setTransferStatus] = useState(STATUS.READY);
  const [leftSelectHeight, setLeftSelectHeight] = useState(0);
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

  const leftSelectDisabled =
    activeMintToken === null ||
    transferStatus === STATUS.IN_PROGRESS ||
    mintStatus === STATUS.IN_PROGRESS ||
    activeMintToken.balance > 0;

  return (
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
              label: "ETH",
              value: "42",
            }}
            onChange={(option) => {}}
            // styles={selectStyles}
            //   options={Tokens
            //     .map((t) => ({ label: t.name, value: t.chainId }))
            //     .filter(
            //       (opt) =>
            //         opt.value !== activeMintToken.chainId &&
            //         opt.value !== activeSendToken.chainId
            //     )}
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
        <div className="Card-Body" ref={leftCardRef}>
          <div className="Card-Token-Content">
            <div className="Token-Balance">
              <img src={IMAGE_PATH.icon.eth} alt="icon" />
              <div className="Toke-Balance-Numbers">
                <p className="Token-Balance-Current">
                  {"1"}&nbsp;
                  <span className="Token-Name">{"ETH"}</span>
                </p>
              </div>
            </div>
            <div
              className="Card-Image"
              style={{
                backgroundImage: `url(${IMAGE_PATH.background.rinkeby})`,
              }}
            ></div>
          </div>
          <button
            type="button"
            className={`Mint-Button`}
            onClick={() => setShowTweetInput(!showTweetInput)}
            //   disabled={
            //     mintStatus === STATUS.IN_PROGRESS ||
            //     transferStatus === STATUS.IN_PROGRESS ||
            //     tokensWereAlreadyMinted
            //   }
          >
            Deposit
          </button>
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
