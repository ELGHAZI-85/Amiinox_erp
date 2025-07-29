import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthPage from './pages/Auth';
import Dashboard from './pages/Dashboard_';
import FormReception from './pages/FormReception'
import './index.css'

function App() {
    return (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/formReception" element={<FormReception />} />
          </Routes>
        </BrowserRouter>

  );
}

export default App