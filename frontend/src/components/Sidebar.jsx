import { Link } from "react-router-dom";

const Sidebar = ()=>{
  const role = localStorage.getItem("role");

  return(
    <div style={{
      width:"220px",
      background:"#1e293b",
      color:"white",
      padding:"20px"
    }}>
      <h2>Exam Panel</h2>

      <nav style={{display:"flex",flexDirection:"column",gap:"10px"}}>

        <Link to="/" style={{color:"white"}}>Dashboard</Link>

        {role==="admin" && (
          <>
            <Link to="/" style={{color:"white"}}>Schools</Link>
            <Link to="/" style={{color:"white"}}>Employees</Link>
          </>
        )}

        {role==="employee" && (
          <>
            <Link to="/" style={{color:"white"}}>Students</Link>
            <Link to="/" style={{color:"white"}}>Exams</Link>
          </>
        )}

      </nav>
    </div>
  );
};

export default Sidebar;
