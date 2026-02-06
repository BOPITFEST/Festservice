import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, User, Lock, AlertCircle } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

const EngineerLogin = () => {
  const navigate = useNavigate();
  const { login } = useTickets();
  const [trigram, setTrigram] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const cleanTrigram = trigram.toUpperCase().trim();
    const res = await login(cleanTrigram, password, 'engineer');
    
    if (res.success) {
      navigate('/engineer/dashboard');
    } else {
      setError(res.message || 'Invalid Agent ID or Password');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card fade-in" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'var(--secondary)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'white'
          }}>
            <Wrench size={28} />
          </div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Field Engineer
          </h2>
          <p style={{ color: 'var(--gray-600)' }}>
            Sign in with your Agent Trigram
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#991b1b'
          }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Agent Trigram</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="text"
                value={trigram}
                onChange={(e) => setTrigram(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.75rem', textTransform: 'uppercase' }}
                placeholder="ABC"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Secure Key</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%', height: '48px', marginTop: '1rem', background: 'var(--secondary)' }}>
            {isSubmitting ? 'Syncing...' : 'Log into Portal'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'var(--gray-50)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Demo Agent Access
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: 'var(--gray-700)', fontWeight: 700 }}>ALI / eng123</p>
              <p style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: 'var(--gray-700)', fontWeight: 700 }}>BOB / eng123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerLogin;
