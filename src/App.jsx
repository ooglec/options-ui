import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Create from './pages/Create/Create'
import OptionsTab from './pages/Options/OptionsTab'
import {Box, Button, Flex, Text} from '@chakra-ui/react'
import { useEthers, useCall } from '@usedapp/core'
import { optionsContract } from './utils'

const ConnectButton = () => {
  const { account, deactivate, activateBrowserWallet } = useEthers()
  // 'account' being undefined means that we are not connected.
  if (account) return <Button onClick={() => deactivate()}>Disconnect</Button>
  else return <Button onClick={() => activateBrowserWallet()}>Connect</Button>
}

function App() {

  const [page, setPage] = useState('1');
  const {account} = useEthers();


  return (
    <>
    
    <Flex minWidth='max-content' justifyContent="right" alignItems='right' gap='15' my={8}>
      <ConnectButton />
      {account && <Button color="rebeccapurple">{account.slice(0, 8)}......</Button>}
    </Flex>

    <Flex minWidth='max-content' justifyContent="left" gap='15' my={8}>
      <Text fontSize="2xl" fontWeight="bold" color="rebeccapurple">Arbitrum Goerli Options</Text>
    </Flex>

    <Flex minWidth='max-content' justifyContent="left" gap='15' my={8}>
      <div className='cur' onClick={() => setPage(1)}>Home</div>
      <div className='cur' onClick={() => setPage(2)}>Create</div>
    </Flex>
     
      <Box w="70vw">

       <div>
        {page == 2 && <Create />}
        {page == 1 && <OptionsTab />}
       </div>
      </Box>
      <p className="read-the-docs">
       
      </p>
    </>
  )
}

export default App
