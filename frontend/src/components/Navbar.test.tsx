import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { authService } from '../services/auth.service';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../services/auth.service', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('Navbar Component (UI Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderNavbar = () => render(<MemoryRouter><Navbar /></MemoryRouter>);

  it('should display Login and Register links when user is anonymous', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);

    renderNavbar();

    expect(screen.getByText(/yoga studio/i)).toBeInTheDocument();
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
    expect(screen.queryByText(/sessions/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
  });

  it('should display classic user links when logged in as regular user', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      token: 'token', id: 1, email: 'user@test.com', firstName: 'A', lastName: 'B', admin: false
    });

    renderNavbar();

    expect(screen.getByText(/sessions/i)).toBeInTheDocument();
    expect(screen.getByText(/profile/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
    expect(screen.queryByText(/create session/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
  });

  it('should display Create Session link when logged in as admin', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      token: 'token', id: 1, email: 'admin@test.com', firstName: 'A', lastName: 'B', admin: true
    });

    renderNavbar();

    expect(screen.getByText(/sessions/i)).toBeInTheDocument();
    expect(screen.getByText(/create session/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  it('should trigger logout action and redirect to login page on click', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      token: 'token', id: 1, email: 'user@test.com', firstName: 'A', lastName: 'B', admin: false
    });

    renderNavbar();

    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);

    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});