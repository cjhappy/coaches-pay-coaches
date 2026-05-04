import { Link, useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goCoaches = () => {
    navigate('/coaches');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer>
      <div className="footer-inner">
        <div>
          <a className="footer-brand-logo" onClick={goHome} style={{ cursor: 'pointer' }}>
            <div className="fbadge">CPC</div>
            <div className="ftext">COACHES <em>PAY</em> COACHES</div>
          </a>
          <p className="footer-tagline">
            The go-to resource hub for youth sports coaches around the world. Share knowledge, earn income, improve the game — one download at a time.
          </p>
        </div>

        <div className="footer-col">
          <h4>Browse</h4>
          <ul>
            <li><a>All Sports</a></li>
            <li><a>Basketball</a></li>
            <li><a>Soccer</a></li>
            <li><a>Football</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Sellers</h4>
          <ul>
            <li><a>Start Selling</a></li>
            <li><a onClick={goCoaches} style={{ cursor: 'pointer' }}>Meet Coaches</a></li>
            <li><a>Upload Guide</a></li>
            <li><a>Pricing &amp; Fees</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a>About Us</a></li>
            <li><a>Contact</a></li>
            <li><a>Terms of Service</a></li>
            <li><a>Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copy">
          © 2025 <em>Coaches Pay Coaches</em>. Built for coaches, by coaches.
        </div>
        <div className="socials">
          <a className="soc">𝕏</a>
          <a className="soc">in</a>
          <a className="soc">▶</a>
          <a className="soc">📘</a>
        </div>
      </div>
    </footer>
  );
}
