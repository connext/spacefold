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

export default function Card() {
  const { Step } = Steps;

  // const [connext, setConnext] = useState<Connext>();

  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(CURRENT.DEPOSIT);
  const [sendStatus, setSendStatus] = useState<
    "wait" | "process" | "finish" | "error"
  >(STATUS.WAIT.status);

  const [fromNetwork, setFromNetwork] = useState<ENV>(ENVIRONMENT[0]);
  const [amount, setAmount] = useState(0);
  const [fromToken, setFromToken] = useState<TOKEN>(fromNetwork.tokens[0]);

  const [toNetwork, setToNetwork] = useState<ENV>(ENVIRONMENT[1]);
  const [address, setAddress] = useState("");

  // const [toToken, setToToken] = useState<TOKEN>(toNetwork.tokens[0]);

  // Promise.all([connext.connectNode()]);

  useEffect(() => {
    async function start() {
      setLoading(true)
      await connext.connectNode();
      setLoading(false)
    }
    start();
  }, []);

  const swap = async () => {
    if (typeof window !== "undefined") {
      const from: ENV = fromNetwork;
      const to: ENV = toNetwork;

      await Promise.all([setFromNetwork(to), setToNetwork(from)]);
    }
  };

  const openNotification = () => {
    notification.open({
      message: "Notification Title",
      description:
        "This is the content of the notification. This is the content of the notification. This is the content of the notification.",
      onClick: () => {
        console.log("Notification Clicked!");
      },
    });
  };

  const onChange = async (value) => {
    setAmount(value);
  };

  return (
    <div className="home">
      <div id="card" className="card p-6">
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
                <img src={fromToken.icon} className="h-8 w-8 pt-1" />
                <InputNumber
                  id="amount"
                  autoFocus={true}
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

        <div
          id="to"
          className="h-28 border-2 border-gray-300 border-opacity-100"
        >
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
                        // setToToken(t.tokens[0]);
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
                <img src={fromToken.icon} className="h-8 w-8 pt-1" />
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
                sendStatus === STATUS.PROCESS.status && current === 0 ? (
                  <LoadingOutlined />
                ) : (
                  ""
                )
              }
            />
            <Step
              title="Transfer"
              icon={
                sendStatus === STATUS.PROCESS.status && current === 1 ? (
                  <LoadingOutlined />
                ) : (
                  ""
                )
              }
            />
            <Step
              title="Withdraw"
              icon={
                sendStatus === STATUS.PROCESS.status && current === 2 ? (
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
          onClick={async () => {
            setLoading(true);
            try {
              setCurrent(CURRENT.DEPOSIT);
              setSendStatus(STATUS.PROCESS.status);
              await connext.deposit(
                fromNetwork.chainId,
                fromToken.address,
                amount.toString()
              );
            } catch (e) {
              console.error(e);
              setSendStatus(STATUS.ERROR.status);
            }

            try {
              setCurrent(CURRENT.TRANSFER);
              await connext.transfer(
                fromNetwork.chainId,
                fromToken.address,
                amount.toString(),
                toNetwork.chainId
              );
            } catch (e) {
              console.error(e);
              setSendStatus(STATUS.ERROR.status);
            }

            // try {
            //   setCurrent(CURRENT.WITHDRAW);
            //   await connext.withdraw(
            //     toNetwork.chainId,
            //     fromToken.address,
            //     address,
            //     amount.toString()
            //   );
            // } catch (e) {
            //   console.error(e);
            //   setSendStatus(STATUS.ERROR.status);
            // }
            // setSendStatus(STATUS.FINISH.status);
            setLoading(false);
          }}
        >
          Send
        </button>
      </div>
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
