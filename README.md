![alt text](https://github.com/connext/spacefold/blob/master/public/SpacefoldLogoPurple.png?raw=true)

# Spacefold

[Spacefold](https://spacefold.io) is a demo and reference implementation of instant cross-evm-chain communication using Connext! Spacefold was built as part of [The Great Reddit Scaling Bake-Off](https://www.reddit.com/r/ethereum/comments/hbjx25/the_great_reddit_scaling_bakeoff/) in July 2020.

### Quick Resources

- You can read more about how to use Spacefold in our announcement post. //TODO
- Found a bug, want to learn more, or just say hello? [Join us in our discord](https://discord.gg/raNmNb5)!
- Learn more about Connext through [our docs](https://docs.connext.network), and by checking out [our monorepo](https://github.com/connext/indra).

### Introduction: "Hold up, how does this meet the Reddit requirements outlined above"?

Great question! It doesn't and it's not supposed to.

[Connext](https://connext.network) is the protocol for programmable p2p micropayments. Connext lets users make unbreakable commitments to each other using _state channels_ - these commitments are effectively free to create and send, but must be backed by funds locked up on (any) chain. Unlike other scalability solutions to Ethereum, we're not a consensus system (a blockchain, rollup, etc.), but a point-to-point communication network that enables extremely high volume, private, ultra-cheap transfers (and other more complex commitments) baked directly into existing web paradigms like HTTP requests. We do this specific activity in a way that is cheaper, simpler, and has much better UX than anything else that is out there.

One consequence of the above is that all actions taken within Connext are private to each user. This means that, while we can enable a high volume of Reddit Community Point _transfers_ at low cost, meeting Reddits requirements of scalably minting/burning their points can't be done in a way where subreddit users can actively monitor and interact with each others' balances. Those balances would be necessarily private.

The reality is that every solution has its tradeoffs. Rather than buiding a custom independent submission, we decided to explore mitigating these tradeoffs by combining different existing solutions to make something even better. The biggest vector for improvement we see is the usability and interoperability of new scale-by-more-chains-based approaches like rollups/plasma/sidechains/sharding.

Spacefold demonstrates how Connext can be used to build an **internet-of-l2-chains/shards**. Users can instantly and seamlessly transfer value between chains/shards, and eventually even make atomic cross-chain contract calls. Most importantly, this can happen in a way where users *dont need to know what chain/rollup/shard they are on to begin with*.

//TODO show diagram of cross chain

## Table of Contents

1. [Compatibility with Other Chains](https://github.com/connext/spacefold/blob/master/README.md#compatibility-with-other-chains)

2. [Running it Yourself](https://github.com/connext/spacefold/blob/master/README.md#run-it-yourself)

   a. [Setting Up the Demo Locally](https://github.com/connext/spacefold/blob/master/README.md#running-the-spacefold-demo-locally)

   b. [Running your own Connext Node on Multiple Chains](https://github.com/connext/spacefold/blob/master/README.md#running-your-own-connext-node-on-multiple-chains)

3. [How does it work?](https://github.com/connext/spacefold/blob/master/README.md#how-does-it-work)

   a. [Background on Connext](https://github.com/connext/spacefold/blob/master/README.md#a-quick-background-on-connext)

   b. [Cross-chain Transfers with Connext](https://github.com/connext/spacefold/blob/master/README.md#cross-chain-transfers-with-connext)

   c. [How Does it Scale?](https://github.com/connext/spacefold/blob/master/README.md#how-does-it-scale)

4. [Demo Implementation Details](https://github.com/connext/spacefold/blob/master/README.md#demo-implementation-details)

   a.

   b. Minting via a Faucet

   c. Functionality Limitations

5. Security, Trust Assumptions, and Other Considerations

6. FAQ

## Compatibility with Other Chains

In general, Connext can support any chain/l2/shard/rollup system that supports turing-complete computation. For limited cases, we may also be able to get away with non-turing-complete chains using a slightly different pattern for cross-chain transfers.

While the above is true, in the ideal case (to avoid custom work), it's best for Connext to work with Ethereum-like systems (that run the EVM and support Solidity). Running Connext on anything else would likely require lots of custom work.

To help with parsing out which solutions can and can't work with Connext, we've created a compatiblity table. **Note** this table is still a WIP while we get more information from teams. If you feel as though anything here was misrepresented, please submit an issue -- we're happy to amend!

|    Name   |        Type        |  EVM Compatible  | Supports `Create2` | Included in demo | Notes | Verdict |
|:---------:|:------------------:|:----------------:|:------------------:|:----------------:|-------|---------|
|   Matic   |    Plasma chain    |         ✔️        |          ✔️         |         ✔️        |       |    😍    |
|  Optimism |         ORU        |         ✔️        |          ✔️         |         ✔️        |       |    😍    |
|   SKALE   | Elastic Sidechains |         ✔️        |          ✔️         |         ✔️        |       |    😍    |
|    xDai   |    PoS Sidechain   |         ✔️        |          ✔️         |         ✔️        |       |    😍    |
|  Arbitrum |         ORU        |         ✔️        |          ✔️         |                  |       |    😍    |
|    OMG    |    Plasma chain    |         ✔️        |          🤷         |                  |  No confirmation from OMG team yet - we're assuming based on most plasma constructions    |    🙂     |
|   Hubble  |         ORU        | Can be supported |                    |                  |       |     🙂    |
|    Fuel   |         ORU        |  Planned for v2  |                    |                  |    While not currently supported, the Fuel team expressed interest in building support potentially earlier than their v2   |    🙂     |
| Starkware |        zkRU        |         ❌        |                    |                  |    No confirmation from team yet, we're assuming based on current zkRU limitations   |    🤷/☹️     |
|  Loopring |        zkRU        |         ❌        |                    |                  |    No confirmation from team yet, we're assuming based on current zkRU limitations  |    🤷/☹️    |
|  zkSync |        zkRU        |         ❌        |                    |                  |    No confirmation from team yet, we're assuming based on current zkRU limitations  |    🤷/☹️     |

## Run it Yourself

### Running the Spacefold Demo Locally

The spacefold demo is pretty simple to run:

```bash
git clone git@github.com:connext/spacefold.git
cd spacefold
yarn start
```

By default, the demo will point to a Connext node that we're hosting at https://node.spacefold.io.

### Running your own Connext Node on Multiple Chains

Running your own Connext node locally is also pretty easy!

```bash
git clone git@github.com:connext/indra.git
cd indra
npm i
make start
```
If you run into trouble, there's more info here. //TODO

By default, this local node will spin up on a single testnet chain. You can point it at a remote chain (or multiple chains) by following the steps in this guide.

Lastly, your node can be deployed to a production environment by following [this guide](https://docs.connext.network/en/latest/how-to/deploy-indra.html).

## How does it work?

### A Quick Background on Connext

Connext is a network of *state channels*. The core concept behind a channel is very simple:
- Suppose you're paying your friend Bob for a metered service at the rate of $1 every minute.
- It would be silly to broadcast every transaction to the blockchain, you would incur lots of fees. At the same time, it also doesn't make sense to pay up front or pay at the end, as that would introduce new trust assumptions.
- Instead, what you can do is send your funds to a 2/2 multisig controlled by you and Bob. Then, rather than sending onchain transactions, you can send Bob ever updating signatures which give Bob *the ability* to withdraw up to a certain amount from the multisig.
- Because Bob *can* get his funds at any time using his unbreakable commitment from you, you complete a new payment to him every time you send a new signature.

// TODO diagram

Connext extends this concept in a couple of ways ways:

1. Updates within the channel can have any arbitrary conditionality to them. This means you could make your payments conditional upon Bob providing a proof of his work, or based on some real world event, or even based on the outcome of a chess game.

2. More importantly: the above paradigm requires you to deploy a new multisig with each new person you transact with. Using the conditionality described above, Connext instead lets you use your channel with Bob to atomically interact with anyone that Bob also has a channel with. For instance, you pay Bob $1, who pays Charlie $0.9999 (Bob takes a microfee), who pays Danielle $0.9998 (Charlie takes a microfee).

There's a lot more information available publicly on state channels, here are some great resources:
- [State channels for babies](https://medium.com/connext/state-channels-for-babies-c39a8001d9af)
- [Counterfactual for dummies](https://medium.com/blockchannel/counterfactual-for-dummies-part-1-8ff164f78540)
- [EthHub](https://docs.ethhub.io/ethereum-roadmap/layer-2-scaling/state-channels/)

### Cross-chain Transfers with Connext

One big hurdle that we encountered when building our network was the difficulty of managing interactions that could be on different chains or different currencies. This is why, in addition to the above we extend basic channels in another way:

Because of the fact that channels are simple primitives and what links them together is *offchain* communitcation, it's possible to transact to Danielle regardless of where Bob and Charlie's channels are or what currency they're using. This means you can pay Bob on Ethereum in Eth, who pays Charlie on Matic in MATIC, who pays Danielle on Arbitrum in aDai, who in turn calls the Uniswap contract running on Optimism on your behalf. This is best shown via the following diagram:

### How Does it Scale?

What you're effectively doing above is freezing funds on an existing ledger and commiting to peers that you will pay them out of those funds (sort of like the Gas Station Network, but no one actually *needs* to submit the transactions to chain unless they want to).

This means that some specific types of activities (anything that is point-to-point and doesn't require global consensus), you are now entirely unconstrained by the limitations of blockchains. Updates in state channels can happen as fast as HTTP messages because... well, they can literally be HTTP messages.

There are of course some limitations, however, which are discussed later in this readme.

## Demo Implementation Details
