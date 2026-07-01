import { useState, useEffect, useRef } from 'react';
import analyticsService from '../services/analyticsService';
import { Helmet } from 'react-helmet-async';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    paymentMethod: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [errors, setErrors] = useState({});
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const [isProjectTypeDropdownOpen, setIsProjectTypeDropdownOpen] = useState(false);

  const paymentDropdownRef = useRef(null);
  const projectTypeDropdownRef = useRef(null);

  const paymentMethods = [
    { value: 'paypal', label: 'PayPal', logo: '/img/payment-logos/paypal-logo.png' },
    { value: 'venmo', label: 'Venmo', logo: '/img/payment-logos/venmo-logo.png' },
    { value: 'cashapp', label: 'Cash App', logo: '/img/payment-logos/cashapp-logo.png' },
    { value: 'zelle', label: 'Zelle', logo: '/img/payment-logos/zelle-logo.png' }
  ];

  const projectTypes = [
    { value: 'awards-trophies', label: 'Corporate Awards & Trophies' },
    { value: 'personalized-gifts', label: 'Personalized Gifts & Keepsakes' },
    { value: 'business-signage', label: 'Business Signage & Branding' },
    { value: 'memorial-commemorative', label: 'Memorial & Commemorative Items' },
    { value: 'industrial-marking', label: 'Industrial Parts Marking' },
    { value: 'promotional-products', label: 'Promotional Products' },
    { value: 'custom-art', label: 'Custom Art & Design' },
    { value: 'other', label: 'Other' }
  ];

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(event.target)) {
        setIsPaymentDropdownOpen(false);
      }
      if (projectTypeDropdownRef.current && !projectTypeDropdownRef.current.contains(event.target)) {
        setIsProjectTypeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Form validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.projectType) newErrors.projectType = 'Project type is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Netlify form encoding function
  const encode = (data) => {
    return Object.keys(data)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Netlify Forms submission
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'contact', ...formData })
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        
        // Track successful form submission with enhanced lead scoring
        analyticsService.trackContactFormSubmission(formData.projectType, 'netlify');
        
        // Additional tracking with lead details for dashboard integration
        analyticsService.trackEvent('lead_generated', {
          project_type: formData.projectType,
          submission_method: 'contact_form',
          lead_source: 'organic',
          estimated_value: analyticsService.getProjectValue(formData.projectType),
          lead_score: analyticsService.calculateLeadScore(formData.projectType),
          timestamp: new Date().toISOString()
        });
        
        setFormData({ name: '', email: '', phone: '', projectType: '', paymentMethod: '', message: '' });
        setErrors({});
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodSelect = (value) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: value
    }));
    setIsPaymentDropdownOpen(false);
  };

  const handleProjectTypeSelect = (value) => {
    setFormData(prev => ({
      ...prev,
      projectType: value
    }));
    setIsProjectTypeDropdownOpen(false);
  };

  const getSelectedPaymentMethod = () => {
    return paymentMethods.find(method => method.value === formData.paymentMethod);
  };

  const getSelectedProjectType = () => {
    return projectTypes.find(type => type.value === formData.projectType);
  };

  return (
    <>
      <Helmet>
        <title>Get a Quote — Underdog Lazer</title>
        <meta name="description" content="Request a custom laser engraving quote. Share your idea and I'll get back to you fast. Based in Fox Valley, WI — ships anywhere in the US." />
        <meta property="og:title" content="Get a Quote — Underdog Lazer" />
        <meta property="og:description" content="Request a custom laser engraving quote. Share your idea and I'll get back to you fast." />
      </Helmet>
      {/* Contact Hero Section */}
      <section className="contact-hero" aria-labelledby="contact-hero-title">
        <div className="container">
          <div className="contact-hero__content">
            <h1 className="hero__title" id="contact-hero-title">
              Contact Us
            </h1>
            <p className="hero__subtitle">
              Ready to start your project? Get in touch with us today for a free quote.
            </p>
          </div>
        </div>
      </section>

      <main className="main">
        <div className="container">
      <section className="section">
        <div className="grid grid-2" style={{ gap: 'var(--space-xl)', alignItems: 'start' }}>
          <form onSubmit={handleSubmit} name="contact" method="post" data-netlify="true">
            {/* Hidden input for Netlify Forms */}
            <input type="hidden" name="form-name" value="contact" />
            
            {/* Success/Error Messages */}
            {submitStatus === 'success' && (
              <div style={{
                backgroundColor: 'var(--clr-accent)',
                color: 'white',
                padding: 'var(--space-md)',
                borderRadius: 'var(--border-radius)',
                marginBottom: 'var(--space-md)',
                textAlign: 'center'
              }}>
                ✅ Thank you! Your message has been sent successfully. We'll get back to you soon!
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div style={{
                backgroundColor: '#dc3545',
                color: 'white',
                padding: 'var(--space-md)',
                borderRadius: 'var(--border-radius)',
                marginBottom: 'var(--space-md)',
                textAlign: 'center'
              }}>
                ❌ Sorry, there was an error sending your message. Please try again or contact us directly.
              </div>
            )}
            
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--border-radius)',
                  border: errors.name ? '2px solid #dc3545' : '1px solid var(--clr-border)',
                  backgroundColor: 'var(--clr-bg)',
                  color: 'var(--clr-text)'
                }}
              />
              {errors.name && (
                <div style={{ color: '#dc3545', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-xs)' }}>
                  {errors.name}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--border-radius)',
                  border: errors.email ? '2px solid #dc3545' : '1px solid var(--clr-border)',
                  backgroundColor: 'var(--clr-bg)',
                  color: 'var(--clr-text)'
                }}
              />
              {errors.email && (
                <div style={{ color: '#dc3545', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-xs)' }}>
                  {errors.email}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label htmlFor="phone" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--clr-border)',
                  backgroundColor: 'var(--clr-bg)',
                  color: 'var(--clr-text)'
                }}
              />
            </div>

            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label htmlFor="projectType" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Project Type *
              </label>
              <div style={{ position: 'relative' }} ref={projectTypeDropdownRef}>
                {/* Hidden select element for accessibility - what the label points to */}
                <select
                  id="projectType"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  required
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    opacity: 0,
                    pointerEvents: 'none'
                  }}
                  aria-hidden="true"
                >
                  <option value="">Select a project type</option>
                  {projectTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                
                {/* Custom visual dropdown */}
                <div
                  role="button"
                  aria-expanded={isProjectTypeDropdownOpen}
                  aria-haspopup="listbox"
                  tabIndex={0}
                  onClick={() => setIsProjectTypeDropdownOpen(!isProjectTypeDropdownOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsProjectTypeDropdownOpen(!isProjectTypeDropdownOpen);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: 'var(--space-sm)',
                    borderRadius: 'var(--border-radius)',
                    border: errors.projectType ? '2px solid #dc3545' : '1px solid var(--clr-border)',
                    backgroundColor: 'var(--clr-bg)',
                    color: 'var(--clr-text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '40px'
                  }}
                >
                  <div>
                    {getSelectedProjectType() ? (
                      <span>{getSelectedProjectType().label}</span>
                    ) : (
                      <span style={{ color: 'var(--clr-text-muted)' }}>Select a project type</span>
                    )}
                  </div>
                  <span style={{ transform: isProjectTypeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    ▼
                  </span>
                </div>
                
                {isProjectTypeDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--clr-bg)',
                    border: '1px solid var(--clr-border)',
                    borderTop: 'none',
                    borderRadius: '0 0 var(--border-radius) var(--border-radius)',
                    zIndex: 1000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div 
                      onClick={() => handleProjectTypeSelect('')}
                      style={{
                        padding: 'var(--space-sm)',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--clr-border)',
                        color: 'var(--clr-text-muted)'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = 'var(--clr-bg-light)'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Select a project type
                    </div>
                    {projectTypes.map((type) => (
                      <div
                        key={type.value}
                        onClick={() => handleProjectTypeSelect(type.value)}
                        style={{
                          padding: 'var(--space-sm)',
                          cursor: 'pointer',
                          borderBottom: type.value !== 'other' ? '1px solid var(--clr-border)' : 'none'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = 'var(--clr-bg-light)'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <span>{type.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {errors.projectType && (
                <div style={{ color: '#dc3545', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-xs)' }}>
                  {errors.projectType}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label htmlFor="paymentMethod" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Preferred Payment Method
              </label>
              <div style={{ position: 'relative' }} ref={paymentDropdownRef}>
                {/* Hidden select element for accessibility - what the label points to */}
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    opacity: 0,
                    pointerEvents: 'none'
                  }}
                  aria-hidden="true"
                >
                  <option value="">Select preferred payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
                
                {/* Custom visual dropdown */}
                <div
                  role="button"
                  aria-expanded={isPaymentDropdownOpen}
                  aria-haspopup="listbox"
                  tabIndex={0}
                  onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsPaymentDropdownOpen(!isPaymentDropdownOpen);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: 'var(--space-sm)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--clr-border)',
                    backgroundColor: 'var(--clr-bg)',
                    color: 'var(--clr-text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '40px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {getSelectedPaymentMethod() ? (
                      <>
                        <img 
                          src={getSelectedPaymentMethod().logo}
                          alt={`${getSelectedPaymentMethod().label} logo`}
                          style={{ height: '20px', width: 'auto' }}
                        />
                        <span>{getSelectedPaymentMethod().label}</span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--clr-text-muted)' }}>Select preferred payment method</span>
                    )}
                  </div>
                  <span style={{ transform: isPaymentDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    ▼
                  </span>
                </div>
                
                {isPaymentDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--clr-bg)',
                    border: '1px solid var(--clr-border)',
                    borderTop: 'none',
                    borderRadius: '0 0 var(--border-radius) var(--border-radius)',
                    zIndex: 1000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div 
                      onClick={() => handlePaymentMethodSelect('')}
                      style={{
                        padding: 'var(--space-sm)',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--clr-border)',
                        color: 'var(--clr-text-muted)'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = 'var(--clr-bg-light)'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Select preferred payment method
                    </div>
                    {paymentMethods.map((method) => (
                      <div
                        key={method.value}
                        onClick={() => handlePaymentMethodSelect(method.value)}
                        style={{
                          padding: 'var(--space-sm)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          borderBottom: method.value !== 'zelle' ? '1px solid var(--clr-border)' : 'none'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = 'var(--clr-bg-light)'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <img 
                          src={method.logo}
                          alt={`${method.label} logo`}
                          style={{ height: '20px', width: 'auto' }}
                        />
                        <span>{method.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label htmlFor="message" style={{ display: 'block', marginBottom: 'var(--space-xs)' }}>
                Project Details *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--border-radius)',
                  border: errors.message ? '2px solid #dc3545' : '1px solid var(--clr-border)',
                  backgroundColor: 'var(--clr-bg)',
                  color: 'var(--clr-text)',
                  resize: 'vertical'
                }}
              />
              {errors.message && (
                <div style={{ color: '#dc3545', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-xs)' }}>
                  {errors.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ 
                width: '100%',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-xs)' }}>
                  <span style={{ 
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  Sending...
                </span>
              ) : (
                'Send Message'
              )}
            </button>
          </form>

          <div>
            <div className="card">
              <h2>Contact Information</h2>
              <div style={{ marginTop: 'var(--space-md)' }}>
                <h3>Email</h3>
                <p>
                  <a 
                    href="mailto:info@underdoglazer.com" 
                    style={{ 
                      color: 'var(--clr-accent)',
                      textDecoration: 'none',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: '500',
                      transition: 'var(--transition)'
                    }}
                    onMouseOver={(e) => e.target.style.color = 'var(--clr-accent-hover)'}
                    onMouseOut={(e) => e.target.style.color = 'var(--clr-accent)'}
                  >
                    info@underdoglazer.com
                  </a>
                </p>
                
                <p style={{ 
                  marginTop: 'var(--space-md)',
                  color: 'var(--clr-text-muted)',
                  fontSize: 'var(--font-size-sm)',
                  fontStyle: 'italic'
                }}>
                  Please allow up to 48 hours for a response
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
        </div>
      </main>
    </>    
  );
}

export default Contact; 