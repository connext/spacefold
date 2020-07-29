![alt text](https://github.com/connext/spacefold/blob/master/public/spacefoldlogo.png?raw=true)

# Spacefold
Spacefold is a demo and reference implementation of instant cross-evm-chain communication using Connext! Spacefold was built as part of [The Great Reddit Scaling Bake-Off](https://www.reddit.com/r/ethereum/comments/hbjx25/the_great_reddit_scaling_bakeoff/) in July 2020.

### Introduction. AKA: "Hold up, how does this meet the Reddit rquirements outlined above"?
Great question! It doesn't and it's not supposed to.

Connext is a protocol for programmable p2p micropayments and cross-chain communication. Connext lets users make unbreakable commitments to each other using _state channels_ - these commitments are effectively free to create and send, but must be backed by funds locked up on (some) chain. Structurally, this makes Connext look and behave lot more like TCP/IP (for value) and a lot less like Ethereum.

One consequence of the above is that all actions taken within a channel is necessarily private to the participants of that channel. This means that, while we can enable an (extremely) high volume of Reddit Community Point *transfers* at low cost, meeting Reddits requirements of scalably minting/burning their points couldn't be done in a way where subreddit users could actively monitor and interact with each others' balances. Those balances would have to be private to each user.

Rather than build an entirely custom implementation, we decided to collaborate with existing solutions to make the whole ecosystem better. Most other approaches to scaling move to an EVM-like computing environment (basically a separate chain), with some mechanism to guarantee finality on mainnet. These mechanisms always involve timeut windows where user funds are locked, which limits interoperability to base chains and makes the process of on/offboarding from the L2 system a giant pain for users.

Spacefold demonstrates Connext's solution to this. Users can use state channels -- which have fantastic on/offboarding -- to transfer funds (and eventually make atomic contract calls) across chains and **most importantly** do so in a way where users *dont need to know or care what chain/rollup/shard/L2 they're on*.
