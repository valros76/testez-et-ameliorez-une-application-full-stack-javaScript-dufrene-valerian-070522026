import { Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { catchAsync } from '../utils/catch-async';

const userService = new UserService();

export class UserController {
  getById = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await userService.getUserById(parseInt(req.params.id as string));
    res.status(200).json(user);
  });

  delete = catchAsync(async (req: AuthRequest, res: Response) => {
    await userService.deleteUser(parseInt(req.params.id as string), req.userId!);
    res.status(200).json({ message: 'User deleted successfully' });
  });

  promoteSelfToAdmin = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await userService.promoteToAdmin(req.userId!);
    res.status(200).json(user);
  });
}