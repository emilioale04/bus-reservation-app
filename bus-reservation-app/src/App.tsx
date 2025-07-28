import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Aquí irán las demás rutas cuando las tengas listas */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;