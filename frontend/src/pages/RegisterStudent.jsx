import { useState } from "react";
import api from "../api";

export default function RegisterStudent(){

  const employeeId = "691b00e61682a8e2b9fc1654";

  const [name,setName]=useState("");
  const [email,setEmail]=useState("");

  const submit = async ()=>{
    await api.post("/students",{
      employeeId,
      fullName:name,
      email
    });

    alert("Student Registered");
  };

  return (
    <div>
      <h2>Register Student</h2>

      <input
        placeholder="Name"
        onChange={e=>setName(e.target.value)}
      />

      <input
        placeholder="Email"
        onChange={e=>setEmail(e.target.value)}
      />

      <button onClick={submit}>
        Submit
      </button>
    </div>
  );
}
