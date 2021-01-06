import React, { useState } from "react";
import { ConnextModal } from "@connext/vector-modal";
import { Grid, Button, TextField, Select, MenuItem } from "@material-ui/core";
import { utils } from "ethers";

const chainConfig = process.env.NEXT_PUBLIC_CHAIN_PROVIDERS;
const chainProviders = JSON.parse(chainConfig);

export default function Modal() {
  const [showModal, setShowModal] = useState(false);

  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [open, setOpen] = React.useState(false);

  const handleChange = (event) => {
    setWithdrawalAddress(event.target.value);
  };

  const handleSubmit = (values) => {
    const errors = { receiverAddress: "" };
    if (!values.receiverAddress) {
      errors.receiverAddress = "Required";
    }
    return errors;
  };

  const CHAIN_INFO_URL = "https://chainid.network/chains.json";
  const getNetworkName = async (chainId: any): Promise<string> => {
    let chainName: string;
    try {
      const chainInfo: any[] = await utils.fetchJson(CHAIN_INFO_URL);

      const getChainInfo = chainInfo.find((info) => info.chainId === chainId);
      if (getChainInfo) {
        chainName = getChainInfo.name;
      }
    } catch (e) {
      console.warn(`Could not fetch chain info from ${CHAIN_INFO_URL}`);
    }
    return chainName;
  };
  interface NETWORK {
    depositChainId: number;
    depositChainName: string;
    withdrawChainId: number;
    withdrawChainName: string;
    tokens: TOKEN[];
  }
  interface TOKEN {
    name: string;
    depositAssetId: string;
    withdrawAssetId: string;
  }

  const GOERLI_MATIC_TOKENS: TOKEN[] = [
    {
      name: "TestToken",
      depositAssetId: "0xbd69fC70FA1c3AED524Bb4E82Adc5fcCFFcD79Fa",
      withdrawAssetId: "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
    },
  ];

  const RINKEBY_KOVAN_TOKENS: TOKEN[] = [
    {
      name: "ETH",
      depositAssetId: "0x0000000000000000000000000000000000000000",
      withdrawAssetId: "0x0000000000000000000000000000000000000000",
    },
  ];
  const networks: NETWORK[] = [
    {
      depositChainId: 5,
      depositChainName: "Goerli Testnet",
      withdrawChainId: 80001,
      withdrawChainName: "Matic Testnet",
      tokens: GOERLI_MATIC_TOKENS,
    },
    {
      depositChainId: 4,
      depositChainName: "Rinkeby Testnet",
      withdrawChainId: 42,
      withdrawChainName: "Kovan Testnet",
      tokens: RINKEBY_KOVAN_TOKENS,
    },
  ];

  const handleNetwork = (event) => {
    setChain(networks[event.target.value]);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const [chain, setChain] = useState<NETWORK>(networks[0]);
  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Select
              id="demo-controlled-open-select"
              open={open}
              onClose={handleClose}
              onOpen={handleOpen}
              onChange={handleNetwork}
              fullWidth
              defaultValue={0}
              // component={Select}
            >
              {networks.map((t, index) => {
                return (
                  <MenuItem value={index} key={index}>
                    {t.depositChainName} to {t.withdrawChainName}
                  </MenuItem>
                );
              })}
            </Select>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Receiver Address"
              name="receiverAddress"
              aria-describedby="receiverAddress"
              defaultValue={withdrawalAddress}
              type="search"
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
        </Grid>
      </form>
      <Grid container spacing={2}>
        <Grid item style={{ marginTop: 16 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!withdrawalAddress || !chain}
            onClick={() => setShowModal(true)}
          >
            Cross-Chain Transfer
          </Button>
        </Grid>
      </Grid>

      {/* <Form form={form} onFinish={() => setShowModal(true)}>
        <Form.Item
          name="withdrawalAddress"
          rules={[
            { required: true, message: "Please input withdrawal address!" },
          ]}
        >
          <Input placeholder="Withdrawal Address" />
        </Form.Item>
        <Divider />
        <Form.Item>
          <button type="submit" className="First-Button">
            Goerli to Matic Testnet
          </button>
        </Form.Item>
      </Form> */}

      <ConnextModal
        showModal={showModal}
        routerPublicIdentifier="vector7tbbTxQp8ppEQUgPsbGiTrVdapLdU5dH7zTbVuXRf1M4CEBU9Q"
        depositAssetId={chain!.tokens[0].depositAssetId}
        depositChainId={chain!.depositChainId}
        withdrawAssetId={chain!.tokens[0].withdrawAssetId}
        withdrawChainId={chain!.withdrawChainId}
        withdrawalAddress={withdrawalAddress}
        onClose={() => setShowModal(false)}
        depositChainProvider={chainProviders[chain!.depositChainId]}
        withdrawChainProvider={chainProviders[chain!.withdrawChainId]}
      />
    </>
  );
}
