import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeacherService } from '../../src/services/teacher.service';
import { TeacherRepository } from '../../src/repositories/teacher.repository';
import { AppError } from '../../src/utils/app-error';

vi.mock('../../src/repositories/teacher.repository');

describe('TeacherService (Unit Tests)', () => {
  let teacherService: TeacherService;
  let teacherRepoMock: any;

  beforeEach(() => {
    teacherService = new TeacherService();
    teacherRepoMock = TeacherRepository.prototype;
  });

  it('should return all teachers', async () => {
    const mockTeachers = [
      { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, firstName: 'Jane', lastName: 'Smith', createdAt: new Date(), updatedAt: new Date() }
    ];
    teacherRepoMock.findAll.mockResolvedValue(mockTeachers);

    const result = await teacherService.getAllTeachers();

    expect(result).toHaveLength(2);
    expect(result[0].firstName).toBe('John');
  });

  it('should return a teacher by id if they exist', async () => {
    const mockTeacher = { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() };
    teacherRepoMock.findById.mockResolvedValue(mockTeacher);

    const result = await teacherService.getTeacherById(1);

    expect(result).toHaveProperty('id', 1);
    expect(result.lastName).toBe('Doe');
  });

  it('should throw a 404 AppError if the teacher does not exist', async () => {
    teacherRepoMock.findById.mockResolvedValue(null);

    await expect(teacherService.getTeacherById(99)).rejects.toThrow(
      new AppError('Teacher not found', 404)
    );
  });
});