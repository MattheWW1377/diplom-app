import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SubjectIcon from '@mui/icons-material/Subject';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CommentIcon from '@mui/icons-material/Comment';
import ScoreIcon from '@mui/icons-material/Score';
import { useAuth } from '../context/AuthContext';
import { useAnswers } from '../context/AnswerContext';

// Интерфейс для формы ручной проверки
interface ManualEvaluationFormData {
  score: string;
  comment: string;
}

// Функция для перевода статуса на русский
const getStatusInRussian = (status: string | undefined): string => {
  if (!status) return 'Ожидает проверки';
  
  const statusMap: { [key: string]: string } = {
    'pending': 'Ожидает проверки',
    'in_progress': 'Проверяется',
    'evaluated': 'Оценено',
  };
  
  const normalizedStatus = status.toLowerCase();
  return statusMap[normalizedStatus] || 'Ожидает проверки';
};

function AnswerDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { updateAnswer } = useAnswers();
  const [answer, setAnswer] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isManualEvalOpen, setIsManualEvalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Состояние формы ручной проверки
  const [manualEvalForm, setManualEvalForm] = useState<ManualEvaluationFormData>({
    score: '',
    comment: '',
  });

  // Состояние ошибок формы
  const [formErrors, setFormErrors] = useState<{
    score?: string;
    comment?: string;
  }>({});

  useEffect(() => {
    const fetchAnswer = async () => {
      try {
        const response = await axios.get(`/api/answer/${id}`);
        setAnswer(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Ошибка при загрузке ответа:', error);
        setError(error.response?.data?.error || 'Не удалось загрузить ответ.');
      }
    };
    fetchAnswer();
  }, [id]);

  // Безопасное получение статуса
  const getStatus = () => {
    if (!answer || !answer.status) return 'pending';
    return answer.status.toLowerCase();
  };

  // Валидация формы
  const validateForm = () => {
    const errors: { score?: string; comment?: string } = {};
    const scoreNum = Number(manualEvalForm.score);

    if (!manualEvalForm.score) {
      errors.score = 'Оценка обязательна';
    } else if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      errors.score = 'Оценка должна быть числом от 0 до 100';
    }

    if (manualEvalForm.comment.trim() === '') {
      errors.comment = 'Комментарий не может быть пустым';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Обработчик автоматической проверки
  const handleAutoEvaluate = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`/api/auto-evaluate/${id}`);
      const { score, comment, status } = response.data;

      // Обновляем ответ в контексте и локальном состоянии
      const updatedAnswer = { ...answer, score, comment, status };
      updateAnswer(id!, updatedAnswer);
      setAnswer(updatedAnswer);

      setSnackbar({
        open: true,
        message: `Автоматическая проверка завершена. Оценка: ${score}`,
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Ошибка при автоматической проверке',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик ручной проверки
  const handleManualEvaluate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.put(`/api/answer/${id}`, {
        score: Number(manualEvalForm.score),
        comment: manualEvalForm.comment,
        status: 'evaluated',
      });

      // Обновляем ответ в контексте и локальном состоянии
      const updatedAnswer = response.data;
      updateAnswer(id!, updatedAnswer);
      setAnswer(updatedAnswer);

      setIsManualEvalOpen(false);
      setSnackbar({
        open: true,
        message: 'Оценка успешно сохранена',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Ошибка при сохранении оценки',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчики формы
  const handleFormChange = (field: keyof ManualEvaluationFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setManualEvalForm(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Очищаем ошибку поля при изменении
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

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
              <strong>Статус:</strong> {getStatusInRussian(getStatus())}
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
                width: getStatus() === 'evaluated' ? '100%' : '0%',
                background: '#28a745',
                transition: 'width 0.5s ease',
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography component="div" sx={{ fontWeight: 'bold', display: 'inline' }}>Текст:</Typography>
            <Box 
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
          </Box>

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

          {/* Кнопки оценки (только для преподавателя) */}
          {user?.role === 'teacher' && getStatus() !== 'evaluated' && (
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleAutoEvaluate}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Автоматическая проверка'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setIsManualEvalOpen(true)}
                disabled={isLoading}
              >
                Ручная проверка
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Диалог ручной проверки */}
      <Dialog 
        open={isManualEvalOpen} 
        onClose={() => setIsManualEvalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Ручная проверка ответа</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Оценка"
              type="number"
              fullWidth
              value={manualEvalForm.score}
              onChange={handleFormChange('score')}
              error={!!formErrors.score}
              helperText={formErrors.score}
              inputProps={{ min: 0, max: 100 }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Комментарий"
              multiline
              rows={4}
              fullWidth
              value={manualEvalForm.comment}
              onChange={handleFormChange('comment')}
              error={!!formErrors.comment}
              helperText={formErrors.comment}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsManualEvalOpen(false)}>
            Отмена
          </Button>
          <Button 
            onClick={handleManualEvaluate}
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AnswerDetailPage;