import { z } from 'zod';

export const CreateSessionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  teacherId: z.number()
});

export const UpdateSessionSchema = z.object({
  name: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  teacherId: z.number().optional()
});

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionInput = z.infer<typeof UpdateSessionSchema>;