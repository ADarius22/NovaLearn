// src/services/quizAttempt.service.ts
import QuizAttempt from '../models/quizAttempt';
import Quiz from '../models/Quiz';

interface RawAnswer { questionId: string; answer: string }

const calculateScore = (
  questions: { _id: string; correctAnswer: string }[],
  answers: RawAnswer[],
) => {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]));
  let correct = 0;

  for (const q of questions) {
    if (answerMap.get(q._id.toString()) === q.correctAnswer) correct += 1;
  }

  const score = (correct / questions.length) * 100;
  return { score, correct };
};

export const submit = async (
  studentId: string,
  quizId: string,
  answers: RawAnswer[],
) => {
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) throw new Error('Quiz not found');

  const { score } = calculateScore(
    quiz.questions.map((q: any) => ({
      _id: q._id,
      correctAnswer: q.correctAnswers[0], 
    })),
    answers
  );
  const passed = score >= (quiz.passingScore || 0);

  return QuizAttempt.create({
    quiz: quizId,
    student: studentId,
    score,
    passed,
    answers,
  });
};

export const getAttempts  = (studentId: string, limit = 5) =>
  QuizAttempt.find({ student: studentId })
    .populate('quiz')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
