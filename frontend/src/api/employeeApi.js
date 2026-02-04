import API from "./axios";

/* Create single student */
export const createStudent = (data)=>
  API.post("/employee/student", data);

/* Bulk CSV upload */
export const bulkUploadStudents = (file)=>{
  const formData = new FormData();
  formData.append("file", file);

  return API.post("/employee/student/bulk", formData,{
    headers:{ "Content-Type":"multipart/form-data" }
  });
};

/* Get employees */
export const getEmployees = ()=>
  API.get("/employee");

/* Get employee by id */
export const getEmployeeById = (id)=>
  API.get(`/employee/${id}`);
