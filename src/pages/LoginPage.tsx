import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // В реальном приложении здесь будет запрос к API
      if (email && password) {
        login(email, role);
        
        // Перенаправляем на соответствующую страницу в зависимости от роли
        const from = location.state?.from?.pathname || 
          (role === 'teacher' ? '/answers' : '/student/results');
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError('Ошибка входа. Проверьте введенные данные.');
    }
  };

  const handleRoleChange = (event: SelectChangeEvent<'teacher' | 'student'>) => {
    setRole(event.target.value as 'teacher' | 'student');
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
          maxWidth: 400,
          background: 'var(--card-bg, #fff)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Вход
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Роль</InputLabel>
            <Select value={role} label="Роль" onChange={handleRoleChange}>
              <MenuItem value="student">Студент</MenuItem>
              <MenuItem value="teacher">Преподаватель</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Войти
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginPage;