import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../context/TicketContext';
import { CheckCircle2, Clock, UserCheck, Package, Terminal, Lock as LockIcon, History, MessageSquare, ChevronRight, SlidersHorizontal, MapPin, Hash, User as UserIcon } from 'lucide-react';

const EngineerDashboard = () => {
    const { tickets, engineers, updateTicket, acceptInvitation, fetchTickets, fetchEngineers, updatePassword, user } = useTickets();
    const navigate = useNavigate();
    const [showPwdForm, setShowPwdForm] = useState(false);
    const [newPwd, setNewPwd] = useState('');
    const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
    const [ticketUpdates, setTicketUpdates] = useState({});
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
    const [selectedTicketHistory, setSelectedTicketHistory] = useState(null);
    const { fetchTicketHistory } = useTickets();

    const STATUS_OPTIONS = [
        { value: '0', label: '0 - Creation by Customer' },
        { value: '5', label: '5 - Assign an Engineer' },
        { value: '10', label: '10 - First Call' },
        { value: '11', label: '11 - Second Call' },
        { value: '15', label: '15 - Video Call' },
        { value: '20', label: '20 - Onsite Visit' },
        { value: '25', label: '25 - RMA' },
        { value: '30', label: '30 - RMA on Workshop' },
        { value: '35', label: '35 - Issue Address with Solution' },
        { value: '40', label: '40 - Fault Confirm' },
        { value: '45', label: '45 - Departure Workshop' },
        { value: '50', label: '50 - Closed Ticket' }
    ];

    const handleTicketUpdateChange = (id, field, value) => {
        setTicketUpdates(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const submitTicketUpdate = async (id, currentStatus) => {
        const update = ticketUpdates[id] || {};
        // Default to current status if not changed, ensuring we send something valid
        const statusToSend = update.status || currentStatus || '0';
        await updateTicket(id, {
            status: statusToSend,
            remarks: update.remarks || '',
            updatedBy: user.trigram
        });
        // Clear local state for this ticket
        setTicketUpdates(prev => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
        });
    };

    useEffect(() => {
        if (!user || (user.role_id !== 5 && user.role !== 'engineer')) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchTickets();
            fetchEngineers();
        }, 5000);
        return () => clearInterval(interval);
    }, [fetchTickets, fetchEngineers]);

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

    if (!user || (user.role_id !== 5 && user.role !== 'engineer')) return null;

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
                        Welcome Agent <span style={{ fontWeight: 800, color: 'var(--gray-900)' }}>{currentEngineer.trigram}</span>. Your technical profile is ready for activation in the FestService fleet.
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

    const activeTasks = myTasks.filter(t => t.status !== '50' && t.status !== 'Completed');
    const completedTasks = myTasks.filter(t => t.status === '50' || t.status === 'Completed');

    return (
        <div className="container fade-in" style={{ padding: '1.5rem', maxWidth: '1400px' }}>
            {/* Header Section */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-1.5px' }}>
                                <span style={{ color: '#0f172a' }}>Fest</span>
                                <span style={{ color: '#2563eb' }}>Service</span>
                            </span>
                            <span style={{ height: '20px', width: '2px', background: '#e2e8f0', margin: '0 8px' }}></span>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#64748b', margin: 0 }}>engineer console</h1>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', background: 'white', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}>
                    <button
                        onClick={() => setActiveTab('active')}
                        style={{
                            padding: '0.6rem 1.25rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: activeTab === 'active' ? '#0f172a' : 'transparent',
                            color: activeTab === 'active' ? 'white' : '#64748b',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <SlidersHorizontal size={16} /> Live Queue
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            padding: '0.6rem 1.25rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: activeTab === 'history' ? '#0f172a' : 'transparent',
                            color: activeTab === 'history' ? 'white' : '#64748b',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <History size={16} /> Service History
                    </button>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '1.5rem' }}>
                {/* Main Content */}
                <div>
                    {activeTab === 'active' ? (
                        <>
                            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ background: '#3b82f6', color: 'white', padding: '0.5rem', borderRadius: '8px' }}>
                                    <Clock size={18} />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Active Assignments ({activeTasks.length})</h2>
                            </div>

                            {activeTasks.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem', border: '2px dashed #e2e8f0', background: 'transparent' }}>
                                    <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                        <CheckCircle2 size={40} color="#cbd5e1" />
                                    </div>
                                    <h3 style={{ color: '#1e293b', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>All Clear</h3>
                                    <p style={{ color: '#64748b', fontWeight: 500 }}>No active complaints assigned to your station.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '1.25rem' }}>
                                    {activeTasks.map(task => (
                                        <div key={task.id} className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0', transition: 'transform 0.2s', borderRadius: '16px' }}>
                                            <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <span style={{ background: '#0f172a', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>TKT-{task.id}</span>
                                                    <span className={`badge badge-${task.status}`} style={{ fontSize: '0.65rem' }}>{STATUS_OPTIONS.find(o => o.value == task.status)?.label || task.status}</span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Clock size={14} /> {new Date(task.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div style={{ padding: '1.5rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>Customer Info</label>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                            <UserIcon size={14} color="#64748b" />
                                                            <span style={{ fontWeight: 800, color: '#1e293b' }}>{task.customerName}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                                            <MapPin size={14} />
                                                            <span>PIN: {task.pincode}, {task.state}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>Hardware Details</label>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                            <Hash size={14} color="#64748b" />
                                                            <span style={{ fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>{task.serialNumber}</span>
                                                        </div>
                                                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                                            {task.brand} {task.modelNumber}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ background: '#fff7ed', borderLeft: '4px solid #f97316', padding: '1rem', borderRadius: '0 8px 8px 0', marginBottom: '1.5rem' }}>
                                                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>Reported Issue</label>
                                                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#7c2d12', margin: 0 }}>{task.issue}</p>
                                                </div>

                                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <MessageSquare size={12} /> Progress Log
                                                    </label>
                                                    <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0, fontStyle: task.remarks ? 'normal' : 'italic' }}>
                                                        {task.remarks || 'No remarks recorded yet for this stage.'}
                                                    </p>
                                                </div>

                                                {/* Status Transition Workflow */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', background: '#f1f5f9', padding: '1rem', borderRadius: '12px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                            <div style={{ flex: 1 }}>
                                                                <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>Next Stage</label>
                                                                <select
                                                                    className="form-select"
                                                                    value={ticketUpdates[task.id]?.status || task.status}
                                                                    onChange={(e) => handleTicketUpdateChange(task.id, 'status', e.target.value)}
                                                                    style={{ height: '42px', padding: '0 2.5rem 0 0.75rem', fontSize: '0.85rem', width: '100%', borderRadius: '8px' }}
                                                                >
                                                                    {STATUS_OPTIONS.filter(o => parseInt(o.value) > 5).map(opt => (
                                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div style={{ flex: 2 }}>
                                                                <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>Engineer Remarks</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-input"
                                                                    placeholder="Diagnostic notes & actions taken..."
                                                                    value={ticketUpdates[task.id]?.remarks || ''}
                                                                    onChange={(e) => handleTicketUpdateChange(task.id, 'remarks', e.target.value)}
                                                                    style={{ height: '42px', padding: '0 1rem', borderRadius: '8px', fontSize: '0.85rem' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => submitTicketUpdate(task.id, task.status)}
                                                        className="btn btn-primary"
                                                        style={{ height: '70px', alignSelf: 'center', background: '#0f172a', fontWeight: 800, borderRadius: '10px', width: '120px' }}
                                                    >
                                                        Sync Update
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ background: '#10b981', color: 'white', padding: '0.5rem', borderRadius: '8px' }}>
                                    <CheckCircle2 size={18} />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Resolved History ({completedTasks.length})</h2>
                            </div>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {completedTasks.length === 0 ? (
                                    <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>No completed logs found.</div>
                                ) : (
                                    completedTasks.map(task => (
                                        <div key={task.id} className="card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                <div style={{ background: '#ecfdf5', color: '#10b981', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <CheckCircle2 size={20} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>TKT-{task.id}: {task.issue}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Resolved on {new Date(task.updatedAt || task.createdAt).toLocaleDateString()} • {task.customerName}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>FINAL STATUS</div>
                                                <div style={{ fontWeight: 800, color: '#10b981' }}>CLOSED</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar */}
                <div>
                    <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="card" style={{ padding: '1.5rem', border: 'none', background: '#0f172a', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <LockIcon size={20} color="#3b82f6" />
                                <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Change your password</h2>
                            </div>
                            {!showPwdForm ? (
                                <button onClick={() => setShowPwdForm(true)} className="btn" style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.1)' }}>Change Password</button>
                            ) : (
                                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="New Password"
                                        style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                        value={newPwd}
                                        onChange={(e) => setNewPwd(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#3b82f6' }}>Update Password</button>
                                    <button type="button" onClick={() => setShowPwdForm(false)} className="btn" style={{ width: '100%', color: '#94a3b8', background: 'transparent' }}>Cancel</button>
                                </form>
                            )}
                            {pwdMsg.text && (
                                <p style={{ fontSize: '0.7rem', marginTop: '0.75rem', color: pwdMsg.type === 'success' ? '#10b981' : '#ef4444', fontWeight: 700 }}>{pwdMsg.text}</p>
                            )}
                        </div>

                        <div className="card" style={{ padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                <Package size={20} color="#64748b" />
                                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>Summary</h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Open Cases</span>
                                    <span style={{ fontWeight: 800, color: '#1e293b' }}>{activeTasks.length}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Lifetime Closed</span>
                                    <span style={{ fontWeight: 800, color: '#1e293b' }}>{completedTasks.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1000px) {
                    .grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default EngineerDashboard;
