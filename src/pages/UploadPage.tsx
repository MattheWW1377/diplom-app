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
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAnswers } from '../context/AnswerContext';

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
  student: string;
  subject: string;
  file: File | null;
  text: string;
}

interface FormErrors {
  student?: string;
  subject?: string;
  file?: string;
  text?: string;
}

function UploadPage() {
  const [formData, setFormData] = useState<UploadFormData>({
    student: '',
    subject: '',
    file: null,
    text: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addAnswer } = useAnswers();
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

  // Обработка изменения текстовых полей
  const handleTextChange = (field: keyof UploadFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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
      setErrors((prev) => ({
        ...prev,
        file: 'Размер файла не должен превышать 10 МБ',
      }));
      return;
    }

    // Проверка типа файла
    if (!isFileTypeAllowed(file)) {
      setErrors((prev) => ({
        ...prev,
        file: 'Недопустимый формат файла. Разрешены: .doc, .docx, .pdf, .txt, .ppt, .pptx',
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, file }));
    setErrors((prev) => ({ ...prev, file: undefined }));

    // Если это текстовый файл, читаем его содержимое
    if (file.type === 'text/plain') {
      try {
        const text = await file.text();
        setFormData((prev) => ({ ...prev, text }));
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          file: 'Ошибка чтения файла',
        }));
      }
    }
  };

  // Удаление файла
  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, file: null, text: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.student.trim()) {
      newErrors.student = 'Введите имя студента';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Введите предмет';
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
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formPayload = {
        student: formData.student,
        subject: formData.subject,
        text: formData.text || formData.file?.name || '',
        fileName: formData.file?.name,
        fileType: formData.file ? getFileExtension(formData.file) : undefined,
      };

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        student: formData.student,
        subject: formData.subject,
        text: formData.text || formData.file?.name || '',
        fileName: formData.file?.name,
        fileType: formData.file ? getFileExtension(formData.file) : undefined,
        status: status || 'pending',
        score: score || null,
        comment: comment || null,
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/answers');
      }, 2000);
    } catch (error) {
      setErrors((prev) => ({
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
      student: '',
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
          '& .MuiInputBase-root': {
            color: 'var(--text-color, #333)',
            '& fieldset': {
              borderColor: 'var(--border-color, rgba(0, 0, 0, 0.23))',
            },
            '&:hover fieldset': {
              borderColor: 'var(--border-hover-color, rgba(0, 0, 0, 0.7))',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'var(--text-color, #333)',
            opacity: 'var(--label-opacity, 0.9)',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#1976d2',
          },
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{ color: 'var(--text-color, #333)' }}
        >
          Загрузите ответ
        </Typography>

        {errors.file && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.file}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            required
            margin="normal"
            label="Студент"
            value={formData.student}
            onChange={handleTextChange('student')}
            error={!!errors.student}
            helperText={errors.student}
            sx={{
              '& .MuiFormHelperText-root': {
                color: errors.student ? 'error.main' : 'var(--text-color, #333)',
                opacity: 'var(--helper-opacity, 0.7)',
              },
            }}
          />

          <TextField
            fullWidth
            required
            margin="normal"
            label="Предмет"
            value={formData.subject}
            onChange={handleTextChange('subject')}
            error={!!errors.subject}
            helperText={errors.subject}
            sx={{
              '& .MuiFormHelperText-root': {
                color: errors.subject ? 'error.main' : 'var(--text-color, #333)',
                opacity: 'var(--helper-opacity, 0.7)',
              },
            }}
          />

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
              fullWidth
              sx={{
                mb: 1,
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
                  sx={{
                    color: 'var(--text-color, #333)',
                    borderColor: 'var(--border-color, rgba(0, 0, 0, 0.23))',
                  }}
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
            onChange={handleTextChange('text')}
            placeholder="Введите текст ответа или загрузите файл"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.9rem',
                color: 'var(--text-color, #333)',
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.9rem',
                color: 'var(--text-color, #333)',
                opacity: 'var(--label-opacity, 0.9)',
              },
              '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--border-color, rgba(0, 0, 0, 0.23))',
              },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--border-hover-color, rgba(0, 0, 0, 0.7))',
              },
            }}
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              fullWidth
              onClick={handleReset}
              disabled={isSubmitting}
              sx={{
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

export default UploadPage;