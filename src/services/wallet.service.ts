import { Knex } from 'knex';
import {
  Wallet,
  Transaction,
  TransactionType,
  TransactionStatus,
  FundWalletDto,
  TransferFundsDto,
  WithdrawFundsDto,
  User,
} from '../types';
import {
  generateId,
  generateReference,
  formatAmount,
} from '../utils/helpers';
import logger from '../utils/logger';

export class WalletService {
  constructor(private readonly db: Knex) {}

  async getWalletByUserId(userId: string): Promise<Wallet | undefined> {
    return this.db<Wallet>('wallets').where({ user_id: userId }).first();
  }

  async getTransactionsByWalletId(
    walletId: string,
    limit = 20,
    offset = 0
  ): Promise<Transaction[]> {
    return this.db<Transaction>('transactions')
      .where({ wallet_id: walletId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async fundWallet(
    userId: string,
    dto: FundWalletDto
  ): Promise<Transaction> {
    const amount = formatAmount(dto.amount);

    return await this.db.transaction(async (trx) => {
      // Lock wallet row to prevent race conditions
      const wallet = await trx<Wallet>('wallets')
        .where({ user_id: userId })
        .forUpdate()
        .first();

      if (!wallet) throw new Error('Wallet not found');

      //const newBalance = formatAmount(wallet.balance + amount);
      const newBalance = formatAmount(Number(wallet.balance) + Number(amount));

      await trx<Wallet>('wallets')
        .where({ id: wallet.id })
        .update({ balance: newBalance, updated_at: trx.fn.now() });

      const transaction: Transaction = {
        id: generateId(),
        wallet_id: wallet.id,
        type: TransactionType.CREDIT,
        amount,
        reference: generateReference(),
        status: TransactionStatus.SUCCESS,
        description: dto.description || 'Wallet funding',
      };

      await trx<Transaction>('transactions').insert(transaction);

      logger.info('Wallet funded', {
        walletId: wallet.id,
        amount,
        newBalance,
      });

      return transaction;
    });
  }

  async transferFunds(
    senderUserId: string,
    dto: TransferFundsDto
  ): Promise<{
    senderTransaction: Transaction;
    recipientTransaction: Transaction;
  }> {
    const amount = formatAmount(dto.amount);

    // Find recipient by email
    const recipient = await this.db<User>('users')
      .where({ email: dto.recipient_email.toLowerCase() })
      .first();

    if (!recipient) throw new Error('Recipient not found');

    if (recipient.id === senderUserId) {
      throw new Error('You cannot transfer funds to yourself');
    }

    return await this.db.transaction(async (trx) => {
      // Lock both wallets — ordered by id to prevent deadlocks
      const wallets = await trx<Wallet>('wallets')
        .whereIn('user_id', [senderUserId, recipient.id])
        .forUpdate()
        .orderBy('id');

      const senderWallet = wallets.find(
        (w) => w.user_id === senderUserId
      );
      const recipientWallet = wallets.find(
        (w) => w.user_id === recipient.id
      );

      if (!senderWallet) throw new Error('Sender wallet not found');
      if (!recipientWallet) {
        throw new Error('Recipient wallet not found');
      }

      if (senderWallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      const senderNewBalance = formatAmount(Number(senderWallet.balance) - Number(amount));
      const recipientNewBalance = formatAmount(Number(recipientWallet.balance) + Number(amount));
      const transferRef = generateReference();

      // Debit sender
      await trx<Wallet>('wallets')
        .where({ id: senderWallet.id })
        .update({
          balance: senderNewBalance,
          updated_at: trx.fn.now(),
        });

      // Credit recipient
      await trx<Wallet>('wallets')
        .where({ id: recipientWallet.id })
        .update({
          balance: recipientNewBalance,
          updated_at: trx.fn.now(),
        });

      const senderTransaction: Transaction = {
        id: generateId(),
        wallet_id: senderWallet.id,
        type: TransactionType.DEBIT,
        amount,
        reference: `${transferRef}-SND`,
        status: TransactionStatus.SUCCESS,
        description: dto.description || `Transfer to ${recipient.email}`,
        metadata: {
          transfer_ref: transferRef,
          recipient_id: recipient.id,
        },
      };

      const recipientTransaction: Transaction = {
        id: generateId(),
        wallet_id: recipientWallet.id,
        type: TransactionType.CREDIT,
        amount,
        reference: `${transferRef}-RCV`,
        status: TransactionStatus.SUCCESS,
        description: dto.description || 'Transfer received',
        metadata: {
          transfer_ref: transferRef,
          sender_id: senderUserId,
        },
      };

      await trx<Transaction>('transactions').insert([
        senderTransaction,
        recipientTransaction,
      ]);

      logger.info('Funds transferred', {
        senderUserId,
        recipientId: recipient.id,
        amount,
        transferRef,
      });

      return { senderTransaction, recipientTransaction };
    });
  }

  async withdrawFunds(
    userId: string,
    dto: WithdrawFundsDto
  ): Promise<Transaction> {
    const amount = formatAmount(dto.amount);

    return await this.db.transaction(async (trx) => {
      const wallet = await trx<Wallet>('wallets')
        .where({ user_id: userId })
        .forUpdate()
        .first();

      if (!wallet) throw new Error('Wallet not found');

      if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      //const newBalance = formatAmount(wallet.balance - amount);
      const newBalance = formatAmount(Number(wallet.balance) - Number(amount));

      await trx<Wallet>('wallets')
        .where({ id: wallet.id })
        .update({ balance: newBalance, updated_at: trx.fn.now() });

      const transaction: Transaction = {
        id: generateId(),
        wallet_id: wallet.id,
        type: TransactionType.DEBIT,
        amount,
        reference: generateReference(),
        status: TransactionStatus.SUCCESS,
        description: dto.description || 'Wallet withdrawal',
      };

      await trx<Transaction>('transactions').insert(transaction);

      logger.info('Withdrawal successful', {
        walletId: wallet.id,
        amount,
        newBalance,
      });

      return transaction;
    });
  }
}