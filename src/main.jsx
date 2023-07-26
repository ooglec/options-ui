import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ChakraProvider } from '@chakra-ui/react'
import { DAppProvider, ArbitrumGoerli } from '@usedapp/core'

const config = {
  readOnlyChainId: ArbitrumGoerli.chainId,
  readOnlyUrls: {
    [ArbitrumGoerli.chainId]: 'https://endpoints.omniatech.io/v1/arbitrum/goerli/public'
  },
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
      <DAppProvider config={config}>
      <App />
      </DAppProvider>
    </ChakraProvider>
  </React.StrictMode>,
)
