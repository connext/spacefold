import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Steps, Input, InputNumber, Row, Col, notification } from "antd";
import {
  CURRENT,
  STATUS,
  ENVIRONMENT,
  ENV,
  TOKEN,
  tokenSelectStyles,
  networkSelectStyles,
} from "../constants";
import {
  ArrowDownOutlined,
  DownOutlined,
  QuestionCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { connext } from "../service/connext";

export default function CrossChainCard() {
  const { Step } = Steps;

  // const [connext, setConnext] = useState<Connext>();

  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(CURRENT.DEPOSIT);
  const [sendStatus, setSendStatus] = useState<
    "wait" | "process" | "finish" | "error"
  >(STATUS.WAIT);

  const [fromNetwork, setFromNetwork] = useState<ENV>(ENVIRONMENT[0]);
  const [amount, setAmount] = useState(0);
  const [fromToken, setFromToken] = useState<TOKEN>(fromNetwork.tokens[0]);

  const [toNetwork, setToNetwork] = useState<ENV>(ENVIRONMENT[1]);
  const [address, setAddress] = useState("");
  const [toToken, setToToken] = useState<TOKEN>(toNetwork.tokens[0]);

  // Promise.all([connext.connectNode()]);

  useEffect(() => {
    async function start() {
      setLoading(true);
      await connext.connectNode();
      setLoading(false);
    }
    start();
  }, []);

  const swap = async () => {
    if (typeof window !== "undefined") {
      const from: ENV = fromNetwork;
      const to: ENV = toNetwork;

      await Promise.all([
        setFromNetwork(to),
        setFromToken(toToken),
        setToNetwork(from),
        setToToken(fromToken),
      ]);
    }
  };

  const onChange = (value) => {
    setAmount(value);
  };

  const openNotification = (
    response: string,
    progress?: number,
    link?: string,
    isError?: boolean
  ) => {
    const config = {
      message: "Title",
      description: "Response",
      duration: 10,
      onClick: () => {
        console.log("Notification Clicked!");
        window.open(link, "_blank");
      },
    };

    if (progress === 0) config.message = "Deposit";
    else if (progress === 1) config.message = "Transfer";
    else if (progress === 2) config.message = "Withdraw";
    else config.message = "ERROR";

    config.description = response;

    if (isError) notification.error(config);
    else notification.success(config);
  };

  const send = async () => {
    setLoading(true);
    try {
      setCurrent(CURRENT.DEPOSIT);
      setSendStatus(STATUS.PROCESS);
      const deposit = await connext.deposit(
        fromNetwork.chainId,
        fromToken.address,
        amount.toString()
      );

      openNotification(deposit.message, CURRENT.DEPOSIT, deposit.link);
      setCurrent(CURRENT.TRANSFER);
      console.log(current, CURRENT.TRANSFER);
      const crossChaintransfer = await connext.crossTransfer(
        amount.toString(),
        fromNetwork.chainId,
        fromToken.address,
        toNetwork.chainId,
        toToken.address,
        address
      );

      openNotification(
        crossChaintransfer.message,
        CURRENT.TRANSFER,
        crossChaintransfer.link
      );
      setSendStatus(STATUS.FINISH);
    } catch (e) {
      console.error(e);
      setSendStatus(STATUS.ERROR);
      openNotification(e.message, undefined, undefined, true);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex self-center p-4">
        <h1 className="text-lg leading-tight font-bold mt-0">
          {`Send ${fromToken.name} from ${fromNetwork.name} to ${toNetwork.name}`}
        </h1>
      </div>
      <div
        id="from"
        className="h-18 border-2 border-gray-300 border-opacity-100"
      >
        <Input.Group size="large">
          <Row className="h-8 bar">
            <Col className="w-2/6 h-8">
              <label className="pl-2 text-base">From</label>
            </Col>
            <Col className="w-2/6 h-8">
              <Select
                value={{
                  label: (
                    <div className="flex items-center">
                      {/* {fromNetwork.icon ? (
                        <img src={fromNetwork.icon} className="h-6 w-6" />
                      ) : (
                        <QuestionCircleOutlined />
                      )} */}
                      <QuestionCircleOutlined className="pr-1" />{" "}
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
                styles={networkSelectStyles}
                options={ENVIRONMENT.map((t) => ({
                  label: (
                    <div className="flex items-center">
                      <img src={t.icon} height="30px" width="30px" />
                      {t.name}{" "}
                    </div>
                  ),
                  value: t.chainId,
                })).filter(
                  (opt) =>
                    opt.value !== fromNetwork.chainId &&
                    opt.value !== toNetwork.chainId
                )}
                isSearchable={false}
                // isDisabled={}
                components={{ DropdownIndicator }}
                maxMenuHeight={300}
              />
            </Col>
          </Row>
          <Row className="h-10 pr-1">
            <Col className="w-2/3 flex">
              <img src={fromToken.icon} className="self-center h-8 w-8 pt-1" />
              <InputNumber
                id="amount"
                autoFocus={false}
                type="string"
                size="large"
                min={0}
                max={100000}
                className="h-10 w-full border-0 text-xl"
                aria-label="amount"
                placeholder="0.00"
                autoComplete="off"
                onChange={onChange}
              />
            </Col>
            <Col className="w-1/3 h-10 border-l-2 border-gray-300 border-opacity-100">
              <Select
                value={{
                  label: fromToken.name,
                  value: fromToken.address,
                }}
                onChange={(option: { value: string }) => {
                  fromNetwork.tokens.findIndex((t) => {
                    if (t.address === option.value) setFromToken(t);
                  });
                }}
                styles={tokenSelectStyles}
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
            </Col>
          </Row>
        </Input.Group>
      </div>

      <div className="m-4 flex flex-col items-center">
        <ArrowDownOutlined
          style={{ fontSize: "20px" }}
          onClick={async () => swap()}
        />
      </div>

      <div id="to" className="h-28 border-2 border-gray-300 border-opacity-100">
        <Input.Group size="large">
          <Row className="h-8 bar">
            <Col className="w-2/6 h-8">
              <label className="pl-2 text-base">To</label>
            </Col>
            <Col className="w-2/6 h-8">
              <Select
                value={{
                  label: (
                    <div className="flex items-center">
                      {/* <img src={toNetwork.icon} className="h-6 w-6" /> */}
                      <QuestionCircleOutlined className="pr-1" />{" "}
                      {toNetwork.name}{" "}
                    </div>
                  ),
                  value: toNetwork.chainId,
                }}
                onChange={(option: { value: number }) => {
                  ENVIRONMENT.findIndex((t) => {
                    if (t.chainId === option.value) {
                      setToNetwork(t);
                      setToToken(t.tokens[0]);
                    }
                  });
                }}
                styles={networkSelectStyles}
                options={ENVIRONMENT.map((t) => ({
                  label: (
                    <div className="flex items-center">
                      <img src={t.icon} height="30px" width="30px" />
                      {t.name}{" "}
                    </div>
                  ),
                  value: t.chainId,
                })).filter(
                  (opt) =>
                    opt.value !== fromNetwork.chainId &&
                    opt.value !== toNetwork.chainId
                )}
                isSearchable={false}
                // isDisabled={}
                components={{ DropdownIndicator }}
              />
            </Col>
          </Row>
          <Row className="h-10 pr-1">
            <Col className="w-2/3 flex">
              <img src={toToken.icon} className="self-center h-8 w-8 pt-1" />
              <InputNumber
                id="amount"
                type="number"
                size="large"
                min={0}
                max={100000}
                className="h-10 w-full border-0 text-xl"
                aria-label="amount"
                placeholder="0.00"
                autoComplete="off"
                readOnly={true}
                value={amount}
              />
            </Col>
            <Col className="w-1/3 h-10 border-l-2 border-gray-300 border-opacity-100">
              <Select
                value={{
                  label: toToken.name,
                  value: toToken.address,
                }}
                onChange={(option: { value: string }) => {
                  toNetwork.tokens.findIndex((t) => {
                    if (t.address === option.value) setToToken(t);
                  });
                }}
                styles={tokenSelectStyles}
                options={toNetwork.tokens
                  .map((t) => ({
                    label: (
                      <div className="flex items-center">
                        <img src={t.icon} height="20px" width="20px" />
                        <p className="pl-2">{t.name} </p>
                      </div>
                    ),
                    value: t.address,
                  }))
                  .filter((opt) => opt.value !== toToken.address)}
                isSearchable={false}
                // isDisabled={true}
                components={{ DropdownIndicator }}
              />
            </Col>
          </Row>
          <Row className="h-10">
            <Col className="w-full border-t-2 border-gray-300 border-opacity-100">
              <Input
                className="h-9 w-full text-xl "
                id="address"
                name="address"
                aria-label="address"
                size="large"
                type="text"
                bordered={false}
                placeholder="public address (0x)"
                allowClear={true}
                onChange={(event) => setAddress(event.target.value)}
              />
            </Col>
          </Row>
        </Input.Group>
      </div>

      <div className="my-8">
        <Steps
          direction="horizontal"
          // progressDot={customDot}
          current={current}
          status={sendStatus}
          size="small"
        >
          <Step
            title="Deposit"
            icon={
              sendStatus === STATUS.PROCESS && current === 0 ? (
                <LoadingOutlined />
              ) : (
                ""
              )
            }
          />
          <Step
            title="CrossChain Transfer"
            icon={
              sendStatus === STATUS.PROCESS && current === 1 ? (
                <LoadingOutlined />
              ) : (
                ""
              )
            }
          />
        </Steps>
      </div>

      <button
        type="button"
        className="First-Button"
        disabled={loading || !connext || !amount || !address}
        onClick={send}
      >
        Send
      </button>
    </div>
  );
}

const DropdownIndicator = ({ selectProps }) => {
  return (
    <DownOutlined
      className={
        selectProps && selectProps.menuIsOpen
          ? "Dropdown-Indicator Dropdown-Indicator-Open"
          : "Dropdown-Indicator"
      }
      style={{
        display: "block",
        margin: "0px 8px",
      }}
      alt="dropdownIndicator"
    />
  );
};
