import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import SessionDetail from './SessionDetail';
import { authService } from '../services/auth.service';
import api from '../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: () => ({ id: '10' }),
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
});