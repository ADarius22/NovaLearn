import Quiz from '../models/Quiz';

export const getQuizById = async (quizId: string) => {
  return await Quiz.findById(quizId).populate('course');
};

export const calculateQuizScore = (questions: any[], answers: any[]): { score: number; results: any[] } => {
  let score = 0;
  const results: { question: string; correct: boolean }[] = [];

  questions.forEach((question, index) => {
    const correctAnswers = question.correctAnswers.sort().join(',');
    const userAnswers = answers[index]?.sort().join(',');

    if (correctAnswers === userAnswers) {
      score += question.points || 1;
      results.push({ question: question.text, correct: true });
    } else {
      results.push({ question: question.text, correct: false });
    }
  });

  return { score, results };
};
