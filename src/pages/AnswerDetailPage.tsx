import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PersonIcon from '@mui/icons-material/Person';
import SubjectIcon from '@mui/icons-material/Subject';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CommentIcon from '@mui/icons-material/Comment';
import ScoreIcon from '@mui/icons-material/Score';

function AnswerDetailPage() {
  const { id } = useParams();
  const [answer, setAnswer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnswer = async () => {
      try {
        const response = await axios.get(`/answer/${id}`);
        setAnswer(response.data);
      } catch (error: any) {
        console.error('Ошибка при загрузке ответа:', error);
        setError(error.response?.data?.error || 'Не удалось загрузить ответ.');
      }
    };
    fetchAnswer();
  }, [id]); // Зависимость только от id

  if (error) return <div className="container"><h1>{error}</h1></div>;
  if (!answer) return <div className="container"><h1>Загрузка...</h1></div>;

  return (
    <div className="container">
      <h1>Детали ответа</h1>
      <div className="answer-detail">
        <p><PersonIcon /> <strong>Студент:</strong> {answer.student}</p>
        <p><SubjectIcon /> <strong>Предмет:</strong> {answer.subject}</p>
        <p><CheckCircleIcon /> <strong>Статус:</strong> {answer.status}</p>
        <div className="status-bar">
          <div className="progress" style={{ width: answer.status === 'Оценено' ? '100%' : '0%' }}></div>
        </div>
        <p><strong>Текст:</strong> {answer.text}</p>
        {answer.score && <p><ScoreIcon /> <strong>Балл:</strong> {answer.score}</p>}
        {answer.comment && <p><CommentIcon /> <strong>Комментарий:</strong> {answer.comment}</p>}
      </div>
    </div>
  );
}

export default AnswerDetailPage;