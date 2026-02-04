import { useState } from "react";
import { loginUser } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

const Login = ()=>{

  const navigate = useNavigate();

  const [form,setForm]=useState({
    email:"",
    password:""
  });

  const handleChange=(e)=>{
    setForm({...form,[e.target.name]:e.target.value});
  };

  const handleSubmit=async(e)=>{
    e.preventDefault();

    const res = await loginUser(form);

    localStorage.setItem("token",res.data.token);
    localStorage.setItem("role",res.data.role);

    navigate("/");
  };

  return(
    <div style={{
      height:"100vh",
      display:"flex",
      justifyContent:"center",
      alignItems:"center"
    }}>
      <form onSubmit={handleSubmit}
        style={{
          width:"300px",
          display:"flex",
          flexDirection:"column",
          gap:"10px"
        }}
      >
        <h2>Login</h2>

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <button>Login</button>
      </form>
    </div>
  );
};

export default Login;
