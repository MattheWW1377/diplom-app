import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SubjectIcon from '@mui/icons-material/Subject';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CommentIcon from '@mui/icons-material/Comment';
import ScoreIcon from '@mui/icons-material/Score';

// Функция для перевода статуса на русский
const getStatusInRussian = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Ожидает проверки',
    'in_progress': 'Проверяется',
    'evaluated': 'Оценено',
  };
  return statusMap[status.toLowerCase()] || status;
};

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
  }, [id]);

  if (error) {
    return (
      <Box className="container">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!answer) {
    return (
      <Box 
        className="container" 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      className="container"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 4,
        color: 'var(--text-color, #333)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 800,
          background: 'var(--card-bg, #fff)',
          color: 'var(--text-color, #333)',
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            color: 'var(--text-color, #333)',
            mb: 4,
            textAlign: 'center'
          }}
        >
          Детали ответа
        </Typography>

        <Box sx={{ '& > *': { mb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ color: 'var(--text-color, #333)' }} />
            <Typography>
              <strong>Студент:</strong> {answer.student}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SubjectIcon sx={{ color: 'var(--text-color, #333)' }} />
            <Typography>
              <strong>Предмет:</strong> {answer.subject}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ color: 'var(--text-color, #333)' }} />
            <Typography>
              <strong>Статус:</strong> {getStatusInRussian(answer.status)}
            </Typography>
          </Box>

          <Box 
            sx={{ 
              mt: 1, 
              mb: 3, 
              height: '4px', 
              background: 'var(--border-color, rgba(0, 0, 0, 0.23))',
              borderRadius: '2px',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: answer.status.toLowerCase() === 'evaluated' ? '100%' : '0%',
                background: '#28a745',
                transition: 'width 0.5s ease',
              }}
            />
          </Box>

          <Typography sx={{ mb: 2 }}>
            <strong>Текст:</strong>
            <Box 
              component="div" 
              sx={{ 
                mt: 1,
                p: 2,
                background: 'var(--background, #f0f2f5)',
                borderRadius: '4px',
                whiteSpace: 'pre-wrap'
              }}
            >
              {answer.text}
            </Box>
          </Typography>

          {answer.score && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScoreIcon sx={{ color: 'var(--text-color, #333)' }} />
              <Typography>
                <strong>Балл:</strong> {answer.score}
              </Typography>
            </Box>
          )}

          {answer.comment && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CommentIcon sx={{ color: 'var(--text-color, #333)' }} />
              <Typography>
                <strong>Комментарий:</strong> {answer.comment}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default AnswerDetailPage;