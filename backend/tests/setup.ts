import { beforeEach, vi } from 'vitest';

vi.mock('../src/middleware/auth.middleware', () => {
  return {
    authMiddleware: (req: any, res: any, next: any) => {
      req.userId = 1;
      next();
    }
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});