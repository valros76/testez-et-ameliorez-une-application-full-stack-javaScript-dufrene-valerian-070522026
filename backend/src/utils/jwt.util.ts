import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

export const generateToken = (userId: number): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
};

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
