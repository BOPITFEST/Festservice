import React, { createContext, useContext, useState, useEffect } from 'react';

const TicketContext = createContext();

const API_BASE_URL = 'http://localhost:3001/api';

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wp_user');
    return saved ? JSON.parse(saved) : null;
  });

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`);
      const data = await response.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    }
  };

  const fetchEngineers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/engineers`);
      const data = await response.json();
      setEngineers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch engineers:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
       await Promise.all([fetchTickets(), fetchEngineers()]);
       setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('wp_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('wp_user');
    }
  }, [user]);

  const login = async (trigram, password, role) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/${role}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigram, password }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server connection failed' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const addTicket = async (ticketData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });
      await fetchTickets();
    } catch (err) {
      console.error('Failed to add ticket:', err);
    }
  };

  const assignTicket = async (ticketId, engineerId) => {
    try {
      await fetch(`${API_BASE_URL}/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: engineerId }),
      });
      await fetchTickets();
    } catch (err) {
      console.error('Failed to assign ticket:', err);
    }
  };

  const completeTicket = async (ticketId) => {
    try {
      await fetch(`${API_BASE_URL}/tickets/${ticketId}/complete`, {
        method: 'PUT',
      });
      await fetchTickets();
    } catch (err) {
      console.error('Failed to complete ticket:', err);
    }
  };

  const addEngineer = async (engineerData) => {
    try {
      await fetch(`${API_BASE_URL}/engineers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(engineerData),
      });
      await fetchEngineers();
    } catch (err) {
      console.error('Failed to add engineer:', err);
    }
  };

  const acceptInvitation = async (trigram) => {
      try {
          await fetch(`${API_BASE_URL}/engineers/accept`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ trigram })
          });
      await fetchEngineers();
      await fetchTickets();
      } catch (err) {
          console.error('Failed to accept invitation:', err);
      }
  }

  const updatePassword = async (trigram, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/engineer/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigram, newPassword }),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Failed to update password:', err);
      return { success: false, message: 'Server connection failed' };
    }
  };

  const value = {
    tickets,
    engineers,
    loading,
    user,
    login,
    logout,
    addTicket,
    assignTicket,
    completeTicket,
    addEngineer,
    acceptInvitation,
    updatePassword, // Added
    fetchTickets,
    fetchEngineers
  };

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
};
