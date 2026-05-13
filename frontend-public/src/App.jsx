import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
