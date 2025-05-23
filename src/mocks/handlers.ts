import { http } from 'msw';
import { addAnswer, getAnswerById, getAllAnswers } from './db';

// Интерфейс для тела запроса POST /evaluate
interface EvaluateRequestBody {
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
    const body = await request.json() as EvaluateRequestBody;
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
      status: 'pending',
      score,
      comment,
    };

    addAnswer(newAnswer);

    return new Response(
      JSON.stringify({ id: newAnswer.id, score, comment }), 
      { status: 200 }
    );
  }),
  http.get('/answers', () => {
    const answers = getAllAnswers();
    return new Response(JSON.stringify(answers), { status: 200 });
  }),
  http.get('/answer/:id', ({ params }) => {
    const { id } = params;
    const answer = getAnswerById(id as string);
    if (!answer) {
      return new Response(
        JSON.stringify({ error: 'Ответ не найден' }), 
        { status: 404 }
      );
    }
    return new Response(JSON.stringify(answer), { status: 200 });
  }),
];