import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import SeatSelectionPage from './pages/SeatSelectionPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/booking/:tripId" element={<SeatSelectionPage />} />
          {/* Aquí irán las demás rutas cuando las tengas listas */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;