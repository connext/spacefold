import {
  LoadingOutlined,
  CheckCircleFilled,
  EllipsisOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

export const tokenSelectStyles = {
  control: (base: any) => ({
    ...base,
    background: "transparent",
    border: "none",
    height: "40px!important",
    minHeight: "20px!important",
    // border: "1px solid #bbc0c5",
    fontSize: "20px",
    // padding: "6px 3px",
    display: "flex",
    flex: "0 0 auto",
    boxShadow: "none",
    cursor: "pointer",
  }),
  valueContainer: (base: any) => ({
    ...base,
    justifyContent: "center",
  }),
  menu: (base: any) => ({
    ...base,
    margin: 0,
  }),
  menuList: (base: any) => ({
    ...base,
    maxHeight: "100%",
  }),
  option: (base: any) => ({
    ...base,
    backgroundColor: "#FFFFFF",
    // color: "#505D68",
    maxheight: "20px",
    textAlign: "left",
    cursor: "pointer",
  }),
  indicatorSeparator: (base: any) => ({
    width: 0,
  }),
};

const networkIndicator = {
  fontStyle: "normal",
  fontWeight: "normal",
  fontSize: "0.625rem",
  lineHeight: "140%",
  display: "flex",
  alignItems: "center",
};

export const networkSelectStyles = {
  control: (base: any) => ({
    ...base,
    background: "transparent",
    minWidth: "20px",
    minHeight: "20px!important",
    border: "1px solid #bbc0c5",
    borderRadius: "16px",
    display: "flex",
    flex: "0 0 auto",
    boxShadow: "none",
    cursor: "pointer",
  }),
  valueContainer: (base: any) => ({
    ...base,
    justifyContent: "center",
  }),
  menu: (base: any) => ({
    ...base,
    // ...networkIndicator,
    margin: 0,
  }),
  menuList: (base: any) => ({
    ...base,
    maxHeight: "100%",
  }),
  option: (base: any) => ({
    ...base,
    backgroundColor: "#FFFFFF",
    maxheight: "20px",
    textAlign: "left",
    cursor: "pointer",
  }),
  indicatorSeparator: (base: any) => ({
    width: 0,
  }),
};

export const LOCAL_STORAGE_VERSION = "1";
export const MINIMUM_BALANCE = 0.001;

export const CURRENT = {
  DEPOSIT: 0,
  TRANSFER: 1,
  WITHDRAW: 2,
};

export interface STATUS_TYPE {
  WAIT: "wait";
  PROCESS: "process";
  FINISH: "finish";
  ERROR: "error";
}

export const STATUS: STATUS_TYPE = {
  WAIT: "wait",
  PROCESS: "process",
  FINISH: "finish",
  ERROR: "error",
};

export interface TOKEN {
  name: string;
  icon: string;
  background: string;
  address: string;
}

export interface ENV {
  chainId: number;
  name: string;
  icon: string;
  tokens: TOKEN[];
  color: string;
  ethProviderUrl: string;
  blockchainExplorerURL: string;
}

const RINKEBY_TOKENS: TOKEN[] = [
  {
    name: "ETH",
    icon: "/images/eth.png",
    background: "/images/rinkebyBackground.png",
    address: "0x0000000000000000000000000000000000000000",
  },
  // {
  //   name: "MOON",
  //   icon: "/images/moon.png",
  //   background: "/images/rinkebyBackground.png",
  //   address: "0x50C94BeCAd95bEe21aF226dc799365Ee6B134459",
  // },
];

const KOVAN_TOKENS: TOKEN[] = [
  {
    name: "ETH",
    icon: "/images/eth.png",
    background: "/images/rinkebyBackground.png",
    address: "0x0000000000000000000000000000000000000000",
  },
  // {
  //   name: "MOON",
  //   icon: "/images/moon.png",
  //   background: "/images/rinkebyBackground.png",
  //   address: "0x50C94BeCAd95bEe21aF226dc799365Ee6B134459",
  // },
];

const GOERLI_TOKENS: TOKEN[] = [
  // {
  //   name: "ETH",
  //   icon: "/images/eth.png",
  //   background: "/images/rinkebyBackground.png",
  //   address: "0x0000000000000000000000000000000000000000",
  // },
  {
    name: "DERC20",
    icon: "/images/moon.png",
    background: "/images/maticBackground.png",
    address: "0x655F2166b0709cd575202630952D71E2bB0d61Af",
  },
  // {
  //   name: "MOON",
  //   icon: "/images/moon.png",
  //   background: "/images/rinkebyBackground.png",
  //   address: "0x50C94BeCAd95bEe21aF226dc799365Ee6B134459",
  // },
];
const MATIC_TOKENS: TOKEN[] = [
  {
    name: "DERC20",
    icon: "/images/moon.png",
    background: "/images/maticBackground.png",
    address: "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1",
  },
  // {
  //   name: "ETH",
  //   icon: "/images/eth.png",
  //   background: "/images/maticBackground.png",
  //   address: "0x0000000000000000000000000000000000000000",
  // },
  // {
  //   name: "MOON",
  //   icon: "/images/moon.png",
  //   background: "/images/rinkebyBackground.png",
  //   address: "0x50C94BeCAd95bEe21aF226dc799365Ee6B134459",
  // },
];

export const ENVIRONMENT: ENV[] = [
  {
    chainId: 5,
    name: "Goerli",
    tokens: GOERLI_TOKENS,
    icon: "/images/brickBackground.png",
    color: "#0091F2",
    ethProviderUrl: `https://goerli.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
    blockchainExplorerURL: `https://goerli.etherscan.io/tx/`,
  },
  {
    chainId: 80001,
    name: "Matic Testnet",
    tokens: MATIC_TOKENS,
    icon: "/images/rinkebyBackground.png",
    color: "#2b6def",
    ethProviderUrl: `https://rpc-mumbai.matic.today`,
    blockchainExplorerURL:
      "https://mumbai-explorer.matic.today/tx/",
  },
  {
    chainId: 4,
    name: "Rinkeby",
    tokens: RINKEBY_TOKENS,
    icon: "/images/brickBackground.png",
    color: "#EFC45C",
    ethProviderUrl: `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
    blockchainExplorerURL: `https://rinkeby.etherscan.io/tx/`,
  },
  {
    chainId: 42,
    name: "Kovan",
    tokens: KOVAN_TOKENS,
    icon: "/images/rinkebyBackground.png",
    color: "#5b32a2",
    ethProviderUrl: `https://kovan.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
    blockchainExplorerURL: `https://kovan.etherscan.io/tx/`,
  },
];

// local env
// export const ENVIRONMENT: ENV[] = [
//   {
//     chainId: 1337,
//     name: "Local 1337",
//     tokens: RINKEBY_TOKENS,
//     icon: "/images/brickBackground.png",
//     color: "#EFC45C",
//     ethProviderUrl: `http://localhost:8545`,
//     blockchainExplorerURL: "https://rinkeby.etherscan.io/tx/{TRANSACTION_HASH}",
//   },
//   {
//     chainId: 1338,
//     name: "Local 1338",
//     tokens: KOVAN_TOKENS,
//     icon: "/images/rinkebyBackground.png",
//     color: "#5b32a2",
//     ethProviderUrl: `http://localhost:8546`,
//     blockchainExplorerURL: "https://kovan.etherscan.io/tx/{TRANSACTION_HASH}",
//   },
// ];

export const IMAGE_PATH = {
  icon: {
    eth: "/images/eth.png",
    moon: "/images/moon.png",
    brick: "/images/brick.png",
  },
  background: {
    optimism: "/images/optimismBackground.png",
    rinkeby: "/images/rinkebyBackground.png",
    brick: "/images/brickBackground.png",
    skale: "/images/skaleBackground.png",
    xDai: "/images/xDaiBackground.png",
    matic: "/images/maticBackground.png",
  },
  status: {
    transferDisabled: "/images/transferDisabled.png",
    dropdownDisabled: "/images/dropdownDisabled.png",
  },
  gifs: {
    loading: "/images/loading.gif",
    transfer: "/images/transfer.gif",
    dropdown: "/images/dropdown.gif",
    spinningGear: "/images/spinningGear.gif",
    ellipsis: "/images/ellipsis.gif",
  },
};

export const TOKENS = {
  4: {
    tokenName: "MOON",
    tokenIcon: IMAGE_PATH.icon.moon,
    tokenBackground: IMAGE_PATH.background.rinkeby,
    tokenAddress: "0x50C94BeCAd95bEe21aF226dc799365Ee6B134459",
    chainId: 4,
    name: "Rinkeby",
    color: "#EFC45C",
    ethProviderUrl: `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
    blockchainExplorerURL: "https://rinkeby.etherscan.io/tx/{TRANSACTION_HASH}",
  },
  // 5: {
  //   tokenName: "ETH",
  //   tokenIcon: ethIcon,
  //   tokenBackground: ethBackground,
  //   tokenAddress: constants.AddressZero,
  //   chainId: 5,
  //   name: "Goerli",
  //   color: "#0091F2",
  //   ethProviderUrl: `https://goerli.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
  //   blockchainExplorerURL: "https://goerli.etherscan.io/tx/{TRANSACTION_HASH}",
  // },
  42: {
    tokenName: "BRICK",
    tokenIcon: IMAGE_PATH.icon.brick,
    tokenBackground: IMAGE_PATH.background.brick,
    tokenAddress: "0x4d4deb65DBC13dE6811095baba7064B41A72D9Db",
    chainId: 42,
    name: "Kovan",
    color: "#5b32a2",
    ethProviderUrl: `https://kovan.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`,
    blockchainExplorerURL: "https://kovan.etherscan.io/tx/{TRANSACTION_HASH}",
  },
  // 61: {
  //   tokenName: "TOKEN",
  //   tokenIcon: ethIcon,
  //   tokenBackground: ethBackground,
  //   tokenAddress: "0xf502A7897a49A9daFa5542203746Bad6C6E86c11",
  //   chainId: 61,
  //   name: "ETC",
  //   color: "#01C853",
  //   ethProviderUrl: `https://www.ethercluster.com/etc`,
  //   blockchainExplorerURL:
  //     "https://blockscout.com/etc/mainnet/tx/{TRANSACTION_HASH}/token_transfers",
  // },
  // 100: {
  //   tokenName: "xBRICKS",
  //   tokenIcon: brickIcon,
  //   tokenBackground: xDaiBackground,
  //   tokenAddress: "0xf502A7897a49A9daFa5542203746Bad6C6E86c11",
  //   chainId: 100,
  //   name: "xDAI",
  //   color: "#01C853",
  //   ethProviderUrl: `https://xdai.poanetwork.dev`,
  //   blockchainExplorerURL:
  //     "https://blockscout.com/poa/xdai/tx/{TRANSACTION_HASH}/token_transfers",
  // },
  // 80001: {
  //   tokenName: "mTOKEN",
  //   tokenIcon: moonIcon,
  //   tokenBackground: maticBackground,
  //   tokenAddress: "0xf502A7897a49A9daFa5542203746Bad6C6E86c11",
  //   chainId: 80001,
  //   name: "Matic",
  //   color: "#2b6def",
  //   ethProviderUrl: `https://rpc-mumbai.matic.today`,
  //   blockchainExplorerURL:
  //     "https://mumbai-explorer.matic.today/tx/{TRANSACTION_HASH}/token_transfers",
  // },
  // 346750: {
  //   tokenName: "sTOKEN",
  //   tokenIcon: ethIcon,
  //   tokenBackground: skaleBackground,
  //   tokenAddress: "0xf502A7897a49A9daFa5542203746Bad6C6E86c11",
  //   chainId: 16,
  //   name: "SKALE",
  //   color: "#000000",
  //   ethProviderUrl: `https://dev-testnet-v1-1.skalelabs.com`,
  //   blockchainExplorerURL: null,
  // },
  // 108: {
  //   tokenName: "oMOON",
  //   tokenIcon: moonIcon,
  //   tokenBackground: optimismBackground,
  //   tokenAddress: "0x9313b03453730D296EC4A62b6f3Fc758A9D1d199",
  //   chainId: 108,
  //   name: "Optimism",
  //   color: "#F50025",
  //   ethProviderUrl: `https://connext.optimism.io`,
  //   blockchainExplorerURL: null,
  // },
};
