import { PairCreated } from "../generated/UniswapV2Factory/UniswapV2Factory"
import { LPPairV2 } from '../generated/templates'
import { PAIR_WHITELIST_TOKENS } from "./utils/Constants"
import { BigDecimal, log } from "@graphprotocol/graph-ts"
import { createLPPair } from "./utils/LPPair"

//This function is called everytime a pair is created in either Uniswap or Sushiswap
export function handlePairCreated(event: PairCreated): void {
    //Check if token0 or token1 is part of Olympus
    if(PAIR_WHITELIST_TOKENS.includes(event.params.token0.toHexString()) || PAIR_WHITELIST_TOKENS.includes(event.params.token1.toHexString())){
      log.debug("CreatedPair V2 {}", [event.params.pair.toHexString()])
      //Create entry in internal database
      let lppair = createLPPair(event.params.pair.toHexString(), "v2", BigDecimal.fromString("0.3"))
      //Instantiate template to listen to LP events
      LPPairV2.create(event.params.pair)
    }
}
