import {
  CreateUserDto,
  FundWalletDto,
  TransferFundsDto,
  WithdrawFundsDto,
} from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateCreateUser = (
  data: Partial<CreateUserDto>
): ValidationResult => {
  const errors: string[] = [];

  if (!data.first_name || data.first_name.trim().length < 2) {
    errors.push('First name must be at least 2 characters');
  }
  if (!data.last_name || data.last_name.trim().length < 2) {
    errors.push('Last name must be at least 2 characters');
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('A valid email address is required');
  }
  if (
    !data.phone ||
    !/^\+?[1-9]\d{9,14}$/.test(data.phone.replace(/\s/g, ''))
  ) {
    errors.push('A valid phone number is required (10-15 digits)');
  }
  if (!data.bvn || !/^\d{11}$/.test(data.bvn)) {
    errors.push('BVN must be exactly 11 digits');
  }

  return { isValid: errors.length === 0, errors };
};

export const validateFundWallet = (
  data: Partial<FundWalletDto>
): ValidationResult => {
  const errors: string[] = [];

  if (!data.amount || typeof data.amount !== 'number') {
    errors.push('Amount must be a number');
  } else if (data.amount <= 0) {
    errors.push('Amount must be greater than 0');
  } else if (data.amount > 10_000_000) {
    errors.push('Amount cannot exceed 10,000,000');
  }

  return { isValid: errors.length === 0, errors };
};

export const validateTransferFunds = (
  data: Partial<TransferFundsDto>
): ValidationResult => {
  const errors: string[] = [];

  if (
    !data.recipient_email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.recipient_email)
  ) {
    errors.push('A valid recipient email address is required');
  }
  if (!data.amount || typeof data.amount !== 'number') {
    errors.push('Amount must be a number');
  } else if (data.amount <= 0) {
    errors.push('Amount must be greater than 0');
  } else if (data.amount > 10_000_000) {
    errors.push('Amount cannot exceed 10,000,000');
  }

  return { isValid: errors.length === 0, errors };
};

export const validateWithdrawFunds = (
  data: Partial<WithdrawFundsDto>
): ValidationResult => {
  const errors: string[] = [];

  if (!data.amount || typeof data.amount !== 'number') {
    errors.push('Amount must be a number');
  } else if (data.amount <= 0) {
    errors.push('Amount must be greater than 0');
  } else if (data.amount > 10_000_000) {
    errors.push('Amount cannot exceed 10,000,000');
  }

  return { isValid: errors.length === 0, errors };
};