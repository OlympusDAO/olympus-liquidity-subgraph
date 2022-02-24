import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import { ERC20 } from '../../generated/templates/LPPairV2/ERC20';
import { UniswapV2Pair } from '../../generated/templates/LPPairV2/UniswapV2Pair';
import { UniswapV3Pair } from '../../generated/templates/LPPairV3/UniswapV3Pair';

import { NATIVESTABLE_PAIR, NATIVE_TOKEN, NATIVE_TOKENS, OHMSTABLE_PAIR, OHM_TOKENS, STABLE_TOKENS, WRAPPED_OHMNATIVE_PAIR } from './Constants';
import { toDecimal } from './Decimals'

let BIG_DECIMAL_1E9 = BigDecimal.fromString('1e9')
let BIG_DECIMAL_1E12 = BigDecimal.fromString('1e12')
let BIG_DECIMAL_1E18 = BigDecimal.fromString('1e18')

export function getNativeUSDRate(): BigDecimal {
    let pair = UniswapV2Pair.bind(Address.fromString(NATIVESTABLE_PAIR))

    let reserves = pair.try_getReserves()
    if(reserves.reverted){
        return BigDecimal.fromString("0")
    }

    let reserve0 = reserves.value.value0.toBigDecimal()
    let reserve1 = reserves.value.value1.toBigDecimal()

    let nativeRate = reserve0.div(reserve1).times(BIG_DECIMAL_1E12)
    log.debug("Native rate {}", [nativeRate.toString()])
    
    return nativeRate
}

export function getOHMUSDRate(): BigDecimal {
    let pair = UniswapV2Pair.bind(Address.fromString(OHMSTABLE_PAIR))

    let reserves = pair.try_getReserves()
    if(reserves.reverted){
        return BigDecimal.fromString("0")
    }

    let reserve0 = reserves.value.value0.toBigDecimal()
    let reserve1 = reserves.value.value1.toBigDecimal()

    let ohmRate = reserve1.div(reserve0).div(BIG_DECIMAL_1E9)
    log.debug("OHM rate {}", [ohmRate.toString()])

    return ohmRate
}

export function getgOHMUSDRate(): BigDecimal {
    let pair = UniswapV2Pair.bind(Address.fromString(WRAPPED_OHMNATIVE_PAIR))

    let ohmRate = BigDecimal.fromString("0")

    let reserves = pair.try_getReserves()
    if(reserves.reverted==false){
        let reserve0 = reserves.value.value0.toBigDecimal()
        let reserve1 = reserves.value.value1.toBigDecimal()
    
        let ohmRate = reserve1.div(reserve0).div(BIG_DECIMAL_1E18)
        log.debug("gOHM rate {}", [ohmRate.toString()])
    }
    else{
        let pair = UniswapV3Pair.bind(Address.fromString(WRAPPED_OHMNATIVE_PAIR))
        let slot0 = pair.try_slot0()
        if(slot0.reverted==false){

            let priceNative = slot0.value.value0.times(pair.slot0().value0).toBigDecimal()
            log.debug("gOHM priceNative {}", [priceNative.toString()])

            let priceDiv = BigInt.fromI32(2).pow(192).toBigDecimal()
            priceNative = priceNative.div(priceDiv)
        
            ohmRate = priceNative.times(getNativeUSDRate()) 
            log.debug("gOHM rate {}", [ohmRate.toString()])
        }

    }

    return ohmRate
}

export function getUSDValue(token0address: string, token0amount: BigInt, token1address: string, token1amount: BigInt): BigDecimal {
    //Stable token in pair
    if(STABLE_TOKENS.includes(token0address)){
        let token = ERC20.bind(Address.fromString(token0address))
        return toDecimal(token0amount, token.decimals())
    }
    else if (STABLE_TOKENS.includes(token1address)){
        let token = ERC20.bind(Address.fromString(token1address))
        return toDecimal(token1amount, token.decimals())
    }

    //Native token in pair
    if(NATIVE_TOKENS.includes(token0address)){
        let token = ERC20.bind(Address.fromString(token0address))
        return toDecimal(token0amount, token.decimals()).times(getNativeUSDRate())
    }
    else if (NATIVE_TOKENS.includes(token1address)){
        let token = ERC20.bind(Address.fromString(token1address))
        return toDecimal(token1amount, token.decimals()).times(getNativeUSDRate())
    }

    //OHM token in pair
    if(OHM_TOKENS.includes(token0address)){
        let token = ERC20.bind(Address.fromString(token0address))
        return toDecimal(token0amount, token.decimals()).times(getOHMUSDRate())
    }
    else if (OHM_TOKENS.includes(token1address)){
        let token = ERC20.bind(Address.fromString(token1address))
        return toDecimal(token1amount, token.decimals()).times(getOHMUSDRate())
    }

    else {
        log.debug("price not found for tokens {} - {}", [token0address, token1address])
        return BigDecimal.fromString("0")
    }
}