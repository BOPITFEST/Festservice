import React, { useState, useEffect } from 'react';
import { useTickets } from '../context/TicketContext';
import { CheckCircle, Package, Layers, AlertCircle } from 'lucide-react';

const LandingPage = () => {
  const { addTicket } = useTickets();

  const [submitted, setSubmitted] = useState(false);
  const [brands, setBrands] = useState([]);
  const [families, setFamilies] = useState([]);
  const [errorCodes, setErrorCodes] = useState([]);
  
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    brand: '',
    family: '',
    modelNumber: '',
    serialNumber: '',
    purchaseDate: '',
    errorCode: '',
    issue: ''
  });

  useEffect(() => {
  fetch('http://localhost:3001/api/products/brands')
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setBrands(data);
      else setBrands([]);
    })
    .catch(err => console.error(err));
}, []);

  const fetchErrorCodes = async () => {
    try {
      const res = await fetch('/api/error-codes');
      const data = await res.json();
      setErrorCodes(data);
    } catch (err) {
      console.error(err);
    }
  };

  /*HANDLErs */
  //   const { name, value } = e.target;

  //   if (name === 'brand') {
  //     fetchFamilies(value);
  //     setFormData({ ...formData, brand: value, family: '' });
  //     return;
  //   }

  //   if (name === 'serialNumber') {
  //     // allow only numbers and max 10 digits
  //     if (!/^\d{0,10}$/.test(value)) return;
  //   }

  //   setFormData({ ...formData, [name]: value });
  // };

    const handleChange = (e) => {
      const { name, value } = e.target;

      if (name === 'brand') {
        setFormData({ ...formData, brand: value, family: '' });

        fetch(`http://localhost:3001/api/products/families/${value}`)
          .then(res => res.json())
          .then(data => setFamilies(data));

        return;
      }

      if (name === 'serialNumber') {
        if (!/^\d{0,10}$/.test(value)) return;
      }

      setFormData({ ...formData, [name]: value });
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addTicket(formData);
    setSubmitted(true);
  };

  /* SUCCESS SCREEN  */

  if (submitted) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div className="card fade-in" style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
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

          <h2 style={{ fontSize: '1.9rem', fontWeight: 700 }}>
            Complaint Registered Successfully
          </h2>

          <p style={{ color: 'var(--gray-600)', marginTop: '1rem' }}>
            Your request has been logged. Our service team will review and assign an engineer shortly.
          </p>

          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                customerName: '',
                email: '',
                brand: '',
                family: '',
                modelNumber: '',
                serialNumber: '',
                purchaseDate: '',
                errorCode: '',
                issue: ''
              });
            }}
            className="btn btn-primary"
            style={{ marginTop: '2rem' }}
          >
            Submit Another Complaint
          </button>
        </div>
      </div>
    );
  }

  /*  MAIN FORM */

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '58px',
            height: '58px',
            background: 'var(--primary)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Package size={28} color="white" />
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>
            Product Complaint Registration
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--gray-600)' }}>
            Please provide the required details to help us resolve your issue quickly and efficiently.
          </p>
        </div>

        <div className="card fade-in">
          <form onSubmit={handleSubmit}>

            {/* CUSTOMER DETAILS */}
            <h3 className="section-title">
              <Layers size={18} /> Customer Information
            </h3>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="customerName"
                  className="form-input"
                  value={formData.customerName}
                  onChange={handleChange}
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
                  required
                />
              </div>
            </div>

            {/* PRODUCT SECTION */}
            <h3 className="section-title">
              <Package size={18} /> Product Details
            </h3>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Brand</label>
                <select name="brand" className="form-input" value={formData.brand} onChange={handleChange} required>
                  <option value="">Select Brand</option>
                  {brands.map((b, i) => (
                    <option key={i} value={b.brand}>{b.brand}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Product Family</label>
                <select name="family" className="form-input" value={formData.family} onChange={handleChange} required>
                  <option value="">Select Family</option>
                  {families.map((f, i) => (
                    <option key={i} value={f.family}>{f.family}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Model Number</label>
                <input
                  type="text"
                  name="modelNumber"
                  className="form-input"
                  value={formData.modelNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Serial Number (10 digits)</label>
                <input
                  type="text"
                  name="serialNumber"
                  className="form-input"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Installation / Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  className="form-input"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Error Code</label>
                <select name="errorCode" className="form-input" value={formData.errorCode} onChange={handleChange}>
                  <option value="">Select Error</option>
                  {errorCodes.map(err => (
                    <option key={err.code} value={err.code}>{err.code}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ISSUE */}
            <div className="form-group">
              <label className="form-label">
                <AlertCircle size={16} /> Issue Description
              </label>
              <textarea
                name="issue"
                className="form-textarea"
                value={formData.issue}
                onChange={handleChange}
                placeholder="Provide detailed description of the problem faced..."
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Register Complaint
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
