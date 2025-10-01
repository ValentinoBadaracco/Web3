import { SiweMessage } from 'siwe';
import jwt from 'jsonwebtoken';

export interface AuthMessage {
  message: string;
  address: string;
  nonce: string;
}

export interface AuthResult {
  token: string;
  address: string;
}

export class AuthService {
  private messages = new Map<string, { message: SiweMessage; timestamp: number }>();

  // Generar mensaje para firmar
  generateMessage(address: string, nonce: string): AuthMessage {
    const message = new SiweMessage({
      domain: 'localhost:3001',
      address,
      statement: 'Sign in to Faucet Token App',
      uri: 'http://localhost:5173',
      version: '1',
      chainId: 11155111,
      nonce,
    });

    // Guardar mensaje temporalmente (en producción usar Redis o DB)
    this.messages.set(nonce, {
      message,
      timestamp: Date.now()
    });

    return {
      message: message.prepareMessage(),
      address,
      nonce
    };
  }

  // Verificar firma y generar JWT
  async verifySignature(signature: string, nonce: string): Promise<AuthResult> {
    try {
      // Obtener mensaje guardado
      const messageData = this.messages.get(nonce);
      if (!messageData) {
        throw new Error('Mensaje no encontrado o expirado');
      }

      const { message } = messageData;

      // Verificar que no haya expirado (10 minutos)
      if (Date.now() - messageData.timestamp > 10 * 60 * 1000) {
        this.messages.delete(nonce);
        throw new Error('Mensaje expirado');
      }

      // Verificar la firma
      const verificationResult = await message.verify({ signature });
      
      if (!verificationResult.success) {
        throw new Error('Firma inválida');
      }

      // Limpiar mensaje usado
      this.messages.delete(nonce);

      // Generar JWT
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET no configurado');
      }

      const token = jwt.sign(
        { 
          address: message.address,
          chainId: message.chainId,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
        },
        jwtSecret
      );

      return {
        token,
        address: message.address
      };
    } catch (error: any) {
      console.error('❌ Error al verificar firma:', error);
      throw new Error(`Error de autenticación: ${error.message}`);
    }
  }

  // Verificar JWT token
  verifyToken(token: string): { address: string; chainId: number } {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET no configurado');
      }

      const decoded = jwt.verify(token, jwtSecret) as any;
      
      return {
        address: decoded.address,
        chainId: decoded.chainId
      };
    } catch (error: any) {
      console.error('❌ Error al verificar token:', error);
      throw new Error('Token inválido o expirado');
    }
  }

  // Limpiar mensajes expirados (llamar periódicamente)
  cleanupExpiredMessages(): void {
    const now = Date.now();
    const expirationTime = 10 * 60 * 1000; // 10 minutos

    for (const [nonce, messageData] of this.messages.entries()) {
      if (now - messageData.timestamp > expirationTime) {
        this.messages.delete(nonce);
      }
    }
  }
}

// Singleton del servicio
export const authService = new AuthService();

// Limpiar mensajes expirados cada 5 minutos
setInterval(() => {
  authService.cleanupExpiredMessages();
}, 5 * 60 * 1000);