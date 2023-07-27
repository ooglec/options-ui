import React, {useState, useEffect} from 'react'
import { Tabs, TabList, TabPanels, Tab, TabPanel , TabIndicator, Box, Spinner, Flex, Text, List, ListItem, UnorderedList} from '@chakra-ui/react'
import Options from './Options'
import MyOptions from './MyOptions'
import { useCall, useEthers } from '@usedapp/core'
import { optionsContract, optionsContractWithSigner, addressToSymbol } from '../../utils'
import { ethers, utils } from 'ethers'

const OptionsTab = () => {

  const [params, setParams] = useState(null)

  const {account} = useEthers();

  const {value: maxId} = useCall({
    contract: optionsContract,
    method: "ids",
    args: []
  }) ?? {}

  

  async function getOptions(startId, endId) {
    let promises = [];

    for (let i = startId; i <= endId; i++) {
        promises.push(optionsContractWithSigner.getOption(i));
    }
    console.log(promises)
    let options = await Promise.all(promises);
    const data = options.map((option, index) => {
        return {
            id: index+1,
            optionHolder: option[1],
            optionWriter: option[0],
            optionMaturity: option[5],
            strikePrice: option[4],
            strikeAsset: option[2],
            underlyingAsset: option[3],
            theoricalPrice: option[8],
            isCall: option[9],
            underlyingAssetValue: option[7],
            lastExerciseDate: option[6],
        }
    })
    setParams(data)
    return options;
}


useEffect(() => {
    
    if(maxId) {
      (async() => {
        const opt = await getOptions(1, utils.formatUnits(maxId[0], 0))
        console.log(opt)
        })();
    }
  }, [maxId])
  return (
    <Box w="100%">
    <Tabs position="relative" variant="unstyled">
    <TabList>
      <Tab>Options</Tab>
      <Tab>My Options</Tab>
      <Tab>Info</Tab>
    </TabList>
    <TabIndicator
      mt="-1.5px"
      height="2px"
      bg="blue.500"
      borderRadius="1px"
    />
   {
    params ? (
      <TabPanels>
      <TabPanel>
       {account && <Options maxId={utils.formatUnits(maxId[0], 0)} account={account} params={params} />}
      </TabPanel>
      <TabPanel>
       <MyOptions params={params} />
      </TabPanel>
      <TabPanel>
      <Flex mt={10} flexDir="column" align="start">
        <Text fontSize={24} my={4}>Test Assets</Text>
        <Text fontSize={16} my={4}>For the testing purposes, these tokens were deployed to represent their mainnet counterparts</Text>
        </Flex>
       {Object.keys(addressToSymbol).map((key, index) => {
          return (
           <Flex align="start">
             <Box alignItems="start" key={index}>
              <Text mr="3">{addressToSymbol[key].symbol} : </Text>
            </Box>
            <Box alignItems="start" key={index}>
            <Text mx="3"><a target='_blank' href={`https://goerli.arbiscan.io/address/${key}`}>{key}</a></Text>
          </Box>
           </Flex>
          )
       })}

       <Flex mt={10} flexDir="column" align="start">
        <Text fontSize={24} my={4}>Info</Text>
       <UnorderedList>
        <ListItem>Time is calculated based on UTC+00</ListItem>
       </UnorderedList>
       </Flex>
      </TabPanel>
    </TabPanels>
    ) : 
    <Spinner />
   }
  </Tabs>
    </Box>
  )
}

export default OptionsTab