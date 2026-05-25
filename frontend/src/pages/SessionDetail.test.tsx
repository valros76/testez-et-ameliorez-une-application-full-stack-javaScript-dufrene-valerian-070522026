import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import SessionDetail from './SessionDetail';
import { authService } from '../services/auth.service';
import api from '../services/api';

const mockNavigate = vi.fn();
let mockParamId: string | undefined = '10';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: () => ({ id: mockParamId }),
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

vi.mock('../services/auth.service', () => ({
  authService: { getCurrentUser: vi.fn(), getToken: vi.fn() },
}));

describe('SessionDetail Page (UI Tests)', () => {
  const mockSession = {
    id: 10,
    name: 'Vinyasa Flow Advanced',
    date: '2026-06-12T09:00:00.000Z',
    description: 'A vigorous yoga class focusing on fluid transitions.',
    teacher: { firstName: 'Yogi', lastName: 'Master' },
    users: [1, 2],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockParamId = '10';
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  const renderSessionDetail = () => render(<MemoryRouter><SessionDetail /></MemoryRouter>);

  it('should render loading state initially', () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, admin: false, token: 'fake-jwt', email: 'user@test.com', firstName: 'John', lastName: 'Doe' });
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));

    renderSessionDetail();
    expect(screen.getByText(/loading session.../i)).toBeInTheDocument();
  });

  it('should render session details and standard user interaction buttons', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 3, admin: false, token: 'fake-jwt', email: 'user3@test.com', firstName: 'Jane', lastName: 'Doe' });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSession });

    renderSessionDetail();

    expect(await screen.findByRole('heading', { name: /vinyasa flow advanced/i })).toBeInTheDocument();
    expect(screen.getByText(/yogi master/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join session/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  it('should show Leave Session button if user is already participating', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, admin: false, token: 'fake-jwt', email: 'user@test.com', firstName: 'John', lastName: 'Doe' });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSession });

    renderSessionDetail();
    expect(await screen.findByRole('button', { name: /leave session/i })).toBeInTheDocument();
  });

  it('should show administrative action buttons if user is admin', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 4, admin: true, token: 'fake-jwt', email: 'admin@test.com', firstName: 'Admin', lastName: 'User' });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSession });

    renderSessionDetail();
    expect(await screen.findByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
  });

  it('should navigate to edit page when admin clicks edit', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 4, admin: true, token: 'fake-jwt', email: 'admin@test.com', firstName: 'Admin', lastName: 'User' });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSession });

    renderSessionDetail();

    const editButton = await screen.findByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(mockNavigate).toHaveBeenCalledWith('/sessions/edit/10');
  });

  it('should navigate back to sessions list on back button click', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 3, admin: false, token: 'fake-jwt', email: 'user3@test.com', firstName: 'Jane', lastName: 'Doe' });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSession });

    renderSessionDetail();

    const backButton = await screen.findByRole('button', { name: /back to sessions/i });
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/sessions');
  });

  it('should join the session successfully when non-participant clicks join', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 3, admin: false, token: 'fake-jwt', email: 'user3@test.com', firstName: 'Jane', lastName: 'Doe' });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSession }).mockResolvedValueOnce({ data: mockSession });
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

    renderSessionDetail();

    const joinButton = await screen.findByRole('button', { name: /join session/i });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/session/10/participate/3', {}, expect.any(Object));
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  it('should leave the session successfully when participant clicks leave', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, admin: false, token: 'fake-jwt', email: 'user@test.com', firstName: 'John', lastName: 'Doe' });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSession }).mockResolvedValueOnce({ data: mockSession });
    vi.mocked(api.delete).mockResolvedValueOnce({ data: {} });

    renderSessionDetail();

    const leaveButton = await screen.findByRole('button', { name: /leave session/i });
    fireEvent.click(leaveButton);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/session/10/participate/1', expect.any(Object));
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  it('should trigger deletion workflow and redirect when administrative deletion is confirmed', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 4, admin: true, token: 'fake-jwt', email: 'admin@test.com', firstName: 'Admin', lastName: 'User' });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSession });
    vi.mocked(api.delete).mockResolvedValueOnce({ data: {} });

    renderSessionDetail();

    const deleteButton = await screen.findByRole('button', { name: /^delete$/i });
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/session/10', expect.any(Object));
      expect(mockNavigate).toHaveBeenCalledWith('/sessions');
    });
  });

  it('should do nothing if admin cancels session deletion', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 4, admin: true, token: 'fake-jwt', email: 'admin@test.com', firstName: 'Admin', lastName: 'User' });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSession });
    vi.spyOn(window, 'confirm').mockImplementationOnce(() => false);

    renderSessionDetail();

    const deleteButton = await screen.findByRole('button', { name: /^delete$/i });
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(api.delete).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should display error message if API fails to load session', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, admin: false, token: 'fake-jwt', email: 'user@test.com', firstName: 'John', lastName: 'Doe' });
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));

    renderSessionDetail();

    expect(await screen.findByText(/failed to load session details/i)).toBeInTheDocument();
  });

  it('should display error alert if join session API fails', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 3, admin: false, token: 'fake-jwt', email: 'user3@test.com', firstName: 'Jane', lastName: 'Doe' });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSession });
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Internal Error'));

    renderSessionDetail();

    const joinButton = await screen.findByRole('button', { name: /join session/i });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to join session');
    });
  });

  it('should display error alert if leave session API fails', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, admin: false, token: 'fake-jwt', email: 'user@test.com', firstName: 'John', lastName: 'Doe' });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSession });
    vi.mocked(api.delete).mockRejectedValueOnce(new Error('Internal Error'));

    renderSessionDetail();

    const leaveButton = await screen.findByRole('button', { name: /leave session/i });
    fireEvent.click(leaveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to leave session');
    });
  });

  it('should display error alert if delete session API fails', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 4, admin: true, token: 'fake-jwt', email: 'admin@test.com', firstName: 'Admin', lastName: 'User' });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockSession });
    vi.mocked(api.delete).mockRejectedValueOnce(new Error('Internal Error'));

    renderSessionDetail();

    const deleteButton = await screen.findByRole('button', { name: /^delete$/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to delete session');
    });
  });

  it('should show error when id parameter is missing', async () => {
    mockParamId = undefined;
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, admin: false, token: 'fake-jwt', email: 'user@test.com', firstName: 'John', lastName: 'Doe' });

    renderSessionDetail();

    expect(await screen.findByText(/invalid session identifier/i)).toBeInTheDocument();
  });
});