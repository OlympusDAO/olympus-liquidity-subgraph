import { BigInt, BigDecimal, log, Address } from "@graphprotocol/graph-ts"
import { Swap, UniswapV2Pair } from "../generated/templates/LPPairV2/UniswapV2Pair"
import { loadOrCreateDailyVolume } from "./utils/DailyVolume"
import { loadLPPair } from "./utils/LPPair"
import { toDecimal } from "./utils/Decimals"
import { getUSDValue } from "./utils/Price"
import { TREASURY_ADDRESS, TREASURY_ADDRESS_V2 } from "./utils/Constants"

export function handleSwap(event: Swap): void {
  let lppair = loadLPPair(event.address.toHexString())
  let dailyVolume = loadOrCreateDailyVolume(event.block.timestamp, lppair.id)

  let totalSwap = getUSDValue(
    lppair.token0, event.params.amount0In.plus(event.params.amount0Out),
    lppair.token1, event.params.amount1In.plus(event.params.amount1Out)
  )

  let pairContract = UniswapV2Pair.bind(Address.fromString(lppair.id))
  let decimals = pairContract.decimals()
  let totalLiquidity = toDecimal(pairContract.totalSupply(), decimals)
  let ownedLiquidity = toDecimal(pairContract.balanceOf(Address.fromString(TREASURY_ADDRESS)), decimals)
  ownedLiquidity = ownedLiquidity.plus(toDecimal(pairContract.balanceOf(Address.fromString(TREASURY_ADDRESS_V2)), decimals))

  let lpFee = totalSwap.times(lppair.fee).div(BigDecimal.fromString("100"))
  log.debug("Swap {} usd amount: {}", [event.transaction.hash.toHexString(), totalSwap.toString()])

  if(ownedLiquidity.gt(BigDecimal.fromString("0"))){
    dailyVolume.protocolOwnedLiquidity = ownedLiquidity.div(totalLiquidity).times(BigDecimal.fromString("100"))
  }
  let polFee = lpFee.times(dailyVolume.protocolOwnedLiquidity).div(BigDecimal.fromString("100"))
  dailyVolume.feesEarned = dailyVolume.feesEarned.plus(polFee)
  dailyVolume.feesTotal = dailyVolume.feesTotal.plus(lpFee)
  dailyVolume.volume = dailyVolume.volume.plus(totalSwap)
  dailyVolume.swaps =  dailyVolume.swaps.plus(BigInt.fromI32(1))
  dailyVolume.save()
}
