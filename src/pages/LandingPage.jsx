import React, { useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { CheckCircle, Package } from 'lucide-react';

const LandingPage = () => {
  const { addTicket } = useTickets();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    serialNumber: '',
    purchaseDate: '',
    issue: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addTicket(formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div className="card fade-in" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#d1fae5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <CheckCircle size={32} color="#065f46" />
          </div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1rem' }}>
            Claim Submitted Successfully
          </h2>
          <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
            Your warranty claim has been received. Our team will review it and get back to you soon.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ customerName: '', email: '', serialNumber: '', purchaseDate: '', issue: '' });
            }}
            className="btn btn-primary"
          >
            Submit Another Claim
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'var(--primary)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Package size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Submit Warranty Claim
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--gray-600)' }}>
            Fill out the form below to register your product warranty claim
          </p>
        </div>

        <div className="card fade-in">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="customerName"
                  className="form-input"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Serial Number</label>
                <input
                  type="text"
                  name="serialNumber"
                  className="form-input"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  placeholder="SN-123456"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  className="form-input"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Issue Description</label>
              <textarea
                name="issue"
                className="form-textarea"
                value={formData.issue}
                onChange={handleChange}
                placeholder="Please describe the issue you're experiencing..."
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Submit Claim
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
