import {BrowserRouter,Routes,Route} from "react-router-dom";
import Students from "./pages/Students";
import Dashboard from "./pages/dashboard/Dashboard";
import Login from "./pages/auth/Login";

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/" element={<Dashboard/>}/>
        <Route path="/students" element={<Students/>}/>
      </Routes>
    </BrowserRouter>
  );
}
