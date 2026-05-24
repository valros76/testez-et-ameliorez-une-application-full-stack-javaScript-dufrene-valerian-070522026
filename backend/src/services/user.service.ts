import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/app-error';

export class UserService {
  private userRepository = new UserRepository();

  async getUserById(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async deleteUser(id: number, currentUserId: number) {
    if (currentUserId !== id) {
      throw new AppError('You can only delete your own account', 403);
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await this.userRepository.delete(id);
  }

  async promoteToAdmin(userId: number | undefined) {
    const isDev = (process.env.NODE_ENV || 'development') === 'development';
    if (!isDev) {
      throw new AppError('Admin self-promotion is only available in development', 403);
    }

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.admin) {
      return user;
    }

    return this.userRepository.update(user.id, { admin: true });
  }
}