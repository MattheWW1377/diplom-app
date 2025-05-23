import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'teacher' | 'student';
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Перенаправляем на страницу входа с сохранением изначального пути
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== allowedRole) {
    // Если роль не соответствует, перенаправляем на соответствующую домашнюю страницу
    const redirectPath = user?.role === 'teacher' ? '/answers' : '/student/results';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
} 