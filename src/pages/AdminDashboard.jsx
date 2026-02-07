import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../context/TicketContext';
import {
  UserPlus,
  Users,
  ClipboardList,
  Send,
  User as UserIcon,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  History,
  TrendingUp,
  MapPin,
  Calendar,
  MoreVertical,
  Wrench
} from 'lucide-react';

const AdminDashboard = () => {
  const { tickets, engineers, assignTicket, addEngineer, user, fetchTicketHistory, loading } = useTickets();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tickets');
  const [newEngName, setNewEngName] = useState('');
  const [newEngTrigram, setNewEngTrigram] = useState('');
  const [newEngEmail, setNewEngEmail] = useState('');
  const [newEngPass, setNewEngPass] = useState('password123');
  const [newEngRole, setNewEngRole] = useState('engineer'); // Added role state
  const [isAdding, setIsAdding] = useState(false);

  // Sorting, Filtering & Modal State
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [filterState, setFilterState] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const STATUS_LABELS = {
    '0': 'Pending Intake',
    '5': 'Eng assigned',
    '10': 'Call scheduled',
    '11': 'Follow-up call',
    '15': 'Virtual inspection',
    '20': 'Field deployment',
    '25': 'RMA Initiated',
    '30': 'Lab diagnostic',
    '35': 'Final Solution',
    '40': 'Tech Defect Verified',
    '45': 'Logistics departure',
    '50': 'Operation Successful'
  };

  // Authorization check
  useEffect(() => {
    if (!loading && (!user || (user.role_id !== 10 && user.role !== 'admin'))) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const availableStates = useMemo(() => {
    const states = tickets.map(t => t.state).filter(Boolean);
    return Array.from(new Set(states)).sort();
  }, [tickets]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const pending = tickets.filter(t => t.status === '0').length;
    const inProgress = tickets.filter(t => !['0', '50'].includes(t.status)).length;
    const completed = tickets.filter(t => t.status === '50').length;

    // State-wise distribution
    const stateWise = {};
    tickets.forEach(t => {
      if (t.state) {
        stateWise[t.state] = (stateWise[t.state] || 0) + 1;
      }
    });

    return { total, pending, inProgress, completed, stateWise };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets
      .filter(t => {
        const matchesState = filterState ? t.state === filterState : true;
        const matchesStatus = filterStatus ? t.status === filterStatus : true;
        const matchesSearch = searchTerm ? (
          t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.id.toString().includes(searchTerm) ||
          t.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.phone?.includes(searchTerm)
        ) : true;
        return matchesState && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (sortField === 'id' || sortField === 'status') {
          aVal = parseInt(aVal) || 0;
          bVal = parseInt(bVal) || 0;
        }
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [tickets, filterState, searchTerm, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleViewDetails = async (ticket) => {
    setSelectedTicket(ticket);
    const history = await fetchTicketHistory(ticket.id);
    setTicketHistory(history || []);
    setShowHistoryModal(true);
  };

  const handleAddEngineer = async (e) => {
    e.preventDefault();
    const formattedTrigram = newEngTrigram.toUpperCase().trim();
    if (!newEngName || !formattedTrigram) return;

    // Validate 3 chars
    if (formattedTrigram.length !== 3) {
      alert("Trigram must be exactly 3 characters (e.g., ADM)");
      return;
    }

    setIsAdding(true);
    await addEngineer({
      name: newEngName,
      trigram: formattedTrigram,
      email: newEngEmail,
      password: newEngPass,
      role: newEngRole
    });
    setNewEngName('');
    setNewEngTrigram('');
    setNewEngEmail('');
    setNewEngPass('password123');
    setNewEngRole('engineer');
    setIsAdding(false);
  };

  if (loading || !user) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Administrative Console...</div>;

  return (
    <div className="container fade-in" style={{ padding: '2rem 1.5rem', background: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-1.5px' }}>
            <span style={{ color: '#0f172a' }}>Fest</span>
            <span style={{ color: '#2563eb' }}>Service</span>
            <span style={{ color: '#64748b', fontSize: '1.25rem', marginLeft: '0.5rem', fontWeight: 600 }}>Admin</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Operations Management</p>
        </div>
        <div style={{ background: 'white', padding: '0.75rem 1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Active Session</div>
          <div style={{ fontWeight: 800, color: '#1e293b' }}>{user.name} ({user.trigram})</div>
        </div>
      </div>

      {/* Visual Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', border: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <ClipboardList size={24} style={{ opacity: 0.8 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>TOTAL</span>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800 }}>{stats.total}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '0.25rem' }}>Claims in Registry</div>
        </div>

        <div className="card" style={{ padding: '1.5rem', border: 'none', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <AlertCircle size={24} color="#ef4444" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#fee2e2', color: '#b91c1c', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>UNASSIGNED</span>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>Requires Attention</div>
        </div>

        <div className="card" style={{ padding: '1.5rem', border: 'none', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Clock size={24} color="#f59e0b" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>IN ACTION</span>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b' }}>{stats.inProgress}</div>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>Work in Progress</div>
        </div>

        <div className="card" style={{ padding: '1.5rem', border: 'none', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <CheckCircle2 size={24} color="#10b981" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#d1fae5', color: '#065f46', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>RESOLVED</span>
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e293b' }}>{stats.completed}</div>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>Service Cycle Complete</div>
        </div>
      </div>

      {/* Analytics Sorting by State Bar (Top Visuals) */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', border: 'none' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} /> Regional Distribution
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {Object.entries(stats.stateWise).sort((a, b) => b[1] - a[1]).map(([st, count]) => (
            <div key={st}
              onClick={() => setFilterState(filterState === st ? '' : st)}
              style={{
                background: filterState === st ? '#2563eb' : '#f1f5f9',
                color: filterState === st ? 'white' : '#475569',
                padding: '0.5rem 1rem',
                borderRadius: 'full',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: '20px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
              <MapPin size={14} />
              {st} <span style={{ opacity: 0.7 }}>({count})</span>
            </div>
          ))}
          {Object.keys(stats.stateWise).length === 0 && <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No regional data available</p>}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('tickets')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'tickets' ? '#2563eb' : '#64748b',
            fontWeight: 700,
            borderBottom: activeTab === 'tickets' ? '2px solid #2563eb' : 'none',
            marginBottom: '-2px',
            cursor: 'pointer'
          }}>
          Claims Portfolio
        </button>
        <button
          onClick={() => setActiveTab('engineers')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            color: activeTab === 'engineers' ? '#2563eb' : '#64748b',
            fontWeight: 700,
            borderBottom: activeTab === 'engineers' ? '2px solid #2563eb' : 'none',
            marginBottom: '-2px',
            cursor: 'pointer'
          }}>
          Staff Management
        </button>
      </div>

      {activeTab === 'tickets' ? (
        <div className="card" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          {/* Controls Bar */}
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search by Ticket ID, Customer, Serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 1rem 0.625rem 2.75rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ minWidth: '180px', borderRadius: '10px', fontSize: '0.85rem' }}
              >
                <option value="">Filter by Status</option>
                <option value="0">0 - Pending/New</option>
                <option value="5">5 - Assigned</option>
                <option value="10">Active - Work In-Progress</option>
                <option value="50">50 - Completed/Closed</option>
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{val} - {label}</option>
                ))}
              </select>
              <select
                className="form-select"
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                style={{ minWidth: '160px', borderRadius: '10px', fontSize: '0.85rem' }}
              >
                <option value="">All Regions</option>
                {availableStates.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>SI</th>
                  <th onClick={() => handleSort('id')} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', cursor: 'pointer' }}>
                    Ticket ID {sortField === 'id' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Customer Details</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Product/Hardware</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Technical Issue</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Assignee</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Latest Activity</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket, index) => (
                  <tr key={ticket.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>{index + 1}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>#{ticket.id}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(ticket.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{ticket.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ticket.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>PIN: {ticket.pincode}, {ticket.state}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{ticket.brand} {ticket.family}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SN: {ticket.serialNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Model: {ticket.modelNumber}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ maxWidth: '200px', fontSize: '0.875rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ticket.issue}>
                        {ticket.issue}
                      </div>
                      {ticket.errorCode && <span style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '1px 4px', borderRadius: '4px', color: '#64748b' }}>Error: {ticket.errorCode}</span>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select
                        className="form-select"
                        style={{ fontSize: '0.8rem', width: '130px', height: '36px', padding: '0 2rem 0 0.5rem' }}
                        value={ticket.assignedTo || ''}
                        onChange={(e) => assignTicket(ticket.id, e.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {engineers.filter(e => e.role_id === 5 || e.role === 'engineer').map(eng => (
                          <option key={eng.id} value={eng.id}>{eng.name} ({eng.trigram})</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge badge-${ticket.status}`} style={{ fontSize: '0.65rem', padding: '0.25rem 0.625rem', whiteSpace: 'nowrap' }}>
                        {STATUS_LABELS[ticket.status] || `Stage ${ticket.status}`}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ maxWidth: '180px', fontSize: '0.8rem', color: '#64748b', fontStyle: ticket.remarks ? 'normal' : 'italic' }} title={ticket.remarks}>
                        {ticket.remarks || 'No remarks yet'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleViewDetails(ticket)}
                        style={{ background: 'transparent', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', color: '#64748b' }}
                      >
                        <History size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {/* Deployment Console */}
            <div className="card" style={{ padding: '2.5rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ background: '#3b82f6', padding: '1rem', borderRadius: '14px', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>
                  <UserPlus size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.01em' }}>Staff Onboarding</h3>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Register the next generation of resources</p>
                </div>
              </div>

              <form onSubmit={handleAddEngineer} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem' }}>Role Permission</label>
                  <select
                    value={newEngRole}
                    onChange={(e) => setNewEngRole(e.target.value)}
                    className="form-input"
                    style={{ background: '#334155', border: '1px solid #475569', color: 'white' }}
                  >
                    <option value="engineer">Technical Engineer (Role ID: 5)</option>
                    <option value="admin">System Administrator (Role ID: 10)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem' }}>Full Name</label>
                    <input
                      type="text"
                      value={newEngName}
                      onChange={(e) => setNewEngName(e.target.value)}
                      className="form-input"
                      placeholder="e.g. John Doe"
                      style={{ background: '#334155', border: '1px solid #475569', color: 'white' }}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem' }}>Trigram ID</label>
                    <input
                      type="text"
                      value={newEngTrigram}
                      onChange={(e) => setNewEngTrigram(e.target.value)}
                      className="form-input"
                      placeholder="JDO"
                      maxLength={10}
                      style={{ background: '#334155', border: '1px solid #475569', color: 'white', textTransform: 'uppercase' }}
                      required
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem' }}>Contact Email</label>
                  <input
                    type="email"
                    value={newEngEmail}
                    onChange={(e) => setNewEngEmail(e.target.value)}
                    className="form-input"
                    placeholder="staff@festasolar.com"
                    style={{ background: '#334155', border: '1px solid #475569', color: 'white' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem' }}>Initial Access Key</label>
                  <input
                    type="text"
                    value={newEngPass}
                    onChange={(e) => setNewEngPass(e.target.value)}
                    className="form-input"
                    style={{ background: '#334155', border: '1px solid #475569', color: 'white' }}
                    required
                  />
                </div>
                <button type="submit" disabled={isAdding} className="btn btn-primary" style={{ height: '56px', fontWeight: 800, marginTop: '1rem', fontSize: '1rem' }}>
                  {isAdding ? 'Processing...' : 'Authorize Staff Member'}
                </button>
              </form>
            </div>

            {/* Engineer List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Staff Directory</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#e2e8f0', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                  {engineers.length} Active Accounts
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {engineers.map(eng => (
                  <div key={eng.id} className="card" style={{ padding: '1rem 1.5rem', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        background: eng.role === 'admin' ? '#fee2e2' : '#dbeafe',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: eng.role === 'admin' ? '#ef4444' : '#2563eb'
                      }}>
                        {eng.role === 'admin' ? <ClipboardList size={20} /> : <UserIcon size={20} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem' }}>{eng.name}</div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, fontFamily: 'monospace' }}>{eng.trigram}</span>
                          <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#cbd5e1' }}></span>
                          <span style={{ fontSize: '0.7rem', color: eng.role === 'admin' ? '#ef4444' : '#2563eb', fontWeight: 800, textTransform: 'uppercase' }}>{eng.role}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge badge-${eng.status.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem' }}>{eng.status}</span>
                      <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.25rem' }}>Added {new Date(eng.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
                {engineers.length === 0 && (
                  <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                    No staff records found in the database.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History/Details Modal */}
      {showHistoryModal && selectedTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', border: 'none', padding: 0 }}>
            {/* Modal Header */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Ticket Registry: #{selectedTicket.id}</h2>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <span className={`badge badge-${selectedTicket.status}`} style={{ fontSize: '0.75rem' }}>Status: {selectedTicket.status}</span>
                  <span style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> Registered: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{ background: 'white', border: '1px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
                {/* Information Sections */}
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserIcon size={14} /> Client Identity</h4>
                  <div style={{ fontWeight: 800, fontSize: '1.125rem', color: '#1e293b' }}>{selectedTicket.customerName}</div>
                  <div style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.5rem' }}>{selectedTicket.email}</div>
                  <div style={{ color: '#475569', fontSize: '0.9rem' }}>{selectedTicket.phone}</div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                    <MapPin size={16} /> PIN: {selectedTicket.pincode}, {selectedTicket.state}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Wrench size={14} /> Asset Specifications</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>BRAND</div>
                      <div style={{ fontWeight: 700, color: '#334155' }}>{selectedTicket.brand || '---'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>PRODUCT FAMILY</div>
                      <div style={{ fontWeight: 700, color: '#334155' }}>{selectedTicket.family || '---'}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>SERIAL NUMBER</div>
                      <div style={{ fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>{selectedTicket.serialNumber}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>MODEL</div>
                      <div style={{ color: '#334155' }}>{selectedTicket.modelNumber || '---'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>PURCHASE DATE</div>
                      <div style={{ color: '#334155' }}>{selectedTicket.purchaseDate || '---'}</div>
                    </div>
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2', background: '#fff7ed', padding: '1.5rem', borderRadius: '16px', border: '1px solid #ffedd5' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Incident Diagnostics</h4>
                  <p style={{ color: '#7c2d12', fontWeight: 600, fontSize: '1rem', lineHeight: 1.6 }}>{selectedTicket.issue}</p>
                </div>
              </div>

              {/* Lifecycle Events */}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={20} color="#2563eb" /> Operational Timeline
              </h3>

              <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
                <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '0', width: '2px', background: '#e2e8f0' }}></div>

                {ticketHistory.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No audit trail entries found.</div>
                ) : (
                  ticketHistory.map((log) => (
                    <div key={log.id} style={{ marginBottom: '2.5rem', position: 'relative' }}>
                      <div style={{
                        position: 'absolute', left: '-2.5rem', top: '4px',
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: 'white', border: '2px solid #2563eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2
                      }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></div>
                      </div>

                      <div style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.875rem' }}>{log.updated_by}</span>
                            <span style={{ color: '#94a3b8' }}>•</span>
                            <span className={`badge badge-${log.new_status}`} style={{ fontSize: '0.65rem' }}>
                              {STATUS_LABELS[log.new_status] || log.new_status}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(log.updated_at).toLocaleString()}</span>
                        </div>
                        <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #e2e8f0' }}>
                          {log.remarks}
                        </p>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '0.5rem' }}>
                          <span>TRANSITION:</span>
                          <span style={{ fontWeight: 700 }}>{STATUS_LABELS[log.previous_status] || log.previous_status || 'Initial'}</span>
                          <span>→</span>
                          <span style={{ fontWeight: 700 }}>{STATUS_LABELS[log.new_status] || log.new_status}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

