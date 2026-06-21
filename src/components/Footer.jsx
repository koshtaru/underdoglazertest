import { Link, useLocation } from 'react-router-dom';

function Footer() {
  const { pathname } = useLocation();
  const showBand = ['/', '/gallery', '/about', '/contact'].includes(pathname);

  return (
    <footer className="site-footer">
      {showBand && (
        <div className="site-footer__band">
          <div className="container">
            <div className="site-footer__band-inner">
              <div>
                <p className="site-footer__band-eyebrow">Ready to start?</p>
                <p className="site-footer__band-headline">Send me your idea — I'll make it real.</p>
              </div>
              <Link to="/contact" className="btn btn-primary site-footer__band-btn">
                Get a quote
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="site-footer__body">
        <div className="container">
          <div className="site-footer__cols">
            <div className="site-footer__col-brand">
              <p className="site-footer__brand-name">Underdog Lazer</p>
              <p className="site-footer__brand-loc">Woodville, TX · Ships anywhere in the US</p>
              <a href="mailto:info@underdoglazer.com" className="site-footer__brand-email">
                info@underdoglazer.com
              </a>
            </div>
            <div className="site-footer__col-nav">
              <p className="site-footer__col-head">Navigation</p>
              <nav aria-label="Footer navigation">
                <Link to="/" className="site-footer__nav-link">Home</Link>
                <Link to="/gallery" className="site-footer__nav-link">Gallery</Link>
                <Link to="/about" className="site-footer__nav-link">About</Link>
                <Link to="/contact" className="site-footer__nav-link">Contact</Link>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="site-footer__bar">
        <div className="container">
          <div className="site-footer__bar-inner">
            <span className="site-footer__copy">© {new Date().getFullYear()} Underdog Lazer. All rights reserved.</span>
            <div className="site-footer__legal">
              <Link to="/privacy" className="site-footer__legal-link">Privacy Policy</Link>
              <Link to="/terms" className="site-footer__legal-link">Terms of Use</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
