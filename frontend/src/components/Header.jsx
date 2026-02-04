const Header = ()=>{

  const logout=()=>{
    localStorage.clear();
    window.location.href="/login";
  };

  return(
    <div style={{
      height:"60px",
      borderBottom:"1px solid #ddd",
      display:"flex",
      justifyContent:"flex-end",
      alignItems:"center",
      padding:"0 20px"
    }}>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Header;
