import { useState, useEffect } from 'react'

interface FaucetDashboardProps {
  address: string
  authToken: string
}

interface FaucetStatus {
  address: string
  hasClaimed: boolean
  balance: string
  faucetAmount: string
  totalUsers: number
  users: string[]
  tokenInfo: {
    name: string
    symbol: string
    decimals: number
    totalSupply: string
  }
}

export default function FaucetDashboard({ address, authToken }: FaucetDashboardProps) {
  const [status, setStatus] = useState<FaucetStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClaiming, setIsClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Cargar estado del faucet al montar el componente
  useEffect(() => {
    loadFaucetStatus()
  }, [])

  const loadFaucetStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`http://localhost:3001/faucet/status/${address}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar estado')
      }

      const data = await response.json()
      setStatus(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClaimTokens = async () => {
    try {
      setIsClaiming(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('http://localhost:3001/faucet/claim', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al reclamar tokens')
      }

      setSuccess(`¡Tokens reclamados exitosamente! TX: ${data.txHash}`)
      
      // Recargar estado después de reclamar
      setTimeout(loadFaucetStatus, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsClaiming(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando información del faucet...</p>
      </div>
    )
  }

  if (error && !status) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadFaucetStatus}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {/* Información del Usuario */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">👤</span>
          Tu Información
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Dirección de Wallet</p>
            <p className="font-mono text-sm break-all">{address}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Balance de {status?.tokenInfo.symbol}</p>
            <p className="text-2xl font-bold text-green-600">
              {status?.balance} {status?.tokenInfo.symbol}
            </p>
          </div>
        </div>
      </div>

      {/* Reclamar Tokens */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🚰</span>
          Reclamar Tokens
        </h2>

        {status?.hasClaimed ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¡Ya reclamaste tus tokens!
            </h3>
            <p className="text-gray-600">
              Esta dirección ya reclamó {status.faucetAmount} {status.tokenInfo.symbol} del faucet.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Puedes reclamar <strong>{status?.faucetAmount} {status?.tokenInfo.symbol}</strong> gratuitos
              </p>
              <p className="text-sm text-gray-500">
                Solo una vez por dirección de wallet
              </p>
            </div>

            <button
              onClick={handleClaimTokens}
              disabled={isClaiming}
              className={`bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-8 rounded-lg transition-colors ${
                isClaiming ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isClaiming ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Reclamando tokens...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">🎁</span>
                  Reclamar {status?.faucetAmount} {status?.tokenInfo.symbol}
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Información del Token */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🪙</span>
          Información del Token
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Nombre</p>
            <p className="font-semibold">{status?.tokenInfo.name}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Símbolo</p>
            <p className="font-semibold">{status?.tokenInfo.symbol}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Decimales</p>
            <p className="font-semibold">{status?.tokenInfo.decimals}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Supply Total</p>
            <p className="font-semibold">{status?.tokenInfo.totalSupply}</p>
          </div>
        </div>
      </div>

      {/* Usuarios del Faucet */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">👥</span>
          Usuarios del Faucet ({status?.totalUsers})
        </h2>
        
        {status?.users && status.users.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-3">Últimos usuarios que reclamaron tokens:</p>
            {status.users.map((user, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <span className="font-mono text-sm">{user}</span>
                {user.toLowerCase() === address.toLowerCase() && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Tú
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No hay usuarios registrados aún.</p>
        )}
      </div>
    </div>
  )
}