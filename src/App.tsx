
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { CarDetail } from './pages/CarDetail';
import { Suppliers } from './pages/Suppliers';
import { SupplierDetail } from './pages/SupplierDetail';
import { CityDetail } from './pages/CityDetail';
import { Messages } from './pages/Messages';
import { About } from './pages/About';
import { Registration } from './pages/Registration';
import { Favorites } from './pages/Favorites';
import { Comparison } from './pages/Comparison';
import { SupplierDashboard } from './pages/SupplierDashboard';
import { AdminPanel } from './pages/AdminPanel';
import { BrokerWorkspace } from './pages/BrokerWorkspace';
import { Profile } from './pages/Profile';
import { SupplierFeed } from './pages/SupplierFeed';
import { NewsHub } from './pages/NewsHub';
import { AppProvider } from './context/AppContext';
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/catalog/:id" element={<CarDetail />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/:id" element={<SupplierDetail />} />
            <Route path="/city/:city" element={<CityDetail />} />
            <Route path="/feed" element={<SupplierFeed />} />
            <Route path="/news" element={<NewsHub />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/compare" element={<Comparison />} />
            <Route path="/broker" element={<BrokerWorkspace />} />
            <Route path="/dashboard" element={<SupplierDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/about" element={<About />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/login" element={<Registration />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </HelmetProvider>
  );
}

export default App;
