import { useConnect, useAccount, useSwitchChain } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { sepolia } from 'wagmi/chains'

export default function ConnectWallet() {
  const { connect, isPending } = useConnect()
  const { isConnected, chainId } = useAccount()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  const handleConnect = () => {
    connect({ connector: injected() })
  }

  const handleSwitchToSepolia = () => {
    switchChain({ chainId: sepolia.id })
  }

  // Si está conectado pero en la red incorrecta
  if (isConnected && chainId !== sepolia.id) {
    return (
      <div className="text-center">
        <div className="max-w-md mx-auto bg-yellow-50 border-2 border-yellow-200 rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Red Incorrecta
            </h2>
            <p className="text-gray-600">
              Esta aplicación funciona solo en la red Sepolia. Por favor cambia de red.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Red actual: {chainId} | Red requerida: {sepolia.id}
            </p>
          </div>

          <button
            onClick={handleSwitchToSepolia}
            disabled={isSwitching}
            className={`w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors ${
              isSwitching ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {isSwitching ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Cambiando red...
              </div>
            ) : (
              'Cambiar a Sepolia'
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🔗</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Conectar Wallet
          </h2>
          <p className="text-gray-600">
            Conecta tu wallet MetaMask para continuar y reclamar tus tokens gratuitos
          </p>
        </div>

        <button
          onClick={handleConnect}
          disabled={isPending}
          className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors ${
            isPending ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {isPending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Conectando...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2">🦊</span>
              Conectar MetaMask
            </div>
          )}
        </button>

        <div className="mt-6 text-sm text-gray-500">
          <p>¿No tienes MetaMask?</p>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Descargar MetaMask
          </a>
        </div>
      </div>
    </div>
  )
}