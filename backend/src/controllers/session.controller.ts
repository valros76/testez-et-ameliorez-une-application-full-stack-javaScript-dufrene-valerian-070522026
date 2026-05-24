import { Response } from 'express';
import { SessionService } from '../services/session.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { catchAsync } from '../utils/catch-async';

const sessionService = new SessionService();

export class SessionController {
  getAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const sessions = await sessionService.getAllSessions();
    res.status(200).json(sessions);
  });

  getById = catchAsync(async (req: AuthRequest, res: Response) => {
    const session = await sessionService.getSessionById(parseInt(req.params.id as string));
    res.status(200).json(session);
  });

  create = catchAsync(async (req: AuthRequest, res: Response) => {
    const session = await sessionService.createSession(req.userId, req.body);
    res.status(201).json(session);
  });

  update = catchAsync(async (req: AuthRequest, res: Response) => {
    const session = await sessionService.updateSession(parseInt(req.params.id as string), req.userId, req.body);
    res.status(200).json(session);
  });

  delete = catchAsync(async (req: AuthRequest, res: Response) => {
    await sessionService.deleteSession(parseInt(req.params.id as string), req.userId);
    res.status(200).json({ message: 'Session deleted successfully' });
  });

  participate = catchAsync(async (req: AuthRequest, res: Response) => {
    await sessionService.participate(parseInt(req.params.id as string), parseInt(req.params.userId as string));
    res.status(200).json({ message: 'Successfully joined the session' });
  });

  unparticipate = catchAsync(async (req: AuthRequest, res: Response) => {
    await sessionService.unparticipate(parseInt(req.params.id as string), parseInt(req.params.userId as string));
    res.status(200).json({ message: 'Successfully left the session' });
  });
}