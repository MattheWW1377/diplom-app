import { Link } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';

function Header() {
  const toggleTheme = () => {
    document.body.classList.toggle('dark');
  };

  return (
    <header style={{ padding: '1rem', background: 'var(--card-bg)', boxShadow: 'var(--shadow)', marginBottom: '1rem' }}>
      <nav style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/upload" style={{ color: 'var(--header-color)', marginRight: '1rem', textDecoration: 'none' }}>
            Загрузить ответ
          </Link>
          <Link to="/answers" style={{ color: 'var(--header-color)', textDecoration: 'none' }}>
            Список ответов
          </Link>
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          <Brightness4Icon />
        </button>
      </nav>
    </header>
  );
}

export default Header;