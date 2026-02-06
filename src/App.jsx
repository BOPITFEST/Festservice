import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TicketProvider } from './context/TicketContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import EngineerLogin from './pages/EngineerLogin';
import EngineerDashboard from './pages/EngineerDashboard';

function App() {
  return (
    <TicketProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public / User Route */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Engineer Routes */}
            <Route path="/engineer/login" element={<EngineerLogin />} />
            <Route path="/engineer/dashboard" element={<EngineerDashboard />} />
          </Routes>
        </Layout>
      </Router>
    </TicketProvider>
  );
}

export default App;
