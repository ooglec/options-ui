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
  } from '@chakra-ui/react'
import { useCall, useContractFunction, ERC20Interface, useEthers} from '@usedapp/core';
import { optionsContract, optionsContractWithSigner, addressToSymbol, USDC } from "../../utils"
import { ethers, utils } from 'ethers';
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

const Row = ({param, click}) => {
    const underlying = addressToSymbol[param.underlyingAsset]
    const strike = addressToSymbol[param.strikeAsset]


    return (
        <Tr>
            <Td>{underlying.symbol}/{strike.symbol}</Td>
            <Td>{param.optionWriter}</Td>
            <Td>{utils.formatUnits(param.optionMaturity, 0)}</Td>
            <Td>{param.isCall == true ? "Sell" : "Buy"}</Td>
            <Td>{utils.formatUnits(param.underlyingAssetValue, underlying.decimals)} {underlying.symbol}</Td>
            <Td>{utils.formatUnits(param.strikePrice, strike.decimals)} {strike.symbol}</Td>

            <Td>$ {utils.formatUnits(param.theoricalPrice, 6)}</Td>
            <Td><Button onClick={click}>Buy</Button></Td>
        </Tr>
    )
}

const Options = ({maxId, params}) => {

   

    const {state: buyOptionState, send: buyOption} = useContractFunction(optionsContract, 'buyOption', { transactionName: 'Buy Option' });


   
    const requestApproval = async (address, amount) => {
        const inProvider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(address, ERC20Interface, inProvider.getSigner(account));
        const allowance = await contract.allowance(optionsContract.address, account);

        if (allowance < amount){
            await contract.approve(optionsContract.address, amount);
        }
    }

    const buyHandler = async (id, amount) => {
        requestApproval(USDC, amount)
        buyOption(id);
        
    }


  return (
    <div>
        <TableContainer>
        <Table variant='simple'>
            <TableCaption></TableCaption>
            <Thead>
            <Tr>
                <Th></Th>
                <Th>Option Writer</Th>
                <Th>Matures In</Th>
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
                            return <Row param={param} click={() => buyHandler(param.id, param.theoricalPrice)} />
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