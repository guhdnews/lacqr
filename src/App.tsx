import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import QuoteCam from './pages/QuoteCam';
import ServiceSorter from './pages/ServiceSorter';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="app">
            <Route path="quote" element={<QuoteCam />} />
            <Route path="sort" element={<ServiceSorter />} />
            <Route index element={<Navigate to="quote" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
