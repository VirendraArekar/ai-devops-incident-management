import { create } from 'zustand';
import { User, AuthResponse } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (data: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  return {
    user: savedUser ? JSON.parse(savedUser) : {
      id: '30000000-0000-0000-0000-000000000001',
      email: 'admin@acme.com',
      fullName: 'Alex Vance (Lead SRE)',
      organizationId: '20000000-0000-0000-0000-000000000001',
      organizationName: 'Acme Cloud Platform',
      role: 'SUPER_ADMIN'
    },
    token: savedToken || 'demo-admin-token',
    isAuthenticated: true,
    setAuth: (data: AuthResponse) => {
      const u: User = {
        id: data.userId,
        email: data.email,
        fullName: data.fullName,
        organizationId: data.organizationId,
        organizationName: data.organizationName,
        role: data.role
      };
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(u));
      set({ user: u, token: data.accessToken, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  };
});
