import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function AddQuestions(){
  const {examId}=useParams();

  const [q,setQ]=useState("");

  const submit = async ()=>{
    await api.post("/questions",{
      examId,
      questionText:q,
      options:["A","B","C","D"],
      correctAnswer:0,
      marks:1
    });

    alert("Question Added");
  };

  return (
    <div style={{padding:20}}>
      <h2>Add Question</h2>

      <input
        placeholder="Question"
        onChange={e=>setQ(e.target.value)}
      />

      <button onClick={submit}>Add</button>
    </div>
  );
}
