import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Profile from './Profile';
import { authService } from '../services/auth.service';
import api from '../services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

vi.mock('../services/auth.service', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    getToken: vi.fn(),
    logout: vi.fn(),
    updateCurrentUser: vi.fn(),
  },
}));

describe('Profile Page (UI Tests)', () => {
  const mockUser = {
    id: 42,
    email: 'yogi@studio.com',
    firstName: 'Jane',
    lastName: 'Doe',
    admin: false,
    createdAt: '2026-01-15T10:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('import', { meta: { env: { DEV: true } } });
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  const renderProfile = () => render(<MemoryRouter><Profile /></MemoryRouter>);

  it('should display an error screen if the user is not authenticated', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);
    renderProfile();
    expect(await screen.findByText(/user not authenticated/i)).toBeInTheDocument();
  });

  it('should render profile data correctly after a successful API fetch', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 42, token: 'fake-jwt', email: 'yogi@studio.com', firstName: 'Jane', lastName: 'Doe', admin: false });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockUser });

    renderProfile();
    
  
    expect(await screen.findByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('yogi@studio.com')).toBeInTheDocument();
    expect(screen.getByText('January 15, 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /promote to admin/i })).toBeInTheDocument();
  });

  it('should process account deletion successfully on user confirmation', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 42, token: 'fake-jwt', email: 'yogi@studio.com', firstName: 'Jane', lastName: 'Doe', admin: false });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockUser });
    vi.mocked(api.delete).mockResolvedValueOnce({ data: {} });

    renderProfile();

    const deleteButton = await screen.findByRole('button', { name: /delete account/i });
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/user/42', expect.any(Object));
      expect(authService.logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should self-promote the user to admin when clicking the dev option', async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 42, token: 'fake-jwt', email: 'yogi@studio.com', firstName: 'Jane', lastName: 'Doe', admin: false });
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockUser });
    vi.mocked(api.post).mockResolvedValueOnce({ data: { ...mockUser, admin: true } });

    renderProfile();

    const promoteButton = await screen.findByRole('button', { name: /promote to admin/i });
    fireEvent.click(promoteButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/user/promote-admin', {}, expect.any(Object));
      expect(authService.updateCurrentUser).toHaveBeenCalledWith({ admin: true });
    });
  });
});