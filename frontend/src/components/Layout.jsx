import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({children})=>{
  return(
    <div style={{display:"flex",height:"100vh"}}>
      <Sidebar/>
      <div style={{flex:1}}>
        <Header/>
        <div style={{padding:"20px"}}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
