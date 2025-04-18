interface Answer {
  id: string;
  student: string;
  subject: string;
  text: string;
  status: string;
  score: number;
  comment: string;
}

let answers: Answer[] = [
  {
    id: '1',
    student: 'Иван Иванов',
    subject: 'Математика',
    text: 'Пример ответа...',
    status: 'Оценено',
    score: 85,
    comment: 'Хороший ответ',
  },
];

export const getAnswerById = (id: string): Answer | undefined => {
  return answers.find((answer) => answer.id === id);
};

export const addAnswer = (answer: Answer): void => {
  answers.push(answer);
};

export const getAllAnswers = (): Answer[] => {
  return answers;
};