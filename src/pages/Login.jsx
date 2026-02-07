import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

const Login = () => {
    const navigate = useNavigate();
    const { login, user } = useTickets();
    const [trigram, setTrigram] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.role_id === 10 || user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user.role_id === 5 || user.role === 'engineer') {
                navigate('/engineer/dashboard');
            }
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Convert to uppercase as trigrams are typically uppercase
        const cleanTrigram = trigram.toUpperCase().trim();
        const res = await login(cleanTrigram, password);

        if (res.success) {
            const loggedUser = res.user;
            if (loggedUser.role_id === 10 || loggedUser.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (loggedUser.role_id === 5 || loggedUser.role === 'engineer') {
                navigate('/engineer/dashboard');
            } else {
                setError('Unauthorized role');
            }
        } else {
            setError(res.message || 'Invalid Trigram or Password');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="container" style={{ padding: '4rem 1.5rem', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card fade-in" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-2px' }}>
                        <span style={{ color: '#0f172a' }}>Fest</span>
                        <span style={{ color: '#2563eb' }}>Service</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>
                        Staff Authentication
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem 1rem',
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: '#991b1b',
                        animation: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both'
                    }}>
                        <AlertCircle size={18} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>Trigram ID</label>
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
                        <label className="form-label" style={{ fontWeight: 600 }}>Password</label>
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

                    <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{
                        width: '100%',
                        height: '52px',
                        marginTop: '1.5rem',
                        fontSize: '1rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        borderRadius: '12px'
                    }}>
                        {isSubmitting ? 'Verifying...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-secondary"
                        style={{
                            width: '100%',
                            height: '52px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        ← Back to Customer Portal
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}} />
        </div>
    );
};

export default Login;
