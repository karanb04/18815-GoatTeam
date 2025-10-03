import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyLoginPage from './pages/MyLoginPage';
import MyRegistrationPage from './pages/MyRegistrationPage';
import MyUserPortal from './pages/MyUserPortal';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MyLoginPage />} />
          <Route path="/register" element={<MyRegistrationPage />} />
          <Route path="/portal" element={<MyUserPortal />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;