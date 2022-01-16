# Olympus Liquidity Subgraph

Subgraph to discover and gather data for Olympus liquidity, intended to be deployed in all the chains were we are present.

Functionality:
- Autodiscover liquidity pools via Factory
- Calculate LP Pair Volume
- Calculate LP Pair Liquidity
- Calculate Fees earned by Olympus Treasury


## Development

Modify `subgraph.yaml` and `src/utils/Constants.ts` to adapt to the contracts of each chain.


## URLs
- [Ethereum](https://thegraph.com/hosted-service/subgraph/drondin/olympus-liquidity-ethereum)
- [Avalanche](https://thegraph.com/hosted-service/subgraph/drondin/olympus-liquidity-avalanche)

//TODO https://snowtrace.io/address/0xe65c29f1c40b52cf3a601a60df6ad37c59af1261#readContract