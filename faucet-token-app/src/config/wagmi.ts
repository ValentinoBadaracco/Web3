import { createConfig, http } from '@wagmi/core'
import { sepolia } from '@wagmi/core/chains'
import { injected } from '@wagmi/connectors'

// Configuración simplificada solo con MetaMask
export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
  },
  connectors: [
    injected({ target: 'metaMask' }),
  ],
})

export default config