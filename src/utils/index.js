import abi from "../abi/optionsAbi.json"
import { ethers, utils } from "ethers";
import { Contract } from "@ethersproject/contracts";

export const optionAddress = "0xF5Ad0a760dF61baE5bA9E88B2C46dEAdfc884259";
export const provider = new ethers.providers.JsonRpcProvider("https://endpoints.omniatech.io/v1/arbitrum/goerli/public")
const optionsInterface = new utils.Interface(abi)
export const optionsContract = new Contract(optionAddress, optionsInterface);
export const optionsContractWithSigner = new Contract(optionAddress, optionsInterface, provider);
export const USDC = "0x1fd96Ebef5f47a6dd75d84CAF703365427A624fC";

export const addressToSymbol = {
    "0x94cBBc4328a74f0D66d9565A45775D81f7FC82CD": {
        symbol: "WETH",
        decimals: 18
    },
    "0xd5F96d0253506b69dC2D7F3074279306904A5807": {
        symbol: "DAI",
        decimals: 18
    },
    "0xFf24A95355DBDb4C2f86391b6BAe2585c41588C2": {
        symbol: "WBTC",
        decimals: 8
    },
    "0x1fd96Ebef5f47a6dd75d84CAF703365427A624fC": {
        symbol: "USDC",
        decimals: 6
    }
}

export function convertUnixTimestampToDate(timestamp) {
    // Multiply by 1000 because JS works with milliseconds instead of the UNIX seconds
    let date = new Date(timestamp * 1000);

    return date.toDateString();
}