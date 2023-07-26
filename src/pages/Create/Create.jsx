import React, {useEffect, useState} from 'react'
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Button,
    Input,
    Select,
    Box,
    Flex
  } from '@chakra-ui/react'
  import { useContractFunction, ERC20, useCall, ERC20Interface, useEthers} from '@usedapp/core';
  import { optionsContract, optionsContractWithSigner, provider } from "../../utils"
  import {ethers, utils} from 'ethers';
  import { addressToSymbol } from '../../utils';
//   struct CreateOptionParams {
//     bool _isCall;
//     address _strikeAsset; //the asset that the option is written in
//     address _underlyingAsset; //the asset that the option is written on
//     uint256 _underlingAssetAmount; //the amount of the underlying asset to trade by the seller
//     uint256 _strikeAssetValue;
//     uint256 _maturityTime; //expressed in days scaled by the factor of 100 (ex: 30 days = 3000, 1/2 day = 50, 1/4 day = 25, 1/8 day = 12)
// }




const Create = () => {

    const { send: createOption, state: createState } = useContractFunction(optionsContract, 'writeOption', { transactionName: 'Create Option' });
    const {account} = useEthers();
   
    
    const [Assets, setAssets] = useState([
            {
                "name": 'WETH',
                "address": '0x94cBBc4328a74f0D66d9565A45775D81f7FC82CD'
            },
            {
                "name": 'WBTC',
                "address": '0xFf24A95355DBDb4C2f86391b6BAe2585c41588C2'
            },
            {
                "name": 'USDC',
                "address": '0x1fd96Ebef5f47a6dd75d84CAF703365427A624fC'
            },
            {
                "name": 'DAI',
                "address": '0xd5F96d0253506b69dC2D7F3074279306904A5807'
            }
        
        ]
    );

    const [firstAsset, setFirstAsset] = useState('0x94cBBc4328a74f0D66d9565A45775D81f7FC82CD');
    const [secondAsset, setSecondAsset] = useState('');
    const [expectedPremium, setExpectedPremium] = useState(0);
    const submitForm = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData);
        console.log(Boolean(payload.isCall));

        console.log(payload)
        const assetChosen = payload.isCall == "0" ? payload.sAsset : payload.uAsset;
        
        const params = [
            payload.isCall == "0" ? true : false,
            payload.sAsset,
            payload.uAsset,
            utils.parseUnits(payload.uAmount, addressToSymbol[payload.uAsset].decimals),
            utils.parseUnits(payload.sValue, addressToSymbol[payload.sAsset].decimals),
            utils.parseUnits(payload.maturity, 2)
        ]
        if (assetChosen == payload.sAsset){
            await requestApproval(payload.sAsset, utils.parseUnits(payload.sValue, addressToSymbol[payload.sAsset].decimals))
        }else{
            await requestApproval(payload.uAsset, utils.parseUnits(payload.uAmount, addressToSymbol[payload.uAsset].decimals))
        }
        console.log(params)
        createOptionHandler(params);
    }

    const createOptionHandler = async (params) => {
        try {
            await createOption(params);
        } catch (error) {
            console.log(error);
        }
    }
    const requestApproval = async (address, amount) => {
        const inProvider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(address, ERC20Interface, inProvider.getSigner(account));
        const allowance = await contract.allowance(optionsContract.address, account);

        if (allowance < amount){
            await contract.approve(optionsContract.address, amount);
        }
    }

    useEffect(() => {
       
    },[])
        
    return (
        <div>
            <h1>Create Option</h1>
           <Box  w="100%">
           <form onSubmit={(e) => submitForm(e)}>

                <FormControl alignItems="flex-start">
                    <FormLabel>I will</FormLabel>
                    <Select name="isCall">
                        <option value={0}>Buy</option>
                        <option value={1}>Sell</option>
                    </Select>
                </FormControl>

                <FormControl>
                <FormLabel></FormLabel>
                <Flex>
                <Select name='uAsset' onChange={(e) => setSecondAsset(e.target.value)}>
                    {
                        Assets.filter(asset => asset.address !== firstAsset)
                            .map((update) => {
                                return (
                                    <option value={update.address}>{update.name}</option>
                                );
                            })
                    }
                    </Select>
                    <Input ml="2" name="uAmount" type='number' placeholder='Amount' />
                </Flex>

                </FormControl>


                <FormControl my="2">
                <FormLabel>For</FormLabel>
                <Flex>
                <Select name="sAsset" onChange={(e) => setFirstAsset(e.target.value)}>
                {Assets.map((asset) => {
                        return(
                            <option value={asset.address}>{asset.name}</option>
                        );
                    })}
                </Select>
                <Input ml="2" name="sValue" type='number' placeholder='Amount' />
                </Flex>
                </FormControl>

               
                <FormControl>
                <FormLabel>Maturity Time(days)</FormLabel>
                <Input name="maturity" type='number' />
                </FormControl>

                <FormControl>
                <FormLabel my='2'>Premium: {expectedPremium}</FormLabel>
                </FormControl>

                <Button my="5" type='submit'>Submit</Button>
                </form>
           </Box>
        </div>
    )
}

export default Create