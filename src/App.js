import React, { useState, useEffect } from 'react';
import * as connext from "@connext/client";
import { ConditionalTransferTypes } from "@connext/types";
import { constants } from 'ethers';
import Select from 'react-select';

import ethIcon from './images/eth.png';
import brickIcon from './images/brick.png';
import moonIcon from './images/moon.png';
import ethBackground from './images/ethBackground.png';
import brickBackground from './images/brickBackground.png';
import moonBackground from './images/moonBackground.png';
import './App.css';
import { getWallet } from './wallet';

const nodeUrl = "https://node.spacefold.io/";

const networks = {
  1: { name: "Mainnet", chainId: 1 },
  4: { name: "Rinkeby", chainId: 4 },
  5: { name: "Goerli", chainId: 5 },
  42: { name: "Kovan", chainId: 42 },
};

const tokens = {
  eth:  {
    tokenName: "Eth",
    tokenIcon: ethIcon,
    tokenBackground: ethBackground,
    tokenAddress: constants.AddressZero,
  },
  moon: {
    tokenName: "Moon",
    tokenIcon: moonIcon,
    tokenBackground: moonBackground,
    tokenAddress: constants.AddressZero,
  },
  brick: {
    tokenName: "Brick",
    tokenIcon: brickIcon,
    tokenBackground: brickBackground,
    tokenAddress: constants.AddressZero,
  },
};

function App() {
  const [clients, setClients] = useState({})
  const [mintTokens, setMintTokens] = useState([]);
  const [sendTokens, setSendTokens] = useState([]);
  const [activeMintToken, setActiveMintToken] = useState(0);
  const [activeSendToken, setActiveSendToken] = useState(0);

  const mintOptions = mintTokens.map(t => ({ label: t.name, value: t.chainId }));
  const sendOptions = sendTokens.map(t => ({ label: t.name, value: t.chainId }));

  useEffect(() => {
    async function initClients() {
      const clientsArr = await Promise.all(Object.values(networks).map(async (network) => {
        const client = await connext.connect({
          nodeUrl,
          ethProviderUrl: `https://${network.name.toLowerCase()}.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
          signer: getWallet(network.chainId).privateKey
        })
        return { chainId: network.chainId, client }
      }))
      const _clients = {}
      clientsArr.forEach(t => {
        _clients[t.chainId] = t.client
      })
      setClients(_clients)
    }
    initClients()
  },[])

  useEffect(() => {
    // TODO:  get balances from respective clients
    const mintTokens = [
      { ...networks[1], ...tokens.eth, balance: 0.1 },
    ];
    const sendTokens = [
      { ...networks[4], ...tokens.moon, balance: 0 },
      { ...networks[5], ...tokens.brick, balance: 0 },
    ]
    setMintTokens(mintTokens);
    setSendTokens(sendTokens);
  }, [clients]);

  const changeMintToken = (option) => {
    const newTokenIndex = mintTokens.findIndex(t => t.chainId === option.value);
    setActiveMintToken(newTokenIndex);
  };
  const changeSendToken = (option) => {
    const newTokenIndex = sendTokens.findIndex(t => t.chainId === option.value);
    setActiveSendToken(newTokenIndex);
  };

  const transfer = async () => {
    const fromToken = mintTokens[activeMintToken]
    const fromClient = clients[fromToken.chainId]

    const toToken = sendTokens[activeSendToken]
    const toClient = clients[toToken.chainId]

    await fromClient.conditionalTransfer({
      conditionType: ConditionalTransferTypes.LinkedTransfer,
      assetId: fromToken.tokenAddress,
      amount: fromToken.balance,
      recipient: toClient.publicIdentifier,
      meta: {
        receiverAssetId: toToken.tokenAddress,
        receiverChainId: toToken.chainId
      }
    })
  }

  const mint = async  () => {
    const mintToken = mintTokens[activeMintToken]
    const assetId = mintToken.tokenAddress
    const recipient = clients[mintToken.chainId].publicIdentifier
    await fetch({
      method: "POST",
      url: `${process.env.REACT_APP_FAUCET_URL}/faucet`,
      body: JSON.stringify({ assetId, recipient })
    })
  }

  const send = async  (address) => {
    const sendToken = sendTokens[activeSendToken]
    const sendClient = clients[sendToken.chainId]
    
    await sendClient.withdraw({
      amount: sendToken.balance,
      assetId: sendToken.tokenAddress,
      recipient: address,
    })
  }
  
  return (
    <div className="App">
      <div className="More-Buttons">
        <button
          type="button"
          className="Discord-Button"
          onClick={() => window.location.href = 'https://discord.com/channels/454734546869551114'}
        >
          <i className="fab fa-discord"></i>
        </button>
        <button
          type="button"
          className="About-Button"
          onClick={() => window.location.href = 'https://connext.network/'}
        >
          <i className="fas fa-info-circle"></i>
        </button>
      </div>
      { mintTokens.length > 0 && (
        <div className="Token Token-Left">
          <div className="Card">
            <div className="Card-Header">
              <Select
                className="Token-Select"
                value={mintOptions[activeMintToken]}
                onChange={changeMintToken}
                styles={{
                  control: base => ({
                    ...base,
                    border: 'none',
                    boxShadow: 'none',
                  }),
                  indicatorSeparator: base => ({
                    width: 0,
                  }),
                }}
                options={mintOptions}
              />
            </div>
            <div className="Card-Body">
              <img className="Card-Background" src={mintTokens[activeMintToken].tokenBackground} />
              <p className="Token-Balance">
                <img src={mintTokens[activeMintToken].tokenIcon} alt="icon" />  
                { mintTokens[activeMintToken].balance }
                { ' ' }
                <span className="Token-Name">
                  { mintTokens[activeMintToken].tokenName }
                </span>
              </p>
              <button
                type="button"
                className="Mint-Button"
                onClick={mint}
              >
                Mint
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        className="Swap-Button"
        onClick={transfer}
      >
        TRANSFER
        <span className="Swap-Arrows">
          <i className="fas fa-chevron-right"></i>
          <i className="fas fa-chevron-right"></i>
          <i className="fas fa-chevron-right"></i>
          <i className="fas fa-chevron-right"></i>
          <i className="fas fa-chevron-right"></i>
        </span>
      </button>
      { sendTokens.length > 0 && (
        <div className="Token Token-Right">
          <div className="Card">
            <div className="Card-Header">
              <Select
                className="Token-Select"
                value={sendOptions[activeSendToken]}
                onChange={changeSendToken}
                styles={{
                  control: base => ({
                    ...base,
                    border: 'none',
                    boxShadow: 'none',
                  }),
                  indicatorSeparator: base => ({
                    width: 0,
                  }),
                }}
                options={sendOptions}
              />
            </div>
            <div className="Card-Body">
              <img className="Card-Background" src={sendTokens[activeSendToken].tokenBackground} />
              <p className="Token-Balance">
                <img src={sendTokens[activeSendToken].tokenIcon} alt="icon" />
                { sendTokens[activeSendToken].balance }
                { ' ' }
                <span className="Token-Name">
                  { sendTokens[activeSendToken].tokenName }
                </span>
              </p>          
              <button
                type="button"
                className="Send-Button"
                onClick={send}
              >
                Send {sendTokens[activeSendToken].tokenName}
              </button>
            </div>
          </div>
        </div>
      )}
      <p className="Footer">Made with <i className="fas fa-heart Heart-Icon"></i> by Connext</p>
    </div>
  );
}

export default App;
