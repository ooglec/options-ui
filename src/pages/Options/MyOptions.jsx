import React from 'react'
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
import { optionsContract, optionsContractWithSigner, addressToSymbol, USDC, convertUnixTimestampToDate } from "../../utils"
import { ethers, utils } from 'ethers';


const Row = ({param, exercise}) => {
    const underlying = addressToSymbol[param.underlyingAsset]
    const strike = addressToSymbol[param.strikeAsset]
    
    return (
        <Tr>
             {param.isCall == true ?<Td>{utils.formatUnits(param.underlyingAssetValue, underlying.decimals)} {underlying.symbol}</Td>: <Td>{utils.formatUnits(param.strikePrice, strike.decimals)} {strike.symbol}</Td>}
             {param.isCall == true ?  <Td>{utils.formatUnits(param.strikePrice, strike.decimals)} {strike.symbol}</Td>:
            <Td>{utils.formatUnits(param.underlyingAssetValue, underlying.decimals)} {underlying.symbol}</Td>}
            <Td>{convertUnixTimestampToDate(param.optionMaturity)}</Td>
            <Td>{param.isCall == true ? "Call" : "Put"}</Td>
            <Td>{param.exercised ? <p>exercised</p> : <Button onClick={exercise}>exercise</Button>}</Td>
            {/* {params.lastDate ? <p>last date</p> : <Button>cancel</Button>} */}
        </Tr>
    )
}

const MyOptions = ({params}) => {
    //options you hold and can exercise
    // options you have written
    // options excercised
    const {account} = useEthers();


    const exercise = () => {
        console.log("exercise")
    }



    //option to pay x for x on
  return (
    <div>
        <TableContainer>
        <Table variant='simple'>
            <TableCaption></TableCaption>
            <Thead>
            <Tr>
                
                <Th>Pay This</Th>
                <Th>For</Th>
                <Th>On</Th>
                <Th>Type</Th>
                <Th>Exercise</Th>
            </Tr>
            </Thead>
            <Tbody>
                {
                   account && params && params.map((param) => {
                       if(param.optionHolder == account) {
                           return <Row param={param} exercise={exercise}/>
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
export default MyOptions