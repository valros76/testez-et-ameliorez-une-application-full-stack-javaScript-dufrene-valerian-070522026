import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { generateToken } from '../utils/jwt.util';
import { AppError } from '../utils/app-error';

export class AuthService {
  private userRepository = new UserRepository();

  async login(body: any) {
    const { email, password } = body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new AppError('Email and password must be strings', 400);
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken(user.id);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
      token,
    };
  }

  async register(body: any) {
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName || !lastName) {
      throw new AppError('All fields are required', 400);
    }
    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      admin: false,
    });

    const token = generateToken(user.id);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
      token,
    };
  }
}