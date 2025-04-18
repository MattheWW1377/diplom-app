import { http } from 'msw';
import { addAnswer, getAnswerById, getAllAnswers } from './db';

// Интерфейс для тела запроса POST /evaluate
interface EvaluateRequestBody {
  text: string;
  student: string;
  subject: string;
}

export const handlers = [
  http.post('/evaluate', async ({ request }) => {
    const body = await request.json() as EvaluateRequestBody;
    const { text, student, subject } = body;
    if (!text || !student || !subject) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    const score = 85;
    const comment = `Ответ от ${student} по ${subject} оценён`;
    const newAnswer = {
      id: Date.now().toString(),
      student,
      subject,
      text,
      status: 'Оценено',
      score,
      comment,
    };
    addAnswer(newAnswer);
    return new Response(JSON.stringify({ id: newAnswer.id, score, comment }), { status: 200 });
  }),
  http.get('/answers', () => {
    const answers = getAllAnswers();
    return new Response(JSON.stringify(answers), { status: 200 });
  }),
  http.get('/answer/:id', ({ params }) => {
    const { id } = params;
    const answer = getAnswerById(id as string);
    if (!answer) {
      return new Response(JSON.stringify({ error: 'Ответ не найден' }), { status: 404 });
    }
    return new Response(JSON.stringify(answer), { status: 200 });
  }),
];