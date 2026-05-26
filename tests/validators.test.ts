import {
  validateCreateUser,
  validateFundWallet,
  validateTransferFunds,
  validateWithdrawFunds,
} from '../src/utils/validators';

describe('validateCreateUser', () => {
  const validUser = {
    first_name: 'Ada',
    last_name: 'Obi',
    email: 'ada@example.com',
    phone: '+2348012345678',
    bvn: '12345678901',
  };

  // Positive tests
  it('should pass for valid user data', () => {
    const result = validateCreateUser(validUser);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // Negative tests
  it('should fail when first_name is missing', () => {
    const result = validateCreateUser({ ...validUser, first_name: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'First name must be at least 2 characters'
    );
  });

  it('should fail for invalid email', () => {
    const result = validateCreateUser({
      ...validUser,
      email: 'not-an-email',
    });
    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.includes('email'))
    ).toBe(true);
  });

  it('should fail when BVN is not 11 digits', () => {
    const result = validateCreateUser({ ...validUser, bvn: '1234' });
    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.includes('BVN'))
    ).toBe(true);
  });

  it('should fail for invalid phone number', () => {
    const result = validateCreateUser({ ...validUser, phone: '123' });
    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.includes('phone'))
    ).toBe(true);
  });

  it('should collect multiple errors at once', () => {
    const result = validateCreateUser({});
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe('validateFundWallet', () => {
  // Positive tests
  it('should pass for valid amount', () => {
    const result = validateFundWallet({ amount: 5000 });
    expect(result.isValid).toBe(true);
  });

  // Negative tests
  it('should fail for zero amount', () => {
    const result = validateFundWallet({ amount: 0 });
    expect(result.isValid).toBe(false);
  });

  it('should fail for negative amount', () => {
    const result = validateFundWallet({ amount: -100 });
    expect(result.isValid).toBe(false);
  });

  it('should fail when amount exceeds limit', () => {
    const result = validateFundWallet({ amount: 11000000 });
    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.includes('10,000,000'))
    ).toBe(true);
  });

  it('should fail when amount is missing', () => {
    const result = validateFundWallet({});
    expect(result.isValid).toBe(false);
  });
});

describe('validateTransferFunds', () => {
  const validTransfer = {
    recipient_email: 'bob@example.com',
    amount: 1000,
  };

  // Positive tests
  it('should pass for valid transfer data', () => {
    const result = validateTransferFunds(validTransfer);
    expect(result.isValid).toBe(true);
  });

  // Negative tests
  it('should fail for invalid recipient email', () => {
    const result = validateTransferFunds({
      ...validTransfer,
      recipient_email: 'bad-email',
    });
    expect(result.isValid).toBe(false);
  });

  it('should fail for zero amount', () => {
    const result = validateTransferFunds({
      ...validTransfer,
      amount: 0,
    });
    expect(result.isValid).toBe(false);
  });

  it('should fail when recipient email is missing', () => {
    const result = validateTransferFunds({ amount: 100 });
    expect(result.isValid).toBe(false);
  });
});

describe('validateWithdrawFunds', () => {
  // Positive tests
  it('should pass for valid amount', () => {
    const result = validateWithdrawFunds({ amount: 500 });
    expect(result.isValid).toBe(true);
  });

  // Negative tests
  it('should fail for zero amount', () => {
    const result = validateWithdrawFunds({ amount: 0 });
    expect(result.isValid).toBe(false);
  });

  it('should fail for negative amount', () => {
    const result = validateWithdrawFunds({ amount: -50 });
    expect(result.isValid).toBe(false);
  });

  it('should fail above the limit', () => {
    const result = validateWithdrawFunds({ amount: 99999999 });
    expect(result.isValid).toBe(false);
  });
});