import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAnswers } from '../context/AnswerContext';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import { debounce } from 'lodash';

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
const getStatusColor = (status: 'pending' | 'in_progress' | 'evaluated'): 'default' | 'primary' | 'success' => {
  const colorMap: Record<'pending' | 'in_progress' | 'evaluated', 'default' | 'primary' | 'success'> = {
    'pending': 'default',
    'in_progress': 'primary',
    'evaluated': 'success',
  };
  return colorMap[status];
};

// Типы для фильтров
interface Filters {
  status: 'pending' | 'in_progress' | 'evaluated' | '';
  subject: string;
  studentName: string;
}

const initialFilters: Filters = {
  status: '',
  subject: '',
  studentName: '',
};

function AnswersPage() {
  const { answers } = useAnswers();
  const [filters, setFilters] = useState<Filters>(initialFilters);

  // Получаем уникальные предметы из ответов
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set(answers.map(answer => answer.subject));
    return Array.from(subjects);
  }, [answers]);

  // Функция для обновления фильтров
  const handleFilterChange = (field: keyof Filters) => (
    event: SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // Функция для сброса фильтров
  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  // Фильтрация ответов
  const filteredAnswers = useMemo(() => {
    return answers.filter(answer => {
      const matchesStatus = !filters.status || answer.status.toLowerCase() === filters.status.toLowerCase();
      const matchesSubject = !filters.subject || answer.subject === filters.subject;
      const matchesStudent = !filters.studentName || 
        answer.student.toLowerCase().includes(filters.studentName.toLowerCase());
      
      return matchesStatus && matchesSubject && matchesStudent;
    });
  }, [answers, filters]);

  // Оптимизированная функция поиска по имени студента
  const debouncedStudentSearch = useCallback(
    debounce((value: string) => {
      setFilters(prev => ({ ...prev, studentName: value }));
    }, 300),
    []
  );

  return (
    <Box className="container">
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        align="center"
        sx={{ mb: 4 }}
      >
        Список ответов
      </Typography>

      {/* Форма фильтрации */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={filters.status}
              label="Статус"
              onChange={handleFilterChange('status') as (event: SelectChangeEvent<string>) => void}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="pending">Ожидает проверки</MenuItem>
              <MenuItem value="in_progress">Проверяется</MenuItem>
              <MenuItem value="evaluated">Оценено</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Предмет</InputLabel>
            <Select
              value={filters.subject}
              label="Предмет"
              onChange={handleFilterChange('subject') as (event: SelectChangeEvent<string>) => void}
            >
              <MenuItem value="">Все</MenuItem>
              {uniqueSubjects.map(subject => (
                <MenuItem key={subject} value={subject}>
                  {subject}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Поиск по имени студента"
            variant="outlined"
            onChange={(e) => debouncedStudentSearch(e.target.value)}
            defaultValue={filters.studentName}
          />

          <Button
            variant="outlined"
            onClick={handleResetFilters}
            sx={{ minWidth: 120 }}
          >
            Сбросить
          </Button>
        </Stack>
      </Paper>

      {/* Таблица ответов */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Студент</TableCell>
                <TableCell>Предмет</TableCell>
                <TableCell>Ответ</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Оценка</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAnswers.map((answer) => (
                <TableRow key={answer.id}>
                  <TableCell>{answer.student}</TableCell>
                  <TableCell>{answer.subject}</TableCell>
                  <TableCell>
                    {answer.fileName || (answer.text.length > 30 
                      ? `${answer.text.substring(0, 30)}...` 
                      : answer.text)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusInRussian(answer.status)}
                      color={getStatusColor(answer.status)}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{answer.score || '—'}</TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/answer/${answer.id}`}
                      variant="contained"
                      size="small"
                    >
                      Подробнее
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {filteredAnswers.length === 0 && (
          <Box sx={{ 
            width: '100%', 
            textAlign: 'center', 
            py: 4,
            color: 'var(--text-color, #333)'
          }}>
            Ответы не найдены
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default AnswersPage;