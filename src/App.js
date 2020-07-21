import React, { useState, useEffect } from 'react';
import Select from 'react-select'

import './App.css';

function App() {
  const [mintTokens, setMintTokens] = useState([]);
  const [sendTokens, setSendTokens] = useState([]);
  const [activeMintToken, setActiveMintToken] = useState(0);
  const [activeSendToken, setActiveSendToken] = useState(0);
  const mintOptions = mintTokens.map(t => ({ label: t.name, value: t.id }));
  const sendOptions = sendTokens.map(t => ({ label: t.name, value: t.id }));
  useEffect(() => {
    // load data
    const mintTokens = [
      { id: 1, name: 'Mainnet', tokenName: 'Tokens', balance: 0.1, },
      { id: 2, name: 'Ethereum', tokenName: 'Tokens', balance: 0 },
    ];
    const sendTokens = [
      { id: 3, name: 'Rinkeby', tokenName: 'Tokens', balance: 0 },
      { id: 4, name: 'Optimism', tokenName: 'Tokens', balance: 0 },
    ]
    setMintTokens(mintTokens);
    setSendTokens(sendTokens);
  }, []);
  const changeMintToken = (option) => {
    const newTokenIndex = mintTokens.findIndex(t => t.id === option.value);
    setActiveMintToken(newTokenIndex);
  };
  const changeSendToken = (option) => {
    const newTokenIndex = sendTokens.findIndex(t => t.id === option.value);
    setActiveSendToken(newTokenIndex);
  };
  const transfer = () => {
    //transfer tokens
  }
  const mint = () => {
    // mint tokens
  }
  const send = () => {
    //send tokens
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
