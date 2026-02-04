import Layout from "../../components/layout/Layout";

const Dashboard = ()=>{

  const role = localStorage.getItem("role");

  return(
    <Layout>
      <h1>Dashboard ({role})</h1>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(4,1fr)",
        gap:"20px"
      }}>
        <Card title="Students" value="120"/>
        <Card title="Exams" value="12"/>
        <Card title="Schools" value="5"/>
        <Card title="Employees" value="20"/>
      </div>

    </Layout>
  );
};

export default Dashboard;

const Card=({title,value})=>(
  <div style={{
    padding:"20px",
    background:"white",
    boxShadow:"0 3px 8px rgba(0,0,0,0.1)"
  }}>
    <h3>{title}</h3>
    <h1>{value}</h1>
  </div>
);
