import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReveal } from '../hooks/useReveal';
import Footer from '../components/Footer';

const FILTERS = ['All Sports', '🏀 Basketball', '⚽ Soccer', '🏈 Football', '⚾ Baseball', '🏒 Hockey', '🏐 Volleyball', '🥍 Lacrosse'];

const COACHES = [
  {
    initials: 'DT', av: 'av-a',
    name: 'Coach D. Thompson',
    title: 'HS Varsity · Defensive Specialist',
    specialty: 'Full-court press systems and zone schemes adaptable for high school basketball programs.',
    tags: [{ label: '🏀 Basketball', sport: true }, { label: 'Defense' }, { label: 'PDF' }],
  },
  {
    initials: 'LM', av: 'av-b',
    name: 'Coach L. Martinez',
    title: 'Club Soccer Director · Tactical Coach',
    specialty: 'Complete seasonal practice plans and tactical frameworks for youth and travel soccer coaches.',
    tags: [{ label: '⚽ Soccer', sport: true }, { label: 'Tactics' }, { label: 'Season Plans' }],
  },
  {
    initials: 'JP', av: 'av-c',
    name: 'Coach J. Patterson',
    title: 'Youth Development · S&C Specialist',
    specialty: '6-to-12 week multi-sport athlete development programs covering skill work and athleticism for youth athletes.',
    tags: [{ label: 'Multi-Sport', sport: true }, { label: 'S&C' }, { label: 'Programs' }],
  },
  {
    initials: 'RG', av: 'av-d',
    name: 'Coach R. Garcia',
    title: 'Pop Warner Football · Offensive Coordinator',
    specialty: 'Youth-friendly playbooks and offensive install guides designed for coaches working with young football players.',
    tags: [{ label: '🏈 Football', sport: true }, { label: 'Playbooks' }, { label: 'Youth' }],
  },
  {
    initials: 'SB', av: 'av-e',
    name: 'Coach S. Brown',
    title: 'PE Teacher · Multi-Sport Youth Coach',
    specialty: 'Beginner-friendly drill libraries and intro resources for PE educators and first-year coaches across multiple sports.',
    tags: [{ label: 'Multi-Sport', sport: true }, { label: 'Drills' }, { label: 'Beginner' }],
  },
  {
    initials: 'KN', av: 'av-f',
    name: 'Coach K. Nielsen',
    title: 'Youth Hockey · Skills Development',
    specialty: 'On-ice drill progressions and practice plans for Mites through Bantam with age-appropriate structure.',
    tags: [{ label: '🏒 Hockey', sport: true }, { label: 'Drills' }, { label: 'Practice Plans' }],
  },
  {
    initials: 'TC', av: 'av-g',
    name: 'Coach T. Chen',
    title: 'Travel Volleyball · Club Director',
    specialty: 'Serve, pass, attack progressions and tournament-ready practice formats for club and high school volleyball programs.',
    tags: [{ label: '🏐 Volleyball', sport: true }, { label: 'Club' }, { label: 'Systems' }],
  },
  {
    initials: 'RL', av: 'av-h',
    name: 'Coach R. Lewis',
    title: 'HS Baseball · Pitching Coach',
    specialty: 'Pitching mechanics breakdowns, bullpen practice plans, and in-season game planning guides for high school programs.',
    tags: [{ label: '⚾ Baseball', sport: true }, { label: 'Pitching' }, { label: 'HS' }],
  },
];

export default function Coaches() {
  useReveal();
  const [activeFilter, setActiveFilter] = useState('All Sports');
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ paddingTop: '66px' }}>

      {/* ── HERO ── */}
      <div className="coaches-hero">
        <div className="coaches-hero-bg" />
        <div className="section-label">Community</div>
        <h1>Meet the <em>Coaches</em></h1>
        <p>
          Real coaches. Real experience. Every sport. Browse profiles, explore their stores, and find resources that elevate your program — whether you're on the hardwood, the pitch, the field, or the ice.
        </p>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── FEATURED COACH ── */}
      <div className="featured-coach">
        <div className="section-label">Featured Seller</div>
        <div className="fc-inner">
          <div className="fc-avatar">MW</div>
          <div>
            <div className="fc-badge">⭐ Top Seller</div>
            <div className="fc-name">Coach Marcus Williams</div>
            <div className="fc-role">AAU Head Coach · Player Development Specialist</div>
            <p className="fc-bio">
              Veteran AAU basketball coach with over a decade of experience developing guards and wings at the youth and high school level. Known for detailed motion offense systems and defensive drill libraries that coaches at every level can implement immediately.
            </p>
            <div className="fc-tags">
              {['🏀 Basketball', 'Motion Offense', 'Guard Development', 'Practice Planning', 'AAU'].map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
            <div className="fc-stats">
              <div><div className="fcs-val">Playbooks</div><div className="fcs-lbl">Specialty</div></div>
              <div><div className="fcs-val">PDFs & Video</div><div className="fcs-lbl">Formats</div></div>
              <div><div className="fcs-val">Verified</div><div className="fcs-lbl">Coach Status</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── COACHES GRID ── */}
      <div className="coaches-section">
        <div className="section-label">All Coaches</div>
        <h2 className="section-title">Browse <em>Seller Profiles</em></h2>
        <p className="section-desc">Every coach is verified. Ratings and reviews come from real purchases across all sports and all levels.</p>
        <div className="coaches-grid reveal">
          {COACHES.map((c, i) => (
            <div key={i} className="coach-card">
              <div className="coach-card-top">
                <div className={`coach-av ${c.av}`}>{c.initials}</div>
                <div className="coach-info">
                  <div className="coach-name">{c.name}</div>
                  <div className="coach-title">{c.title}</div>
                  <div className="coach-specialty">{c.specialty}</div>
                </div>
              </div>
              <div className="coach-card-bottom">
                <div className="coach-tags-small">
                  {c.tags.map((t, j) => (
                    <span key={j} className={t.sport ? 'sport-tag-sm' : 'tag-sm'}>{t.label}</span>
                  ))}
                </div>
                <button className="view-btn">View Store</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BECOME CTA ── */}
      <div className="become-cta">
        <div className="cpc-mark">CPC</div>
        <h2>Share Your <em>Knowledge</em></h2>
        <p>Every coach — in every sport — has something valuable to offer. Create your profile, upload your resources, and join a community that's elevating youth sports together.</p>
        <button className="btn btn-green">Become a Seller →</button>
      </div>

      {/* ── FOOTER ── */}
      <div>
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
                <li><a onClick={goHome} style={{ cursor: 'pointer' }}>Back to Home</a></li>
                <li><a>Upload Guide</a></li>
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
            <div className="footer-copy">© 2025 <em>Coaches Pay Coaches</em>. Built for coaches, by coaches.</div>
            <div className="socials">
              <a className="soc">𝕏</a>
              <a className="soc">in</a>
              <a className="soc">▶</a>
              <a className="soc">📘</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
