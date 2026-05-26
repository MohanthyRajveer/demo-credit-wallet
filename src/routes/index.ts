import { Router } from 'express';
import { Knex } from 'knex';
import { UserController } from '../controllers/user.controller';
import { WalletController } from '../controllers/wallet.controller';
import { UserService } from '../services/user.service';
import { WalletService } from '../services/wallet.service';
import { authMiddleware } from '../middleware/auth.middleware';

export const createRouter = (db: Knex): Router => {
  const router = Router();

  const userService = new UserService(db);
  const walletService = new WalletService(db);
  const userController = new UserController(userService);
  const walletController = new WalletController(walletService);
  const authenticate = authMiddleware(db);

  // Health check — no auth needed
  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Demo Credit Wallet API',
      timestamp: new Date().toISOString(),
    });
  });

  // User routes
  router.post('/users', userController.createUser);
  router.get('/users/profile', authenticate, userController.getProfile);

  // Wallet routes — all require authentication
  router.get('/wallet', authenticate, walletController.getWallet);
  router.post('/wallet/fund', authenticate, walletController.fundWallet);
  router.post('/wallet/transfer', authenticate, walletController.transferFunds);
  router.post('/wallet/withdraw', authenticate, walletController.withdrawFunds);
  router.get('/wallet/transactions', authenticate, walletController.getTransactions);

  return router;
};