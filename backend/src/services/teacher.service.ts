import { TeacherRepository } from '../repositories/teacher.repository';
import { AppError } from '../utils/app-error';

export class TeacherService {
  private teacherRepository = new TeacherRepository();

  async getAllTeachers() {
    return this.teacherRepository.findAll();
  }

  async getTeacherById(id: number) {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }
    return teacher;
  }
}