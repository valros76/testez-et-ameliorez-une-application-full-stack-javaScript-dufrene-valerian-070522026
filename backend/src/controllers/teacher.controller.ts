import { Response } from 'express';
import { TeacherService } from '../services/teacher.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { catchAsync } from '../utils/catch-async';

const teacherService = new TeacherService();

export class TeacherController {
  getAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const teachers = await teacherService.getAllTeachers();
    res.status(200).json(teachers);
  });

  getById = catchAsync(async (req: AuthRequest, res: Response) => {
    const teacher = await teacherService.getTeacherById(parseInt(req.params.id as string));
    res.status(200).json(teacher);
  });
}