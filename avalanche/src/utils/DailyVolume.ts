import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { dayFromTimestamp } from "./Dates";
import { dailyVolume } from "../../generated/schema"

export function loadOrCreateDailyVolume(timestamp: BigInt, lppair: string): dailyVolume{
    let dayTimestamp = dayFromTimestamp(timestamp);

    let dailyvolume = dailyVolume.load(dayTimestamp+lppair)
    if (dailyvolume == null) {
        dailyvolume = new dailyVolume(dayTimestamp+lppair)
        dailyvolume.timestamp = dayTimestamp
        dailyvolume.lp = lppair
        dailyvolume.volume = BigDecimal.fromString("0")
        dailyvolume.swaps = BigInt.fromString("0")
        dailyvolume.protocolOwnedLiquidity = BigDecimal.fromString("0")
        dailyvolume.feesEarned = BigDecimal.fromString("0")
        dailyvolume.feesTotal = BigDecimal.fromString("0")
        dailyvolume.save()
    }
    return dailyvolume as dailyVolume
}
