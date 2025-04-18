import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAnswers } from '../context/AnswerContext';

function UploadPage() {
  const [student, setStudent] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ score?: number; comment?: string; id?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addAnswer } = useAnswers();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post('/evaluate', { student, subject, text });
      const { id, score, comment } = response.data;
      setResult({ score, comment, id });
      addAnswer({
        id,
        student,
        subject,
        text,
        status: 'Оценено',
        score,
        comment,
      });
      setTimeout(() => navigate('/answers'), 2000);
    } catch (error: any) {
      console.error('Ошибка при оценке:', error);
      setError(error.response?.data?.error || 'Не удалось отправить ответ. Попробуйте снова.');
    }
  };

  return (
    <div className="container">
      <h1>Загрузить ответ</h1>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Студент</label>
        <input
          type="text"
          value={student}
          onChange={(e) => setStudent(e.target.value)}
          placeholder="Введите имя студента"
          required
        />
        <label>Предмет</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Введите предмет"
          required
        />
        <label>Текст ответа</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите текст ответа"
          required
        />
        <button type="submit">Отправить</button>
      </form>
      {result && (
        <div className="answer-detail" style={{ marginTop: '2rem' }}>
          <h2>Результат</h2>
          <p><strong>Балл:</strong> {result.score}</p>
          <p><strong>Комментарий:</strong> {result.comment}</p>
        </div>
      )}
    </div>
  );
}

export default UploadPage;