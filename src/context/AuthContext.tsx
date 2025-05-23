import { createContext, useContext, useState, ReactNode } from 'react';

// Типы для контекста аутентификации
export interface User {
  email: string;
  role: 'teacher' | 'student';
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, role: 'teacher' | 'student') => void;
  logout: () => void;
}

// Создаем контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер контекста
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Функция для входа
  const login = (email: string, role: 'teacher' | 'student') => {
    setUser({ email, role });
  };

  // Функция для выхода
  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Хук для использования контекста
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 