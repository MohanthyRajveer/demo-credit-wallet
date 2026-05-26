import {
  generateId,
  generateReference,
  successResponse,
  errorResponse,
  formatAmount,
} from '../src/utils/helpers';

describe('generateId', () => {
  it('should generate a valid UUID', () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('should generate unique IDs each time', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe('generateReference', () => {
  it('should generate a reference starting with DC-', () => {
    const ref = generateReference();
    expect(ref.startsWith('DC-')).toBe(true);
  });

  it('should generate unique references each time', () => {
    const ref1 = generateReference();
    const ref2 = generateReference();
    expect(ref1).not.toBe(ref2);
  });
});

describe('successResponse', () => {
  it('should return success true with message and data', () => {
    const response = successResponse('Done', { id: 1 });
    expect(response.success).toBe(true);
    expect(response.message).toBe('Done');
    expect(response.data).toEqual({ id: 1 });
  });

  it('should work without data', () => {
    const response = successResponse('Done');
    expect(response.success).toBe(true);
    expect(response.data).toBeUndefined();
  });
});

describe('errorResponse', () => {
  it('should return success false with message', () => {
    const response = errorResponse('Something went wrong');
    expect(response.success).toBe(false);
    expect(response.message).toBe('Something went wrong');
  });

  it('should include error details when provided', () => {
    const response = errorResponse('Failed', 'Detailed error');
    expect(response.error).toBe('Detailed error');
  });
});

describe('formatAmount', () => {
  it('should round to 2 decimal places', () => {
    expect(formatAmount(10.005)).toBe(10.01);
  });

  it('should handle whole numbers', () => {
    expect(formatAmount(5000)).toBe(5000);
  });

  it('should handle addition correctly without float errors', () => {
    expect(formatAmount(0.1 + 0.2)).toBe(0.3);
  });
});