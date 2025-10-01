import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { sepolia } from 'wagmi/chains'
import ConnectWallet from './components/ConnectWallet'
import AuthLogin from './components/AuthLogin'
import FaucetDashboard from './components/FaucetDashboard'
import './App.css'

function App() {
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar si hay token guardado al cargar
  useEffect(() => {
    const savedToken = localStorage.getItem('faucet_auth_token')
    if (savedToken && isConnected) {
      // Verificar si el token sigue siendo válido
      verifyToken(savedToken)
    }
  }, [isConnected])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setAuthToken(token)
        setIsAuthenticated(true)
      } else {
        // Token inválido, limpiar storage
        localStorage.removeItem('faucet_auth_token')
        setAuthToken(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Error verificando token:', error)
      localStorage.removeItem('faucet_auth_token')
      setAuthToken(null)
      setIsAuthenticated(false)
    }
  }

  const handleAuthSuccess = (token: string) => {
    setAuthToken(token)
    setIsAuthenticated(true)
    localStorage.setItem('faucet_auth_token', token)
  }

  const handleLogout = () => {
    setAuthToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem('faucet_auth_token')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🚰 Faucet Token App
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {isConnected && (
                <div className="text-sm text-gray-600">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              )}
              
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Cerrar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {!isConnected ? (
            <ConnectWallet />
          ) : chainId !== sepolia.id ? (
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
                    Esta aplicación solo funciona en Sepolia testnet.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Red actual: {chainId} | Red requerida: {sepolia.id}
                  </p>
                </div>
                <button
                  onClick={() => switchChain({ chainId: sepolia.id })}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Cambiar a Sepolia
                </button>
              </div>
            </div>
          ) : !isAuthenticated ? (
            <AuthLogin 
              address={address!} 
              onAuthSuccess={handleAuthSuccess} 
            />
          ) : (
            <FaucetDashboard 
              address={address!} 
              authToken={authToken!} 
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
