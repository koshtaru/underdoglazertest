import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Only true on tablet/desktop widths. Used to avoid loading the hero background
// video on phones (it's a large file and mobile autoplay is unreliable) — a
// static background image is shown there instead.
function useIsDesktop() {
  // Require a tall-enough viewport too, so landscape phones (wide but short)
  // get the static background instead of downloading the large video.
  const query = '(min-width: 768px) and (min-height: 500px)';
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setIsDesktop(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}

function Home() {
  const isDesktop = useIsDesktop();
  const [selectedImage, setSelectedImage] = useState(null);
  const [displayedSamples, setDisplayedSamples] = useState(null);
  const [samplesLoading, setSamplesLoading] = useState(true);

  const serviceList = [
    { title: 'Custom gifts & personal pieces', desc: 'Wedding gifts, memorials, anniversary items — made for one person, not a shelf.' },
    { title: 'Business branding', desc: 'Cards, patches, signage, and swag that actually looks like your brand.' },
    { title: 'Laser cutting', desc: 'Clean cuts, custom shapes, stencils, and patches cut to your exact specs.' },
    { title: 'Industrial & trade marking', desc: 'Asset tags, serial numbers, part IDs — permanent and precise.' },
    { title: 'Apparel & hat patches', desc: 'Leather patches and custom hat branding done right.' },
  ];

  const workSamples = [
    {
      src: '/img/gallery/apparel-degrave-electric-hat.jpg',
      title: 'Degrave Electric Branded Hat',
      detail: 'Leather Patch · Laser Cut & Engraved',
    },
    {
      src: '/img/gallery/corporate-underdog-business-card.jpg',
      title: 'Underdog Lazer Business Card',
      detail: 'Black Anodized Metal · Precision Engraving',
    },
    {
      src: '/img/gallery/promotional-drinkware-01.jpg',
      title: 'Custom Drinkware Collection',
      detail: 'Multi-Surface Engraving',
    },
    {
      src: '/img/gallery/gifts-happier-with-you-koozie.jpg',
      title: 'Personal Photo Koozie',
      detail: 'Photo Engraving · Custom Keepsake',
    },
  ];

  // Fetch featured images from Firestore to populate the showcase grid.
  // Falls back to the hardcoded workSamples if the API fails or returns nothing.
  useEffect(() => {
    const endpoint = import.meta.env.DEV
      ? '/api/gallery-get?featured=true'
      : '/.netlify/functions/gallery-get?featured=true';

    fetch(endpoint)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.success && Array.isArray(data.images) && data.images.length > 0) {
          setDisplayedSamples(data.images.map(img => ({
            src: img.src,
            title: img.title,
            detail: [img.materials, img.technique].filter(Boolean).join(' · '),
          })));
        }
      })
      .catch(() => { /* keep fallback */ })
      .finally(() => setSamplesLoading(false));
  }, []);

  const handleHowItWorksClick = (e) => {
    e.preventDefault();
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Close the lightbox on Escape and lock background scroll while open.
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    if (selectedImage) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  return (
    <>
      <Helmet>
        <title>Underdog Lazer — Custom Laser Engraving · Fox Valley, WI</title>
        <meta name="description" content="Custom laser engraving for gifts, business branding, hat patches, and more. Based in Fox Valley, WI. Ships anywhere in the US." />
        <meta property="og:title" content="Underdog Lazer — Custom Laser Engraving · Fox Valley, WI" />
        <meta property="og:description" content="Custom laser engraving for gifts, business branding, hat patches, and more. Ships anywhere in the US." />
      </Helmet>
      {/* Hero Section — Logo First */}
      <section className="hero" aria-labelledby="hero-title">
        {/* Desktop only: phones fall back to the .hero CSS background image
            (set in global.css) instead of downloading the large video. */}
        {isDesktop && (
          <video
            className="hero__video"
            autoPlay
            muted
            loop
            playsInline
            poster="/img/hero-background.jpg"
          >
            <source src="/img/hero-background.mp4" type="video/mp4" />
          </video>
        )}

        <div className="hero__video-overlay"></div>

        <div className="container">
          <div className="hero__split">
            <div className="hero__logo-wrap">
              <img
                src="/img/logo-transparent.png"
                alt="Underdog Lazer"
                className="hero__logo"
                id="hero-title"
              />
            </div>
            <div className="hero__copy">
              <p className="hero__tagline">
                Custom laser engraving for people who care about the details.
              </p>
              <div className="hero__cta">
                <a href="#how-it-works" className="btn btn-secondary" onClick={handleHowItWorksClick}>
                  How It Works
                </a>
                <Link to="/contact" className="btn btn-primary">
                  Get a Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Samples Grid */}
      <section className="section" id="our-work" aria-labelledby="work-title">
        <div className="container">
          <h2 className="section-title" id="work-title">Our Work</h2>
          <p className="section-subtitle">Real projects. Real people.</p>

          <div className="work-grid">
            {(samplesLoading ? [] : (displayedSamples ?? workSamples)).map((item, i) => (
              <div
                key={i}
                className="work-grid__item"
                onClick={() => setSelectedImage(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedImage(item);
                  }
                }}
                aria-label={`View ${item.title}`}
              >
                <img src={item.src} alt={item.title} loading="lazy" />
                <div className="work-grid__overlay">
                  <p className="work-grid__overlay-title">{item.title}</p>
                  <p className="work-grid__overlay-detail">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'right', marginTop: 'var(--space-md)' }}>
            <Link to="/products" className="text-accent" style={{ fontWeight: 500, textDecoration: 'none' }}>
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-it-works" id="how-it-works" style={{ backgroundColor: 'var(--clr-bg-light)', scrollMarginTop: 'var(--header-height)' }} aria-labelledby="how-title">
        <div className="container">
          <h2 className="section-title" id="how-title">How it works</h2>
          <p className="section-subtitle">Three steps. No guesswork.</p>

          <div className="how-steps">
            <div className="how-step">
              <div className="how-step__circle">1</div>
              <h3 className="how-step__title">Send your idea</h3>
              <p className="how-step__body">
                Photo, sketch, logo file, or just describe it. No file? No problem — I'll work with what you've got.
              </p>
            </div>

            <div className="how-step">
              <div className="how-step__circle">2</div>
              <h3 className="how-step__title">See it before I burn it</h3>
              <p className="how-step__body">
                You get a digital proof before anything is engraved. Approve it, request changes, or kill it — your call.
              </p>
            </div>

            <div className="how-step">
              <div className="how-step__circle">3</div>
              <h3 className="how-step__title">Pick up or ship</h3>
              <p className="how-step__body">
                Local pickup in Fox Valley, or shipped anywhere in the US. Most orders out within a week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section" aria-labelledby="services-title">
        <div className="container">
          <div className="services-editorial">
            <div className="services-editorial__left">
              <p className="services-editorial__eyebrow">Underdog Lazer</p>
              <h2 className="services-editorial__headline" id="services-title">
                Made for people who care about the details
              </h2>
              <p className="services-editorial__body">
                Whether it's a logo on a leather patch or a memorial piece for someone you love — every job gets the same attention. No minimums. No runaround. Just send me what you've got.
              </p>
            </div>

            <ul className="services-editorial__list">
              {serviceList.map((item, i) => (
                <li key={i} className="services-editorial__item">
                  <span className="services-editorial__dot" aria-hidden="true"></span>
                  <div>
                    <strong className="services-editorial__item-title">{item.title}</strong>
                    <span className="services-editorial__item-desc"> — {item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Lightbox for Our Work images */}
      {selectedImage && (
        <div
          className="modal"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="work-modal-title"
        >
          <figure className="work-lightbox" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal__close"
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
            >
              ×
            </button>
            <img className="work-lightbox__img" src={selectedImage.src} alt={selectedImage.title} />
            <figcaption className="work-lightbox__caption">
              <span className="work-lightbox__title" id="work-modal-title">{selectedImage.title}</span>
              <span className="work-lightbox__detail">{selectedImage.detail}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

export default Home;
