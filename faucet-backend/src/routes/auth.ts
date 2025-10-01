import express from 'express';
import { authService } from '../services/auth';

const router = express.Router();

// POST /auth/message - Generar mensaje para firmar
router.post('/message', (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Dirección requerida' });
    }

    // Validar formato de dirección Ethereum
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Formato de dirección inválido' });
    }

    // Generar nonce único
    const nonce = Math.random().toString(36).substring(2, 15);

    // Generar mensaje SIWE
    const messageData = authService.generateMessage(address, nonce);

    console.log(`📝 Mensaje generado para ${address}`);

    res.json({
      message: messageData.message,
      nonce: messageData.nonce
    });
  } catch (error: any) {
    console.error('❌ Error al generar mensaje:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /auth/signin - Verificar firma y generar JWT
router.post('/signin', async (req, res) => {
  try {
    const { signature, nonce } = req.body;

    if (!signature || !nonce) {
      return res.status(400).json({ 
        error: 'Firma y nonce requeridos' 
      });
    }

    // Verificar firma y generar JWT
    const authResult = await authService.verifySignature(signature, nonce);

    console.log(`✅ Usuario autenticado: ${authResult.address}`);

    res.json({
      token: authResult.token,
      address: authResult.address,
      success: true
    });
  } catch (error: any) {
    console.error('❌ Error en signin:', error);
    res.status(401).json({ 
      error: error.message || 'Error de autenticación' 
    });
  }
});

// GET /auth/verify - Verificar token JWT
router.get('/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const decoded = authService.verifyToken(token);

    res.json({
      valid: true,
      address: decoded.address,
      chainId: decoded.chainId
    });
  } catch (error: any) {
    console.error('❌ Error al verificar token:', error);
    res.status(403).json({ 
      valid: false,
      error: 'Token inválido o expirado' 
    });
  }
});

export default router;