import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../src/services/auth.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { AppError } from '../../src/utils/app-error';
import * as bcrypt from 'bcrypt';

vi.mock('../../src/repositories/user.repository');
vi.mock('bcrypt');
vi.mock('../../src/utils/jwt.util', () => ({
  generateToken: () => 'fake-jwt-token',
}));

describe('AuthService (Unit Tests)', () => {
  let authService: AuthService;
  let userRepositoryMock: any;

  beforeEach(() => {
    authService = new AuthService();
    userRepositoryMock = UserRepository.prototype;
  });

  it('should throw an AppError if validation fails during login (Zod)', async () => {
    const invalidBody = { email: 'invalid-email', password: '' };
    await expect(authService.login(invalidBody)).rejects.toThrow(AppError);
  });

  it('should throw a 401 error if user is not found during login', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);
    const body = { email: 'test@test.com', password: 'password123' };
    await expect(authService.login(body)).rejects.toThrow(new AppError('Invalid credentials', 401));
  });

  it('should throw a 401 error if password does not match', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({ id: 1, password: 'hashed' });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    const body = { email: 'test@test.com', password: 'password123' };
    await expect(authService.login(body)).rejects.toThrow(new AppError('Invalid credentials', 401));
  });

  it('should return token and user details on correct login', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({ id: 1, email: 'a@b.com', password: 'password123' });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    const result = await authService.login({ email: 'a@b.com', password: 'password123' });
    expect(result).toHaveProperty('token');
  });

  it('should throw 400 during registration if email already exists', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({ id: 1 });
    const body = { email: 'exist@test.com', password: 'password123', firstName: 'A', lastName: 'B' };
    await expect(authService.register(body)).rejects.toThrow(new AppError('Email already exists', 400));
  });

  it('should hash password and save new user on successful registration', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed_pwd' as never);
    userRepositoryMock.create.mockResolvedValue({ id: 2, email: 'new@test.com' });

    const body = { email: 'new@test.com', password: 'password123', firstName: 'A', lastName: 'B' };
    const result = await authService.register(body);
    expect(result).toHaveProperty('id', 2);
  });
});