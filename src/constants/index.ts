import { TRANSFER_STATES, TransferStates } from './types';

export const CHAIN_INFO_URL = 'https://chainid.network/chains.json';

const PROD_ROUTER_IDENTIFIER =
  'vector7tbbTxQp8ppEQUgPsbGiTrVdapLdU5dH7zTbVuXRf1M4CEBU9Q';

const PROD_IFRAME_WALLET = 'https://wallet.connext.network';

export const routerPublicIdentifier =
  process.env.REACT_APP_ROUTER_IDENTIFIER || PROD_ROUTER_IDENTIFIER;

export const iframeSrc = process.env.REACT_APP_IFRAME_SRC || PROD_IFRAME_WALLET;

export const ethProvidersOverrides = JSON.parse(
  process.env.REACT_APP_ETH_PROVIDERS || '{}'
);

export { TransferStates, TRANSFER_STATES };
