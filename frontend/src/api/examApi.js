import API from "./axios";

/* Create exam */
export const createExam = (data)=>
  API.post("/exams/create", data);

/* Add question */
export const addQuestion = (data)=>
  API.post("/exams/questions/create", data);

/* Get exams */
export const getExams = ()=>
  API.get("/exams/questions");
