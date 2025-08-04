import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import ConfirmationPage from "./pages/ConfirmationPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import PaymentPage from "./pages/PaymentPage";
import RegistroPage from "./pages/RegistroPage";
import SearchPage from "./pages/SearchPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import TermsPage from "./pages/TermsPage";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
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
