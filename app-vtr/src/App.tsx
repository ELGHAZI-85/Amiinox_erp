import { HashRouter, Route, Routes } from 'react-router-dom'; 
import AuthPage from './pages/Auth';
import Dashboard from './pages/Dashboard_';
import FormReception from './pages/FormReception';
import './index.css';

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/formReception" element={<FormReception />} />
            </Routes>
        </HashRouter>
    );
}

export default App;
