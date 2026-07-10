import { useState } from 'react';
import analyticsService from '../services/analyticsService';
import { Helmet } from 'react-helmet-async';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const next = {};
    if (!formData.name.trim()) next.name = 'Name is required';
    if (!formData.email.trim()) {
      next.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      next.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) next.message = 'Tell me a bit about your project';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const encode = (data) =>
    Object.keys(data)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'contact', ...formData }),
      });

      if (!response.ok) throw new Error('Form submission failed');

      setSubmitStatus('success');
      analyticsService.trackContactFormSubmission('general', 'netlify');
      analyticsService.trackEvent('lead_generated', {
        project_type: 'general',
        submission_method: 'contact_form',
        lead_source: 'organic',
        timestamp: new Date().toISOString(),
      });
      setFormData({ name: '', email: '', phone: '', message: '' });
      setErrors({});
    } catch (err) {
      console.error('Form submission error:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fieldClass = (name) => `cq-field${errors[name] ? ' cq-field--error' : ''}`;

  return (
    <>
      <Helmet>
        <title>Get a Quote — Underdog Lazer</title>
        <meta
          name="description"
          content="Request a custom laser engraving quote. Share your idea and I'll get back to you fast. Based in Fox Valley, WI — ships anywhere in the US."
        />
        <meta property="og:title" content="Get a Quote — Underdog Lazer" />
        <meta
          property="og:description"
          content="Request a custom laser engraving quote. Share your idea and I'll get back to you fast."
        />
      </Helmet>

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
        <div className="cq-body cq-body--sheet">
          <div className="container">
            <div className="cq-sheet">
              <header className="cq-sheet__head">
                <h2 className="cq-sheet__title">Send your idea</h2>
                <p className="cq-sheet__lede">
                  No cart, no checkout. Just a quick note and I&apos;ll follow up with pricing.
                </p>
              </header>

              <form
                onSubmit={handleSubmit}
                name="contact"
                method="post"
                data-netlify="true"
                className="cq-form"
              >
                <input type="hidden" name="form-name" value="contact" />

                {submitStatus === 'success' && (
                  <div className="cq-alert cq-alert--success" role="status">
                    Got it — thanks! I&apos;ll get back to you soon.
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="cq-alert cq-alert--error" role="alert">
                    Something went wrong. Try again or email{' '}
                    <a href="mailto:info@underdoglazer.com">info@underdoglazer.com</a>.
                  </div>
                )}

                <div className="cq-form__row">
                  <div className={fieldClass('name')}>
                    <label htmlFor="name">Name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      placeholder="Your name"
                    />
                    {errors.name && <span className="cq-field__err">{errors.name}</span>}
                  </div>

                  <div className={fieldClass('email')}>
                    <label htmlFor="email">Email *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      placeholder="you@email.com"
                    />
                    {errors.email && <span className="cq-field__err">{errors.email}</span>}
                  </div>
                </div>

                <div className={fieldClass('phone')}>
                  <label htmlFor="phone">
                    Phone <span className="cq-optional">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    placeholder="(555) 000-0000"
                  />
                </div>

                <div className={fieldClass('message')}>
                  <label htmlFor="message">Project details *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="What do you want made? Materials, size, quantity, deadline — anything helps."
                  />
                  {errors.message && <span className="cq-field__err">{errors.message}</span>}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary cq-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending…' : 'Send message'}
                </button>
              </form>

              <footer className="cq-sheet__foot">
                <a href="mailto:info@underdoglazer.com" className="cq-mail">
                  info@underdoglazer.com
                </a>
                <span className="cq-meta">
                  Usually within 48 hours · Fox Valley, WI · Ships US-wide
                </span>
              </footer>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Contact;
