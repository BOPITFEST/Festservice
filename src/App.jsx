import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TicketProvider } from './context/TicketContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EngineerDashboard from './pages/EngineerDashboard';

function App() {
  return (
    <TicketProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public / User Route */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Engineer Routes */}
            <Route path="/engineer/dashboard" element={<EngineerDashboard />} />

            {/* Redirect legacy login paths to unified login */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/engineer/login" element={<Login />} />
          </Routes>
        </Layout>
      </Router>
    </TicketProvider>
  );
}

export default App;
