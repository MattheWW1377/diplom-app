import { useMemo, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAnswers } from '../context/AnswerContext';
import { useAuth } from '../context/AuthContext';

// Функция для перевода статуса на русский
const getStatusInRussian = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Ожидает проверки',
    'in_progress': 'Проверяется',
    'evaluated': 'Оценено',
  };
  return statusMap[status.toLowerCase()] || status;
};

// Функция для определения цвета статуса
const getStatusColor = (status: string): 'default' | 'primary' | 'success' => {
  const colorMap: { [key: string]: 'default' | 'primary' | 'success' } = {
    'pending': 'default',
    'in_progress': 'primary',
    'evaluated': 'success',
  };
  return colorMap[status.toLowerCase()] || 'default';
};

function StudentResultsPage() {
  const { answers, setAnswers } = useAnswers();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка ответов студента
  useEffect(() => {
    const fetchAnswers = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/student/answers', {
          headers: {
            'Authorization': `Bearer ${user.email}`, // В реальном приложении здесь будет JWT токен
          },
        });

        if (!response.ok) {
          throw new Error('Не удалось загрузить ответы');
        }

        const data = await response.json();
        setAnswers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке ответов');
      } finally {
        setLoading(false);
      }
    };

    fetchAnswers();
  }, [user, setAnswers]);

  // Фильтруем ответы для текущего студента
  const studentAnswers = useMemo(() => {
    return user ? answers.filter(answer => answer.student === user.email) : [];
  }, [answers, user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, mx: 2 }}>
        <Alert severity="error">{error}</Alert>
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
          maxWidth: 1000,
          background: 'var(--card-bg, #fff)',
          color: 'var(--text-color, #333)',
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{ 
            color: 'var(--text-color, #333)',
            mb: 4,
          }}
        >
          Ваши результаты
        </Typography>

        {studentAnswers.length === 0 ? (
          <Typography 
            align="center" 
            sx={{ 
              color: 'var(--text-color, #333)',
              opacity: 0.7,
            }}
          >
            У вас пока нет загруженных ответов
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'var(--text-color, #333)' }}>Предмет</TableCell>
                  <TableCell sx={{ color: 'var(--text-color, #333)' }}>Файл/Текст</TableCell>
                  <TableCell sx={{ color: 'var(--text-color, #333)' }}>Статус</TableCell>
                  <TableCell sx={{ color: 'var(--text-color, #333)' }}>Оценка</TableCell>
                  <TableCell sx={{ color: 'var(--text-color, #333)' }}>Комментарий</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentAnswers.map((answer) => (
                  <TableRow key={answer.id}>
                    <TableCell 
                      component="th" 
                      scope="row"
                      sx={{ color: 'var(--text-color, #333)' }}
                    >
                      {answer.subject}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--text-color, #333)' }}>
                      {answer.fileName ? (
                        <Typography variant="body2" component="span">
                          Файл: {answer.fileName}
                        </Typography>
                      ) : (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: '300px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {answer.text}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusInRussian(answer.status)}
                        color={getStatusColor(answer.status)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'var(--text-color, #333)' }}>
                      {answer.score || '—'}
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        color: 'var(--text-color, #333)',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {answer.comment || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

export default StudentResultsPage; 