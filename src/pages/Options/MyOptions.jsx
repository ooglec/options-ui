import React, { useEffect } from 'react'
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


const Row = ({param, exercise}) => {
    const underlying = addressToSymbol[param.underlyingAsset]
    const strike = addressToSymbol[param.strikeAsset]
    const lastDate = new Date(param.lastExerciseDate * 1000);
    const maturity = new Date(param.optionMaturity * 1000);
    const now = new Date(Date.now());

    return (
        <Tr>
             {param.isCall == true ?<Td>{utils.formatUnits(param.underlyingAssetValue, underlying.decimals)} {underlying.symbol}</Td>: <Td>{utils.formatUnits(param.strikePrice, strike.decimals)} {strike.symbol}</Td>}
             {param.isCall == true ?  <Td>{utils.formatUnits(param.strikePrice, strike.decimals)} {strike.symbol}</Td>:
            <Td>{utils.formatUnits(param.underlyingAssetValue, underlying.decimals)} {underlying.symbol}</Td>}
            <Td>{convertUnixTimestampToDate(param.optionMaturity)}</Td>
            <Td>{param.isCall == true ? "Call" : "Put"}</Td>
            
            <Td>{
              param.exercised ? <Button color="red">Expired</Button> : (now > lastDate ? <Button color="red">Expired</Button> : 
              now > maturity ?  <Button color="green" onClick={exercise}>exercise</Button> : <Button color="rebeccapurple">Not mature</Button>)
            }</Td> 
            
            {/* {params.lastDate ? <p>last date</p> : <Button>cancel</Button>} */}
        </Tr>
    )
}

const MyOptions = ({params}) => {
    //options you hold and can exercise
    // options you have written
    // options excercised
    const {state: exerciseOptionState, send: exerciseOption} = useContractFunction(optionsContract, 'exerciseOption', { transactionName: 'Exercise Option' });

    const {account} = useEthers();
    const toast = useToast();


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



   const exercise = async (id, address, amount) => {
        await requestApproval(address, amount)
        try{
            await exerciseOption(id)
        }catch(e){
            showToast('Exercise', `Exercise failed ${e.message}`, 'error')
        }

    }

    
    const showToast = (title, desc, status) => {
        
        toast({
            title: title,
            description: desc,
            status: status,
            duration: 5000,
            isClosable: true,
        })
    }

    useEffect(() => {
        if(exerciseOptionState.status === 'Mining'){
            showToast('Exercise', `Exercise in progress`, 'info')
        }
        if(exerciseOptionState.status === 'Success'){
            showToast('Exercise', `Exercise successful`, 'success')
        }
        if (exerciseOptionState.status === 'Exception') {
            showToast('Exercise', `Exercise failed ${exerciseOptionState.errorMessage}`, 'error')
        }
    }, [exerciseOptionState])



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
                   account && params && params.reverse().map((param, index) => {
                    const address = params.isCall ? param.strikeAsset :  param.underlyingAsset 
                    const amount = params.isCall ? param.strikePrice : param.underlyingAssetValue
                       if(param.optionHolder == account && param.optionWriter != param.optionHolder) {
                           return <Row key={index} param={param} exercise={() => exercise(param.id, address, amount)}/>
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