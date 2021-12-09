import { PairCreated } from "../generated/UniswapV2Factory/UniswapV2Factory"
import { LPPairV2 } from '../generated/templates'
import { PAIR_WHITELIST_TOKENS } from "./utils/Constants"
import { BigDecimal, log } from "@graphprotocol/graph-ts"
import { createLPPair } from "./utils/LPPair"

export function handlePairCreated(event: PairCreated): void {
    if(PAIR_WHITELIST_TOKENS.includes(event.params.token0.toHexString()) || PAIR_WHITELIST_TOKENS.includes(event.params.token1.toHexString())){
      log.debug("CreatedPair V2 {}", [event.params.pair.toHexString()])
      let lppair = createLPPair(event.params.pair.toHexString(), "v2", BigDecimal.fromString("0.3"))
      LPPairV2.create(event.params.pair)
    }
}
