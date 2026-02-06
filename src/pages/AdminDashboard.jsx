import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../context/TicketContext';
import { UserPlus, Users, ClipboardList, Send, User as UserIcon } from 'lucide-react';

const AdminDashboard = () => {
  const { tickets, engineers, assignTicket, addEngineer, user } = useTickets();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tickets');
  const [newEngName, setNewEngName] = useState('');
  const [newEngTrigram, setNewEngTrigram] = useState('');
  const [newEngEmail, setNewEngEmail] = useState('');
  const [newEngPass, setNewEngPass] = useState('password123');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [user]);

  if (!user || user.role !== 'admin') return null;

  const handleAddEngineer = async (e) => {
    e.preventDefault();
    if (!newEngName || !newEngTrigram) return;
    setIsAdding(true);
    await addEngineer({ 
        name: newEngName, 
        trigram: newEngTrigram.toUpperCase().trim(),
        email: newEngEmail, 
        password: newEngPass 
    });
    setNewEngName('');
    setNewEngTrigram('');
    setNewEngEmail('');
    setNewEngPass('password123');
    setIsAdding(false);
  };

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--gray-900)' }}>
          Operations Dashboard
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '1.125rem' }}>
          Global ticket management & engineering fleet control
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        marginBottom: '2.5rem',
        background: 'var(--gray-100)',
        padding: '0.4rem',
        borderRadius: '12px',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('tickets')}
          style={{
            padding: '0.6rem 1.5rem',
            border: 'none',
            background: activeTab === 'tickets' ? 'white' : 'transparent',
            color: activeTab === 'tickets' ? 'var(--gray-900)' : 'var(--gray-500)',
            borderRadius: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: activeTab === 'tickets' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <ClipboardList size={18} />
          Active Claims
        </button>
        <button
          onClick={() => setActiveTab('engineers')}
          style={{
            padding: '0.6rem 1.5rem',
            border: 'none',
            background: activeTab === 'engineers' ? 'white' : 'transparent',
            color: activeTab === 'engineers' ? 'var(--gray-900)' : 'var(--gray-500)',
            borderRadius: '10px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: activeTab === 'engineers' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <Users size={18} />
          Engineering Team
        </button>
      </div>

      {activeTab === 'tickets' ? (
        <div className="grid">
          {tickets.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed var(--gray-200)', background: 'transparent', boxShadow: 'none' }}>
              <p style={{ color: 'var(--gray-400)', fontSize: '1.125rem', fontWeight: 500 }}>No active mission tickets found.</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="card" style={{ borderLeft: `4px solid ${ticket.status === 'Completed' ? 'var(--success)' : ticket.status === 'Assigned' ? 'var(--primary)' : 'var(--warning)'}` }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <span className={`badge badge-${ticket.status.toLowerCase()}`}>
                        {ticket.status}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 700, fontFamily: 'monospace' }}>
                        TKT-{ticket.id.toString().padStart(4, '0')}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--gray-900)' }}>
                      {ticket.issue}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                        <div>
                            <span style={{ display: 'block', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>Customer</span>
                            <span style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{ticket.customerName}</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>Serial Num</span>
                            <span style={{ fontWeight: 700, color: 'var(--gray-800)', fontFamily: 'monospace' }}>{ticket.serialNumber}</span>
                        </div>
                    </div>
                  </div>

                  <div style={{ minWidth: '280px', background: 'var(--gray-50)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                    {ticket.status === 'Completed' ? (
                      <div style={{ textAlign: 'center' }}>
                         <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: 'var(--success)', borderRadius: '50%', color: 'white', marginBottom: '0.5rem' }}>
                            <ClipboardList size={20} />
                         </div>
                         <p style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Resolution Verified</p>
                      </div>
                    ) : (
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                          Deployment Assignment
                        </label>
                        <select
                          className="form-select"
                          style={{ marginBottom: '1rem', fontWeight: 700 }}
                          value={ticket.assignedTo || ''}
                          onChange={(e) => assignTicket(ticket.id, e.target.value)}
                        >
                          <option value="">Select available agent...</option>
                          {engineers.filter(e => e.status === 'Active').map(eng => (
                            <option key={eng.id} value={eng.id}>{eng.name} ({eng.trigram})</option>
                          ))}
                        </select>
                        {ticket.assignedTo && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>
                             <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                             Active Agent: {engineers.find(e => e.id == ticket.assignedTo)?.trigram}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="fade-in">
          {/* Add Engineer Form */}
          <div className="card" style={{ marginBottom: '3rem', border: 'none', background: 'var(--primary)', boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white' }}>
              <UserPlus size={24} />
              Deploy New Technical Agent
            </h3>
            <form onSubmit={handleAddEngineer}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Full Identity Name</label>
                  <input
                    type="text"
                    value={newEngName}
                    onChange={(e) => setNewEngName(e.target.value)}
                    placeholder="E.g. John Doe"
                    className="form-input"
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontWeight: 600 }}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Trigram ID (3 Letters)</label>
                  <input
                    type="text"
                    value={newEngTrigram}
                    onChange={(e) => setNewEngTrigram(e.target.value)}
                    placeholder="E.g. JDO"
                    className="form-input"
                    maxLength={10}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontWeight: 700, textTransform: 'uppercase' }}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Contact Email</label>
                  <input
                    type="email"
                    value={newEngEmail}
                    onChange={(e) => setNewEngEmail(e.target.value)}
                    placeholder="john@fest.com"
                    className="form-input"
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontWeight: 600 }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Login Password</label>
                  <input
                    type="text"
                    value={newEngPass}
                    onChange={(e) => setNewEngPass(e.target.value)}
                    placeholder="Set Password"
                    className="form-input"
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontWeight: 600 }}
                    required
                  />
                </div>
                <button type="submit" disabled={isAdding} className="btn" style={{
                    height: '48px',
                    background: 'white',
                    color: 'var(--primary)',
                    fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <Send size={18} />
                  {isAdding ? 'Deploying...' : 'Confirm Deployment'}
                </button>
              </div>
            </form>
          </div>

          {/* Engineers List */}
          <div className="grid grid-cols-3">
            {engineers.map((eng) => (
              <div key={eng.id} className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'var(--gray-100)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gray-600)'
                    }}>
                    <UserIcon size={28} />
                    </div>
                    <span className={`badge badge-${eng.status.toLowerCase()}`}>
                    {eng.status}
                    </span>
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--gray-900)' }}>
                  {eng.name}
                </h4>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace', marginBottom: '1rem' }}>
                  ID: {eng.trigram}
                </p>
                <div style={{
                  paddingTop: '1.25rem',
                  borderTop: '1px solid var(--gray-100)',
                  fontSize: '0.75rem',
                  color: 'var(--gray-400)',
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Deployed</span>
                  <span>{new Date(eng.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
