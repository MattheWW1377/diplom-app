import { Link } from 'react-router-dom';
import { useAnswers } from '../context/AnswerContext';
import PersonIcon from '@mui/icons-material/Person';
import SubjectIcon from '@mui/icons-material/Subject';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function AnswersPage() {
  const { answers } = useAnswers();

  return (
    <div className="container">
      <h1>Список ответов</h1>
      <div className="answers-list">
        {answers.map((answer, index) => (
          <div key={answer.id} className="answer-card" style={{ '--index': index } as React.CSSProperties}>
            <p><PersonIcon /> <strong>Студент:</strong> {answer.student}</p>
            <p><SubjectIcon /> <strong>Предмет:</strong> {answer.subject}</p>
            <div className="status-container">
              <p className="status-text">
                <CheckCircleIcon /> <strong>Статус:</strong> {answer.status}
              </p>
            </div>
            <Link to={`/answer/${answer.id}`}>
              <button className="details-button">Подробнее</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnswersPage;