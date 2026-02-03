import Exam from "../models/Exam.js";

export const createExam = async (req, res) => {
  const {
    schoolId,
    employeeId,
    title,
    totalMarks,
    duration,
    examDate
  } = req.body;

  const exam = await Exam.create({
    school: schoolId,
    createdBy: employeeId,
    title,
    totalMarks,
    duration,
    examDate
  });

  res.json({
    success: true,
    data: exam
  });
};
