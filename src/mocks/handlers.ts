import { http } from 'msw';
import { addAnswer, getAnswerById, getAllAnswers, updateAnswer } from './db';

// Интерфейс для тела запроса POST /evaluate и POST /api/upload
interface UploadRequestBody {
  student: string;
  subject: string;
  text: string;
  fileName?: string;
  fileType?: 'doc' | 'docx' | 'pdf' | 'txt' | 'ppt' | 'pptx';
}

// Интерфейс для тела запроса POST /register
interface RegisterRequestBody {
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role: 'teacher' | 'student';
  password: string;
}

// Типы для ответов
type AnswerStatus = 'pending' | 'in_progress' | 'evaluated';

interface Answer {
  id: string;
  student: string;
  subject: string;
  text: string;
  fileType?: 'doc' | 'docx' | 'pdf' | 'txt' | 'ppt' | 'pptx';
  fileName?: string;
  status: AnswerStatus;
  score: number | null;
  comment: string | null;
}

// Хранилище зарегистрированных пользователей
const registeredUsers = new Set<string>();

export const handlers = [
  // Обработчик регистрации
  http.post('/register', async ({ request }) => {
    const body = await request.json() as RegisterRequestBody;
    const { email, firstName, lastName, role, password } = body;

    // Проверка обязательных полей
    if (!email || !firstName || !lastName || !role || !password) {
      return new Response(
        JSON.stringify({ error: 'Все обязательные поля должны быть заполнены' }), 
        { status: 400 }
      );
    }

    // Проверка формата email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Неверный формат email' }), 
        { status: 400 }
      );
    }

    // Проверка длины пароля
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Пароль должен быть не короче 6 символов' }), 
        { status: 400 }
      );
    }

    // Проверка существования пользователя
    if (registeredUsers.has(email)) {
      return new Response(
        JSON.stringify({ error: 'Пользователь с таким email уже существует' }), 
        { status: 400 }
      );
    }

    // Регистрация пользователя
    registeredUsers.add(email);

    return new Response(
      JSON.stringify({ message: 'Регистрация успешна' }), 
      { status: 200 }
    );
  }),
  http.post('/evaluate', async ({ request }) => {
    const body = await request.json() as UploadRequestBody;
    const { student, subject, text, fileName, fileType } = body;

    // Проверка обязательных полей
    if (!student || !subject || !text) {
      return new Response(
        JSON.stringify({ error: 'Все обязательные поля должны быть заполнены' }), 
        { status: 400 }
      );
    }

    // Имитация оценки
    const score = Math.floor(Math.random() * 30) + 70; // Случайная оценка от 70 до 100
    const comment = `Ответ от ${student} по предмету ${subject} оценён`;

    const newAnswer = {
      id: Date.now().toString(),
      student,
      subject,
      text,
      fileName,
      fileType,
      status: 'evaluated' as AnswerStatus,
      score,
      comment,
    };

    addAnswer(newAnswer);

    return new Response(
      JSON.stringify({ id: newAnswer.id, score, comment, status: 'evaluated' }), 
      { status: 200 }
    );
  }),
  http.get('/answers', () => {
    const answers = getAllAnswers();
    return new Response(JSON.stringify(answers), { status: 200 });
  }),
  http.get('/api/answer/:id', ({ params }) => {
    const { id } = params;
    const answer = getAnswerById(id as string);
    
    if (!answer) {
      return new Response(
        JSON.stringify({ error: 'Ответ не найден' }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Убедимся, что статус всегда имеет корректное значение
    const status = ['pending', 'in_progress', 'evaluated'].includes(answer.status.toLowerCase())
      ? answer.status.toLowerCase()
      : 'pending';

    return new Response(
      JSON.stringify({ ...answer, status }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }),
  // Получение всех ответов (для преподавателя)
  http.get('/api/answers', () => {
    const answers = getAllAnswers();
    return new Response(JSON.stringify(answers), {
      headers: { 'Content-Type': 'application/json' },
    });
  }),

  // Получение ответов студента
  http.get('/api/student/answers', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return new Response(JSON.stringify({ message: 'Invalid authorization format' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userEmail = token;
    const answers = getAllAnswers();
    const studentAnswers = answers.filter(answer => answer.student === userEmail);
    
    return new Response(JSON.stringify(studentAnswers), {
      headers: { 'Content-Type': 'application/json' },
    });
  }),

  // Загрузка нового ответа
  http.post('/api/upload', async ({ request }) => {
    const { student, subject, text, fileName, fileType } = await request.json() as UploadRequestBody;
    
    // Проверка обязательных полей
    if (!student || !subject || !text) {
      return new Response(
        JSON.stringify({ error: 'Все обязательные поля должны быть заполнены' }), 
        { status: 400 }
      );
    }

    const answers = getAllAnswers();
    const newAnswer: Answer = {
      id: Date.now().toString(),
      student,
      subject,
      text,
      fileName,
      fileType,
      status: 'pending' as AnswerStatus,
      score: null,
      comment: null,
    };

    addAnswer(newAnswer);
    
    return new Response(JSON.stringify({ ...newAnswer, status: 'pending' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }),

  // Обновление статуса ответа
  http.put('/api/answer/:id', async ({ request, params }) => {
    const { id } = params;
    if (!id || typeof id !== 'string') {
      return new Response(JSON.stringify({ message: 'Invalid ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updates = await request.json() as Partial<Answer>;
    const updatedAnswer = updateAnswer(id, updates);
    if (!updatedAnswer) {
      return new Response(JSON.stringify({ message: 'Answer not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify(updatedAnswer), {
      headers: { 'Content-Type': 'application/json' },
    });
  }),
];

// Функция для сброса данных (полезно для тестирования)
export const resetAnswers = () => {
  const answers = getAllAnswers();
  answers.length = 0; // Очищаем массив ответов
};