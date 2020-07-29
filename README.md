![alt text](https://github.com/connext/spacefold/blob/master/public/spacefoldlogopurple.png?raw=true)

# Spacefold
[Spacefold](https://spacefold.io) is a demo and reference implementation of instant cross-evm-chain communication using Connext! Spacefold was built as part of [The Great Reddit Scaling Bake-Off](https://www.reddit.com/r/ethereum/comments/hbjx25/the_great_reddit_scaling_bakeoff/) in July 2020.

You can read more about how to use Spacefold in our announcement post. //TODO

Found a bug, want to learn more, or just say hello? [Join us in our discord](https://discord.gg/raNmNb5)!

### Introduction: "Hold up, how does this meet the Reddit requirements outlined above"?
Great question! It doesn't and it's not supposed to.

[Connext](https://connext.network) is a protocol for programmable p2p micropayments and cross-chain communication. Connext lets users make unbreakable commitments to each other using _state channels_ - these commitments are effectively free to create and send, but must be backed by funds locked up on (some) chain. Structurally, this makes Connext look and behave lot more like TCP/IP (for value) and a lot less like Ethereum.

One consequence of the above is that all actions taken within a channel is necessarily private to the participants of that channel. This means that, while we can enable an (extremely) high volume of Reddit Community Point *transfers* at low cost, meeting Reddits requirements of scalably minting/burning their points couldn't be done in a way where subreddit users could actively monitor and interact with each others' balances. Those balances would have to be private to each user.

Rather than build an entirely custom implementation, we decided to collaborate with existing solutions to make the whole ecosystem better. Most other approaches to scaling move to an EVM-like computing environment (basically a separate chain), with some mechanism to guarantee finality on mainnet. These mechanisms always involve timeut windows where user funds are locked, which limits interoperability to base chains and makes the process of on/offboarding from the L2 system a giant pain for users.

Spacefold demonstrates Connext's solution to this. Users can use state channels -- which have fantastic on/offboarding -- to transfer funds (and eventually make atomic contract calls) across chains and **most importantly** do so in a way where users *dont need to know or care what chain/rollup/shard/L2 they're on*.

//TODO show diagram of cross chain

## Table of Contents
1. Compatibility with Other Chains

2. Running it Yourself

    a. Setting Up the Demo Locally
    
    b. Running your own Connext Node on Multiple Chains
    
3. Demo implementation details

    a. Minting via a Faucet
    
    b. Functionality Limitations
    
3. How does it work?

    a. Background on Connext
    
    b. Cross-chain transfers with Connext
    
4. Security and Trust Assumptions

## Compatibility with Other Chains
In general, Connext can support any chain/l2/shard/rollup system that supports turing-complete computation. For limited cases, we may also be able to get away with non-turing-complete chains using a slightly different pattern for cross-chain transfers.

While the above is true, in the ideal case (to avoid custom work), it's best for Connext to work with Ethereum-like systems (that run the EVM and support Solidity). Running Connext on anything else would likely require lots of custom work. 

To help with parsing out which solutions can and can't work with Connext, we've created an easy-to-parse compatiblity chart: //TODO

Spacefold demonstrates the following out-of-the-box integrations with several chains and scalability solutions:

### L2/Scalability Chains
**Matic Mumbai Testnet**
ChainId:
Website:
Type: Plasma chain
Reddit Submission:

**xDai Mainnet**
ChainId:
Website:
Type: PoS sidechain
Reddit Submission:

**SKALE Public Testnet**
ChainId:
Website:
Type: Elastic sidechains with BLS signature validation on Ethereum
Reddit Submission:

**Optimism Hosted Testnet**
ChainId:
Website:
Type: Optimistic rollup

**Arbitrum Hosted Testnet**
ChainId:
Website:
Type: Optimistic rollup

### Other Chains
**Rinkeby (Ethereum testnet)**
ChainId: `4`
Website: https://www.rinkeby.io/#stats

**Kovan (Ethereum testnet)**
ChainId:
Website

**Goerli (Ethereum testnet)**
ChainId:
Website

**Ethereum Classic (mainnet)**
ChainId:
Website:

Other solutions that are out there:
