import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ConfirmationPage from "./pages/ConfirmationPage";
import HomePage from "./pages/HomePage";
import PaymentPage from "./pages/PaymentPage";
import RegistroPage from "./pages/RegistroPage";
import SearchPage from "./pages/SearchPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/booking/:tripId" element={<SeatSelectionPage />} />
          <Route path="/registro/:tripId" element={<RegistroPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
