import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../../src/services/user.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { AppError } from '../../src/utils/app-error';

vi.mock('../../src/repositories/user.repository');

describe('UserService (Unit Tests)', () => {
  let userService: UserService;
  let userRepoMock: any;

  beforeEach(() => {
    userService = new UserService();
    userRepoMock = UserRepository.prototype;
  });

  it('should return user info if found', async () => {
    userRepoMock.findById.mockResolvedValue({ id: 1, email: 'test@test.com' });
    const res = await userService.getUserById(1);
    expect(res.email).toBe('test@test.com');
  });

  it('should throw 404 if user to get does not exist', async () => {
    userRepoMock.findById.mockResolvedValue(null);
    await expect(userService.getUserById(99)).rejects.toThrow(new AppError('User not found', 404));
  });

  it('should throw 403 if a user tries to delete another user account', async () => {
    await expect(userService.deleteUser(5, 1)).rejects.toThrow(AppError);
  });

  it('should throw 404 if user to delete does not exist', async () => {
    userRepoMock.findById.mockResolvedValue(null);
    await expect(userService.deleteUser(1, 1)).rejects.toThrow(AppError);
  });

  it('should delete account if current user matches id', async () => {
    userRepoMock.findById.mockResolvedValue({ id: 1 });
    await expect(userService.deleteUser(1, 1)).resolves.not.toThrow();
  });

  it('should throw 403 during admin self-promotion if environment is production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    await expect(userService.promoteToAdmin(1)).rejects.toThrow(AppError);
    process.env.NODE_ENV = originalEnv;
  });

  it('should throw 401 if userId is not provided', async () => {
    await expect(userService.promoteToAdmin(undefined)).rejects.toThrow(AppError);
  });

  it('should throw 404 if user to promote does not exist', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    userRepoMock.findById.mockResolvedValue(null);
    await expect(userService.promoteToAdmin(1)).rejects.toThrow(AppError);
    process.env.NODE_ENV = originalEnv;
  });

  it('should return user directly if already admin', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    userRepoMock.findById.mockResolvedValue({ id: 1, admin: true });
    
    const res = await userService.promoteToAdmin(1);
    expect(res.admin).toBe(true);
    process.env.NODE_ENV = originalEnv;
  });

  it('should trigger update repository if user is not yet admin', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    userRepoMock.findById.mockResolvedValue({ id: 1, admin: false });
    userRepoMock.update.mockResolvedValue({ id: 1, admin: true });
    
    const res = await userService.promoteToAdmin(1);
    expect(res.admin).toBe(true);
    process.env.NODE_ENV = originalEnv;
  });
});