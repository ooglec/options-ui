import React, { useState, useEffect } from 'react'
import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Button,
    useToast
  } from '@chakra-ui/react'
import { useCall, useContractFunction, ERC20Interface, useEthers} from '@usedapp/core';
import { optionsContract, optionsContractWithSigner, addressToSymbol, USDC, convertUnixTimestampToDate } from "../../utils"
import { ethers, utils } from 'ethers';
import { showToast } from '../../components/Toasts';
//   struct Option {
//     address optionWriter;
//     address optionHolder;
//     address strikeAsset;
//     address underlyingAsset;
//     uint256 strikePrice; //the value of the underlying asset in terms of the strike asset (ex: 1 weth = 2500 dai)
//     uint256 maturityTime;
//     uint256 lastExerciseDate;
//     uint256 underlyingAssetValue; //in the value of the asset (ex: 1000 USDC / or dai etc)
//     uint256 theoricalPrice;
//     bool isCall;
//     bool exercised;
//     bool expired;
//     bool cancelled;
// }

const Row = ({param, buyHandler, account}) => {
    console.log(param.id)
    const underlying = addressToSymbol[param.underlyingAsset]
    const strike = addressToSymbol[param.strikeAsset]




    return (
        
        <Tr>
            <Td>{underlying.symbol}/{strike.symbol}</Td>
            <Td>{param.optionWriter.slice(0, 8)}....</Td>
            <Td>{convertUnixTimestampToDate(utils.formatUnits(param.optionMaturity, 0))}</Td>
            <Td>{param.isCall == true ? "Buy" : "Sell"}</Td>
            <Td>{utils.formatUnits(param.underlyingAssetValue, underlying.decimals)} {underlying.symbol}</Td>
            <Td>{utils.formatUnits(param.strikePrice, strike.decimals)} {strike.symbol}</Td>

            <Td>$ {utils.formatUnits(param.theoricalPrice, 6)}</Td>
            <Td>{param.optionWriter != account ? <Button onClick={buyHandler}>Buy</Button> : <p>Writer</p>}</Td>
        </Tr>
    )
}

const Options = ({maxId, params}) => {

    const {account} = useEthers();
    const toast = useToast();

   

    const {state: buyOptionState, send: buyOption} = useContractFunction(optionsContract, 'buyOption', { transactionName: 'Buy Option' });

    const showToast = (title, desc, status) => {
        toast({
            title: title,
            description: desc,
            status: status,
            duration: 5000,
            isClosable: true,
        })
    }
   
    const requestApproval = async (address, amount) => {
        const inProvider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(address, ERC20Interface, inProvider.getSigner(account));
        const allowance = await contract.allowance(account, optionsContract.address);
        console.log(allowance)
        if (allowance < amount){
            await contract.approve(optionsContract.address, ethers.constants.MaxUint256);
            showToast('Approved', `Approval successful`, 'success')
        }
    }

    const buyHandler = async (id, amount) => {
        console.log(account)
        await requestApproval(USDC, amount)
        await buyOption(id);
        showToast('Option bought', `Option bought successfully`, 'success')
    }


  return (
    <div>
        <TableContainer maxW="100%">
        <Table variant='simple'>
            <TableCaption></TableCaption>
            <Thead>
            <Tr>
                <Th></Th>
                <Th>Option Writer</Th>
                <Th>Matures On</Th>
                <Th>To</Th>
                <Th>this</Th>
                <Th>For</Th>
                <Th>Premium(USDC)</Th>
                <Th>Buy</Th>
            </Tr>
            </Thead>
            <Tbody>
                {
                    params && params.map((param) => {
                        if(param.optionHolder == param.optionWriter){
                            return <Row param={param} buyHandler={() => buyHandler(param.id, param.theoricalPrice)} account={account} />

                        }else{
                            return null;
                        }
                    })
                }
            </Tbody>
            <Tfoot>
            {/* <Tr>
                <Th>Prev</Th>
                <Th> Next</Th>
            </Tr> */}
            </Tfoot>
        </Table>
        </TableContainer>

       
    </div>
  )
}

export default Options