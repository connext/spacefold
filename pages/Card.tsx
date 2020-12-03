import React, { useState } from "react";
import Select from "react-select";
// import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IMAGE_PATH, ENVIRONMENT, ENV, TOKEN } from "../constants";
import Connext from "../service/connext";

export default function Card() {
  const [connext, setConnext] = useState<Connext>();

  const [fromNetwork, setFromNetwork] = useState<ENV>(ENVIRONMENT[0]);
  const [amount, setAmount] = useState("0");
  const [fromToken, setFromToken] = useState<TOKEN>(fromNetwork.tokens[0]);

  const [toNetwork, setToNetwork] = useState<ENV>(ENVIRONMENT[0]);
  const [address, setAddress] = useState("");
  // const [toToken, setToToken] = useState<TOKEN>(toNetwork.tokens[0]);

  const connect = async () => {
    if (typeof window !== "undefined") {
      const connextNode = new Connext();
      connextNode.connectNode();
      setConnext(connextNode);
      // connextNode.deposit(4);
    }
  };

  const controlStyles = {
    // padding: "0 56px",
    // background: "#DEEBFF",
    border: "none",
    boxShadow: "none",
    cursor: "pointer",
  };
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      ...controlStyles,
    }),
    valueContainer: (base: any) => ({
      ...base,
      paddingLeft: 4,
    }),
    menu: (base: any) => ({
      ...base,
      margin: 0,
    }),
    menuList: (base: any) => ({
      ...base,
      maxHeight: "100%",
    }),
    option: (base: any) => ({
      ...base,
      backgroundColor: "#FFFFFF",
      // color: "#505D68",
      maxheight: "20px",
      // padding: "19px 56px",
      textAlign: "left",
      cursor: "pointer",
    }),
    indicatorSeparator: (base: any) => ({
      width: 0,
    }),
  };

  return (
    <div className="Token">
      <div id="card" className="Card p-6">
        <button
          type="button"
          className="First-Button mb-2"
          onClick={() => connect()}
        >
          Connect to Connext
        </button>
        <div
          id="from"
          className="p-2 mb-8 border-2 border-blue-500 border-opacity-25 rounded-3xl"
        >
          <p>From</p>
          <div className="flex">
            <Select
              className=" w-1/3 py-4"
              value={{
                label: (
                  <div className="flex items-center">
                    <img src={fromNetwork.icon} className="h-6 w-6" />
                    {fromNetwork.name}{" "}
                  </div>
                ),
                value: fromNetwork.chainId,
              }}
              onChange={(option: { value: number }) => {
                ENVIRONMENT.findIndex((t) => {
                  if (t.chainId === option.value) {
                    setFromNetwork(t);
                    setFromToken(t.tokens[0]);
                  }
                });
              }}
              styles={selectStyles}
              options={ENVIRONMENT.map((t) => ({
                label: (
                  <div className="flex items-center">
                    <img src={t.icon} height="30px" width="30px" />
                    {t.name}{" "}
                  </div>
                ),
                value: t.chainId,
              })).filter((opt) => opt.value !== fromNetwork.chainId)}
              isSearchable={false}
              // isDisabled={}
              components={{ DropdownIndicator }}
            />

            <div className="w-2/3 flex focus-within:text-gray-600">
              <div className="w-1/6 left-0 pl-3 flex items-center">
                <img src={fromToken.icon} height="30px" width="30px" />
              </div>
              <input
                className="w-3/6 pl-2 text-xl"
                id="amount"
                type="amount"
                aria-label="amount"
                placeholder="0.00"
                autoComplete="off"
                onChange={(event) => setAmount(event.target.value)}
              />
              <Select
                className="w-2/6 Token-Select"
                value={{
                  label: fromToken.name,
                  value: fromToken.address,
                }}
                onChange={(option: { value: string }) => {
                  fromNetwork.tokens.findIndex((t) => {
                    if (t.address === option.value) setFromToken(t);
                  });
                }}
                styles={selectStyles}
                options={fromNetwork.tokens
                  .map((t) => ({
                    label: (
                      <div className="flex items-center">
                        <img src={t.icon} height="20px" width="20px" />
                        <p className="pl-2">{t.name} </p>
                      </div>
                    ),
                    value: t.address,
                  }))
                  .filter((opt) => opt.value !== fromToken.address)}
                isSearchable={false}
                // isDisabled={}
                components={{ DropdownIndicator }}
              />
            </div>
          </div>
        </div>

        {/* <FontAwesomeIcon icon={faAngleDown} /> */}

        <div
          id="to"
          className="p-2 mb-8 border-2 border-blue-500 border-opacity-25 rounded-3xl"
        >
          <p>To</p>
          <div className="flex">
            <Select
              className=" w-1/3 py-4"
              value={{
                label: (
                  <div className="flex items-center">
                    <img src={toNetwork.icon} className="h-6 w-6" />
                    {toNetwork.name}{" "}
                  </div>
                ),
                value: toNetwork.chainId,
              }}
              onChange={(option: { value: number }) => {
                ENVIRONMENT.findIndex((t) => {
                  if (t.chainId === option.value) {
                    setToNetwork(t);
                    // setToToken(t.tokens[0]);
                  }
                });
              }}
              styles={selectStyles}
              options={ENVIRONMENT.map((t) => ({
                label: (
                  <div className="flex items-center">
                    <img src={t.icon} height="30px" width="30px" />
                    {t.name}{" "}
                  </div>
                ),
                value: t.chainId,
              })).filter((opt) => opt.value !== toNetwork.chainId)}
              isSearchable={false}
              // isDisabled={}
              components={{ DropdownIndicator }}
            />
            <div className="w-2/3 flex focus-within:text-gray-600">
              <div className="w-1/6 left-0 pl-3 flex items-center">
                <img src={fromToken.icon} height="30px" width="30px" />
              </div>
              <div className="w-3/6 flex items-center pl-2 text-2xl font-semibold">
                <p className="">{amount}&nbsp;</p>
              </div>
              <span className="w-2/6 flex items-center text-xl">
                {fromToken.name}
              </span>
            </div>
          </div>

          <input
            className="w-full p-3 text-center border-2 border-blue-500 border-opacity-25 rounded-3xl"
            id="transferAddress"
            name="Address"
            type="text"
            aria-label="address"
            placeholder="public address(0x)"
            // autoComplete="off"
            onChange={(event) => setAddress(event.target.value)}
          />
        </div>
        <button
          type="button"
          className="First-Button mb-2"
          onClick={() =>
            connext.deposit(fromNetwork.chainId, fromToken.address, amount)
          }
        >
          Deposit
        </button>
        <button
          type="button"
          className="First-Button mb-2"
          onClick={() =>
            connext.transfer(fromNetwork.chainId, fromToken.address, amount)
          }
        >
          Transfer
        </button>
        <button
          type="button"
          className="First-Button mb-2"
          onClick={() =>
            connext.withdraw(
              fromNetwork.chainId,
              fromToken.address,
              address,
              amount
            )
          }
        >
          Withdraw
        </button>
        {/* <button
          type="button"
          className="First-Button mb-2"
          onClick={() => connext.send(fromNetwork.chainId, amount)}
        >
          Send
        </button> */}
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
