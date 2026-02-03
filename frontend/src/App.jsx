import {BrowserRouter,Routes,Route} from "react-router-dom";
import Navbar from "./components/Navbar";
import Schools from "./pages/Schools";
import Students from "./pages/Students";
import CreateExam from "./pages/CreateExam";
import AddQuestions from "./pages/AddQuestions";

export default function App(){
  return (
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Schools/>}/>
        <Route path="/students/:schoolId" element={<Students/>}/>
        <Route path="/create-exam/:schoolId" element={<CreateExam/>}/>
        <Route path="/add-questions/:examId" element={<AddQuestions/>}/>
      </Routes>
    </BrowserRouter>
  );
}
