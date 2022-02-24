import { BigInt, BigDecimal, log, Address } from "@graphprotocol/graph-ts"
import { Swap, UniswapV2Pair } from "../generated/templates/LPPairV2/UniswapV2Pair"
import { loadOrCreateDailyVolume } from "./utils/DailyVolume"
import { loadLPPair, lpUSDReserves } from "./utils/LPPair"
import { toDecimal } from "./utils/Decimals"
import { getUSDValue } from "./utils/Price"
import { TREASURY_ADDRESS, TREASURY_ADDRESS_V2 } from "./utils/Constants"

//Every time there is a swap in the LP we do the following calculations
export function handleSwap(event: Swap): void {
  //Retrieve LP from database
  let lppair = loadLPPair(event.address.toHexString())
  lppair.liquidity = lpUSDReserves(lppair.id)
  lppair.save()
  
  //Create dailyVolume object to store info
  let dailyVolume = loadOrCreateDailyVolume(event.block.timestamp, lppair.id)

  //Calculate the swap USD value
  let totalSwap = getUSDValue(
    lppair.token0, event.params.amount0In.plus(event.params.amount0Out),
    lppair.token1, event.params.amount1In.plus(event.params.amount1Out)
  )
  log.debug("Swap {} usd amount: {}", [event.transaction.hash.toHexString(), totalSwap.toString()])

  //Calculate owned liquidity
  let pairContract = UniswapV2Pair.bind(Address.fromString(lppair.id))
  let decimals = pairContract.decimals()
  let totalLiquidity = toDecimal(pairContract.totalSupply(), decimals)
  let ownedLiquidity = toDecimal(pairContract.balanceOf(Address.fromString(TREASURY_ADDRESS)), decimals)
  ownedLiquidity = ownedLiquidity.plus(toDecimal(pairContract.balanceOf(Address.fromString(TREASURY_ADDRESS_V2)), decimals))

  //Calculate Fees
  let lpFee = totalSwap.times(lppair.fee).div(BigDecimal.fromString("100"))
  if(ownedLiquidity.gt(BigDecimal.fromString("0"))){
    dailyVolume.protocolOwnedLiquidity = ownedLiquidity.div(totalLiquidity)
  }

  //Calculate Fees earned by Olympus
  let polFee = lpFee.times(dailyVolume.protocolOwnedLiquidity)
  dailyVolume.feesEarned = dailyVolume.feesEarned.plus(polFee)
  dailyVolume.feesTotal = dailyVolume.feesTotal.plus(lpFee)
  dailyVolume.volume = dailyVolume.volume.plus(totalSwap)
  dailyVolume.swaps =  dailyVolume.swaps.plus(BigInt.fromI32(1))
  dailyVolume.save()
}
