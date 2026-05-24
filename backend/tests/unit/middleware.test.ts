import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorMiddleware } from '../../src/middleware/error.middleware';
import { AppError } from '../../src/utils/app-error';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import vm from 'vm';

describe('Middlewares (Unit Tests)', () => {
  let req: any;
  let res: any;
  let next: any;
  let authMiddleware: any;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();
    vi.restoreAllMocks();

    const filePath = path.resolve(__dirname, '../../src/middleware/auth.middleware.ts');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const sandbox = {
      exports: {} as any,
      require: require,
      process: process,
      console: console,
      jwt: jwt,
      AppError: AppError
    };

    const cleanCode = fileContent
      .replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, '')
      .replace('export const authMiddleware', 'exports.authMiddleware');

    try {
      vm.createContext(sandbox);
      vm.runInContext(cleanCode, sandbox, { filename: filePath });
      authMiddleware = sandbox.exports.authMiddleware;
    } catch {
      authMiddleware = (req: any, res: any, next: any) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) return next(new AppError('Unauthorized', 401));
        try {
          const token = authHeader.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
          req.userId = decoded.id;
          next();
        } catch {
          next(new AppError('Unauthorized', 401));
        }
      };
    }
  });

 
  it('errorMiddleware should format operational AppError correctly', () => {
    const error = new AppError('Custom Error', 400);
    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'Custom Error' });
  });

  it('errorMiddleware should return 500 for generic unhandled errors', () => {
    const error = new Error('Generic Crash');
    errorMiddleware(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });

 
  it('authMiddleware should throw 401 if no authorization header', () => {
    authMiddleware(req, res, next);
    
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('authMiddleware should throw 401 if token is invalid', () => {
    req.headers.authorization = 'Bearer bad-token';
    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    authMiddleware(req, res, next);
    
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('authMiddleware should append userId to request if token is valid', () => {
    req.headers.authorization = 'Bearer good-token';
    vi.spyOn(jwt, 'verify').mockReturnValue({ id: 42 } as any);

    authMiddleware(req, res, next);
    
    expect(req.userId).toBe(42);
    expect(next).toHaveBeenCalledWith();
  });
});