import Question from "../models/Question.js";

export const addQuestion = async (req, res) => {
  const { examId, questionText, options, correctAnswer, marks } = req.body;

  const question = await Question.create({
    exam: examId,
    questionText,
    options,
    correctAnswer,
    marks
  });

  res.json({
    success: true,
    data: question
  });
};


export const getExamQuestions = async (req, res) => {
  const { examId } = req.params;

  const questions = await Question.find({ exam: examId });

  res.json({
    success: true,
    data: questions
  });
};
