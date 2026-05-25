import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';
import api from './api';

vi.mock('axios', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
      create: vi.fn().mockReturnThis(), 
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
      }
    }
  };
});

vi.mock('./api', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn()
    }
  };
});

describe('Auth Service (Frontend Unit Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });
  it('should store token and user data upon successful login', async () => {
    const mockResponse = {
      data: {
        token: 'mock-jwt-token',
        id: 1,
        email: 'yoga@studio.com'
      }
    };
    
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await authService.login({ email: 'yoga@studio.com', password: 'test!1234' });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'yoga@studio.com',
      password: 'test!1234'
    });
    
    expect(result).toEqual(mockResponse.data);
    expect(window.localStorage.getItem('token')).toBe('mock-jwt-token');
    expect(window.localStorage.getItem('user')).toContain('mock-jwt-token');
  });

  it('should not store anything if login response does not contain a token', async () => {
    const mockResponse = { data: { message: 'No token here' } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await authService.login({ email: 'yoga@studio.com', password: 'test!1234' });

    expect(result).toEqual(mockResponse.data);
    expect(window.localStorage.getItem('token')).toBeNull();
  });

  it('should store token and user data upon successful register', async () => {
    const mockResponse = {
      data: {
        token: 'register-jwt-token',
        id: 2,
        email: 'new@studio.com'
      }
    };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await authService.register({
      email: 'new@studio.com',
      password: 'password123',
      firstName: 'Lucas',
      lastName: 'Martin'
    });

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      email: 'new@studio.com',
      password: 'password123',
      firstName: 'Lucas',
      lastName: 'Martin'
    });
    expect(result).toEqual(mockResponse.data);
    expect(window.localStorage.getItem('token')).toBe('register-jwt-token');
  });

  it('should not store anything if register response does not contain a token', async () => {
    const mockResponse = { data: { id: 2 } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    await authService.register({
      email: 'new@studio.com',
      password: 'password123',
      firstName: 'Lucas',
      lastName: 'Martin'
    });

    expect(window.localStorage.getItem('token')).toBeNull();
  });

  it('should clear localStorage upon logout', () => {
    window.localStorage.setItem('token', 'old-token');
    window.localStorage.setItem('user', JSON.stringify({ token: 'old-token' }));

    authService.logout();

    expect(window.localStorage.getItem('token')).toBeNull();
    expect(window.localStorage.getItem('user')).toBeNull();
  });

  it('should return null if no user or token is stored in localStorage', () => {
    expect(authService.getCurrentUser()).toBeNull();
    expect(authService.getToken()).toBeNull();
  });

  it('should retrieve correctly stored user and token', () => {
    const mockUser = { token: 'valid-token', id: 42 };
    window.localStorage.setItem('token', 'valid-token');
    window.localStorage.setItem('user', JSON.stringify(mockUser));

    expect(authService.getToken()).toBe('valid-token');
    expect(authService.getCurrentUser()).toEqual(mockUser);
  });

  it('should return null when trying to update user while not logged in', () => {
    const result = authService.updateCurrentUser({ firstName: 'Updated' });
    expect(result).toBeNull();
  });

  it('should successfully update and merge current user data in localStorage', () => {
    const initialUser = { id: 5, firstName: 'Lucas', admin: false };
    window.localStorage.setItem('user', JSON.stringify(initialUser));

    const result = authService.updateCurrentUser({ admin: true, lastName: 'Martin' });

    const expectedUser = { id: 5, firstName: 'Lucas', admin: true, lastName: 'Martin' };
    expect(result).toEqual(expectedUser);
    expect(JSON.parse(window.localStorage.getItem('user')!)).toEqual(expectedUser);
  });

  it('should check if user is authenticated correctly', () => {
    expect(authService.isAuthenticated()).toBe(false);

    window.localStorage.setItem('token', 'active-token');
    expect(authService.isAuthenticated()).toBe(true);
  });
});