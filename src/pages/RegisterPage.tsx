import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  Alert,
  Paper,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface RegisterFormData {
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  role: 'teacher' | 'student';
  password: string;
}

interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  password?: string;
  role?: string;
  submit?: string;
}

const initialFormData: RegisterFormData = {
  email: '',
  firstName: '',
  lastName: '',
  middleName: '',
  role: 'student',
  password: '',
};

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Валидация email с помощью регулярного выражения
  const isEmailValid = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!isEmailValid(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не короче 6 символов';
    }

    if (!formData.role) {
      newErrors.role = 'Выберите роль';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTextFieldChange = (field: keyof RegisterFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Очищаем ошибку поля при изменении
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRoleChange = (event: SelectChangeEvent<'teacher' | 'student'>) => {
    const value = event.target.value as 'teacher' | 'student';
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка регистрации');
      }

      // Успешная регистрация
      navigate('/login');
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Произошла ошибка при регистрации',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const isFormValid = (): boolean => {
    return (
      !!formData.email &&
      !!formData.firstName &&
      !!formData.lastName &&
      !!formData.password &&
      formData.password.length >= 6 &&
      !!formData.role &&
      isEmailValid(formData.email)
    );
  };

  return (
    <Box
      className="container"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          background: 'var(--card-bg, #fff)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Регистрация
        </Typography>

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            required
            margin="normal"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleTextFieldChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            autoComplete="email"
          />

          <TextField
            fullWidth
            required
            margin="normal"
            label="Имя"
            value={formData.firstName}
            onChange={handleTextFieldChange('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName}
          />

          <TextField
            fullWidth
            required
            margin="normal"
            label="Фамилия"
            value={formData.lastName}
            onChange={handleTextFieldChange('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Отчество"
            value={formData.middleName}
            onChange={handleTextFieldChange('middleName')}
          />

          <FormControl
            fullWidth
            required
            margin="normal"
            error={!!errors.role}
          >
            <InputLabel>Роль</InputLabel>
            <Select
              value={formData.role}
              label="Роль"
              onChange={handleRoleChange}
            >
              <MenuItem value="student">Студент</MenuItem>
              <MenuItem value="teacher">Преподаватель</MenuItem>
            </Select>
            {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
          </FormControl>

          <TextField
            fullWidth
            required
            margin="normal"
            label="Пароль"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleTextFieldChange('password')}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>

          <Button
            component={Link}
            to="/login"
            fullWidth
            sx={{ textAlign: 'center' }}
          >
            Уже есть аккаунт? Войти
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default RegisterPage; 