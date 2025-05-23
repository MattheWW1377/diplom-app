import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAnswers } from '../context/AnswerContext';
import { useAuth } from '../context/AuthContext';

// Допустимые типы файлов
const ALLOWED_FILE_TYPES = [
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/pdf', // .pdf
  'text/plain', // .txt
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
];

// Максимальный размер файла (10 МБ)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface UploadFormData {
  subject: string;
  file: File | null;
  text: string;
}

interface FormErrors {
  subject?: string;
  file?: string;
  text?: string;
}

function StudentUploadPage() {
  const [formData, setFormData] = useState<UploadFormData>({
    subject: '',
    file: null,
    text: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addAnswer } = useAnswers();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Проверка типа файла
  const isFileTypeAllowed = (file: File): boolean => {
    return ALLOWED_FILE_TYPES.includes(file.type);
  };

  // Получение расширения файла для сохранения в контексте
  const getFileExtension = (file: File): 'doc' | 'docx' | 'pdf' | 'txt' | 'ppt' | 'pptx' | undefined => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && ['doc', 'docx', 'pdf', 'txt', 'ppt', 'pptx'].includes(extension)) {
      return extension as 'doc' | 'docx' | 'pdf' | 'txt' | 'ppt' | 'pptx';
    }
    return undefined;
  };

  // Обработка изменения предмета
  const handleSubjectChange = (event: SelectChangeEvent<string>) => {
    setFormData(prev => ({
      ...prev,
      subject: event.target.value,
    }));
    if (errors.subject) {
      setErrors(prev => ({ ...prev, subject: undefined }));
    }
  };

  // Обработка загрузки файла
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({
        ...prev,
        file: 'Размер файла не должен превышать 10 МБ',
      }));
      return;
    }

    // Проверка типа файла
    if (!isFileTypeAllowed(file)) {
      setErrors(prev => ({
        ...prev,
        file: 'Недопустимый формат файла. Разрешены: .doc, .docx, .pdf, .txt, .ppt, .pptx',
      }));
      return;
    }

    setFormData(prev => ({ ...prev, file }));
    setErrors(prev => ({ ...prev, file: undefined }));

    // Если это текстовый файл, читаем его содержимое
    if (file.type === 'text/plain') {
      try {
        const text = await file.text();
        setFormData(prev => ({ ...prev, text }));
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          file: 'Ошибка чтения файла',
        }));
      }
    }
  };

  // Удаление файла
  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, file: null, text: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Выберите предмет';
    }

    if (!formData.file && !formData.text.trim()) {
      newErrors.file = 'Загрузите файл или введите текст ответа';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formPayload = {
        student: user.email,
        subject: formData.subject,
        text: formData.text || formData.file?.name || '',
        fileName: formData.file?.name,
        fileType: formData.file ? getFileExtension(formData.file) : undefined,
      };

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.email}`,
        },
        body: JSON.stringify(formPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при отправке ответа');
      }

      const { id, score, comment, status } = await response.json();

      // Добавляем ответ в контекст
      addAnswer({
        id,
        student: user.email,
        subject: formData.subject,
        text: formData.text || formData.file?.name || '',
        fileName: formData.file?.name,
        fileType: formData.file ? getFileExtension(formData.file) : undefined,
        status: status || 'pending',
        score: score || null,
        comment: comment || null,
      });

      setShowSuccess(true);
      // Очищаем форму после успешной отправки
      setFormData({
        subject: '',
        file: null,
        text: '',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Перенаправляем на страницу результатов через 2 секунды
      setTimeout(() => {
        navigate('/student/results');
      }, 2000);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        file: error instanceof Error ? error.message : 'Произошла ошибка при отправке',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Очистка формы
  const handleReset = () => {
    setFormData({
      subject: '',
      file: null,
      text: '',
    });
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
          maxWidth: 600,
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
          Загрузите ответ
        </Typography>

        {errors.file && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.file}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <FormControl 
            fullWidth 
            margin="normal"
            error={!!errors.subject}
          >
            <InputLabel>Предмет</InputLabel>
            <Select
              value={formData.subject}
              label="Предмет"
              onChange={handleSubjectChange}
              size="small"
            >
              <MenuItem value="Математика">Математика</MenuItem>
              <MenuItem value="Физика">Физика</MenuItem>
              <MenuItem value="Информатика">Информатика</MenuItem>
              <MenuItem value="История">История</MenuItem>
            </Select>
            {errors.subject && (
              <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.subject}
              </Typography>
            )}
          </FormControl>

          <Box sx={{ mt: 2, mb: 2 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".doc,.docx,.pdf,.txt,.ppt,.pptx"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              size="small"
              sx={{
                height: '40px',
                width: '100%',
                borderColor: 'var(--border-color, rgba(0, 0, 0, 0.23))',
                color: 'var(--text-color, #333)',
                '&:hover': {
                  borderColor: 'var(--border-hover-color, rgba(0, 0, 0, 0.7))',
                  background: 'var(--button-hover-bg, rgba(0, 0, 0, 0.04))',
                },
              }}
            >
              ВЫБЕРИТЕ ФАЙЛ
            </Button>
            {formData.file && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={formData.file.name}
                  onDelete={handleRemoveFile}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'var(--text-color, #333)',
                    opacity: 'var(--helper-opacity, 0.7)',
                  }}
                >
                  ({(formData.file.size / 1024 / 1024).toFixed(2)} МБ)
                </Typography>
              </Box>
            )}
          </Box>

          <TextField
            fullWidth
            multiline
            rows={2}
            margin="normal"
            label="Текст ответа"
            value={formData.text}
            onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
            error={!!errors.text}
            helperText={errors.text}
            size="small"
            placeholder="Введите текст ответа или загрузите файл"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.9rem',
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.9rem',
              },
              '& .MuiFormHelperText-root': {
                color: errors.text ? 'error.main' : 'var(--text-color, #333)',
                opacity: 'var(--helper-opacity, 0.7)',
              },
            }}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="small"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
              sx={{ height: '40px' }}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              fullWidth
              size="small"
              onClick={handleReset}
              disabled={isSubmitting}
              sx={{
                height: '40px',
                borderColor: 'var(--border-color, rgba(0, 0, 0, 0.23))',
                color: 'var(--text-color, #333)',
                '&:hover': {
                  borderColor: 'var(--border-hover-color, rgba(0, 0, 0, 0.7))',
                  background: 'var(--button-hover-bg, rgba(0, 0, 0, 0.04))',
                },
              }}
            >
              Очистить
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        onClose={() => setShowSuccess(false)}
        message="Ответ успешно отправлен"
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setShowSuccess(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
}

export default StudentUploadPage; 