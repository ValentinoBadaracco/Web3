import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, FAUCET_TOKEN_ABI, SEPOLIA_CONFIG } from '../config/contract';

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    // Inicializar provider
    this.provider = new ethers.JsonRpcProvider(SEPOLIA_CONFIG.rpcUrl);
    
    // Inicializar wallet con la clave privada
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY no configurada en variables de entorno');
    }
    
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    // Inicializar contrato
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      FAUCET_TOKEN_ABI,
      this.wallet
    );
  }

  // Reclamar tokens del faucet
  async claimTokens(): Promise<{ txHash: string; success: boolean }> {
    try {
      console.log('🔄 Intentando reclamar tokens...');
      
      const tx = await this.contract.claimTokens();
      console.log('📝 Transacción enviada:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Transacción confirmada:', receipt.hash);
      
      return {
        txHash: receipt.hash,
        success: true
      };
    } catch (error: any) {
      console.error('❌ Error al reclamar tokens:', error);
      throw new Error(`Error al reclamar tokens: ${error.message}`);
    }
  }

  // Verificar si una dirección ya reclamó tokens
  async hasAddressClaimed(address: string): Promise<boolean> {
    try {
      const hasClaimed = await this.contract.hasAddressClaimed(address);
      return hasClaimed;
    } catch (error: any) {
      console.error('❌ Error al verificar reclamo:', error);
      throw new Error(`Error al verificar reclamo: ${error.message}`);
    }
  }

  // Obtener balance de tokens de una dirección
  async getTokenBalance(address: string): Promise<string> {
    try {
      const balance = await this.contract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error: any) {
      console.error('❌ Error al obtener balance:', error);
      throw new Error(`Error al obtener balance: ${error.message}`);
    }
  }

  // Obtener lista de usuarios del faucet
  async getFaucetUsers(): Promise<string[]> {
    try {
      const users = await this.contract.getFaucetUsers();
      return users;
    } catch (error: any) {
      console.error('❌ Error al obtener usuarios:', error);
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  // Obtener cantidad de tokens por reclamo
  async getFaucetAmount(): Promise<string> {
    try {
      const amount = await this.contract.getFaucetAmount();
      return ethers.formatEther(amount);
    } catch (error: any) {
      console.error('❌ Error al obtener cantidad del faucet:', error);
      throw new Error(`Error al obtener cantidad del faucet: ${error.message}`);
    }
  }

  // Obtener información del token
  async getTokenInfo(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  }> {
    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals(),
        this.contract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatEther(totalSupply)
      };
    } catch (error: any) {
      console.error('❌ Error al obtener info del token:', error);
      throw new Error(`Error al obtener info del token: ${error.message}`);
    }
  }
}

// Singleton del servicio
export const blockchainService = new BlockchainService();