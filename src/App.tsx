
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AppProvider } from './context/AppContext';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Catalog = lazy(() => import('./pages/Catalog').then(m => ({ default: m.Catalog })));
const CarDetail = lazy(() => import('./pages/CarDetail').then(m => ({ default: m.CarDetail })));
const Suppliers = lazy(() => import('./pages/Suppliers').then(m => ({ default: m.Suppliers })));
const SupplierDetail = lazy(() => import('./pages/SupplierDetail').then(m => ({ default: m.SupplierDetail })));
const CityDetail = lazy(() => import('./pages/CityDetail').then(m => ({ default: m.CityDetail })));
const Messages = lazy(() => import('./pages/Messages').then(m => ({ default: m.Messages })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Registration = lazy(() => import('./pages/Registration').then(m => ({ default: m.Registration })));
const Favorites = lazy(() => import('./pages/Favorites').then(m => ({ default: m.Favorites })));
const Comparison = lazy(() => import('./pages/Comparison').then(m => ({ default: m.Comparison })));
const SupplierDashboard = lazy(() => import('./pages/SupplierDashboard').then(m => ({ default: m.SupplierDashboard })));
const AdminPanel = lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const BrokerWorkspace = lazy(() => import('./pages/BrokerWorkspace').then(m => ({ default: m.BrokerWorkspace })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const SupplierFeed = lazy(() => import('./pages/SupplierFeed').then(m => ({ default: m.SupplierFeed })));
const NewsHub = lazy(() => import('./pages/NewsHub').then(m => ({ default: m.NewsHub })));
const TradeIn = lazy(() => import('./pages/TradeIn').then(m => ({ default: m.TradeIn })));
const Promotions = lazy(() => import('./pages/Promotions').then(m => ({ default: m.Promotions })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]" aria-label="Загрузка страницы">
    <div className="flex gap-1.5">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <AppProvider>
        <Router>
          <Layout>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/catalog/:id" element={<CarDetail />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/suppliers/:id" element={<SupplierDetail />} />
                  <Route path="/city/:city" element={<CityDetail />} />
                  <Route path="/feed" element={<Navigate to="/" replace />} />
                  <Route path="/news" element={<Navigate to="/" replace />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/compare" element={<Comparison />} />
                  <Route path="/broker" element={<BrokerWorkspace />} />
                  <Route path="/dashboard" element={<SupplierDashboard />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/trade-in" element={<TradeIn />} />
                  <Route path="/promotions" element={<Navigate to="/" replace />} />
                  <Route path="/register" element={<Registration />} />
                  <Route path="/login" element={<Registration />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </Layout>
        </Router>
      </AppProvider>
    </HelmetProvider>
  );
}

export default App;
