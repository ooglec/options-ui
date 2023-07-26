import React, {useState, useEffect} from 'react'
import { Tabs, TabList, TabPanels, Tab, TabPanel , TabIndicator, Box} from '@chakra-ui/react'
import Options from './Options'
import MyOptions from './MyOptions'
import { useCall, useEthers } from '@usedapp/core'
import { optionsContract, optionsContractWithSigner } from '../../utils'
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
    let i = 1;
    const data = options.map((option) => {
        return {
            id: 1,
            optionHolder: option[1],
            optionWriter: option[0],
            optionMaturity: option[5],
            strikePrice: option[4],
            strikeAsset: option[2],
            underlyingAsset: option[3],
            theoricalPrice: option[8],
            isCall: option[9],
            underlyingAssetValue: option[7]
        }
        i++;
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
    </TabList>
    <TabIndicator
      mt="-1.5px"
      height="2px"
      bg="blue.500"
      borderRadius="1px"
    />
    <TabPanels>
      <TabPanel>
       {params && <Options maxId={utils.formatUnits(maxId[0], 0)} params={params} />}
      </TabPanel>
      <TabPanel>
        {params && <MyOptions params={params} />}
      </TabPanel>
    </TabPanels>
  </Tabs>
    </Box>
  )
}

export default OptionsTab