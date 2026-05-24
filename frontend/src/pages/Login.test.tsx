import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { authService } from '../services/auth.service';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../services/auth.service', () => ({
  authService: { login: vi.fn() },
}));

describe('Login Page (UI Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () => render(<MemoryRouter><Login /></MemoryRouter>);

  it('should render the form components properly', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /login to yoga studio/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });

  it('should sign in successfully and redirect to /sessions', async () => {
  vi.mocked(authService.login).mockResolvedValueOnce({
    token: 'fake-token', id: 1, email: 'yoga@studio.com', firstName: 'Jean', lastName: 'Yoga', admin: false,
  });

  renderLogin();

  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'yoga@studio.com' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'test!1234' } });
  
  fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

  
  await waitFor(() => {
    expect(authService.login).toHaveBeenCalledWith({
      email: 'yoga@studio.com',
      password: 'test!1234',
    });
    expect(mockNavigate).toHaveBeenCalledWith('/sessions');
  });
});

  it('should display an explicit error message when login fails', async () => {
    const apiError = { response: { data: { message: 'Invalid credentials' } } };
    vi.mocked(authService.login).mockRejectedValueOnce(apiError);

    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@studio.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));


    const errorMessage = await screen.findByText(/invalid credentials/i);
    expect(errorMessage).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /^login$/i })).not.toBeDisabled();
  });
});