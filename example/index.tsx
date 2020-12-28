import 'react-app-polyfill/ie11';
import 'regenerator-runtime/runtime';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { config } from 'dotenv';

import { ConnextModal } from '../src';
import { BrowserNode } from '@connext/vector-browser-node';

config();

function App() {
  const [showModal, setShowModal] = React.useState(false);

  const node = new BrowserNode({
    routerPublicIdentifier:
      'vector7tbbTxQp8ppEQUgPsbGiTrVdapLdU5dH7zTbVuXRf1M4CEBU9Q',
    iframeSrc: 'https://wallet.connext.network',
    supportedChains: [5, 80001],
  });

  return (
    <>
      <button onClick={() => setShowModal(true)}>Hello World</button>
      <ConnextModal
        showModal={showModal}
        depositAssetId={'0x655F2166b0709cd575202630952D71E2bB0d61Af'}
        depositChainId={5}
        withdrawAssetId={'0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1'}
        withdrawChainId={80001}
        withdrawalAddress={'0x5A9e792143bf2708b4765C144451dCa54f559a19'}
        onClose={() => setShowModal(false)}
        connextNode={node}
      />
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
