import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import UploadPage from './pages/UploadPage';
import AnswersPage from './pages/AnswersPage';
import AnswerDetailPage from './pages/AnswerDetailPage';
import Header from './components/Header';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/answers" element={<AnswersPage />} />
        <Route path="/answer/:id" element={<AnswerDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;