import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts"
import { Swap, UniswapV3Pair } from "../generated/templates/LPPairV3/UniswapV3Pair"
import { loadOrCreateDailyVolume } from "./utils/DailyVolume"
import { loadLPPair } from "./utils/LPPair"
import { toDecimal } from "./utils/Decimals"
import { getUSDValue } from "./utils/Price"
import { TREASURY_ADDRESS, TREASURY_ADDRESS_V2, TREASURY_ADDRESS_V3 } from "./utils/Constants"

export function handleSwap(event: Swap): void {
  let lppair = loadLPPair(event.address.toHexString())
  let dailyVolume = loadOrCreateDailyVolume(event.block.timestamp, lppair.id)

  let totalSwap = getUSDValue(
    lppair.token0, event.params.amount0.abs(),
    lppair.token1, event.params.amount1.abs()
  )

  let pairContract = UniswapV3Pair.bind(Address.fromString(lppair.id))
  let decimals = 18
  let totalLiquidity = toDecimal(pairContract.liquidity(), decimals)
  let ownedLiquidity = toDecimal(pairContract.positions(Address.fromString(TREASURY_ADDRESS)).value0, decimals)
  ownedLiquidity = ownedLiquidity.plus(toDecimal(pairContract.positions(Address.fromString(TREASURY_ADDRESS_V2)).value0, decimals))
  ownedLiquidity = ownedLiquidity.plus(toDecimal(pairContract.positions(Address.fromString(TREASURY_ADDRESS_V3)).value0, decimals))

  let lpFee = totalSwap.times(lppair.fee).div(BigDecimal.fromString("100"))

  log.debug("Swap {} usd amount {}", [event.transaction.hash.toHexString(), totalSwap.toString()])

  if(ownedLiquidity.gt(BigDecimal.fromString("0"))){
    dailyVolume.protocolOwnedLiquidity = ownedLiquidity.div(totalLiquidity)
  }
  let polFee = lpFee.times(dailyVolume.protocolOwnedLiquidity)
  dailyVolume.feesEarned = dailyVolume.feesEarned.plus(polFee)
  dailyVolume.feesTotal = dailyVolume.feesTotal.plus(lpFee)
  dailyVolume.volume = dailyVolume.volume.plus(totalSwap)
  dailyVolume.swaps =  dailyVolume.swaps.plus(BigInt.fromI32(1))
  dailyVolume.save()
}
