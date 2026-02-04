import API from "./axios";

export const getSchools = ()=>
  API.get("/schools");
