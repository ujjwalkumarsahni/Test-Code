import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CreateExam(){
  const {schoolId}=useParams();
  const nav = useNavigate();

  const [title,setTitle]=useState("");

  const submit = async ()=>{
    const res = await api.post("/exams",{
      schoolId,
      employeeId:"691b00e61682a8e2b9fc1654",
      title,
      totalMarks:100,
      duration:60,
      examDate:new Date()
    });

    alert("Exam Created");
    nav(`/add-questions/${res.data.data._id}`);
  };

  return (
    <div style={{padding:20}}>
      <h2>Create Exam</h2>

      <input
        placeholder="Exam Title"
        onChange={e=>setTitle(e.target.value)}
      />

      <button onClick={submit}>Create</button>
    </div>
  );
}
