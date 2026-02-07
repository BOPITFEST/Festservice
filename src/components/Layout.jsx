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
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-1.5px'
          }}>
            <span style={{ color: '#0f172a' }}>Fest</span>
            <span style={{ color: '#2563eb' }}>Service</span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'none' }} className="desktop-nav">
            {!user ? (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/login" className="btn btn-primary" style={{ borderRadius: '8px' }}>Staff Login</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {user.role} AUTHORIZATION
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                    {user.trigram || user.name}
                  </span>
                </div>
                <div style={{ width: '2px', height: '32px', background: '#f1f5f9' }}></div>
                <button onClick={handleLogout} className="btn" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ef4444',
                  fontWeight: 700,
                  background: 'none',
                  padding: '0.5rem'
                }}>
                  <LogOut size={20} />
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
                <Link to="/login" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                  Staff Login
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
