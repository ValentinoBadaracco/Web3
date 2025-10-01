# 🚰 Faucet Token Web3 App

## Descripción
Aplicación Web3 completa que permite a los usuarios reclamar tokens FAUCET usando autenticación SIWE (Sign-In with Ethereum) en la red Sepolia testnet.

## 🎯 Funcionalidades

### Frontend (React + TypeScript)
- ✅ Conexión con MetaMask
- ✅ Interfaz moderna con Tailwind CSS
- ✅ Verificación automática de red Sepolia
- ✅ Dashboard interactivo del faucet

### Backend (Express + Node.js)
- ✅ API RESTful con Express
- ✅ Autenticación SIWE (Sign-In with Ethereum)
- ✅ Interacción con smart contracts
- ✅ Sistema de JWT para sesiones

### Blockchain Integration
- ✅ Red: Sepolia Testnet (Chain ID: 11155111)
- ✅ Token: FAUCET (1,000,000 por dirección)
- ✅ Contrato: `0x3e2117c19a921507ead57494bbf29032f33c7412`

## 🚀 Tecnologías Utilizadas

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Wagmi + Viem (Web3 libraries)
- TanStack Query

**Backend:**
- Node.js + Express
- TypeScript
- SIWE (Sign-In with Ethereum)
- JWT Authentication
- Ethers.js

## 📦 Instalación y Uso

### 1. Backend
```bash
cd faucet-backend
npm install
cp .env.example .env
# Configurar variables en .env
npm run dev
```

### 2. Frontend
```bash
cd faucet-token-app
npm install
npm run dev
```

## 🔧 Configuración

### Variables de Entorno (Backend)
```env
PRIVATE_KEY=your_private_key_here
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173
```

## 🌐 Demo en Vivo

1. **Conectar MetaMask** a Sepolia testnet
2. **Obtener Sepolia ETH** de un faucet público
3. **Acceder a la aplicación** en http://localhost:5173
4. **Conectar wallet** y autenticarse con SIWE
5. **Reclamar tokens** - ¡Solo una vez por dirección!

## 📋 Flujo de Usuario

1. **Conexión de Wallet** → MetaMask detecta automáticamente
2. **Verificación de Red** → Cambio automático a Sepolia si es necesario
3. **Autenticación SIWE** → Firma de mensaje seguro (gratuito)
4. **Reclamación de Tokens** → Transacción en blockchain (costo de gas)
5. **Confirmación** → Tokens transferidos exitosamente

## ✅ Resultado Final

**Aplicación Web3 100% funcional que demuestra:**
- Integración completa con MetaMask
- Autenticación descentralizada con SIWE
- Interacción real con smart contracts
- Manejo de transacciones blockchain
- UX/UI moderna para Web3

---

**Desarrollado para:** Ejercicio 12 - Aplicación React Web3 con Faucet Token  
**Estado:** ✅ Completado y funcionando