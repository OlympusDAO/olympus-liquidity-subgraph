import { PoolCreated } from "../generated/UniswapV3Factory/UniswapV3Factory"
import { LPPairV3 } from '../generated/templates'
import { PAIR_WHITELIST_TOKENS } from "./utils/Constants"
import { BigInt, log } from "@graphprotocol/graph-ts"
import { createLPPair } from "./utils/LPPair"
import { toDecimal } from "./utils/Decimals"

export function handlePairCreated(event: PoolCreated): void {
    if(PAIR_WHITELIST_TOKENS.includes(event.params.token0.toHexString()) || PAIR_WHITELIST_TOKENS.includes(event.params.token1.toHexString())){
      log.debug("CreatedPair V3 {}", [event.params.pool.toHexString()])
      let lppair = createLPPair(event.params.pool.toHexString(), "v3", toDecimal(BigInt.fromI32(event.params.fee),4))
      LPPairV3.create(event.params.pool)
    }
}
