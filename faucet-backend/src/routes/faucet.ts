import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { blockchainService } from '../services/blockchain';

const router = express.Router();

// POST /faucet/claim - Reclamar tokens (Protegido)
router.post('/claim', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { address } = req.user;

    // Verificar si ya reclamó tokens
    const hasClaimed = await blockchainService.hasAddressClaimed(address);
    
    if (hasClaimed) {
      return res.status(400).json({ 
        error: 'Esta dirección ya reclamó tokens del faucet',
        hasClaimed: true 
      });
    }

    console.log(`🔄 ${address} intentando reclamar tokens...`);

    // Ejecutar reclamo de tokens
    const result = await blockchainService.claimTokens();

    console.log(`✅ Tokens reclamados exitosamente para ${address}`);

    res.json({
      success: true,
      txHash: result.txHash,
      message: '¡Tokens reclamados exitosamente!',
      address
    });
  } catch (error: any) {
    console.error('❌ Error al reclamar tokens:', error);
    
    // Manejar errores específicos del contrato
    let errorMessage = 'Error al reclamar tokens';
    
    if (error.message.includes('Already claimed')) {
      errorMessage = 'Esta dirección ya reclamó tokens';
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Fondos insuficientes en el contrato';
    }

    res.status(500).json({ 
      success: false,
      error: errorMessage,
      details: error.message 
    });
  }
});

// GET /faucet/status/:address - Obtener estado del faucet para una dirección (Protegido)
router.get('/status/:address', authenticateToken, async (req, res) => {
  try {
    const { address } = req.params;

    // Validar formato de dirección
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Formato de dirección inválido' });
    }

    // Verificar que el usuario autenticado puede acceder a esta información
    if (req.user?.address !== address) {
      return res.status(403).json({ 
        error: 'No autorizado para acceder a esta información' 
      });
    }

    console.log(`📊 Obteniendo estado del faucet para ${address}`);

    // Obtener datos en paralelo
    const [hasClaimed, balance, users, faucetAmount, tokenInfo] = await Promise.all([
      blockchainService.hasAddressClaimed(address),
      blockchainService.getTokenBalance(address),
      blockchainService.getFaucetUsers(),
      blockchainService.getFaucetAmount(),
      blockchainService.getTokenInfo()
    ]);

    res.json({
      address,
      hasClaimed,
      balance,
      faucetAmount,
      totalUsers: users.length,
      users: users.slice(-10), // Solo los últimos 10 usuarios
      tokenInfo
    });
  } catch (error: any) {
    console.error('❌ Error al obtener estado del faucet:', error);
    res.status(500).json({ 
      error: 'Error al obtener estado del faucet',
      details: error.message 
    });
  }
});

// GET /faucet/info - Obtener información general del faucet (Público)
router.get('/info', async (req, res) => {
  try {
    console.log('📋 Obteniendo información del faucet...');

    const [faucetAmount, tokenInfo, users] = await Promise.all([
      blockchainService.getFaucetAmount(),
      blockchainService.getTokenInfo(),
      blockchainService.getFaucetUsers()
    ]);

    res.json({
      faucetAmount,
      tokenInfo,
      totalUsers: users.length,
      contractAddress: process.env.CONTRACT_ADDRESS,
      chainId: 11155111,
      networkName: 'Sepolia'
    });
  } catch (error: any) {
    console.error('❌ Error al obtener info del faucet:', error);
    res.status(500).json({ 
      error: 'Error al obtener información del faucet',
      details: error.message 
    });
  }
});

// GET /faucet/users - Obtener lista de usuarios del faucet (Público, limitado)
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    console.log(`👥 Obteniendo usuarios del faucet (página ${page})`);

    const allUsers = await blockchainService.getFaucetUsers();
    
    // Invertir para mostrar los más recientes primero
    const reversedUsers = [...allUsers].reverse();
    const paginatedUsers = reversedUsers.slice(offset, offset + limit);

    res.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: allUsers.length,
        totalPages: Math.ceil(allUsers.length / limit)
      }
    });
  } catch (error: any) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({ 
      error: 'Error al obtener usuarios del faucet',
      details: error.message 
    });
  }
});

export default router;