interface Answer {
  id: string;
  student: string;
  subject: string;
  text: string;
  fileType?: 'doc' | 'docx' | 'pdf' | 'txt' | 'ppt' | 'pptx';
  fileName?: string;
  status: 'pending' | 'in_progress' | 'evaluated';
  score: number | null;
  comment: string | null;
}

let answers: Answer[] = [
  {
    id: '1',
    student: 'student@example.com',
    subject: 'Математика',
    text: 'Пример ответа на задачу по математике',
    status: 'evaluated',
    score: 85,
    comment: 'Хорошая работа!',
  },
  {
    id: '2',
    student: 'student@example.com',
    subject: 'Физика',
    text: 'Ответ на задачу по физике',
    status: 'pending',
    score: null,
    comment: null,
  },
  {
    id: '3',
    student: 'another@example.com',
    subject: 'Информатика',
    text: 'Решение задачи по программированию',
    status: 'in_progress',
    score: null,
    comment: 'На проверке',
  },
];

export const getAnswerById = (id: string): Answer | undefined => {
  return answers.find((answer) => answer.id === id);
};

export const addAnswer = (answer: Answer): void => {
  const existingIndex = answers.findIndex(a => a.id === answer.id);
  if (existingIndex !== -1) {
    // Если ответ с таким id уже существует, обновляем его
    answers[existingIndex] = answer;
  } else {
    // Если это новый ответ, добавляем его
    answers.push(answer);
  }
};

export const getAllAnswers = (): Answer[] => {
  return answers;
};

export const updateAnswer = (id: string, updates: Partial<Answer>): Answer | undefined => {
  const index = answers.findIndex(a => a.id === id);
  if (index === -1) return undefined;
  
  answers[index] = { ...answers[index], ...updates };
  return answers[index];
};