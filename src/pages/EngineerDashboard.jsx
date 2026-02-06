import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../context/TicketContext';
import { CheckCircle2, Clock, UserCheck, Package, Terminal } from 'lucide-react';

const EngineerDashboard = () => {
  const { tickets, engineers, completeTicket, acceptInvitation, fetchTickets, fetchEngineers, updatePassword, user } = useTickets();
  const navigate = useNavigate();
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user || user.role !== 'engineer') {
      navigate('/engineer/login');
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTickets();
      fetchEngineers(); // Added: poll engineers to keep status (Pending/Active) updated
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdatePassword = async (e) => {
      e.preventDefault();
      if (!newPwd) return;
      const res = await updatePassword(user.trigram, newPwd);
      if (res.success) {
          setPwdMsg({ type: 'success', text: 'Security key updated successfully!' });
          setNewPwd('');
          setTimeout(() => {
              setPwdMsg({ type: '', text: '' });
              setShowPwdForm(false);
          }, 3000);
      } else {
          setPwdMsg({ type: 'error', text: 'Update failed. Try again.' });
      }
  };

  if (!user || user.role !== 'engineer') return null;

  // Find engineer in list to check status, but use user.id for filtering tasks
  const currentEngineer = engineers.find(e => e.trigram === user.trigram || e.id === user.id);
  const myTasks = tickets.filter(t => t.assignedTo == user.id || t.assignedTo == currentEngineer?.id);
  const isPendingInvitation = currentEngineer ? currentEngineer.status === 'Pending' : false;

  if (isPendingInvitation) {
    return (
      <div className="container fade-in" style={{ padding: '4rem 1.5rem', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', textAlign: 'center', padding: '3.5rem 2.5rem', boxShadow: 'var(--shadow-xl)', borderTop: '4px solid var(--warning)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#fffbeb',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--warning)'
          }}>
            <Clock size={32} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--gray-900)' }}>
            System Sync Required
          </h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '2.5rem', fontSize: '1.125rem', lineHeight: 1.5 }}>
            Welcome Agent <span style={{ fontWeight: 800, color: 'var(--gray-900)' }}>{currentEngineer.trigram}</span>. Your technical profile is ready for activation in the FESTService fleet.
          </p>
          <button
            onClick={() => acceptInvitation(user.trigram)}
            className="btn btn-primary"
            style={{ gap: '0.75rem', width: '100%', height: '56px', fontSize: '1.125rem', background: 'var(--gray-900)' }}
          >
            <UserCheck size={24} />
            Activate Agent Profile
          </button>
        </div>
      </div>
    );
  }

  const activeTasks = myTasks.filter(t => t.status !== 'Completed');
  const completedTasks = myTasks.filter(t => t.status === 'Completed');

  return (
    <div className="container fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '10px', height: '10px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fleet Sync Active</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
            Mission Control
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '1.125rem' }}>
            Agent: <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{currentEngineer?.trigram}</span> | {currentEngineer?.name}
          </p>
          <button 
            onClick={() => setShowPwdForm(!showPwdForm)}
            style={{ 
                marginTop: '1rem', 
                padding: '0.4rem 0.8rem', 
                fontSize: '0.75rem', 
                background: 'var(--gray-100)', 
                border: 'none', 
                borderRadius: '6px', 
                fontWeight: 700, 
                color: 'var(--gray-600)',
                cursor: 'pointer'
            }}>
            {showPwdForm ? 'Cancel Security Update' : 'Change Secure Key'}
          </button>
        </div>

        {showPwdForm && (
            <div className="card fade-in" style={{ 
                position: 'absolute', 
                top: '120px', 
                left: '24px', 
                zIndex: 100, 
                width: '300px', 
                background: 'white', 
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--gray-200)'
            }}>
                <form onSubmit={handleUpdatePassword}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update Security Key</h4>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <input 
                            type="password" 
                            className="form-input" 
                            placeholder="New Mission Key"
                            value={newPwd}
                            onChange={(e) => setNewPwd(e.target.value)}
                            required
                        />
                    </div>
                    {pwdMsg.text && (
                        <p style={{ 
                            fontSize: '0.75rem', 
                            marginBottom: '1rem', 
                            color: pwdMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
                            fontWeight: 700
                        }}>{pwdMsg.text}</p>
                    )}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '40px' }}>
                        Confirm Update
                    </button>
                </form>
            </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem' }}>
             <div className="card" style={{ padding: '1rem 2rem', background: 'var(--gray-900)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '140px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>Active</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{activeTasks.length}</span>
             </div>
             <div className="card" style={{ padding: '1rem 2rem', background: 'white', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '140px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: '0.25rem' }}>Cleared</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>{completedTasks.length}</span>
             </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
        {/* Left Column: Active Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Terminal size={22} color="var(--primary)" />
                Current Mission Assignments
            </h2>

            {activeTasks.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem', border: '2px dashed var(--gray-200)', background: 'transparent', boxShadow: 'none' }}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--gray-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--gray-400)' }}>
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>Area Secured</h3>
                    <p style={{ color: 'var(--gray-500)' }}>No pending maintenance requests in your queue.</p>
                </div>
            ) : (
                activeTasks.map(task => (
                    <div key={task.id} className="card fade-in" style={{ padding: '2rem', borderLeft: '4px solid var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                                        TKT-{task.id.toString().padStart(4, '0')}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-400)' }}>
                                        Assigned {new Date(task.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '1.5rem' }}>
                                    {task.issue}
                                </h3>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Deployment Origin</span>
                                        <span style={{ fontWeight: 700, color: 'var(--gray-800)', fontSize: '1rem' }}>{task.customerName}</span>
                                        <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>{task.email}</span>
                                    </div>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Hardware Identifier</span>
                                        <span style={{ fontWeight: 800, color: 'var(--gray-900)', fontSize: '1.125rem', fontFamily: 'monospace' }}>{task.serialNumber}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => completeTicket(task.id)}
                            className="btn btn-primary"
                            style={{ width: '100%', height: '56px', fontSize: '1.125rem', gap: '0.75rem', background: 'var(--primary)', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}
                        >
                            <CheckCircle2 size={24} />
                            Complete Mission Successfully
                        </button>
                    </div>
                ))
            )}
        </div>

        {/* Right Column: History */}
        <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '1.5rem' }}>
                Resolution Log
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {completedTasks.length === 0 ? (
                    <div className="card" style={{ padding: '2rem', textAlign: 'center', background: 'transparent', border: '1px solid var(--gray-200)', boxShadow: 'none' }}>
                        <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', fontStyle: 'italic' }}>No historical entries yet.</p>
                    </div>
                ) : (
                    completedTasks.slice(0, 10).map(task => (
                        <div key={task.id} className="card" style={{ padding: '1rem 1.25rem', background: 'var(--gray-50)', border: 'none', boxShadow: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ minWidth: '32px', height: '32px', background: 'var(--success)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <CheckCircle2 size={16} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {task.issue}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 600 }}>
                                        TKT-{task.id} • {task.customerName}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
      
      <style>{`
          @media (max-width: 900px) {
              .grid { grid-template-columns: 1fr !important; }
          }
      `}</style>
    </div>
  );
};

export default EngineerDashboard;
