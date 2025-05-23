import { createContext, useContext, useState, ReactNode } from 'react';

interface Answer {
  id: string;
  student: string;
  subject: string;
  text: string;
  fileType?: 'doc' | 'docx' | 'pdf' | 'txt' | 'ppt' | 'pptx';
  fileName?: string;
  status: 'pending' | 'evaluated';
  score?: number;
  comment?: string;
}

interface AnswerContextType {
  answers: Answer[];
  addAnswer: (answer: Answer) => void;
}

const AnswerContext = createContext<AnswerContextType | undefined>(undefined);

export const AnswerProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<Answer[]>([
    {
      id: '1',
      student: 'Иван Иванов',
      subject: 'Математика',
      text: 'Пример ответа...',
      status: 'evaluated',
      score: 85,
      comment: 'Хороший ответ',
    },
  ]);

  const addAnswer = (answer: Answer) => {
    setAnswers((prev) => [...prev, { ...answer, id: `${prev.length + 1}` }]);
  };

  return (
    <AnswerContext.Provider value={{ answers, addAnswer }}>
      {children}
    </AnswerContext.Provider>
  );
};

export const useAnswers = () => {
  const context = useContext(AnswerContext);
  if (!context) {
    throw new Error('useAnswers must be used within an AnswerProvider');
  }
  return context;
};