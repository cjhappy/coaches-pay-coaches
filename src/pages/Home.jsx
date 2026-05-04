import { useNavigate } from 'react-router-dom';
import { useReveal } from '../hooks/useReveal';
import Footer from '../components/Footer';

const MARQUEE_ITEMS = [
  'Playbooks', 'Practice Plans', 'Scouting Reports', 'Film Breakdowns',
  'Skill Workouts', 'Defensive Schemes', 'Strength & Conditioning',
  'Video Clinics', 'All Sports', 'All Levels',
];

const SPORTS = [
  { emoji: '🏀', name: 'Basketball', sub: 'Youth · AAU · HS · College' },
  { emoji: '⚽', name: 'Soccer', sub: 'Club · Rec · Travel' },
  { emoji: '🏈', name: 'Football', sub: 'Pop Warner · HS · Flag' },
  { emoji: '⚾', name: 'Baseball', sub: 'Little League · Travel Ball' },
  { emoji: '🥎', name: 'Softball', sub: 'Rec · Travel · HS' },
  { emoji: '🏒', name: 'Hockey', sub: 'Mites · Squirts · Bantam' },
  { emoji: '🏐', name: 'Volleyball', sub: 'Club · Rec · HS' },
  { emoji: '🥍', name: 'Lacrosse', sub: 'Youth · HS · Club' },
];

const CATEGORIES = [
  { icon: '📒', name: 'Playbooks', sub: 'Offensive & Defensive Sets' },
  { icon: '📅', name: 'Practice Plans', sub: 'Full Season Blueprints' },
  { icon: '🏋️', name: 'Skill Workouts', sub: 'Player Development' },
  { icon: '🛡️', name: 'Defensive Schemes', sub: 'System-Level Defense' },
  { icon: '🎬', name: 'Film Breakdowns', sub: 'Opponent Scouting' },
  { icon: '💪', name: 'Strength & Conditioning', sub: 'Athlete Performance' },
];

const PRODUCTS = [
  { thumb: 'pt1', badge: 'Playbook', sport: '🏀 Basketball', emoji: '📒', seller: 'Youth · AAU · High School', name: 'Motion Offense Complete System', type: 'PDF · Digital Download' },
  { thumb: 'pt2', badge: 'Practice Plan', sport: '⚽ Soccer', emoji: '📅', seller: 'Club · Recreational', name: 'Youth Soccer Season Practice Bundle', type: 'PDF · Template Pack' },
  { thumb: 'pt3', badge: 'Playbook', sport: '🏈 Football', emoji: '🏈', seller: 'Youth · Pop Warner', name: 'Youth Spread Offense Playbook', type: 'PDF · Diagrams' },
  { thumb: 'pt4', badge: 'Workout', sport: 'Multi-Sport', emoji: '🏋️', seller: 'Youth · Development', name: 'Athlete Skill Development 8-Week Program', type: 'PDF · Video Drills' },
  { thumb: 'pt5', badge: 'Defense', sport: '⚽ Soccer', emoji: '🛡️', seller: 'Travel · HS', name: 'Defensive Shape & Pressing System', type: 'PDF · Video' },
  { thumb: 'pt6', badge: 'Film', sport: '🏈 Football', emoji: '🎬', seller: 'Youth · HS', name: 'Reading Defenses: Youth QB Guide', type: 'Video Breakdown · PDF' },
];

const WHO = [
  { emoji: '👨‍👧', title: 'Parent Coaches', desc: 'You volunteered, now you need a plan. Find ready-to-run practice plans, drills, and seasonal guides built by coaches who\'ve been there.' },
  { emoji: '🏆', title: 'AAU & Club Coaches', desc: 'High-level content for high-level programs. Playbooks, scouting reports, and film breakdowns built for competitive play.' },
  { emoji: '🎓', title: 'High School Coaches', desc: 'Full-season systems, defensive schemes, and strength programs designed for the varsity level and up — across all sports.' },
  { emoji: '📐', title: 'Skills & Trainers', desc: 'Sell your training programs, workout plans, and player development systems to coaches and parents nationwide.' },
  { emoji: '🌍', title: 'International Coaches', desc: 'U.S. coaching resources are in demand worldwide. Access or sell proven content across borders, across sports.' },
  { emoji: '🏫', title: 'PE Teachers', desc: 'Find beginner-friendly drill libraries, intro sport resources, and multi-sport materials built for the classroom and gym.' },
];

const SPORT_PILLS = ['🏀 Basketball', '⚽ Soccer', '🏈 Football', '⚾ Baseball', '🏒 Hockey', '🏐 Volleyball', '🥍 Lacrosse', '+ More'];

export default function Home() {
  useReveal();
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    setTimeout(() => {
      const el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const goCoaches = () => {
    navigate('/coaches');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div style={{ paddingTop: '66px' }}>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-rings">
          <div className="ring" /><div className="ring" /><div className="ring" /><div className="ring" />
        </div>
        <div className="sports-orbit">
          {['🏀','⚽','🏈','⚾','🏒','🎾','🏐','🥍'].map((s, i) => (
            <span key={i} className="orbit-sport">{s}</span>
          ))}
        </div>

        <div className="hero-mark"><div className="cpc-mark">CPC</div></div>
        <div className="hero-eyebrow"><span className="blink" />The Marketplace for Youth Sports Coaches</div>
        <h1>Coaches <em>Pay</em><br />Coaches</h1>
        <p className="hero-sub">
          A peer-driven digital marketplace where youth sports coaches buy and sell high-quality coaching materials — playbooks, drills, practice plans, scouting reports, film breakdowns, and more. Every sport. Every level.
        </p>
        <div className="hero-btns">
          <button className="btn btn-green" onClick={() => scrollToSection('#sports')}>Browse by Sport →</button>
          <button className="btn btn-ghost" onClick={() => scrollToSection('#sell')}>Start Selling</button>
        </div>
        <div className="sport-pills">
          {SPORT_PILLS.map((p, i) => (
            <div key={i} className="sport-pill">
              <span>{p.split(' ')[0]}</span> {p.split(' ').slice(1).join(' ')}
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-bar">
        <div className="marquee-track">
          {doubled.map((item, i) => (
            <span key={i} className="m-item">
              {item} <span className="m-dot">●</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── PROBLEM / SOLUTION ── */}
      <section className="problem-strip">
        <div className="problem-inner">
          <div className="reveal">
            <div className="problem-tag">The Problem</div>
            <h2 className="problem-title">Youth Coaches<br />Deserve <em>Better</em><br />Resources</h2>
            <ul className="problem-list">
              <li><div className="prob-x">✕</div>Most youth coaches are parents — not always versed in practice planning, drills, or skill development</li>
              <li><div className="prob-x">✕</div>No centralized, trusted platform exists to buy or sell sport-specific coaching content</li>
              <li><div className="prob-x">✕</div>Quality resources are scattered, inconsistent, and often overpriced</li>
            </ul>
          </div>
          <div className="reveal">
            <div className="problem-tag">Our Solution</div>
            <div className="solution-cards">
              {[
                { icon: '🤝', title: 'Peer-Driven Marketplace', desc: 'Coaches upload, sell, and purchase materials quickly and securely — all in one place, across every sport.' },
                { icon: '⭐', title: 'Curated & Reviewed', desc: 'Quality content from real coaches. User ratings, product reviews, and top-seller recognition built in.' },
                { icon: '🔒', title: 'Secure & Protected', desc: 'Safe file delivery, watermarked downloads, and encrypted payments — built for coaches, not tech experts.' },
              ].map((s, i) => (
                <div key={i} className="sol-card">
                  <div className="sol-icon">{s.icon}</div>
                  <div><h4>{s.title}</h4><p>{s.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SPORTS ── */}
      <section className="section sports-wrap" id="sports">
        <div className="section-label">Every Sport</div>
        <h2 className="section-title">Browse <em>By Sport</em></h2>
        <p className="section-desc">From the hardwood to the pitch to the ice — resources for every youth sports coach, at every level.</p>
        <div className="sports-grid reveal">
          {SPORTS.map((s, i) => (
            <a key={i} className="sport-card">
              <span className="sport-emoji">{s.emoji}</span>
              <div className="sport-name">{s.name}</div>
              <div className="sport-sub">{s.sub}</div>
            </a>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section">
        <div className="section-label">Browse By Type</div>
        <h2 className="section-title">Find What You <em>Need</em></h2>
        <p className="section-desc">Every format a coach needs — downloadable, game-ready, and built by coaches who've been there.</p>
        <div className="cats-grid reveal">
          {CATEGORIES.map((c, i) => (
            <a key={i} className="cat-card">
              <span className="cat-icon">{c.icon}</span>
              <div className="cat-name">{c.name}</div>
              <div className="cat-sub">{c.sub}</div>
            </a>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="section" style={{ background: 'var(--navy-mid)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="section-label">Top Sellers</div>
        <h2 className="section-title">Featured <em>Products</em></h2>
        <p className="section-desc">Peer-reviewed resources from coaches who've been in the gym, on the field, and in the film room.</p>
        <div className="products-grid reveal">
          {PRODUCTS.map((p, i) => (
            <div key={i} className="product-card">
              <div className={`product-thumb ${p.thumb}`}>
                <span className="p-badge">{p.badge}</span>
                <span className="p-sport-tag">{p.sport}</span>
                {p.emoji}
              </div>
              <div className="product-info">
                <div className="p-seller">{p.seller}</div>
                <div className="p-name">{p.name}</div>
                <div className="p-type">{p.type}</div>
                <div className="p-meta">
                  <div className="p-price">$—</div>
                  <button className="p-btn">View</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section className="section who-wrap">
        <div className="section-label">Who It's For</div>
        <h2 className="section-title">Built for <em>Every</em> Coach</h2>
        <p className="section-desc">Whether you've coached for 20 years or just took over a rec team last weekend — this platform is for you.</p>
        <div className="who-grid reveal">
          {WHO.map((w, i) => (
            <div key={i} className="who-card">
              <span className="who-emoji">{w.emoji}</span>
              <h3>{w.title}</h3>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" id="how">
        <div className="section-label">Simple Process</div>
        <h2 className="section-title">How It <em>Works</em></h2>
        <p className="section-desc">Built by coaches, for coaches. Get what you need or earn from what you know — in any sport.</p>
        <div className="how-grid reveal">
          {[
            { num: '01', icon: '🏅', title: 'Create Your Account', desc: 'Sign up free as a buyer, seller, or both. Build your public coach profile with your sport, bio, and credentials.' },
            { num: '02', icon: '📋', title: 'Browse or Upload', desc: 'Shop peer-reviewed resources from real coaches — or upload your own playbooks, drills, and practice plans to start earning.' },
            { num: '03', icon: '💳', title: 'Secure Checkout', desc: 'Every transaction is encrypted and protected. Files are watermarked and tracked to prevent unauthorized sharing.' },
            { num: '04', icon: '📥', title: 'Instant Download', desc: 'Get your resources immediately after purchase. PDFs, videos, and templates delivered straight to your dashboard.' },
          ].map((h, i) => (
            <div key={i} className="how-card">
              <div className="how-num">{h.num}</div>
              <div className="how-icon">{h.icon}</div>
              <h3>{h.title}</h3>
              <p>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SELL ── */}
      <section className="section seller-strip" id="sell">
        <div className="seller-inner">
          <div className="reveal">
            <div className="section-label">For Coaches Who Know</div>
            <h2 className="section-title">Start <em>Earning</em><br />From Your<br />Expertise</h2>
            <p className="section-desc">Your playbooks, your practice plans, your systems — in any sport, worth more than you think. Set your price, upload your work, and earn every time another coach downloads it.</p>
            <ul className="earn-list">
              <li><div className="chk">✓</div>Keep 70% of every sale — transparent, no surprises</li>
              <li><div className="chk">✓</div>Upload PDFs, videos, templates, and graphics — all formats supported</li>
              <li><div className="chk">✓</div>Your own public storefront with ratings and full sales history</li>
              <li><div className="chk">✓</div>Passive income — sell the same resource to hundreds of coaches</li>
              <li><div className="chk">✓</div>Files are watermarked and protected against piracy</li>
            </ul>
            <button className="btn btn-green" onClick={goCoaches}>Meet Our Coaches →</button>
          </div>
          <div className="seller-visual">
            <div className="cpc-big">CPC</div>
            <div className="seller-float">
              <div className="sf"><div className="sf-val">70%</div><div className="sf-lbl">You keep per sale</div></div>
              <div className="sf"><div className="sf-val">30%</div><div className="sf-lbl">Platform fee</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMISSION ── */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="section-label" style={{ justifyContent: 'center' }}>Transparent Pricing</div>
        <h2 className="section-title">Simple <em>Commission</em> Model</h2>
        <p className="section-desc" style={{ margin: '0 auto' }}>No hidden fees. No confusing tiers. Straightforward revenue sharing — coaches first, every sport.</p>
        <div className="comm-box reveal">
          <div className="comm-top">
            <div className="comm-pct">70%</div>
            <div className="comm-sub">Goes Directly to You</div>
            <p className="comm-desc">Set your price. Sell your knowledge. Every download puts 70% straight into your account — basketball, soccer, football, or any other sport.</p>
          </div>
          <div className="comm-rows">
            <div className="cr"><div className="cr-val">You Set</div><div className="cr-lbl">Your Own Price</div></div>
            <div className="cr"><div className="cr-val">70%</div><div className="cr-lbl">Goes to Seller</div></div>
            <div className="cr"><div className="cr-val">30%</div><div className="cr-lbl">Platform Fee</div></div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
