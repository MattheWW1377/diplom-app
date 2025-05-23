import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import UploadPage from './pages/UploadPage';
import AnswersPage from './pages/AnswersPage';
import AnswerDetailPage from './pages/AnswerDetailPage';
import RegisterPage from './pages/RegisterPage';
import Header from './components/Header';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/answers" element={<AnswersPage />} />
        <Route path="/answer/:id" element={<AnswerDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;