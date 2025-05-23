import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnswerProvider } from './context/AnswerContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import StudentHeader from './components/StudentHeader';
import UploadPage from './pages/UploadPage';
import AnswersPage from './pages/AnswersPage';
import AnswerDetailPage from './pages/AnswerDetailPage';
import StudentUploadPage from './pages/StudentUploadPage';
import StudentResultsPage from './pages/StudentResultsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

// Выносим роутинг в отдельный компонент для использования хука useLocation
function AppRoutes() {
  const location = useLocation();
  
  // Определяем, какой хедер показывать на основе URL
  const getHeader = (pathname: string) => {
    if (pathname.startsWith('/student')) {
      return <StudentHeader />;
    }
    return <Header />;
  };

  return (
    <div className="app">
      {getHeader(location.pathname)}
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Маршруты для преподавателей */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute allowedRole="teacher">
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/answers"
          element={
            <ProtectedRoute allowedRole="teacher">
              <AnswersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/answer/:id"
          element={
            <ProtectedRoute allowedRole="teacher">
              <AnswerDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Маршруты для студентов */}
        <Route
          path="/student/upload"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentUploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentResultsPage />
            </ProtectedRoute>
          }
        />

        {/* Корневой маршрут */}
        <Route path="/" element={<Navigate to="/register" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AnswerProvider>
          <AppRoutes />
        </AnswerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;