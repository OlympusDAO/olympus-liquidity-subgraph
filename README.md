# Olympus Liquidity Subgraph

Subgraph to discover and gather data for Olympus liquidity, intended to be deployed in all the chains were we are present.

Functionality:
- Autodiscover liquidity pools via Factory
- Calculate LP Pair Volume
- Calculate Fees earned by Olympus Treasury


## Development

Modify `subgraph.yaml` and `src/utils/Constants.ts` to adapt to the contracts of each chain.


## URLs
- [Ethereum](https://thegraph.com/hosted-service/subgraph/drondin/olympus-liquidity-ethereum)
- [Avalanche](https://thegraph.com/hosted-service/subgraph/drondin/olympus-liquidity-avalanche)
