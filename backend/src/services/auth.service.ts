import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { generateToken } from '../utils/jwt.util';
import { AppError } from '../utils/app-error';
import { LoginSchema, RegisterSchema } from '../dto/auth.dto';

export class AuthService {
  private userRepository = new UserRepository();

  async login(body: any) {
    const result = LoginSchema.safeParse(body);
    
    if (!result.success) {
      const firstError = result.error.issues[0].message;
      throw new AppError(firstError, 400);
    }

    const { email, password } = result.data;

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
    const result = RegisterSchema.safeParse(body);
    
    if (!result.success) {
      const firstError = result.error.issues[0].message;
      throw new AppError(firstError, 400);
    }

    const { email, password, firstName, lastName } = result.data;

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