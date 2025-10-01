import { useState } from 'react'
import { useSignMessage } from 'wagmi'

interface AuthLoginProps {
  address: string
  onAuthSuccess: (token: string) => void
}

export default function AuthLogin({ address, onAuthSuccess }: AuthLoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const { signMessage } = useSignMessage()

  // Paso 1: Obtener mensaje para firmar
  const handleGetMessage = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('http://localhost:3001/auth/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al obtener mensaje')
      }

      const data = await response.json()
      setMessage(data.message)
      setNonce(data.nonce)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Paso 2: Firmar mensaje
  const handleSignMessage = () => {
    if (!message || !nonce) return

    signMessage(
      { message },
      {
        onSuccess: (signature) => {
          handleSubmitSignature(signature)
        },
        onError: (error) => {
          setError(`Error al firmar: ${error.message}`)
        }
      }
    )
  }

  // Paso 3: Enviar firma al backend
  const handleSubmitSignature = async (signature: string) => {
    try {
      setIsLoading(true)

      const response = await fetch('http://localhost:3001/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          signature,
          nonce 
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error en autenticación')
      }

      const data = await response.json()
      onAuthSuccess(data.token)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="text-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Autenticación Web3
          </h2>
          <p className="text-gray-600 mb-4">
            Firma el mensaje con tu wallet para autenticarte de forma segura
          </p>
          <div className="text-sm text-gray-500 bg-gray-50 rounded p-2">
            <strong>Dirección:</strong> {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!message ? (
          <button
            onClick={handleGetMessage}
            disabled={isLoading}
            className={`w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors ${
              isLoading ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generando mensaje...
              </div>
            ) : (
              'Generar Mensaje de Autenticación'
            )}
          </button>
        ) : (
          <div>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <p className="text-xs text-gray-600 mb-2">Mensaje a firmar:</p>
              <div className="text-sm font-mono bg-white p-2 rounded border max-h-32 overflow-y-auto">
                {message}
              </div>
            </div>
            
            <button
              onClick={handleSignMessage}
              disabled={isLoading}
              className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors ${
                isLoading ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Autenticando...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">✍️</span>
                  Firmar Mensaje
                </div>
              )}
            </button>

            <button
              onClick={() => {
                setMessage(null)
                setNonce(null)
                setError(null)
              }}
              className="w-full mt-2 text-gray-600 hover:text-gray-700 text-sm"
            >
              Generar nuevo mensaje
            </button>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>La firma es gratuita y no consume gas</p>
        </div>
      </div>
    </div>
  )
}