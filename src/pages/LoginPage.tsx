import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Простая заглушка для авторизации
    if (username && password) {
      navigate('/upload');
    }
  };

  return (
    <div className="container">
      <h1>Вход</h1>
      <form onSubmit={handleSubmit}>
        <label>Имя пользователя</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Введите имя пользователя"
          required
        />
        <label>Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Введите пароль"
          required
        />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}

export default LoginPage;