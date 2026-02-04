import API from "./axios";

export const createSchool = (data)=>
  API.post("/admin/school", data);

export const createEmployee = (data)=>
  API.post("/admin/employee", data);
