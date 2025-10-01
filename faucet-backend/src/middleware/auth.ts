import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth';

// Extender Request para incluir user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        address: string;
        chainId: number;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Token de acceso requerido' });
      return;
    }

    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error('❌ Error de autenticación:', error.message);
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};