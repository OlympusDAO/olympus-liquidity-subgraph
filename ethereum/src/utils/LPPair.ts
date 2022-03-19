import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { lpPair } from "../../generated/schema"
import { UniswapV2Pair } from "../../generated/templates/LPPairV2/UniswapV2Pair";
import { ERC20 } from "../../generated/templates/LPPairV2/ERC20";
import { CURRENT_GOHM, CURRENT_OHM, OHM_TOKENS } from "./Constants";
import { toDecimal } from "./Decimals";
import { getgOHMUSDRate, getOHMUSDRate, getUSDValue } from "./Price";
import { UniswapV3Pair } from "../../generated/templates/LPPairV3/UniswapV3Pair";

export function createLPPair(address: string, verion: string, fee: BigDecimal): lpPair{
    //Load from database with LP address
    let lppair = lpPair.load(address)
    //If it doesn't exist we create it
    if (lppair == null) {
        //Instantiate Contracts
        let pair = UniswapV2Pair.bind(Address.fromString(address))
        let token0 = ERC20.bind(pair.token0())
        let token1 = ERC20.bind(pair.token1())

        //Create object
        lppair = new lpPair(address)
        lppair.name = token0.symbol() + "-" + token1.symbol()
        lppair.token0 = token0._address.toHexString()
        lppair.token1 = token1._address.toHexString()
        lppair.version = verion
        lppair.fee = fee
        lppair.token0Decimal = BigInt.fromI32(token0.decimals())
        lppair.token1Decimal = BigInt.fromI32(token1.decimals())

        //Save in DB
        lppair.save()
    }
    return lppair as lpPair
}

export function loadLPPair(address: string): lpPair{
    let lppair = lpPair.load(address)
    return lppair as lpPair
}

export function lpUSDReserves(address: string): BigDecimal{
    let pair = UniswapV2Pair.bind(Address.fromString(address))
    let pair_reserves = pair.try_getReserves()

    if(pair_reserves.reverted){
        return BigDecimal.fromString("0")
    }

    let reserves0 = getUSDValue(pair.token0().toHexString(), pair_reserves.value.value0)
    let reserves1 = getUSDValue(pair.token1().toHexString(), pair_reserves.value.value1)

    if(reserves0.gt(BigDecimal.fromString("0"))){
        return reserves0.times(BigDecimal.fromString("2"))
    }
    if(reserves1.gt(BigDecimal.fromString("0"))){
        return reserves1.times(BigDecimal.fromString("2"))
    }

    return BigDecimal.fromString("0")
}

export function lpUSDReservesV3(address: string): BigDecimal{
    let pair = UniswapV3Pair.bind(Address.fromString(address))

    let token0 = ERC20.bind(pair.token0())
    let token1 = ERC20.bind(pair.token1())

    let tokenAmount0 = token0.balanceOf(pair._address)
    let tokenAmount1 = token1.balanceOf(pair._address)

    let reserves0 = getUSDValue(pair.token0().toHexString(), tokenAmount0)
    let reserves1 = getUSDValue(pair.token1().toHexString(), tokenAmount1)


    return reserves0.plus(reserves1)
}