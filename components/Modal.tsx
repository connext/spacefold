import React, { useState } from "react";
import { ConnextModal } from "@connext/vector-modal";
import { Grid, Button, TextField, Select, MenuItem } from "@material-ui/core";

export default function Modal() {
  const [showModal, setShowModal] = useState(false);

  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [open, setOpen] = React.useState(false);
  const [injectedProvider, setInjectedProvider] = React.useState();

  const chainConfig = process.env.NEXT_PUBLIC_CHAIN_PROVIDERS;
  const chainProviders = JSON.parse(chainConfig!);

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

  const GOERLI_MUMBAI_TOKENS: TOKEN[] = [
    {
      name: "Test Token",
      depositAssetId: "0xbd69fC70FA1c3AED524Bb4E82Adc5fcCFFcD79Fa",
      withdrawAssetId: "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
    },
  ];

  const MUMBAI_GOERLI_TOKENS: TOKEN[] = [
    {
      name: "Test Token",
      depositAssetId: "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
      withdrawAssetId: "0xbd69fC70FA1c3AED524Bb4E82Adc5fcCFFcD79Fa",
    },
  ];

  const RINKEBY_KOVAN_TOKENS: TOKEN[] = [
    {
      name: "ETH",
      depositAssetId: "0x0000000000000000000000000000000000000000",
      withdrawAssetId: "0x0000000000000000000000000000000000000000",
    },
  ];

  const KOVAN_RINKEBY_TOKENS: TOKEN[] = [
    {
      name: "ETH",
      depositAssetId: "0x0000000000000000000000000000000000000000",
      withdrawAssetId: "0x0000000000000000000000000000000000000000",
    },
  ];

  const KOVAN_ARBITRUM_TOKENS: TOKEN[] = [
    {
      name: "ETH",
      depositAssetId: "0x0000000000000000000000000000000000000000",
      withdrawAssetId: "0x0000000000000000000000000000000000000000",
    },
  ];

  const ARBITRUM_KOVAN_TOKENS: TOKEN[] = [
    {
      name: "ETH",
      depositAssetId: "0x0000000000000000000000000000000000000000",
      withdrawAssetId: "0x0000000000000000000000000000000000000000",
    },
  ];

  // const ETH_MATIC_TOKENS: TOKEN[] = [
  //   {
  //     name: "Test Token",
  //     depositAssetId: "0x9E86dd60e0B1e7e142F033d1BdEf734c6b3224Bb",
  //     withdrawAssetId: "0x9E86dd60e0B1e7e142F033d1BdEf734c6b3224Bb",
  //   },
  // ];

  // const MATIC_ETH_TOKENS: TOKEN[] = [
  //   {
  //     name: "Test Token",
  //     depositAssetId: "0x9E86dd60e0B1e7e142F033d1BdEf734c6b3224Bb",
  //     withdrawAssetId: "0x9E86dd60e0B1e7e142F033d1BdEf734c6b3224Bb",
  //   },
  // ];

  const networks: NETWORK[] = [
    {
      depositChainId: 5,
      depositChainName: "Goerli Testnet",
      withdrawChainId: 80001,
      withdrawChainName: "Matic Testnet",
      tokens: GOERLI_MUMBAI_TOKENS,
    },
    {
      depositChainId: 80001,
      depositChainName: "Matic Testnet",
      withdrawChainId: 5,
      withdrawChainName: "Goerli Testnet",
      tokens: MUMBAI_GOERLI_TOKENS,
    },
    {
      depositChainId: 4,
      depositChainName: "Rinkeby Testnet",
      withdrawChainId: 42,
      withdrawChainName: "Kovan Testnet",
      tokens: RINKEBY_KOVAN_TOKENS,
    },
    {
      depositChainId: 42,
      depositChainName: "Kovan Testnet",
      withdrawChainId: 4,
      withdrawChainName: "Rinkeby Testnet",
      tokens: KOVAN_RINKEBY_TOKENS,
    },
    {
      depositChainId: 42,
      depositChainName: "Kovan Testnet",
      withdrawChainId: 79377087078960,
      withdrawChainName: "Arbitrum Testnet V3",
      tokens: KOVAN_ARBITRUM_TOKENS,
    },
    {
      depositChainId: 79377087078960,
      depositChainName: "Arbitrum Testnet V3",
      withdrawChainId: 42,
      withdrawChainName: "Kovan Testnet",
      tokens: ARBITRUM_KOVAN_TOKENS,
    },
    // {
    //   depositChainId: 137,
    //   depositChainName: "Matic Mainnet",
    //   withdrawChainId: 1,
    //   withdrawChainName: "ETH Mainnet",
    //   tokens: MATIC_ETH_TOKENS,
    // },
    // {
    //   depositChainId: 1,
    //   depositChainName: "ETH Mainnet",
    //   withdrawChainId: 137,
    //   withdrawChainName: "Matic Mainnet",
    //   tokens: ETH_MATIC_TOKENS,
    // },
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
      <Grid container spacing={2} justifyContent="center">
        <Grid item style={{ marginTop: 16 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!!injectedProvider}
            onClick={async () => {
              if ((window as any).ethereum) {
                const req = await (window as any).ethereum.send(
                  "eth_requestAccounts"
                );
                console.log("req: ", req);
                setInjectedProvider((window as any).ethereum);
              }
            }}
          >
            Connect Metamask
          </Button>
        </Grid>
      </Grid>
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
      <Grid container spacing={2} justifyContent="center">
        <Grid item style={{ marginTop: 16 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!withdrawalAddress || !chain}
            onClick={async () => {
              if (!injectedProvider) {
                alert("Please connect to Metamask to use this dapp.");
                throw new Error("Metamask not available");
              }
              setShowModal(true);
            }}
          >
            Cross-Chain Transfer
          </Button>
        </Grid>
      </Grid>

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
        injectedProvider={injectedProvider}
        loginProvider={injectedProvider}
        iframeSrcOverride="https://wallet-beta.connext.network"
      />
    </>
  );
}
