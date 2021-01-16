![alt text](https://github.com/connext/spacefold/blob/master/public/SpacefoldLogoPurple.png?raw=true)

# Spacefold

[Spacefold](https://spacefold.io) is a demo and reference implementation of instant cross-evm-chain communication using Connext! Spacefold was built as part of [The Great Reddit Scaling Bake-Off](https://www.reddit.com/r/ethereum/comments/hbjx25/the_great_reddit_scaling_bakeoff/) in July 2020.

Here's [our official submission to the /r/ethereum subreddit](https://www.reddit.com/r/ethereum/comments/i1eooc/spacefold_connexts_submission_to_the_great_reddit/)!

### Quick Resources

- You can read more about how to use Spacefold in [our announcement post](https://medium.com/connext/introducing-spacefold-d1c227a29d3)
- Found a bug, want to learn more, or just say hello? [Join us in our discord](https://discord.gg/raNmNb5)!
- Learn more about Connext through [our docs](https://docs.connext.network), and by checking out [our monorepo](https://github.com/connext/indra)

### Introduction: "Hold up, how does this meet the Reddit requirements outlined above"?

Great question! It doesn't and it's not supposed to.

[Connext](https://connext.network) is the protocol for programmable p2p micropayments. Connext lets users make unbreakable commitments to each other using _state channels_ - these commitments are effectively free to create and send, but must be backed by funds locked up on (any) chain. Unlike other scalability solutions to Ethereum, we're not a consensus system (a blockchain, rollup, etc.), but a point-to-point communication network that enables extremely high volume, private, ultra-cheap transfers (and other more complex commitments) baked directly into existing web paradigms like HTTP requests.

One consequence of the above is that all actions taken within Connext are private to each user. This means that, while we can enable a high volume of Reddit Community Point _transfers_ at low cost, meeting Reddits requirements of scalably minting/burning their points can't be done in a way where subreddit users can actively monitor and interact with each others' balances. Those balances would be necessarily private.

The reality is that every solution has its tradeoffs. Rather than building a custom independent submission, we decided to experiment with mitigating these tradeoffs by combining different existing solutions to make something even better. The biggest vector for improvement we see is the usability and interoperability of new scale-by-more-chains-based approaches like rollups/plasma/sidechains/sharding.

Spacefold demonstrates how Connext can be used to build an **internet-of-l2-chains/shards**. Users can instantly and seamlessly transfer value between chains/shards, and eventually even make atomic cross-chain contract calls. Most importantly, this can happen in a way where users _dont need to know what chain/rollup/shard they are on to begin with_.

## Table of Contents

1. [Compatibility with Other Chains](https://github.com/connext/spacefold/blob/master/README.md#compatibility-with-other-chains)

2. [Running it Yourself](https://github.com/connext/spacefold/blob/master/README.md#run-it-yourself)

   a. [Setting Up the Demo Locally](https://github.com/connext/spacefold/blob/master/README.md#running-the-spacefold-demo-locally)

   b. [Running your own Connext Node on Multiple Chains](https://github.com/connext/spacefold/blob/master/README.md#running-your-own-connext-node-on-multiple-chains)

3. [How Does it Work?](https://github.com/connext/spacefold/blob/master/README.md#how-does-it-work)

   a. [Background on Connext](https://github.com/connext/spacefold/blob/master/README.md#a-quick-background-on-connext)

   b. [Cross-chain Transfers with Connext](https://github.com/connext/spacefold/blob/master/README.md#cross-chain-transfers-with-connext)

   c. [How Does it Scale?](https://github.com/connext/spacefold/blob/master/README.md#how-does-it-scale)

4. [Demo Implementation Details](https://github.com/connext/spacefold/blob/master/README.md#demo-implementation-details)

5. [Trust Assumptions and Other Considerations](https://github.com/connext/spacefold/blob/master/README.md#trust-assumptions-and-considerations)

## Compatibility with Other Chains

In general, Connext can support any chain/l2/shard/rollup system that supports turing-complete computation. For limited cases, we may also be able to get away with non-turing-complete chains using a slightly different pattern for cross-chain transfers.

While the above is true, in the ideal case (to avoid custom work), it's best for Connext to work with Ethereum-like systems (that run the EVM and support Solidity). Running Connext on anything else would likely require lots of custom work.

To help with parsing out which solutions can and can't work with Connext, we've created a compatiblity table. **Note** this table is still a WIP while we get more information from teams. If you feel as though anything here was misrepresented, please submit an issue -- we're happy to amend!

|   Name    |        Type        |  EVM Compatible  | Supports `Create2` | Included in demo | Notes                                                                                                                 | Verdict |
| :-------: | :----------------: | :--------------: | :----------------: | :--------------: | --------------------------------------------------------------------------------------------------------------------- | ------- |
|   Matic   |    Plasma chain    |        ✔️        |         ✔️         |        ✔️        |                                                                                                                       | 😍      |
| Optimism  |        ORU         |        ✔️        |         ✔️         |        ✔️        |                                                                                                                       | 😍      |
|   xDai    |   PoS Sidechain    |        ✔️        |         ✔️         |        ✔️        |                                                                                                                       | 😍      |
|   SKALE   | Elastic Sidechains |        ✔️        |         ✔️         |   Coming soon    |                                                                                                                       | 😍      |
| Arbitrum  |        ORU         |        ✔️        |         ✔️         |   Coming soon    |                                                                                                                       | 😍      |
|    OMG    |    Plasma chain    |        ✔️        |         🤷         |                  | No confirmation from OMG team yet - we're assuming based on most plasma constructions                                 | 🙂      |
|  Hubble   |        ORU         | Can be supported |                    |                  |                                                                                                                       | 🙂      |
|   Fuel    |        ORU         |  Planned for v2  |                    |                  | While not currently supported, the Fuel team expressed interest in building support potentially earlier than their v2 | 🙂      |
| Starkware |        zkRU        |        ❌        |                    |                  | No confirmation from team yet, we're assuming based on current zkRU limitations                                       | 🤷/☹️   |
| Loopring  |        zkRU        |        ❌        |                    |                  | No confirmation from team yet, we're assuming based on current zkRU limitations                                       | 🤷/☹️   |
|  zkSync   |        zkRU        |        ❌        |                    |                  | No confirmation from team yet, we're assuming based on current zkRU limitations                                       | 🤷/☹️   |

## Run it Yourself

### Running the Spacefold Demo Locally

The spacefold demo is pretty simple to run:

```bash
git clone git@github.com:connext/spacefold.git
cd spacefold
```

By default, the demo will point to a Connext node that we're hosting at https://node.spacefold.io.

You'll need a few environment variables to start the demo.

1. `NEXT_PUBLIC_CHAIN_PROVIDERS=` -- JSON string to provide node URLs with chains, i.e. '{"4":"https://rinkeby.infura.io/v3/...","5":"https://goerli.infura.io/v3/...","42":"https://kovan.infura.io/v3/...","80001":"https://rpc-mumbai.matic.today"}'

Then,

```
yarn && yarn dev
```

### Running your own Connext Node on Multiple Chains

Running your own Connext node locally is also pretty easy!

```bash
git clone git@github.com:connext/vector.git
cd vector
make # this will take a while
make start-trio
```

Please refer to our [docs](https://docs.connext.network) for more info, or ping us in our Discord!

## How does it work?

### A Quick Background on Connext

Connext is a network of _state channels_. The core concept behind a channel is very simple:

- Suppose you're paying your friend Bob for a metered service at the rate of \$1 every minute.
- It would be silly to broadcast every transaction to the blockchain, you would incur lots of fees. At the same time, it also doesn't make sense to pay up front or pay at the end, as that would introduce new trust assumptions.
- Instead, what you can do is send your funds to a 2/2 multisig controlled by you and Bob. Then, rather than sending onchain transactions, you can send Bob ever updating signatures which give Bob _the ability_ to withdraw up to a certain amount from the multisig.
- Because Bob _can_ get his funds at any time using his unbreakable commitment from you, you complete a new payment to him every time you send a new signature.

![alt text](https://github.com/connext/spacefold/blob/master/public/BasicChannel.png?raw=true)

Connext extends this concept in a couple of ways ways:

1. Updates within the channel can have any arbitrary conditionality to them. This means you could make your payments conditional upon Bob providing a proof of his work, or based on some real world event, or even based on the outcome of a chess game.

2. More importantly: the above paradigm requires you to deploy a new multisig with each new person you transact with. Using the conditionality described above, Connext instead lets you use your channel with Bob to atomically interact with anyone that Bob also has a channel with. For instance, you pay Bob $1, who pays Charlie $0.9999 (Bob takes a microfee), who pays Danielle \$0.9998 (Charlie takes a microfee).

There's a lot more information available publicly on state channels, here are some great resources:

- [State channels for babies](https://medium.com/connext/state-channels-for-babies-c39a8001d9af)
- [Counterfactual for dummies](https://medium.com/blockchannel/counterfactual-for-dummies-part-1-8ff164f78540)
- [EthHub](https://docs.ethhub.io/ethereum-roadmap/layer-2-scaling/state-channels/)

### Cross-chain Transfers with Connext

One big hurdle that we encountered when building our network was the difficulty of managing interactions that could be on different chains or different currencies. This is why, in addition to the above we extend basic channels in another way:

Because of the fact that channels are simple primitives and what links them together is _offchain_ communication, it's possible to transact to Danielle regardless of where Bob and Charlie's channels are or what currency they're using. This means you can pay Bob on Ethereum in Eth, who pays Charlie on Matic in MATIC, who pays Danielle on Arbitrum in aDai, who in turn calls the Uniswap contract running on Optimism on your behalf. This is best shown via the following diagram:

![alt text](https://github.com/connext/spacefold/blob/master/public/Crosschain.png?raw=true)

### How Does it Scale?

What you're effectively doing above is freezing funds on an existing ledger and committing to peers that you will pay them out of those funds (sort of like the Gas Station Network, but no one actually _needs_ to submit the transactions to chain unless they want to).

This means that some specific types of activities (anything that is point-to-point and doesn't require global consensus), you are now entirely unconstrained by the limitations of blockchains. Updates in state channels can happen as fast as HTTP messages because... well, they can literally be HTTP messages.

There are of course some limitations, however, which are discussed later in this readme.

## Demo Implementation Details

For the purposes of the demo, we've made some simplifying assumptions:

1. We mint for users using a faucet instead of letting them deposit their own assets. We found that the user experience of getting assets to different chains to test folding with was really poor and took away from the substance of the demo. If spacefold existed as a standalone production app, it would be much easier for users to get value to these other l2s in the first place. 🤔

2. For Optimism, we're using a temporary testnet chain hosted by the team themselves. At the moment, a public testnet does not exist.

3. Throughout the demo, we use a dummy ERC20 token with a 1:1 swap rate. We considered using Eth for some chains, but decided against it because then we would need to do lots of social verification in a short time to get Eth liquidity and our team only has so many twitter accounts.

4. We decided against showing mainnet in the demo -- at the time of writing, mainnet gas fees are at 62 gwei. While this code can definitely be run on mainnet, we thought that the it would be annoying for users who just want to understand how it works to have to wait several minutes for a faucet transaction.

5. There's a LOT more functionality that Connext enables. Even if you're using Connext primarily to bridge between chains, it can be **highly** cost effective to also use it to further reduce the costs of transfers of tokens like Community points. You can also do more complex constructions such as bounties, or token-proportional content investing. We've left these things out of the demo to specifically highlight the cross-chain functionality.

## Trust Assumptions and Considerations

### Trust Vectors

Connext is _entirely_ noncustodial for users. No matter what happens, users are always able to withdraw their balance to whatever chain(s) they are actively participating in.

This comes with a couple of caveats, however:

1. First, users need to hold their latest offchain state to withdraw with. This is typically referred to as the "data availability problem" for solutions like state channels and plasma (as contrasted to solutions that post data to chain -- i.e. rollups). In practice, we've found that this is actually not as big of a problem for users as people think it is, particularly if users are utilizing authenticated sessions. This data storage can also be easily decentralized and outsourced to remote backup providers to ensure user funds remain secure.

2. Second, users need to monitor the chain to respond to any potential disputes. This is a similar pattern to what users have to do for plasma and optimistic rollup chains. Similar to those approaches, monitoring the chain can be outsourced to third parties who do it as a service (typically referred to as Watchtowers). [We have an open source implementation of a watchtower module which can be dropped into any service](https://github.com/connext/indra/tree/staging/modules/watcher).

Both of the above problems can be solved in pretty elegant ways in the long run. You can use watchtower pools to back up state -- these can utilize eventually-consistent persistent store systems like IPFS which take in anonymized data plus run our watcher interface. The pools can be held economically liable through value staked upfront on-chain, which is slashed upon pool misbehavior.

In return for these caveats, channels give unparalleled UX. Unless all communication has broken down and you're actively in dispute, getting into and out of a channel is a single onchain transaction, which can also be **entirely gas abstracted** (as is the case with Connext). You can also onboard users to channels in sticky ways -- for instance, we support referral codes that implementers can create (or users can generate for each other) which create/fund a channel.

### Censorship

Because state channel networks are _not consensus systems_ but are instead structurally similar to TCP/IP, the potential exists for censorship by intermediary routers.

This is true in the current implementation of Connext which features a hub-and-spoke pattern over many single nodes. In the current construction, one "full node" provider connects to many users (running fully validating, but browser-compatible light nodes) and acts as the primary router.

Our eventual goal is to move towards a pattern where routing nodes also all connect to each other. Then, censoring transactions becomes much much much tougher. Transfers can be routed over TOR using VPNs and pass through many routers before reaching a destination. They can also be broken up into many smaller transfers/updates which are all atomically routed over many different paths, exactly like how TCP works.

### Liquidity

Effectively what you're doing with Connext is doing many many tiny swaps between linked channels when you route a transfer or make an update. These swaps require collateral to happen trustlessly. This means that routing nodes in Connext are also liquidity providers earning fees for their service.

There's a lot of misinformation about the _amount_ and _extent_ to which liquidity is needed within channel networks. The reality is that it's very very hard to judge exactly how much, but as the network gets more connected and transaction volume increases, you start to see more and more transactions flowing in both directions within a routing channel. For each transfer, the node earns fees multiplicatively against the locked up collateral. From internal rough calculations made by some of our users the ROI generated here is _more than enough_ to offset liquidity costs and competitive with existing DeFi returns.

Aside from the cost of liquidity, the base cost of transfers is equal to the cost of bandwidth.
