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
  SelectChangeEvent,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SubjectIcon from '@mui/icons-material/Subject';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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

// Типы для фильтров
interface Filters {
  status: string;
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

  // Фильтрация ответов с использованием useMemo для оптимизации производительности
  const filteredAnswers = useMemo(() => {
    return answers.filter(answer => {
      const matchesStatus = !filters.status || answer.status.toLowerCase() === filters.status.toLowerCase();
      const matchesSubject = !filters.subject || answer.subject === filters.subject;
      const matchesStudent = !filters.studentName || 
        answer.student.toLowerCase().includes(filters.studentName.toLowerCase());
      
      return matchesStatus && matchesSubject && matchesStudent;
    });
  }, [answers, filters]);

  // Оптимизированная функция поиска по имени студента с debounce
  const debouncedStudentSearch = useCallback(
    debounce((value: string) => {
      setFilters(prev => ({ ...prev, studentName: value }));
    }, 300),
    []
  );

  return (
    <div className="container">
      <h1>СПИСОК ОТВЕТОВ</h1>
      
      {/* Форма фильтрации */}
      <Paper sx={{ p: 2, mb: 3 }} className="answer-card">
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
            value={filters.studentName}
          />

          <Button
            variant="outlined"
            onClick={handleResetFilters}
            sx={{ minWidth: 120 }}
          >
            СБРОСИТЬ
          </Button>
        </Stack>
      </Paper>

      {/* Список ответов */}
      <div className="answers-list">
        {filteredAnswers.map((answer, index) => (
          <div 
            key={answer.id} 
            className="answer-card" 
            style={{ '--index': index } as React.CSSProperties}
          >
            <div className="answer-content">
              <p><PersonIcon /> <strong>Студент:</strong> {answer.student}</p>
              <p><SubjectIcon /> <strong>Предмет:</strong> {answer.subject}</p>
              <div className="status-container">
                <p className="status-text">
                  <CheckCircleIcon /> <strong>Статус:</strong> {getStatusInRussian(answer.status)}
                </p>
                <div className="status-bar">
                  <div 
                    className="progress" 
                    style={{ 
                      width: answer.status.toLowerCase() === 'evaluated' ? '100%' : 
                             answer.status.toLowerCase() === 'in_progress' ? '50%' : '0%' 
                    }}
                  />
                </div>
              </div>
            </div>
            <Link to={`/answer/${answer.id}`} className="details-link">
              <button className="details-button">Подробнее</button>
            </Link>
          </div>
        ))}
        
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
      </div>
    </div>
  );
}

export default AnswersPage;