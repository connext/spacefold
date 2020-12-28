import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { constants } from 'ethers';
import { ConnextModal } from '../src';

describe('it', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <ConnextModal
        showModal={true}
        depositChainId={1337}
        depositAssetId={constants.AddressZero}
        withdrawAssetId={constants.AddressZero}
        withdrawChainId={1338}
        withdrawalAddress={constants.AddressZero}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
