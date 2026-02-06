import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, LogOut } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useTickets();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid var(--gray-200)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'var(--gray-900)',
            fontWeight: 800,
            fontSize: '1.5rem',
            letterSpacing: '-0.025em'
          }}>
            <span style={{ color: 'var(--gray-900)' }}>FEST</span>
            <span style={{ color: 'var(--primary)' }}>Service</span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'none' }} className="desktop-nav">
            {!user ? (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/admin/login" className="btn btn-secondary">Admin Access</Link>
                <Link to="/engineer/login" className="btn btn-primary">Engineer Portal</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {user.role}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                    ID: {user.trigram}
                    </span>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'block',
              padding: '0.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer'
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            padding: '1rem',
            borderTop: '1px solid var(--gray-200)',
            background: 'white'
          }} className="mobile-menu">
            {!user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/admin/login" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>
                  Admin Access
                </Link>
                <Link to="/engineer/login" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                  Engineer Portal
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    Authenticated {user.role}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>ID: {user.trigram}</div>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary">
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: block !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
