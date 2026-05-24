import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';

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

import api from './api';

describe('Auth Service (Frontend Unit Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('should store token and user data upon successful login', async () => {
    const mockResponse = {
      data: {
        token: 'mock-jwt-token',
        user: { id: 1, email: 'yoga@studio.com' }
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

  it('should clear localStorage upon logout', () => {
    window.localStorage.setItem('token', 'old-token');
    window.localStorage.setItem('user', JSON.stringify({ token: 'old-token' }));

    authService.logout();

    expect(window.localStorage.getItem('token')).toBeNull();
    expect(window.localStorage.getItem('user')).toBeNull();
  });

  it('should return null if no user is stored in localStorage', () => {
    expect(authService.getCurrentUser()).toBeNull();
    expect(authService.getToken()).toBeNull();
  });

  it('should retrieve correctly stored user and token', () => {
    const mockUser = { token: 'valid-token', user: { id: 42 } };
    window.localStorage.setItem('token', 'valid-token');
    window.localStorage.setItem('user', JSON.stringify(mockUser));

    expect(authService.getToken()).toBe('valid-token');
    expect(authService.getCurrentUser()).toEqual(mockUser);
  });
});