import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { dayFromTimestamp } from "./Dates";
import { dailyLiquidity } from "../../generated/schema"

export function loadOrCreateDailyLiquidity(timestamp: BigInt, lppair: string, liquidity: BigDecimal): dailyLiquidity{
    let dayTimestamp = dayFromTimestamp(timestamp);

    let dailyliquidity = dailyLiquidity.load(dayTimestamp+lppair)
    if (dailyliquidity == null) {
        dailyliquidity = new dailyLiquidity(dayTimestamp+lppair)
        dailyliquidity.timestamp = dayTimestamp
        dailyliquidity.lp = lppair
        dailyliquidity.liquidity = liquidity
        dailyliquidity.save()
    }
    return dailyliquidity as dailyLiquidity
}
