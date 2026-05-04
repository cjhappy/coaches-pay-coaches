import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    // Navigate home first, then scroll
    navigate('/');
    setTimeout(() => {
      const el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  };

  return (
    <nav
      id="main-nav"
      style={{
        background: scrolled ? 'rgba(7,16,26,0.98)' : 'rgba(11,22,34,0.94)',
      }}
    >
      <Link to="/" className="logo">
        <div className="logo-badge">CPC</div>
        <div className="logo-text">
          COACHES <em>PAY</em> COACHES
        </div>
      </Link>

      <ul className="nav-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            Home
          </NavLink>
        </li>
        <li>
          <a onClick={() => scrollToSection('#sports')}>Sports</a>
        </li>
        <li>
          <NavLink to="/coaches" className={({ isActive }) => isActive ? 'active' : ''}>
            Coaches
          </NavLink>
        </li>
        <li>
          <a onClick={() => scrollToSection('#sell')}>Sell</a>
        </li>
        <li>
          <a className="nav-cta">Get Started →</a>
        </li>
      </ul>
    </nav>
  );
}
