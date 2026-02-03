import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Schools(){
  const [schools,setSchools]=useState([]);
  const nav = useNavigate();

  useEffect(()=>{
    api.get("/schools").then(res=>{
      setSchools(res.data.data);
    });
  },[]);

  return (
    <div style={{padding:20}}>
      <h2>Schools</h2>

      {schools.map(s=>(
        <div key={s._id} style={{
          border:"1px solid #ddd",
          padding:15,
          marginBottom:10,
          borderRadius:8
        }}>
          <h3>{s.name}</h3>
          <p>{s.city}</p>

          <button onClick={()=>nav(`/students/${s._id}`)}>
            Register Student
          </button>

          <button onClick={()=>nav(`/create-exam/${s._id}`)}>
            Create Exam
          </button>
        </div>
      ))}
    </div>
  );
}
