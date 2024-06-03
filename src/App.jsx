import './App.css'
import { Routes, Route, BrowserRouter } from "react-router-dom";
import IntroPage from './pages/IntroPage/IntroPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import QuizInterfacePage from './pages/QuizInterfacePage/QuizInterfacePage';

function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path = "/" element = {<IntroPage />} />
      <Route path = "/dashboard" element = {<DashboardPage />} />
      <Route path = "/play/:link" element = {<QuizInterfacePage />} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
