import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../utils/catch-async';

const authService = new AuthService();

export class AuthController {
  login = catchAsync(async (req: Request, res: Response) => {
    const user = await authService.login(req.body);
    res.status(200).json(user);
  });

  register = catchAsync(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  });
}