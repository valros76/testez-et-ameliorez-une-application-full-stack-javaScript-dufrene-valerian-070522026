import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateToken } from '../../src/utils/jwt.util';

describe('JWT Utility (Unit Tests)', () => {
  it('should generate and verify a token successfully', () => {
    const userId = 42;
    
    const token = generateToken(userId);
    
    expect(token).toBeTypeOf('string');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number };
    expect(decoded.id).toBe(42);
  });
});