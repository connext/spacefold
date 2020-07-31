![alt text](https://github.com/connext/spacefold/blob/master/public/SpacefoldLogoPurple.png?raw=true)

# Spacefold

[Spacefold](https://spacefold.io) is a demo and reference implementation of instant cross-evm-chain communication using Connext! Spacefold was built as part of [The Great Reddit Scaling Bake-Off](https://www.reddit.com/r/ethereum/comments/hbjx25/the_great_reddit_scaling_bakeoff/) in July 2020.

### Quick Resources

- You can read more about how to use Spacefold in our announcement post. //TODO
- Found a bug, want to learn more, or just say hello? [Join us in our discord](https://discord.gg/raNmNb5)!
- Learn more about Connext through [our docs](https://docs.connext.network), and by checking out [our monorepo](https://github.com/connext/indra).

### Introduction: "Hold up, how does this meet the Reddit requirements outlined above"?

Great question! It doesn't and it's not supposed to.

[Connext](https://connext.network) is a protocol for programmable p2p micropayments and cross-chain communication. Connext lets users make unbreakable commitments to each other using _state channels_ - these commitments are effectively free to create and send, but must be backed by funds locked up on (some) chain. Structurally, this makes Connext look and behave lot more like TCP/IP (for value) and a lot less like Ethereum.

One consequence of the above is that all actions taken within a channel is necessarily private to the participants of that channel. This means that, while we can enable an (extremely) high volume of Reddit Community Point _transfers_ at low cost, meeting Reddits requirements of scalably minting/burning their points couldn't be done in a way where subreddit users could actively monitor and interact with each others' balances. Those balances would have to be private to each user.

Rather than build an entirely custom implementation, we decided to collaborate with existing solutions to make the whole ecosystem better. Most other approaches to scaling move to an EVM-like computing environment (basically a separate chain), with some mechanism to guarantee finality on mainnet. These mechanisms always involve timeut windows where user funds are locked, which limits interoperability to base chains and makes the process of on/offboarding from the L2 system a giant pain for users.

Spacefold demonstrates Connext's solution to this. Users can use state channels -- which have fantastic on/offboarding -- to transfer funds (and eventually make atomic contract calls) across chains and **most importantly** do so in a way where users _dont need to know or care what chain/rollup/shard/L2 they're on_.

//TODO show diagram of cross chain

## Table of Contents

1. Compatibility with Other Chains

2. Running it Yourself

   a. Setting Up the Demo Locally

   b. Running your own Connext Node on Multiple Chains

3. How does it work?

   a. Background on Connext

   b. Cross-chain transfers with Connext

4. Demo Implementation Details

   a.

   b. Minting via a Faucet

   c. Functionality Limitations

5. Security, Trust Assumptions, and Other Considerations

6. FAQ

## 1. Compatibility with Other Chains

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

## 2. Run it Yourself

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

By default, this local node will spin up on a single testnet chain. You can point it at a remote chain (or multiple chains) by following the steps in [this guide](https://github.com/connext/indra#launch-indra-in-developer-mode).

Lastly, your node can be deployed to a production environment by following [this guide](https://docs.connext.network/en/latest/how-to/deploy-indra.html).

## 3. How does it work?

### A Quick Background on Connext

Connext is a state channel network.
