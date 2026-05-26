import { Request, Response } from 'express';
import { WalletService } from '../services/wallet.service';
import { FundWalletDto, TransferFundsDto, WithdrawFundsDto } from '../types';
import { successResponse, errorResponse } from '../utils/helpers';
import {
  validateFundWallet,
  validateTransferFunds,
  validateWithdrawFunds,
} from '../utils/validators';
import logger from '../utils/logger';

export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  getWallet = async (req: Request, res: Response): Promise<void> => {
    try {
      const wallet = await this.walletService.getWalletByUserId(
        req.user!.id
      );

      if (!wallet) {
        res.status(404).json(errorResponse('Wallet not found'));
        return;
      }

      res.json(successResponse('Wallet retrieved', wallet));
    } catch (error) {
      logger.error('Get wallet error', { error });
      res.status(500).json(errorResponse('Failed to retrieve wallet'));
    }
  };

  fundWallet = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: FundWalletDto = req.body;

      const validation = validateFundWallet(dto);
      if (!validation.isValid) {
        res.status(400).json(
          errorResponse('Validation failed', validation.errors.join('; '))
        );
        return;
      }

      const transaction = await this.walletService.fundWallet(
        req.user!.id,
        dto
      );

      res
        .status(200)
        .json(
          successResponse('Wallet funded successfully', { transaction })
        );
    } catch (error) {
      logger.error('Fund wallet error', { error });
      const message =
        error instanceof Error ? error.message : 'Failed to fund wallet';
      res.status(400).json(errorResponse(message));
    }
  };

  transferFunds = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: TransferFundsDto = req.body;

      const validation = validateTransferFunds(dto);
      if (!validation.isValid) {
        res.status(400).json(
          errorResponse('Validation failed', validation.errors.join('; '))
        );
        return;
      }

      const result = await this.walletService.transferFunds(
        req.user!.id,
        dto
      );

      res.status(200).json(
        successResponse('Transfer successful', {
          sender_transaction: result.senderTransaction,
          recipient_transaction: result.recipientTransaction,
        })
      );
    } catch (error) {
      logger.error('Transfer funds error', { error });
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to transfer funds';
      const statusCode =
        message.includes('Insufficient') ||
        message.includes('not found')
          ? 400
          : 500;
      res.status(statusCode).json(errorResponse(message));
    }
  };

  withdrawFunds = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: WithdrawFundsDto = req.body;

      const validation = validateWithdrawFunds(dto);
      if (!validation.isValid) {
        res.status(400).json(
          errorResponse('Validation failed', validation.errors.join('; '))
        );
        return;
      }

      const transaction = await this.walletService.withdrawFunds(
        req.user!.id,
        dto
      );

      res
        .status(200)
        .json(
          successResponse('Withdrawal successful', { transaction })
        );
    } catch (error) {
      logger.error('Withdraw funds error', { error });
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to process withdrawal';
      const statusCode = message.includes('Insufficient') ? 400 : 500;
      res.status(statusCode).json(errorResponse(message));
    }
  };

  getTransactions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const wallet = await this.walletService.getWalletByUserId(
        req.user!.id
      );

      if (!wallet) {
        res.status(404).json(errorResponse('Wallet not found'));
        return;
      }

      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const offset = Number(req.query.offset) || 0;

      const transactions =
        await this.walletService.getTransactionsByWalletId(
          wallet.id,
          limit,
          offset
        );

      res.json(
        successResponse('Transactions retrieved', {
          transactions,
          limit,
          offset,
        })
      );
    } catch (error) {
      logger.error('Get transactions error', { error });
      res
        .status(500)
        .json(errorResponse('Failed to retrieve transactions'));
    }
  };
}