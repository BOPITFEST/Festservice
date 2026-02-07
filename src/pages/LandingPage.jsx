import React, { useState, useEffect } from 'react';
import { useTickets } from '../context/TicketContext';
import { CheckCircle, Package, Layers, AlertCircle } from 'lucide-react';

const LandingPage = () => {
  const { addTicket } = useTickets();

  const [submitted, setSubmitted] = useState(false);
  const [brands, setBrands] = useState([]);
  const [families, setFamilies] = useState([]);
  const [models, setModels] = useState([]);
  const [errorCodes, setErrorCodes] = useState([]);

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '', // Added
    state: '', // Added
    pincode: '', // Added
    brand: '',
    family: '',
    modelNumber: '',
    serialNumber: '',
    purchaseDate: '',
    errorCode: '',
    issue: ''
  });

  const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
  ];

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
      setFamilies([]);
      setModels([]);
      setFormData({ ...formData, brand: value, family: '', modelNumber: '' });
      if (value) {
        fetch(`http://localhost:3001/api/products/families/${value}`)
          .then(res => res.json())
          .then(data => setFamilies(data));
      }
      return;
    }

    if (name === 'family') {
      setModels([]);
      setFormData({ ...formData, family: value, modelNumber: '' });
      if (value) {
        fetch(`http://localhost:3001/api/products/models/${formData.brand}/${value}`)
          .then(res => res.json())
          .then(data => setModels(data));
      }
      return;
    }

    if (name === 'serialNumber') {
      if (!/^\d{0,10}$/.test(value)) return;
    }

    if (name === 'pincode') {
      if (!/^\d{0,6}$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addTicket(formData);
    setSubmitted(true);
  };

  /* SUCCESS SCREEN  */

  // Handle auto-close/redirect after submission
  useEffect(() => {
    let timer;
    if (submitted) {
      timer = setTimeout(() => {
        handleResetForm();
      }, 10000); // Redirect after 10 seconds
    }
    return () => clearTimeout(timer);
  }, [submitted]);

  const handleResetForm = () => {
    setSubmitted(false);
    setFormData({
      customerName: '',
      email: '',
      phone: '',
      state: '',
      city: '',
      brand: '',
      family: '',
      modelNumber: '',
      serialNumber: '',
      purchaseDate: '',
      errorCode: '',
      issue: ''
    });
  };

  /* SUCCESS SCREEN  */

  if (submitted) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="card fade-in" style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center', padding: '3.5rem 2.5rem', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: '#d1fae5',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            transform: 'rotate(-10deg)'
          }}>
            <CheckCircle size={40} color="#059669" />
          </div>

          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111827', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Mission Accomplished!
          </h2>

          <p style={{ color: 'var(--gray-500)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
            Your complaint has been synchronized with our database. A technical task has been generated for our engineering fleet.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={handleResetForm}
              className="btn btn-primary"
              style={{ height: '56px', fontSize: '1.1rem', width: '100%', borderRadius: '14px' }}
            >
              Return to Flight Deck
            </button>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>
              Auto-returning in 10 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*  MAIN FORM */

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.25rem', letterSpacing: '-2px' }}>
            <span style={{ color: '#0f172a' }}>Fest</span>
            <span style={{ color: '#2563eb' }}>Service</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 600 }}>
            Customer Complaint Portal
          </p>
        </div>

        <div className="card fade-in" style={{ padding: '1.5rem 2rem' }}>
          <form onSubmit={handleSubmit}>

            {/* CUSTOMER DETAILS */}
            <h3 className="section-title">
              Customer Information
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

            <div className="grid grid-cols-3">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <select
                  name="state"
                  className="form-select"
                  value={formData.state}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pincode (6-digit)</label>
                <input
                  type="text"
                  name="pincode"
                  className="form-input"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  placeholder="682001"
                />
              </div>
            </div>

            {/* PRODUCT SECTION */}
            <h3 className="section-title">
              Product Details
            </h3>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Brand</label>
                <select name="brand" className="form-select" value={formData.brand} onChange={handleChange} required>
                  <option value="">Select Brand</option>
                  {brands.map((b, i) => (
                    <option key={i} value={b.brand}>{b.brand}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Product Family</label>
                <select name="family" className="form-select" value={formData.family} onChange={handleChange} required disabled={!formData.brand}>
                  <option value="">Select Family</option>
                  {families.map((f, i) => (
                    <option key={i} value={f.family}>{f.family}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Model Number (MN)</label>
                <select name="modelNumber" className="form-select" value={formData.modelNumber} onChange={handleChange} required disabled={!formData.family}>
                  <option value="">Select Model Number</option>
                  {models.map((m, i) => (
                    <option key={i} value={m.mn}>{m.mn}</option>
                  ))}
                </select>
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
                <select name="errorCode" className="form-select" value={formData.errorCode} onChange={handleChange}>
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '56px', fontSize: '1.1rem', marginTop: '1rem' }}>
              Register Complaint
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
