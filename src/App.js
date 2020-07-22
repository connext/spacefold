import React, { useState, useEffect } from 'react';
import * as connext from "@connext/client"
import { ConditionalTransferTypes } from "@connext/types"
import { constants } from 'ethers';
import Select from 'react-select'

import './App.css';
import { getWallet } from './wallet';


const networks = {
  1: { name: "Mainnet", chainId: 1 },
  4: { name: "Rinkeby", chainId: 4 },
  5: { name: "Goerli", chainId: 5 },
  42: { name: "Kovan", chainId: 42 }
}

const tokens = {
  eth:  {  tokenName: "ETH", tokenAddress: constants.AddressZero },
  moon: {  tokenName: "MOON", tokenAddress: constants.AddressZero },
  brick: {  tokenName: "BRICK", tokenAddress: constants.AddressZero }
}

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
    const recipient = clients[mintToken].publicIdentifier
    await fetch({
      method: "GET",
      url: `${process.env.REACT_APP_FAUCET_URL}/faucet/${assetId}/${recipient}`
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
      <div className="Token Token-Left">
        <div className="Card">
          <Select
            className="Token-Select"
            value={mintOptions[activeMintToken]}
            onChange={changeMintToken}
            options={mintOptions}
          />
          <p className="Token-Balance">
            { mintTokens.length > 0 && mintTokens[activeMintToken].balance }
            { ' ' }
            <span className="Token-Name">
              { mintTokens.length > 0 && mintTokens[activeMintToken].tokenName }
            </span>
          </p>
          <button
            type="button"
            className="Mint-Button"
            onClick={mint}
          >
            MINT
          </button>
        </div>
      </div>
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
      <div className="Token Token-Right">
        <div className="Card">
          <Select
            className="Token-Select"
            value={sendOptions[activeSendToken]}
            onChange={changeSendToken}
            options={sendOptions}
          />
          <p className="Token-Balance">
            { sendTokens.length > 0 && sendTokens[activeSendToken].balance }
            { ' ' }
            <span className="Token-Name">
              { sendTokens.length > 0 && sendTokens[activeSendToken].tokenName }
            </span>
          </p>          
          <button
            type="button"
            className="Send-Button"
            onClick={send}
          >
            SEND {sendTokens.length > 0 && sendTokens[activeSendToken].tokenName}
          </button>
        </div>
      </div>
      <p className="Footer">Made with <i className="fas fa-heart Heart-Icon"></i> by Connext</p>
    </div>
  );
}

export default App;
