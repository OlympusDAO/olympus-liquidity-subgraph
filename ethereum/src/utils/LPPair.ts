import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { lpPair } from "../../generated/schema"
import { UniswapV2Pair } from "../../generated/templates/LPPairV2/UniswapV2Pair";
import { ERC20 } from "../../generated/templates/LPPairV2/ERC20";

export function createLPPair(address: string, verion: string, fee: BigDecimal): lpPair{
    let lppair = lpPair.load(address)
    if (lppair == null) {

        let pair = UniswapV2Pair.bind(Address.fromString(address))
        let token0 = ERC20.bind(pair.token0())
        let token1 = ERC20.bind(pair.token1())

        lppair = new lpPair(address)
        lppair.name = token0.symbol() + "-" + token1.symbol()
        lppair.token0 = token0._address.toHexString()
        lppair.token1 = token1._address.toHexString()
        lppair.version = verion
        lppair.fee = fee
        lppair.token0Decimal = BigInt.fromI32(token0.decimals())
        lppair.token1Decimal = BigInt.fromI32(token1.decimals())

        lppair.save()
    }
    return lppair as lpPair
}

export function loadLPPair(address: string): lpPair{
    let lppair = lpPair.load(address)
    return lppair as lpPair
}