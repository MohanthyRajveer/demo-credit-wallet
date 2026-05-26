export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bvn: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  type: TransactionType;
  amount: number;
  reference: string;
  status: TransactionStatus;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at?: Date;
  updated_at?: Date;
}

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface CreateUserDto {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bvn: string;
}

export interface FundWalletDto {
  amount: number;
  description?: string;
}

export interface TransferFundsDto {
  recipient_email: string;
  amount: number;
  description?: string;
}

export interface WithdrawFundsDto {
  amount: number;
  description?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}