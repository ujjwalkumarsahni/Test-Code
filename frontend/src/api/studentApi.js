import API from "./axios";

export const getStudents = ()=>
  API.get("/students");
