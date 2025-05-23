import { Link, useNavigate } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';

function StudentHeader() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(document.body.classList.contains('dark'));

  const toggleTheme = () => {
    document.body.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Синхронизация состояния темы при загрузке
  useEffect(() => {
    setIsDark(document.body.classList.contains('dark'));
  }, []);

  return (
    <header style={{ 
      padding: '1rem', 
      background: 'var(--card-bg)', 
      boxShadow: 'var(--shadow)', 
      marginBottom: '1rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <nav style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div>
          <Link 
            to="/student/upload" 
            style={{ 
              color: 'var(--header-color)', 
              marginRight: '1.5rem', 
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            Загрузить ответ
          </Link>
          <Link 
            to="/student/results" 
            style={{ 
              color: 'var(--header-color)', 
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            Мои результаты
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tooltip title={isDark ? "Включить светлую тему" : "Включить тёмную тему"}>
            <IconButton 
              onClick={toggleTheme}
              sx={{ 
                color: 'var(--header-color)',
                '&:hover': {
                  backgroundColor: 'var(--button-hover)',
                }
              }}
            >
              {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Выйти">
            <IconButton 
              onClick={handleLogout}
              sx={{ 
                color: 'var(--header-color)',
                '&:hover': {
                  backgroundColor: 'var(--button-hover)',
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </div>
      </nav>
    </header>
  );
}

export default StudentHeader; 