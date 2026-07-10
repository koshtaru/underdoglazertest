import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header" id="header">
      <div className="container header__container">
        <Link to="/" className="logo" aria-label="Underdog Lazer Home">
          <img src="/img/logo.png" alt="Underdog Lazer" className="logo__image" />
          <span className="logo__text">Underdog Lazer</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="nav" role="navigation" aria-label="Main navigation">
          <ul className="nav__list">
            <li><Link to="/" className={`nav__link ${isActive('/')}`}>Home</Link></li>
            <li><Link to="/about" className={`nav__link ${isActive('/about')}`}>About</Link></li>
            <li><Link to="/products" className={`nav__link ${isActive('/products')}`}>Products</Link></li>
            <li><Link to="/contact" className={`nav__link ${isActive('/contact')}`}>Contact</Link></li>
          </ul>
        </nav>
        
        {/* Mobile Menu Toggle */}
        <button 
          className={`menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      {/* Mobile Navigation */}
      <nav 
        className={`nav-mobile ${isMobileMenuOpen ? 'open' : ''}`} 
        role="navigation" 
        aria-label="Mobile navigation"
      >
        <ul className="nav-mobile__list">
          <li className="nav-mobile__item">
            <Link 
              to="/" 
              className={`nav-mobile__link ${isActive('/')}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li className="nav-mobile__item">
            <Link 
              to="/about" 
              className={`nav-mobile__link ${isActive('/about')}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
          </li>
          <li className="nav-mobile__item">
            <Link 
              to="/products" 
              className={`nav-mobile__link ${isActive('/products')}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
          </li>
          <li className="nav-mobile__item">
            <Link 
              to="/contact" 
              className={`nav-mobile__link ${isActive('/contact')}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header; 